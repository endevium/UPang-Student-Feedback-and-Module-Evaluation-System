from django.db import models
from .Student import Student
from .Module import Module

class EnrolledModules(models.Model):
    id = models.BigAutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'student_module_assignments'
        unique_together = ('student', 'module')
