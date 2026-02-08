from rest_framework import generics, status
from .models import *
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from .throttles import LoginRateThrottle
from .models import Student

def _issue_jwt(role: str, legacy_user_id: int) -> str:
    token = AccessToken()
    token["role"] = role
    token["legacy_user_id"] = legacy_user_id
    return str(token)

def _get_bearer_token(request) -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1].strip()
    return None

# List all students or create a new student
class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

# Retrieve, update, or delete a single student
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
            "must_change_password": user.must_change_password,
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
            "must_change_password": user.must_change_password,
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

class StudentChangePasswordView(APIView):
    def post(self, request):
        serializer = StudentChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        user.must_change_password = False
        user.save()

        return Response({"detail": "Password updated"}, status=status.HTTP_200_OK)

class FacultyChangePasswordView(APIView):
    def post(self, request):
        serializer = FacultyChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        user.must_change_password = False
        user.save()

        return Response({"detail": "Password updated"}, status=status.HTTP_200_OK)

class StudentMeView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        token_str = _get_bearer_token(request)
        if not token_str:
            return Response({"detail": "Authorization token missing"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            token = AccessToken(token_str)
        except Exception:
            return Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        if token.get("role") != "student":
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        student_id = token.get("legacy_user_id")
        if not student_id:
            return Response({"detail": "Invalid token payload"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            return Response({"detail": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "student": {
                "id": student.id,
                "student_number": student.student_number,
                "email": student.email,
                "firstname": student.firstname,
                "lastname": student.lastname,
                "program": student.program,
                "year_level": student.year_level,
            },
            "stats": {
                "total_modules": 0,
                "instructors": 0,
                "completed": 0,
                "pending": 0,
            },
            "recent_modules": [],
        }, status=status.HTTP_200_OK)
class EvaluationFormListCreateView(generics.ListCreateAPIView):
    queryset = EvaluationForm.objects.all()
    serializer_class = EvaluationFormSerializer

class EvaluationFormDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EvaluationForm.objects.all()
    serializer_class = EvaluationFormSerializer