# api/serializers/Block.py
from rest_framework import serializers
from ..models.Block import Block
from ..models.Program import Program

class BlockSerializer(serializers.ModelSerializer):
    program = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all()
    )
    department = serializers.CharField(read_only=True)

    class Meta:
        model = Block
        fields = ["id", "program", "department", "year_level", "block_name"]
        read_only_fields = ["id", "department"]

    def validate_program(self, prog):
        head = self.context.get("dept_head")
        if head and prog.department != head.department:
            raise serializers.ValidationError(
                "Cannot create a block for a program you don't own."
            )
        return prog

    def create(self, validated_data):
        prog = validated_data["program"]
        validated_data["department"] = prog.department
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("department", None)
        return super().update(instance, validated_data)