from .Student import StudentSerializer
from .StudentLogin import StudentLoginSerializer
from .Faculty import FacultySerializer
from .FacultyLogin import FacultyLoginSerializer
from .DepartmentHead import DepartmentHeadSerializer
from .DepartmentHeadLogin import DepartmentHeadLoginSerializer
from .Module import ModuleSerializer
from .ModuleAssignment import ModuleAssignmentSerializer

__all__ = [
    "StudentSerializer",
    "StudentLoginSerializer",
    "FacultySerializer",
    "FacultyLoginSerializer",
    "DepartmentHeadSerializer",
    "DepartmentHeadLoginSerializer",
    "ModuleSerializer",
    "ModuleAssignmentSerializer",
]