from django.db import models
from .ModuleAssignment import ModuleAssignment
from .DepartmentHead import DepartmentHead

class EvaluationForm(models.Model):
    id = models.BigAutoField(primary_key=True)
    assignment = models.ForeignKey(ModuleAssignment, on_delete=models.CASCADE)
    created_by = models.ForeignKey(DepartmentHead, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    open_at = models.DateTimeField(null=True, blank=True)
    close_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'evaluation_forms'
