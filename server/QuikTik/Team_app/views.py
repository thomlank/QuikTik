from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from User_app.models import User
from .models import Team, TeamMembership
from .serializers import TeamSerializer, TeamMembershipSerializer


class TeamListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        teams = Team.objects.all()
        serializer = TeamSerializer(teams, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        # Only admin can create teams
        if not request.user.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = TeamSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeamDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            team = Team.objects.get(pk=pk)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = TeamSerializer(team, context={'request': request})
        return Response(serializer.data)
    
    def patch(self, request, pk):
        # Only admin can update teams
        if not request.user.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            team = Team.objects.get(pk=pk)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = TeamSerializer(team, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        # Only admin can delete teams
        if not request.user.is_admin:
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            team = Team.objects.get(pk=pk)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)
        
        team.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TeamMemberListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, team_pk):
        try:
            team = Team.objects.get(pk=team_pk)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)
        
        memberships = team.memberships.all()
        serializer = TeamMembershipSerializer(memberships, many=True)
        return Response(serializer.data)
    
    def post(self, request, team_pk):
        try:
            team = Team.objects.get(pk=team_pk)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Admin can add to any team, team leads can only add to their own teams
        if not request.user.is_admin:
            if not team.memberships.filter(user=request.user, role='lead').exists():
                return Response({'error': 'Must be team lead of this team'}, status=status.HTTP_403_FORBIDDEN)
        
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'member')
        
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if TeamMembership.objects.filter(user=user, team=team).exists():
            return Response({'error': 'User already in team'}, status=status.HTTP_400_BAD_REQUEST)
        
        membership = TeamMembership.objects.create(user=user, team=team, role=role)
        serializer = TeamMembershipSerializer(membership)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TeamMemberDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        try:
            membership = TeamMembership.objects.get(pk=pk)
        except TeamMembership.DoesNotExist:
            return Response({'error': 'Membership not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Admin can update any, team leads can only update their own teams
        if not request.user.is_admin:
            if not membership.team.memberships.filter(user=request.user, role='lead').exists():
                return Response({'error': 'Must be team lead of this team'}, status=status.HTTP_403_FORBIDDEN)
        
        role = request.data.get('role')
        if role:
            membership.role = role
            membership.save()
        
        serializer = TeamMembershipSerializer(membership)
        return Response(serializer.data)
    
    def delete(self, request, pk):
        try:
            membership = TeamMembership.objects.get(pk=pk)
        except TeamMembership.DoesNotExist:
            return Response({'error': 'Membership not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Admin can remove from any team, team leads can only remove from their own teams
        if not request.user.is_admin:
            if not membership.team.memberships.filter(user=request.user, role='lead').exists():
                return Response({'error': 'Must be team lead of this team'}, status=status.HTTP_403_FORBIDDEN)
        
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)