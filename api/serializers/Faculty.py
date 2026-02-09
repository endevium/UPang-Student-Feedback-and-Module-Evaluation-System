from rest_framework import serializers
from ..models.Faculty import Faculty

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
