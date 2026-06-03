from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    ROLE_CHOICES=(
        ('admin','Admin'),
        ('doctor','Doctor'),
        ('patient','Patient'),
    )
    
    role=models.CharField(max_length=10,choices=ROLE_CHOICES)


class DoctorProfile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)

    specialization = models.CharField(max_length=100)
    license_number = models.CharField(max_length=50)
    experience_years = models.IntegerField()
    hospital = models.CharField(max_length=100)

    def __str__(self):
        return self.user.name

class PatientProfile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)

    age = models.IntegerField()
    gender = models.CharField(max_length=10)
    blood_group = models.CharField(max_length=5)
    address = models.TextField()

    def __str__(self):
        return self.user.name

class AdminProfile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)

    department=models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.user.name