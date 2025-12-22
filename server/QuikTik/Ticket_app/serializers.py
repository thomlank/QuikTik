from rest_framework import serializers
from .models import Category, Ticket, Comment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class CommentSerializer(serializers.ModelSerializer):
    author_email = serializers.EmailField(source='author.email', read_only=True)
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'ticket', 'author', 'author_email', 'author_name', 'content', 'created_at']
        read_only_fields = ['id', 'ticket', 'author', 'created_at']


class TicketSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    priority_label = serializers.CharField(source='get_priority_display', read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    assigned_to_email = serializers.EmailField(source='assigned_to.email', read_only=True, allow_null=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    team_name = serializers.CharField(source='assigned_to_team.name', read_only=True, allow_null=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Ticket
        fields = ['id', 'title', 'description', 'status', 'status_label', 
                  'priority', 'priority_label', 'category', 'category_name',
                  'created_by', 'created_by_email', 'assigned_to', 'assigned_to_email',
                  'assigned_to_team', 'team_name', 'created_at', 'updated_at', 'comments']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']