from django.urls import path
from . import views

urlpatterns = [
    path("students/", views.StudentListCreateView.as_view(), name="student-list-create"),
    path("students/<int:pk>/", views.StudentDetailView.as_view(), name="student-detail"),
    path("students/login/", views.StudentLoginView.as_view(), name="student-login"),

    path("faculty/", views.FacultyListCreateView.as_view(), name="faculty-list-create"),
    path("faculty/<int:pk>/", views.FacultyDetailView.as_view(), name="faculty-detail"),
    path("faculty/login/", views.FacultyLoginView.as_view(), name="faculty-login"),

    path("department-heads/", views.DepartmentHeadListCreateView.as_view(), name="department-head-list-create"),
    path("department-heads/<int:pk>/", views.DepartmentHeadDetailView.as_view(), name="department-head-detail"),
    path("department-head/login/", views.DepartmentHeadLoginView.as_view(), name="department-head-login"),

    path("module/", views.ModuleListCreateView.as_view(), name="module-list-create"),
    path("modules/<int:pk>/", views.ModuleDetailView.as_view(), name="module-detail"),

    path("assign-module/", views.ModuleAssignmentListCreateView.as_view(), name="module-assignment-list-create"),
    path("assign-module/<int:pk>/", views.ModuleAssignmentDetailView.as_view(), name="module-assignment-detail"),

    path("debug-auth/", views.DebugAuthView.as_view(), name="debug-auth")
]
