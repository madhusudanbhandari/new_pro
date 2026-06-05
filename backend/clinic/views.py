from django.shortcuts import render
from .models import User,DoctorProfile,PatientProfile,AdminProfile,Appointment
from .serializers import userSerializer,DoctorSerializer,PatientSerializer,RegisterSerializer,LoginSerializer,AppointmentSerializer,AppointmentStatusSerializer
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
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_doctors(request):
    doctors=User.objects.filter(role='doctor')
    serializer=DoctorSerializer(doctors,many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_appointment(request):
    if request.user.role!='patient':
        return Response({'error':'Only patient can make bookings'},status=403)
    
    serializer=AppointmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(patient=request.user)
        return Response({'message':'Appointment Booked','appointment':serializer.data},status=201)
    return Response(serializer.errors,status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_appointments(request):
    user=request.user

    if user.role=='patient':
        appointmets=Appointment.object.filter(patient=user).oder_by('-created_at')

    if user.role=='doctor':
        appointmets=Appointment.objects.filter(doctor=user).order_by('-created_at')

    if user.role=='admin':
        appointmets=Appointment.objects.filter(admin=user).order_by('-created_at')

    else:
        return Response({'error':'Unauthorized'},status=403)
    
    serializer=AppointmentSerializer(appointmets,many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_appointment_status(request,pk):
    try:
        appointment=Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({'error':'Appointment not found'},status=404)
    
    if request.user.role not in ['doctor','admin']:
        return Response({'error':'Only doctors or admins can update status.'},status=403)
    
    serializer=AppointmentStatusSerializer(appointment,data=request.data,partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'message':'Status Updated.','appointment':serializer.data})
    return Response(serializer.errors,status=400)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cancel_appointment(request,pk):
    try:
        appointment=Appointment.objects.get(pk=pk,patient=request.user)
    except Appointment.DoesNotExist:
        return Response({'error':'Appointment not found'},status=404)

    if appointment.status=='completed':
        return Response({'error':'Cannot cancel a completed appointment'},status=400)
    
    appointment.status='cancelled'
    appointment.save()
    return Response({'message':'Appointment cancelled'})

