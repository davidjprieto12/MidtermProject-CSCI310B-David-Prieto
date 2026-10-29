from rest_framework.permissions import SAFE_METHODS, BasePermission

class IsCreatorOrAdmin(BasePermission):
    # Anyone logged in can read or create, but only the creator or an admin can change/delete

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.created_by == request.user or request.user.role == "admin"