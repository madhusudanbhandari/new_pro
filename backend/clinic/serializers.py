from rest_framework import serializers
from .models import User,DoctorProfile,PatientProfile,AdminProfile,Appointment,DoctorAvailability
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

class DoctorListSerializer(serializers.ModelSerializer):
    doctor_profile=serializers.SerializerMethodField()

    class Meta:
        model=User
        fields=['id','username','email','doctor_profile']

    def get_doctor_profile(self,obj):
        try:
            profile=obj.doctor_profile
            return{
                'specialization':profile.specialization,
                'experience_years':profile.experience_years,
                'hospital':profile.hospital,
            }
        except:
            return None

class PatientSerializer(serializers.ModelSerializer):
    username=serializers.CharField(source='user.username',read_only=True)
    email=serializers.CharField(source='user.email',read_only=True)

    class Meta:
        model=PatientProfile
        fields=['id','username','email','age','gender','blood_group','address']

    

class RegisterSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True)
    username=serializers.CharField()
    specialization = serializers.CharField(required=False, allow_blank=True)
    license_number = serializers.CharField(required=False, allow_blank=True)
    experience_years = serializers.IntegerField(required=False,allow_null=True)
    hospital = serializers.CharField(required=False, allow_blank=True)

    age = serializers.IntegerField(required=False,allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    blood_group = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    department = serializers.CharField(required=False, allow_blank=True)
        
    class Meta:
        model=User
        fields=['id','username','email','password','role',
            'specialization',
            'license_number',
            'experience_years',
            'hospital','age','gender','blood_group','address','department']

    def validate_email(self,value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email already exist")
        return value


    def create(self,validated_data):
        specialization = validated_data.pop('specialization', None)
        license_number = validated_data.pop('license_number', None)
        experience_years = validated_data.pop('experience_years', 0)
        hospital = validated_data.pop('hospital', None)
        password=validated_data.pop('password')
        age=validated_data.pop('age',0)
        gender=validated_data.pop('gender',None)
        blood_group=validated_data.pop('blood_group',None)
        address=validated_data.pop('address',None)
        department=validated_data.pop('department',None)
        # email=validated_data.get('email')

        user=User(**validated_data)
        
        # user.username=email
        user.set_password(password)
        user.save()

        if user.role=='doctor':
            DoctorProfile.objects.create(user=user,specialization=specialization,
                license_number=license_number,
                experience_years=experience_years,
                hospital=hospital)
        elif user.role=='patient':
            PatientProfile.objects.create(user=user,
                                          age=age,gender=gender,blood_group=blood_group,address=address)
        elif user.role=='admin':
            AdminProfile.objects.create(user=user,department=department)

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
    admin_name=serializers.CharField(source='admin.username',read_only=True)

    class Meta:
        model=Appointment
        fields = [
            'id',
            'patient', 'patient_name', 'patient_email',
            'doctor',  'doctor_name',  'doctor_email',
            'date', 'time', 'reason', 'status',
            'created_at','admin','admin_name','token_no'
        ]
    read_only_fields=['patient','status','created_at']
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


class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model=DoctorAvailability
        fields=['id','day','start_time','end_time','slot_duration']