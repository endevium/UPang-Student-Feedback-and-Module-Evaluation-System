from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            'id',
            'student_number',
            'profile_picture',
            'firstname',
            'middlename',
            'lastname',
            'year_level',
            'birthdate',
        ]