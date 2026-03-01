from django.db import models

class Program(models.model):
    id = models.BigAutoField(primary_key=True)
    program_name = models.CharField(max_length=50)
    program_code = models.CharField(max_length=10, unique=True)
    department = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'programs'
    
    def __str__(self):
        return f"{self.course_code} - {self.course_name}"