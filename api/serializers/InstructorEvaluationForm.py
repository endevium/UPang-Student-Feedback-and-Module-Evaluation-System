from rest_framework import serializers
from ..models import InstructorEvaluationForm, Classroom

class InstructorEvaluationFormSerializer(serializers.ModelSerializer):
    classroom_code = serializers.CharField(write_only=True, required=False)
    title = serializers.CharField(
        source="instructor_name",
        read_only=True,
    )
    
    class Meta:
        model = InstructorEvaluationForm
        fields = [
            "id",
            "classroom",
            "instructor_name",  
            "title",    
            "description",
            "status",
            "created_at",
            "classroom_code",      
        ]
        read_only_fields = ["id", "title", "instructor_name", "created_at"]

    def get_instructor_name(self, obj):
        fac = getattr(obj.classroom, "faculty", None)
        if fac:
            return f"{fac.firstname} {fac.lastname}"
        return ""
    
    def validate(self, attrs):
        code = attrs.pop("classroom_code", None)
        if code:
            try:
                attrs["classroom"] = Classroom.objects.get(
                    classroom_code=code
                )
            except Classroom.DoesNotExist:
                raise serializers.ValidationError(
                    {"classroom_code": "Invalid classroom code."}
                )

        classroom = attrs.get("classroom")
        if not classroom:
            raise serializers.ValidationError(
                {"classroom": "This field is required."}
            )

        faculty = classroom.faculty
        attrs["instructor_name"] = f"{faculty.firstname} {faculty.lastname}"

        request_fac = getattr(self.context.get("request"), "user", None)
        if request_fac and request_fac != faculty:
            raise serializers.ValidationError(
                "You may only create forms for your own classroom."
            )

        return super().validate(attrs)

    def create(self, validated_data):
        validated_data.pop("classroom_code", None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("classroom_code", None)
        return super().update(instance, validated_data)