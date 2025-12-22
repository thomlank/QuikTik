from rest_framework import serializers
from .models import Team, TeamMembership


class TeamMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    team_name = serializers.CharField(source='team.name', read_only=True)

    class Meta:
        model = TeamMembership
        fields = ['id', 'user', 'user_email', 'user_name', 'team', 'team_name', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']


class TeamSerializer(serializers.ModelSerializer):
    members = TeamMembershipSerializer(source='memberships', many=True, read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Team
        fields = ['id', 'name', 'can_view_all_tickets', 'can_assign_tickets', 
                  'can_close_tickets', 'can_delete_tickets', 'created_at', 
                  'members', 'member_count']
        read_only_fields = ['id', 'created_at']
    
    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request')
        
        # Only admin can see permission flags
        if request and not request.user.is_admin:
            fields.pop('can_view_all_tickets', None)
            fields.pop('can_assign_tickets', None)
            fields.pop('can_close_tickets', None)
            fields.pop('can_delete_tickets', None)
        
        return fields
    
    def get_member_count(self, obj):
        return obj.memberships.count()