from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from Team_app.serializers import TeamMembershipSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    is_team_lead = serializers.BooleanField(read_only=True)
    teams = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'role', 'is_active', 'is_team_lead', 'teams']
        read_only_fields = ['id', 'email']
    
    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request')
        
        # Only admin and team leads can see role, is_active, and teams
        if request and not (request.user.is_admin or request.user.is_team_lead):
            fields.pop('role', None)
            fields.pop('is_active', None)
            fields.pop('teams', None)
        
        return fields
    
    def get_teams(self, obj):
        return TeamMembershipSerializer(obj.team_memberships.all(), many=True).data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'role']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)