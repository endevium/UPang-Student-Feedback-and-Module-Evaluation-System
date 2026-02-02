from django.urls import path
from . import views

urlpatterns = [
    path("students/", views.StudentListCreateView.as_view(), name="student-list-create"),
    path('students/<int:pk>/', views.StudentDetailView.as_view(), name='student-detail'),
]