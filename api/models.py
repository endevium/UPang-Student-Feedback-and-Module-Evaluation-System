from django.db import models

# UPang SFME
class Student(models.Model):
    student_number = models.CharField(max_length=20, unique=True)
    profile_picture = models.TextField(blank=True, null=True)
    firstname = models.CharField(max_length=100)
    middlename = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    year_level = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        choices=[(1, '1st Year'), (2, '2nd Year'), (3, '3rd Year'), (4, '4th Year'), (5, '5th Year')]
    )
    birthdate = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "students"
        managed = False 

    def __str__(self):
        return f"{self.firstname} {self.lastname} ({self.student_number})"

