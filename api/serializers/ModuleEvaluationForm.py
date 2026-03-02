from rest_framework import serializers
from ..models import ModuleEvaluationForm, Classroom

class ModuleEvaluationFormSerializer(serializers.ModelSerializer):
    # client may send either the PK or the code of the classroom
    classroom_code = serializers.CharField(write_only=True, required=False)
    module_name = serializers.CharField(
        source="subject_description", read_only=True
    )
    instructor_name = serializers.SerializerMethodField()

    class Meta:
        model = ModuleEvaluationForm
        fields = [
            "id",
            "classroom",          
            "classroom_code",     
            "subject_code",       
            "module_name",
            "instructor_name",        
            "description",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "subject_code",
            "module_name",
            "instructor_name",
            "created_at",
            "updated_at",
        ]

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
                    {"classroom_code": "Invalid classroom_code"}
                )

        classroom = attrs.get("classroom")
        if not classroom:
            raise serializers.ValidationError(
                {"classroom": "This field is required."}
            )

        attrs["subject_code"] = classroom.subject_code
        attrs["subject_description"] = classroom.module_name

        return super().validate(attrs)

    def create(self, validated_data):
        validated_data.pop("classroom_code", None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("classroom_code", None)
        return super().update(instance, validated_data)