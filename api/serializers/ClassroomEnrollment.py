from rest_framework import serializers
from api.models import ClassroomEnrollment

class ClassroomEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassroomEnrollment
        fields = [
            "id",
            "student",
            "classroom",
            "approved",
            "requested_at",
            "approved_at",
        ]
        read_only_fields = ["id", "approved", "requested_at", "approved_at"]