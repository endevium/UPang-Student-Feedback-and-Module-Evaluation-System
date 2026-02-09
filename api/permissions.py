from rest_framework.permissions import BasePermission
from .models import DepartmentHead

class IsDepartmentHead(BasePermission):
    message = "Department head privileges required."

    def has_permission(self, request, view):
        user = request.user
        if not getattr(user, "is_authenticated", False):
            return False
        if getattr(user, "role", None) == "department_head":
            return True
        if isinstance(user, DepartmentHead):
            return True
        inst = getattr(user, "instance", None)
        if isinstance(inst, DepartmentHead):
            return True
        return False