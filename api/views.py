from rest_framework import generics, status
from .models import *
from .serializers import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from .throttles import LoginRateThrottle
from .models import Student
from .sentiment_service import predict_sentiment
import csv
import io

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

    def create(self, request, *args, **kwargs):
        # Manual authentication for department head
        token = _get_bearer_token(request)
        if not token:
            return Response({"detail": "No token provided"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            decoded_token = AccessToken(token)
        except:
            return Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        if decoded_token.get("role") != "department_head":
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        dept_head_id = decoded_token.get("legacy_user_id")
        if not dept_head_id:
            return Response({"detail": "Invalid token payload"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            dept_head = DepartmentHead.objects.get(id=dept_head_id)
        except DepartmentHead.DoesNotExist:
            return Response({"detail": "Department head not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            response = super().create(request, *args, **kwargs)
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            return Response({"detail": str(e), "trace": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if response.status_code == status.HTTP_201_CREATED:
            # Get the created student
            student = Student.objects.get(id=response.data['id'])
            
            # Log the creation
            user_name = f"{dept_head.firstname} {dept_head.lastname}".strip() or dept_head.email or 'Depthead User'
            AuditLog.objects.create(
                user=user_name,
                role='Depthead',
                action='Create Student',
                category='USER MANAGEMENT',
                status='Success',
                message=f'Created new student: {student.firstname} {student.lastname} ({student.student_number})',
                ip=request.META.get('REMOTE_ADDR', 'Unknown')
            )
        
        return response

# Retrieve, update, or delete a single student
class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class FacultyListCreateView(generics.ListCreateAPIView):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer

    def create(self, request, *args, **kwargs):
        # Manual authentication for department head
        token = _get_bearer_token(request)
        if not token:
            return Response({"detail": "No token provided"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            decoded_token = AccessToken(token)
        except:
            return Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        if decoded_token.get("role") != "department_head":
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        dept_head_id = decoded_token.get("legacy_user_id")
        if not dept_head_id:
            return Response({"detail": "Invalid token payload"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            dept_head = DepartmentHead.objects.get(id=dept_head_id)
        except DepartmentHead.DoesNotExist:
            return Response({"detail": "Department head not found"}, status=status.HTTP_404_NOT_FOUND)

        response = super().create(request, *args, **kwargs)
        
        if response.status_code == status.HTTP_201_CREATED:
            # Get the created faculty
            faculty = Faculty.objects.get(id=response.data['id'])
            
            # Log the creation
            user_name = f"{dept_head.firstname} {dept_head.lastname}".strip() or dept_head.email or 'Depthead User'
            AuditLog.objects.create(
                user=user_name,
                role='Depthead',
                action='Create Faculty',
                category='USER MANAGEMENT',
                status='Success',
                message=f'Created new faculty: {faculty.firstname} {faculty.lastname} ({faculty.email})',
                ip=request.META.get('REMOTE_ADDR', 'Unknown')
            )
        
        return response

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

    def create(self, request, *args, **kwargs):
        # Manual authentication for department head
        token = _get_bearer_token(request)
        if not token:
            return Response({"detail": "No token provided"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            decoded_token = AccessToken(token)
        except:
            return Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        if decoded_token.get("role") != "department_head":
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        dept_head_id = decoded_token.get("legacy_user_id")
        if not dept_head_id:
            return Response({"detail": "Invalid token payload"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            dept_head = DepartmentHead.objects.get(id=dept_head_id)
        except DepartmentHead.DoesNotExist:
            return Response({"detail": "Department head not found"}, status=status.HTTP_404_NOT_FOUND)

        # Set the user on the request for logging
        request.user = dept_head

        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            form_data = response.data
            # Log the creation
            user_name = 'System'
            if hasattr(request, 'user') and request.user:
                user_name = f"{request.user.firstname} {request.user.lastname}".strip() or request.user.email or 'Depthead User'
            AuditLog.objects.create(
                user=user_name,
                role='Depthead',
                action='Created Evaluation Form',
                category='FORM MANAGEMENT',
                status='Success',
                message=f'Created new form: {form_data.get("title", "Unknown")}',
                ip=request.META.get('REMOTE_ADDR', 'Unknown')
            )
        return response

class EvaluationFormDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EvaluationForm.objects.all()
    serializer_class = EvaluationFormSerializer

    def perform_update(self, serializer):
        # Manual authentication for department head
        token = _get_bearer_token(self.request)
        if token:
            try:
                decoded_token = AccessToken(token)
                if decoded_token.get("role") == "department_head":
                    dept_head_id = decoded_token.get("legacy_user_id")
                    if dept_head_id:
                        try:
                            dept_head = DepartmentHead.objects.get(id=dept_head_id)
                            self.request.user = dept_head
                        except DepartmentHead.DoesNotExist:
                            pass
            except:
                pass

        old_instance = self.get_object()
        super().perform_update(serializer)
        new_instance = serializer.instance
        # Log the update
        user_name = 'System'
        if hasattr(self.request, 'user') and self.request.user:
            user_name = f"{self.request.user.firstname} {self.request.user.lastname}".strip() or self.request.user.email or 'Depthead User'
        AuditLog.objects.create(
            user=user_name,
            role='Depthead',
            action='Updated Evaluation Form',
            category='FORM MANAGEMENT',
            status='Success',
            message=f'Updated form: {new_instance.title}',
            ip=self.request.META.get('REMOTE_ADDR', 'Unknown')
        )

    def perform_destroy(self, instance):
        # Manual authentication for department head
        token = _get_bearer_token(self.request)
        if token:
            try:
                decoded_token = AccessToken(token)
                if decoded_token.get("role") == "department_head":
                    dept_head_id = decoded_token.get("legacy_user_id")
                    if dept_head_id:
                        try:
                            dept_head = DepartmentHead.objects.get(id=dept_head_id)
                            self.request.user = dept_head
                        except DepartmentHead.DoesNotExist:
                            pass
            except:
                pass

        # Log the deletion
        user_name = 'System'
        if hasattr(self.request, 'user') and self.request.user:
            user_name = f"{self.request.user.firstname} {self.request.user.lastname}".strip() or self.request.user.email or 'Depthead User'
        AuditLog.objects.create(
            user=user_name,
            role='Depthead',
            action='Deleted Evaluation Form',
            category='FORM MANAGEMENT',
            status='Success',
            message=f'Deleted form: {instance.title}',
            ip=self.request.META.get('REMOTE_ADDR', 'Unknown')
        )
        super().perform_destroy(instance)

class StudentBulkImportView(APIView):
    """Bulk import students from CSV file"""

    def post(self, request):
        # Manual authentication for department head
        token = _get_bearer_token(request)
        if not token:
            return Response({"detail": "No token provided"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            decoded_token = AccessToken(token)
        except:
            return Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        if decoded_token.get("role") != "department_head":
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        dept_head_id = decoded_token.get("legacy_user_id")
        if not dept_head_id:
            return Response({"detail": "Invalid token payload"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            dept_head = DepartmentHead.objects.get(id=dept_head_id)
        except DepartmentHead.DoesNotExist:
            return Response({"detail": "Department head not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if file is provided
        if 'file' not in request.FILES:
            return Response({"detail": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        csv_file = request.FILES['file']
        if not csv_file.name.endswith('.csv'):
            return Response({"detail": "File must be a CSV"}, status=status.HTTP_400_BAD_REQUEST)

        # Parse CSV and create students
        try:
            decoded_file = csv_file.read().decode('utf-8')
            csv_reader = csv.DictReader(io.StringIO(decoded_file))

            created_count = 0
            errors = []

            for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 to account for header
                try:
                    # Validate required fields
                    required_fields = ['email', 'firstname', 'lastname', 'student_id']
                    for field in required_fields:
                        if not row.get(field, '').strip():
                            errors.append(f"Row {row_num}: Missing required field '{field}'")
                            continue

                    # Check if student already exists
                    if Student.objects.filter(email=row['email']).exists():
                        errors.append(f"Row {row_num}: Student with email '{row['email']}' already exists")
                        continue

                    if Student.objects.filter(student_number=row['student_id']).exists():
                        errors.append(f"Row {row_num}: Student with ID '{row['student_id']}' already exists")
                        continue

                    # Parse enrolled_subjects (semicolon-separated) and block
                    raw_subjects = row.get('enrolled_subjects', '').strip()
                    subjects_list = [s.strip() for s in raw_subjects.split(';') if s.strip()] if raw_subjects else []
                    block_val = row.get('block_section', '').strip()

                    # Create student
                    year_val = row.get('year_level', '').strip()
                    try:
                        year_val_parsed = int(year_val) if year_val else None
                    except ValueError:
                        year_val_parsed = None

                    student = Student.objects.create(
                        email=row['email'].strip(),
                        firstname=row['firstname'].strip(),
                        lastname=row['lastname'].strip(),
                        student_number=row['student_id'].strip(),
                        department=row.get('department', '').strip(),
                        program=row.get('course', '').strip(),
                        year_level=year_val_parsed,
                        enrolled_subjects=subjects_list,
                        block_section=block_val or None,
                        must_change_password=True
                    )
                    created_count += 1

                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")

            # Log the bulk import
            user_name = f"{dept_head.firstname} {dept_head.lastname}".strip() or dept_head.email or 'Depthead User'
            AuditLog.objects.create(
                user=user_name,
                role='Depthead',
                action='Bulk Import Students',
                category='USER MANAGEMENT',
                status='Success' if created_count > 0 else 'Failed',
                message=f'Imported {created_count} new student records from CSV file. {len(errors)} errors encountered.',
                ip=request.META.get('REMOTE_ADDR', 'Unknown')
            )

            return Response({
                "message": f"Successfully imported {created_count} students",
                "created_count": created_count,
                "errors": errors[:10]  # Limit errors shown to first 10
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"detail": f"Error processing CSV: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class FacultyBulkImportView(APIView):
    """Bulk import faculty from CSV file"""

    def post(self, request):
        # Manual authentication for department head
        token = _get_bearer_token(request)
        if not token:
            return Response({"detail": "No token provided"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            decoded_token = AccessToken(token)
        except:
            return Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        if decoded_token.get("role") != "department_head":
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        dept_head_id = decoded_token.get("legacy_user_id")
        if not dept_head_id:
            return Response({"detail": "Invalid token payload"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            dept_head = DepartmentHead.objects.get(id=dept_head_id)
        except DepartmentHead.DoesNotExist:
            return Response({"detail": "Department head not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if file is provided
        if 'file' not in request.FILES:
            return Response({"detail": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        csv_file = request.FILES['file']
        if not csv_file.name.endswith('.csv'):
            return Response({"detail": "File must be a CSV"}, status=status.HTTP_400_BAD_REQUEST)

        # Parse CSV and create faculty
        try:
            decoded_file = csv_file.read().decode('utf-8')
            csv_reader = csv.DictReader(io.StringIO(decoded_file))

            created_count = 0
            errors = []

            for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 to account for header
                try:
                    # Validate required fields
                    required_fields = ['email', 'firstname', 'lastname', 'employee_id']
                    for field in required_fields:
                        if not row.get(field, '').strip():
                            errors.append(f"Row {row_num}: Missing required field '{field}'")
                            continue

                    # Check if faculty already exists
                    if Faculty.objects.filter(email=row['email']).exists():
                        errors.append(f"Row {row_num}: Faculty with email '{row['email']}' already exists")
                        continue

                    if Faculty.objects.filter(employee_id=row['employee_id']).exists():
                        errors.append(f"Row {row_num}: Faculty with ID '{row['employee_id']}' already exists")
                        continue

                    # Create faculty
                    faculty = Faculty.objects.create(
                        email=row['email'].strip(),
                        firstname=row['firstname'].strip(),
                        lastname=row['lastname'].strip(),
                        employee_id=row['employee_id'].strip(),
                        department=row.get('department', '').strip(),
                        position=row.get('position', '').strip(),
                        must_change_password=True
                    )
                    created_count += 1

                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")

            # Log the bulk import
            user_name = f"{dept_head.firstname} {dept_head.lastname}".strip() or dept_head.email or 'Depthead User'
            AuditLog.objects.create(
                user=user_name,
                role='Depthead',
                action='Bulk Import Faculty',
                category='USER MANAGEMENT',
                status='Success' if created_count > 0 else 'Failed',
                message=f'Imported {created_count} new faculty records from CSV file. {len(errors)} errors encountered.',
                ip=request.META.get('REMOTE_ADDR', 'Unknown')
            )

            return Response({
                "message": f"Successfully imported {created_count} faculty members",
                "created_count": created_count,
                "errors": errors[:10]  # Limit errors shown to first 10
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"detail": f"Error processing CSV: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class AuditLogListView(generics.ListCreateAPIView):
    queryset = AuditLog.objects.filter(role__in=['Depthead', 'Department Head'])
    serializer_class = AuditLogSerializer

    def list(self, request, *args, **kwargs):
        # Manual authentication for department head
        token = _get_bearer_token(request)
        if not token:
            return Response({"detail": "No token provided"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            decoded_token = AccessToken(token)
        except:
            return Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        if decoded_token.get("role") != "department_head":
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Manual authentication for department head
        token = _get_bearer_token(request)
        if not token:
            return Response({"detail": "No token provided"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            decoded_token = AccessToken(token)
        except:
            return Response({"detail": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

        if decoded_token.get("role") != "department_head":
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        dept_head_id = decoded_token.get("legacy_user_id")
        if not dept_head_id:
            return Response({"detail": "Invalid token payload"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            dept_head = DepartmentHead.objects.get(id=dept_head_id)
        except DepartmentHead.DoesNotExist:
            return Response({"detail": "Department head not found"}, status=status.HTTP_404_NOT_FOUND)

        # Create the audit log with the correct user
        data = request.data.copy()
        data['user'] = f"{dept_head.firstname} {dept_head.lastname}".strip() or dept_head.email or 'Depthead User'
        data['role'] = 'Depthead'
        data['ip'] = request.META.get('REMOTE_ADDR', 'Unknown')

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class SentimentTestView(APIView):
    """Temporary view to test sentiment model integration.

    POST JSON: { "text": "..." }
    Returns: { "label": "positive" }
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        text = request.data.get("text")
        if not text:
            return Response({"detail": 'Missing "text" field'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            label = predict_sentiment(text)
        except Exception as e:
            return Response({"detail": "Model error", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"label": label}, status=status.HTTP_200_OK)