from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.permissions import AllowAny, IsAuthenticated

from .throttles import LoginRateThrottle
from .permissions import *
from .authentication import LegacyJWTAuthentication

from .models.Student import Student
from .models.Faculty import Faculty
from .models.DepartmentHead import DepartmentHead
from .models.Module import Module
from .models.ModuleAssignment import ModuleAssignment

from .serializers.Student import StudentSerializer
from .serializers.StudentLogin import StudentLoginSerializer
from .serializers.Faculty import FacultySerializer
from .serializers.FacultyLogin import FacultyLoginSerializer
from .serializers.DepartmentHead import DepartmentHeadSerializer
from .serializers.DepartmentHeadLogin import DepartmentHeadLoginSerializer
from .serializers.Module import ModuleSerializer
from .serializers.ModuleAssignment import ModuleAssignmentSerializer

''' JWT '''
def _issue_jwt(role: str, legacy_user_id: int) -> str:
    token = AccessToken()
    token["role"] = role
    token["legacy_user_id"] = legacy_user_id
    return str(token)

''' USERS '''
class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class FacultyListCreateView(generics.ListCreateAPIView):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

class FacultyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

class DepartmentHeadListCreateView(generics.ListCreateAPIView):
    queryset = DepartmentHead.objects.all()
    serializer_class = DepartmentHeadSerializer

class DepartmentHeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DepartmentHead.objects.all()
    serializer_class = DepartmentHeadSerializer

''' LOGINS '''
class StudentLoginView(APIView):
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        serializer = StudentLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        token = _issue_jwt("student", user.id)

        return Response({
            "id": user.id,
            "student_number": user.student_number,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "user_type": "student",
            "token": token
        },
        status=status.HTTP_200_OK)

class FacultyLoginView(APIView):
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        serializer = FacultyLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        token = _issue_jwt("faculty", user.id)

        return Response({
            "id": user.id,
            "email": user.email,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "user_type": "faculty",
            "token": token
        },
        status=status.HTTP_200_OK)

class DepartmentHeadLoginView(APIView):
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request):
        serializer = DepartmentHeadLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        token = _issue_jwt("department_head", user.id)

        return Response({
            "id": user.id,
            "email": user.email,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "user_type": "department_head",
            "token": token
        },
        status=status.HTTP_200_OK)

''' MODULES '''
'''             '''
class ModuleListCreateView(generics.ListCreateAPIView):
    authentication_classes = [LegacyJWTAuthentication]
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsDepartmentHead()]
        return [AllowAny()]

class ModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [LegacyJWTAuthentication]
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    
    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [IsDepartmentHead()]
        return [AllowAny()]

''' MODULE ASSIGNMENT '''
class ModuleAssignmentListCreateView(generics.ListCreateAPIView):
    queryset = ModuleAssignment.objects.all()
    serializer_class = ModuleAssignmentSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsDepartmentHead()]
        return [AllowAny()]

class ModuleAssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ModuleAssignment.objects.all()
    serializer_class = ModuleAssignmentSerializer

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [IsDepartmentHead()]
        return [AllowAny()]


from rest_framework.views import APIView
from rest_framework.response import Response
from .authentication import LegacyJWTAuthentication

class DebugAuthView(APIView):
    authentication_classes = [LegacyJWTAuthentication]
    permission_classes = []

    def get(self, request):
        return Response({
            "http_auth": request.META.get("HTTP_AUTHORIZATION"),
            "user_info": {
                "is_authenticated": getattr(request.user, "is_authenticated", False),
                "role": getattr(request.user, "role", None),
                "legacy_user_id": getattr(request.user, "legacy_user_id", None)
            }
        })