from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    # Admin-only access
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class IsAdminOrReadOnly(BasePermission):
    # Read access for all authenticated users
    # write access for admins only
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_admin


class ObjectPermission(BasePermission):
    def has_permission(self, request, view):
        # authentication check
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # model methods authority
        user = request.user
        if user.is_admin:
            return True
        
        # HTTP method to permission action
        if request.method in SAFE_METHODS:
            action = 'view'
        elif request.method in ['PUT', 'PATCH']:
            action = 'edit'
        elif request.method == 'DELETE':
            action = 'delete'
        else:
            return False
        
        # Try model's permission method
        method_name = f'user_can_{action}'
        if hasattr(obj, method_name):
            return getattr(obj, method_name)(user)
        # for comments
        if action in ['edit', 'delete'] and hasattr(obj, 'user_can_modify'):
            return obj.user_can_modify(user)
        # for teams
        if hasattr(obj, 'can_user_modify'):
            return obj.can_user_modify(user)
        # for users
        if hasattr(obj, 'can_modify_user'):
            return obj.can_modify_user(user)
        return False


class SpecialPermission(BasePermission):
    """
    Special permission for actions that don't fit standard patterns
    
    Usage: For special endpoints like ticket assignment, role toggling, etc.
    Checks if user is admin or team lead
    
    Example: AssignTicketView, ToggleMemberRoleView
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Admin or team lead can perform special actions
        return (
            request.user.is_admin or
            request.user.is_team_lead()
        )