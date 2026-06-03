from django.contrib import admin
from .models import User,DoctorProfile,PatientProfile,AdminProfile

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display=['username','email','role']

@admin.register(DoctorProfile)
class DoctorAdmin(admin.ModelAdmin):
    list_display=['doctor_name','doctor_email','specialization']

    def doctor_name(self,obj):
        return obj.user.name
    
    def doctor_email(self,obj):
        return obj.user.email
    
@admin.register(PatientProfile)
class PatientAdmin(admin.ModelAdmin):
    list_display=['patient_name','patient_email','age']

    def patient_name(self,obj):
        return obj.user.name
    
    def patient_email(self,obj):
        return obj.user.email
    
    
@admin.register(AdminProfile)
class Admin(admin.ModelAdmin):
    list_display=['admin_name','admin_email','department']

    def admin_name(self,obj):
        return obj.user.name
    
    def admin_email(self,obj):
        return obj.user.email
    
    