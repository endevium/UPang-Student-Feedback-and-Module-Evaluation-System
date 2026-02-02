from rest_framework import serializers
from .models import Student, Faculty, DepartmentHead
from django.contrib.auth import authenticate

# Students
class StudentSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Student
        fields = [
            'id',
            'student_number',
            'email',
            'password',
            'profile_picture',
            'firstname',
            'middlename',
            'lastname',
            'contact_number',
            'department',
            'program',
            'year_level',
            'birthdate',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        student = Student(**validated_data)
        student.set_password(password)
        student.save()
        return student

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

# Faculty
class FacultySerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Faculty
        fields = [
            'id',
            'email',
            'password',
            'profile_picture',
            'firstname',
            'middlename',
            'lastname',
            'contact_number',
            'department',
            'status',
            'birthdate',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        faculty = Faculty(**validated_data)
        if password:
            faculty.set_password(password)
        faculty.save()
        return faculty

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


# Department Heads
class DepartmentHeadSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = DepartmentHead
        fields = [
            'id',
            'email',
            'password',
            'profile_picture',
            'firstname',
            'middlename',
            'lastname',
            'contact_number',
            'department',
            'status',
            'birthdate',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        head = DepartmentHead(**validated_data)
        if password:
            head.set_password(password)
        head.save()
        return head

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

