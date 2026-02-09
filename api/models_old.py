from django.db import models
from django.contrib.auth.models import BaseUserManager
from django.contrib.auth.hashers import make_password, check_password

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
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class PersonBase(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)

    firstname = models.CharField(max_length=100)
    middlename = models.CharField(max_length=100, blank=True, null=True)
    lastname = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.TextField(blank=True, null=True)
    birthdate = models.DateField(blank=True, null=True)

    class Meta:
        abstract = True

    def set_password(self, raw_password: str) -> None:
        self.password = make_password(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password(raw_password, self.password)

    def __str__(self):
        return f"{self.firstname} {self.lastname}"

class Student(PersonBase):
    student_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    program = models.CharField(max_length=100, blank=True, null=True)
    year_level = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        choices=[(1, "1st Year"), (2, "2nd Year"), (3, "3rd Year"), (4, "4th Year"), (5, "5th Year")],
    )

    class Meta:
        db_table = "students"
        managed = False

    def __str__(self):
        return f"{self.firstname} {self.lastname} ({self.student_number})"


class Faculty(PersonBase):
    department = models.CharField(max_length=100, blank=True, null=True)
    status = models.BooleanField(default=True)

    class Meta:
        db_table = "faculty"
        managed = False

class DepartmentHead(PersonBase):
    department = models.CharField(max_length=100, blank=True, null=True)
    status = models.BooleanField(default=True)

    class Meta:
        db_table = "department_heads"
        managed = False

    def __str__(self):
        return f"{self.firstname} {self.lastname} - {self.department}"