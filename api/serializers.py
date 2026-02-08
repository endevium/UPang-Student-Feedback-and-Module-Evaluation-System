from rest_framework import serializers
from .models import Student, Faculty, DepartmentHead, EvaluationForm
from django.contrib.auth import authenticate

# Students
class StudentSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    must_change_password = serializers.BooleanField(read_only=True)

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
            'must_change_password',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        student = Student(**validated_data)
        birthdate = validated_data.get('birthdate')
        if birthdate:
            first = (validated_data.get('firstname') or '').strip()
            middle = (validated_data.get('middlename') or '').strip()
            last = (validated_data.get('lastname') or '').strip()

            first_two = first[:2].upper()
            middle_two = middle[:2].upper() if middle else ''
            last_two = last[:2].upper()

            name_key = f"{first_two}{middle_two}{last_two}"
            month_year = f"{birthdate.month}{birthdate.year}"
            password = f"{name_key}{month_year}"

        if not password:
            raise serializers.ValidationError("Password or birthdate is required to create a student")

        student.set_password(password)
        student.must_change_password = True
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

# Faculty
class FacultySerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    must_change_password = serializers.BooleanField(read_only=True)

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
            'must_change_password',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        faculty = Faculty(**validated_data)
        birthdate = validated_data.get('birthdate')
        if birthdate:
            first = (validated_data.get('firstname') or '').strip()
            middle = (validated_data.get('middlename') or '').strip()
            last = (validated_data.get('lastname') or '').strip()

            first_two = first[:2].upper()
            middle_two = middle[:2].upper() if middle else ''
            last_two = last[:2].upper()

            name_key = f"{first_two}{middle_two}{last_two}"
            month_year = f"{birthdate.month}{birthdate.year}"
            password = f"{name_key}{month_year}"

        if not password:
            raise serializers.ValidationError("Password or birthdate is required to create a faculty")

        faculty.set_password(password)
        faculty.must_change_password = True
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

# Login
class StudentLoginSerializer(serializers.Serializer):
    student_number = serializers.CharField()  
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False)

    def validate(self, attrs):
        student_number = attrs.get('student_number')
        password = attrs.get('password')

        user = None

        try:
            student = Student.objects.get(student_number=student_number)
            if student.check_password(password):
                user = student
        except Student.DoesNotExist:
            pass

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        attrs['user'] = user
        return attrs

class FacultyLoginSerializer(serializers.Serializer):
    email = serializers.CharField()  
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = None

        try:
            faculty = Faculty.objects.get(email=email)
            if faculty.check_password(password):
                user = faculty
        except Faculty.DoesNotExist:
            pass

        if not user:
            try:
                head = DepartmentHead.objects.get(email__iexact=email)
                if head.check_password(password):
                    user = head
            except DepartmentHead.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        attrs['user'] = user
        return attrs

class DepartmentHeadLoginSerializer(serializers.Serializer):
    email = serializers.CharField()  
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = None

        try:
            head = DepartmentHead.objects.get(email=email)
            if head.check_password(password):
                user = head
        except DepartmentHead.DoesNotExist:
            pass

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        attrs['user'] = user
        return attrs

class EvaluationFormSerializer(serializers.ModelSerializer):
    questions_count = serializers.SerializerMethodField()
    usage_count = serializers.SerializerMethodField()

    class Meta:
        model = EvaluationForm
        fields = [
            'id',
            'title',
            'form_type',
            'description',
            'status',
            'questions',
            'questions_count',
            'usage_count',
            'created_at',
        ]

    def get_questions_count(self, obj):
        return len(obj.questions) if obj.questions else 0

    def get_usage_count(self, obj):
        # Placeholder for usage count, can be calculated based on evaluations
        return 0