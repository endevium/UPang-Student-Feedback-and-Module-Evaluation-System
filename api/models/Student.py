from django.db import models
from .base import PersonBase

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