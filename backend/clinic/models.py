from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    ROLE_CHOICES=(
        ('admin','Admin'),
        ('doctor','Doctor'),
        ('patient','Patient'),
    )
    # username=models.CharField(max_length=150,unique=True,validators=[])
    
    role=models.CharField(max_length=10,choices=ROLE_CHOICES,blank=True)
    email=models.EmailField(unique=True)

    # USERNAME_FIELD='email'
    # REQUIRED_FIELDS=['username']
    def __str__(self):
        return self.email

class DoctorProfile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE,related_name="doctor_profile")

    specialization = models.CharField(max_length=100,blank=True, null=True)
    license_number = models.CharField(max_length=50,blank=True, null=True)
    experience_years = models.IntegerField(default=0)
    hospital = models.CharField(max_length=100,blank=True, null=True)

    def __str__(self):
        return self.user.username

class PatientProfile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)

    age = models.IntegerField(default=0)
    gender = models.CharField(max_length=10,blank=True, null=True)
    blood_group = models.CharField(max_length=5,blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.user.username

class AdminProfile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)

    department=models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.user.username
    
class Appointment(models.Model):
    STATUS_CHOICES=[
        ('pending','Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    patient=models.ForeignKey(User,on_delete=models.CASCADE,related_name='patient_appointments')
    doctor=models.ForeignKey(User,on_delete=models.CASCADE,related_name='doctor_appointments')
    date=models.DateField()
    time=models.TimeField()
    status=models.CharField(max_length=20,choices=STATUS_CHOICES,default='pending')
    reason=models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    token_no=models.IntegerField(null=True,blank=True)
    
    def __str__(self):
        return f'{self.patient.username}->Dr.{self.doctor.username} on {self.date} at {self.time}'
    



