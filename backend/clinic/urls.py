from django.urls import path
from .import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns=[
    path('register/',views.register_user),
    path('login/',views.login_user),
    path('doctors/',  views.get_doctors,    name='doctors'),
    path('appointments/',              views.get_appointments,         name='appointments'),
    path('appointments/book/',         views.book_appointment,         name='book-appointment'),
    path('appointments/<int:pk>/status/', views.update_appointment_status, name='update-status'),
    path('appointments/<int:pk>/cancel/', views.cancel_appointment,    name='cancel-appointment'),
    path('settoken/',views.assign_token,name='give_token'),
    path('gettoken/',views.my_token,name='get token'),
    path('queueposition/',views.queue_position),
    path('token/refresh',TokenRefreshView.as_view(),name='token_refresh'),
    path('availability/', views.doctor_availability, name='availability'),
    path('availability/<int:pk>/delete/', views.delete_availability, name='delete-availability'),
    path('slots/<int:doctor_id>/', views.get_available_slots, name='available-slots'),
]