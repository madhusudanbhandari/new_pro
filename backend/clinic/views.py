from django.shortcuts import render
from .models import User,DoctorProfile,PatientProfile,AdminProfile,Appointment,DoctorAvailability
from .serializers import userSerializer,DoctorSerializer,PatientSerializer,RegisterSerializer,LoginSerializer,AppointmentSerializer,AppointmentStatusSerializer,DoctorListSerializer,DoctorAvailabilitySerializer
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny,IsAuthenticated
from datetime import datetime, timedelta
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
    serializer=DoctorListSerializer(doctors,many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_appointment(request):
    if request.user.role!='patient':
        return Response({'error':'Only patient can make bookings'},status=403)
    data=request.data.copy()
    data['patient']=request.user.id
    serializer=AppointmentSerializer(data=data)
    if serializer.is_valid():
        serializer.save(patient=request.user,
                        status='pending')
        return Response({'message':'Appointment Booked','appointment':serializer.data},status=201)
    print(serializer.errors)
    return Response(serializer.errors,status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_appointments(request):
    user=request.user

    if user.role=='patient':
        appointmets=Appointment.objects.filter(patient=user).order_by('-created_at')

    elif user.role=='doctor':
        appointmets=Appointment.objects.filter(doctor=user).order_by('-created_at')

    elif user.role=='admin':
        appointmets=Appointment.objects.all()

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_token(request):
    if request.user.role!='admin':
        return Response({'messaeg':'Only admin can assign token'},status=403)
    
    appointment_id=request.data.get('appointment_id')
    token_no=request.data.get('token_no')

    
    try:
        appointment=Appointment.objects.get(id=appointment_id)
        appointment.token_no=token_no
        appointment.admin=request.user
        appointment.status='confirmed'
        appointment.save()

        return Response({
            'message':'Token assigned successfully',
           'token_no':token_no
        })
    except Appointment.DoesNotExist:
        return Response(
            {'message':'Appointment not found'},
            status=404
        )
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_token(request):
    if request.user.role!='patient':
        return Response(
            {'message':'Only Patients can view tokens'},
            status=403
        )
    appointments=Appointment.objects.filter(
        patient=request.user,
      
    ).exclude(
        token_no__isnull=True
       
    )
    serializer=AppointmentSerializer(
        appointments,
        many=True
    )
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def queue_position(request):
    if request.user.role!='patient':
        return Response({'error':'patients only'},status=403)
    

    
    patient_appointment=Appointment.objects.filter(
        patient=request.user,
        status='confirmed',
        token_no__isnull=False
       
    ).order_by('date','time').first()

    if not patient_appointment or not patient_appointment.token_no:
        return Response({'position':None, 'message':'No active token today'})
    

    ahead=Appointment.objects.filter(
        doctor=patient_appointment.doctor,
        date=patient_appointment.date, 
        status='confirmed',
        token_no__lt=patient_appointment.token_no
    ).count()

    return Response({
        'position':ahead+1,
        'token_no':patient_appointment.token_no,
        'doctor_name':patient_appointment.doctor.username,
        'total_ahead':ahead,
        'appointment_date': str(patient_appointment.date),
        'appointment_time': str(patient_appointment.time),

    })

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def doctor_availability(request):
    if request.user.role!='doctor':
        return Response({'error':'Doctor Only'},status=403)
    
    if request.method=='GET':
        availability=DoctorAvailability.objects.filter(doctor=request.user)
        serializer=DoctorAvailabilitySerializer(availability,many=True)
        return Response(serializer.data)
    
    if request.method=='POST':
        day=request.data.get('day')
        existing=DoctorAvailability.objects.filter(
            doctor=request.user, day=day
        ).first()

        if existing:
            serializer=DoctorAvailabilitySerializer(existing,data=request.data,partial=True)
        else:
            serializer=DoctorAvailabilitySerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(doctor=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors,status=400)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_slots(request, doctor_id):
    date_str = request.query_params.get('date')  
    if not date_str:
        return Response({'error': 'date is required'}, status=400)

    try:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Invalid date format'}, status=400)

    day_name = date.strftime('%A').lower()
    try:
        availability = DoctorAvailability.objects.get(
            doctor_id=doctor_id, day=day_name
        )
    except DoctorAvailability.DoesNotExist:
        return Response({'slots': [], 'message': 'Doctor not available on this day'})

    slots=[]
    current=datetime.combine(date,availability.start_time)
    end=datetime.combine(date,availability.end_time)


    while current + timedelta(minutes=availability.slot_duration)<=end:
        slots.append(current.strftime('%H:%M'))
        current+=timedelta(minutes=availability.slot_duration)


    booked=Appointment.objects.filter(
        doctor_id=doctor_id,
        date=date,
    ).exclude(status='cancelled').values_list('time',flat=True)


    booked_times = [t.strftime('%H:%M') for t in booked]
    available_slots = [s for s in slots if s not in booked_times]

    return Response({
        'slots': available_slots,
        'day': day_name,
        'date': date_str,
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_availability(request,pk):
    try:
        availability=DoctorAvailability.objects.filter(pk=pk,doctor=request.user)
        availability.delete()
    except DoctorAvailability.DoesNotExist:
        return Response({'error':'Not found'},status=404)