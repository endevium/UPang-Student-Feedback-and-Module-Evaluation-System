from rest_framework import serializers
from api.models import Module

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = [
            "id",
            "subject_code",
            "module_name",
            "year_level",
            "department",
            "semester",
            "academic_year",
            "department_head",     
        ]
        read_only_fields = ["id", "department"]