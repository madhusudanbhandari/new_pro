from rest_framework import serializers
from .models import User,DoctorProfile,PatientProfile,AdminProfile
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