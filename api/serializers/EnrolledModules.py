from django.db import models

class Module(models.Model):
    id = models.BigAutoField(primary_key=True)
    module_code = models.CharField(max_length=20, unique=True)
    module_name = models.CharField(max_length=150)
    department = models.CharField(max_length=100)
    semester = models.CharField(max_length=20)
    academic_year = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'modules'
