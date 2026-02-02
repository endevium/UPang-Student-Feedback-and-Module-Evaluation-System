from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# User manager
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=150, unique=True)
    firstname = models.CharField(max_length=100)
    middlename = models.CharField(max_length=100, blank=True, null=True)
    lastname = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.TextField(blank=True, null=True)
    birthdate = models.DateField(blank=True, null=True)
    
    is_student = models.BooleanField(default=False)
    is_faculty = models.BooleanField(default=False)
    is_department_head = models.BooleanField(default=False)
    
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['firstname', 'lastname']

    objects = UserManager()

    class Meta:
        abstract = True 

# System user models
# Student
class Student(User):
    student_number = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    program = models.CharField(max_length=100, blank=True, null=True)
    year_level = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        choices=[(1, '1st Year'), (2, '2nd Year'), (3, '3rd Year'), (4, '4th Year'), (5, '5th Year')]
    )

    class Meta:
        db_table = "students"
        managed = False

    def __str__(self):
        return f"{self.firstname} {self.lastname} ({self.student_number})"

# Faculty
class Faculty(User):
    department = models.CharField(max_length=100)
    status = models.BooleanField(default=True)

    class Meta:
        db_table = "faculty"

    def __str__(self):
        return f"{self.firstname} {self.lastname}"

# Department Heads
class DepartmentHead(User):
    department = models.CharField(max_length=100)
    status = models.BooleanField(default=True)

    class Meta:
        db_table = "department_heads"

    def __str__(self):
        return f"{self.faculty.firstname} {self.faculty.lastname} - {self.department}"
