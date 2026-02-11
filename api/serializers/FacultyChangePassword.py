from rest_framework import serializers
from ..models.Faculty import Faculty

class FacultyChangePasswordSerializer(serializers.Serializer):
    email = serializers.CharField()
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        old_password = attrs.get('old_password')
        new_password = attrs.get('new_password')

        if not new_password or len(new_password) < 6:
            raise serializers.ValidationError("New password must be at least 6 characters")

        try:
            faculty = Faculty.objects.get(email=email)
        except Faculty.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")

        if not faculty.check_password(old_password):
            raise serializers.ValidationError("Invalid credentials")

        attrs['user'] = faculty
        return attrs
