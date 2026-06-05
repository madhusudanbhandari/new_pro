from rest_framework import serializers
from .models import User,DoctorProfile,PatientProfile,AdminProfile,Appointment
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class userSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['id','username','email','role']

    def create(self,validated_data):
        password=validated_data.pop('password')
        user=User(**validated_data)
        user.set_password(password)
        user.save()
        return user
        

class DoctorSerializer(serializers.ModelSerializer):
    username=serializers.CharField(source='user.username',read_only=True)
    email=serializers.CharField(source='user.email',read_only=True)

    class Meta:
        model=DoctorProfile
        fields=['id','username','email','specialization','license_number','experience_years','hospital']


class PatientSerializer(serializers.ModelSerializer):
    username=serializers.CharField(source='user.username',read_only=True)
    email=serializers.CharField(source='user.email',read_only=True)

    class Meta:
        model=PatientProfile
        fields=['id','username','email','age','gender','blood_group','address']

    

class RegisterSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True)
    username=serializers.CharField()
    
    class Meta:
        model=User
        fields=['id','username','email','password','role']

    def validate_email(self,value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email already exist")
        return value


    def create(self,validated_data):
        password=validated_data.pop('password')

        # email=validated_data.get('email')
        user=User(**validated_data)
        
        # user.username=email
        user.set_password(password)
        user.save()

        if user.role=='doctor':
            DoctorProfile.objects.create(user=user)
        elif user.role=='patient':
            PatientProfile.objects.create(user=user)
        elif user.role=='admin':
            AdminProfile.objects.create(user=user)

        return user
        

class LoginSerializer(serializers.Serializer):
    email=serializers.EmailField()
    password=serializers.CharField(write_only=True)

    def validate(self,data):
        email=data.get("email")
        password=data.get("password")

        user=authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid Credentials")
        
        refresh=RefreshToken.for_user(user)

        return{
            'refresh':str(refresh),
            'access':str(refresh.access_token),
            'role':user.role,
            'email':user.email,
            'username':user.username,
          
        }
    
class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.username', read_only=True)
    doctor_name  = serializers.CharField(source='doctor.username',  read_only=True)
    patient_email= serializers.CharField(source='patient.email',    read_only=True)
    doctor_email = serializers.CharField(source='doctor.email',     read_only=True)

    class Meta:
        model=Appointment
        fields = [
            'id',
            'patient', 'patient_name', 'patient_email',
            'doctor',  'doctor_name',  'doctor_email',
            'date', 'time', 'reason', 'status',
            'created_at',
        ]
        read_only_fields=['petient','status','created_at']

    def validate(self,data):
        if data['doctor'].role !='doctor':
            raise serializers.ValidationError('Selected user is not a doctor')
        
        if Appointment.objects.filter(
            doctor=data['doctor'],
            date=data['date'],
            time=data['time']

        ).exists():
            raise serializers.ValidationError('This doctor already has an appointment')
        
        return data
    

class AppointmentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model=Appointment
        fields=['id','status']
