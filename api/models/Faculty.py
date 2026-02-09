from django.db import models
from .base import PersonBase

class Faculty(PersonBase):
    department = models.CharField(max_length=100, blank=True, null=True)
    status = models.BooleanField(default=True)

    class Meta:
        db_table = "faculty"
        managed = False