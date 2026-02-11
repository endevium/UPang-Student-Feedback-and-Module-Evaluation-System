from rest_framework import serializers
from ..models.Student import Student

class StudentChangePasswordSerializer(serializers.Serializer):
    student_number = serializers.CharField()
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        student_number = attrs.get('student_number')
        old_password = attrs.get('old_password')
        new_password = attrs.get('new_password')

        if not new_password or len(new_password) < 6:
            raise serializers.ValidationError("New password must be at least 6 characters")

        try:
            student = Student.objects.get(student_number=student_number)
        except Student.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")

        if not student.check_password(old_password):
            raise serializers.ValidationError("Invalid credentials")

        attrs['user'] = student
        return attrs
