from django.shortcuts import render
from .models import User,DoctorProfile,PatientProfile,AdminProfile
from .serializers import userSerializer,DoctorSerializer,PatientSerializer,RegisterSerializer,LoginSerializer
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny,IsAuthenticated

# Create your views here.

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer=RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user=serializer.save()
        return Response({"message":"User Created"},status=201)
    
    return Response(serializer.errors,status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    serializer=LoginSerializer(data=request.data)

    if serializer.is_valid():
        return Response(serializer.validated_data,
                        status=200)
    print(serializer.errors)
    return Response(serializer.errors,status=400)
    