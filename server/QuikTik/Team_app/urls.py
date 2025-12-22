from django.urls import path
from .views import (
    TeamListView,
    TeamDetailView,
    TeamMemberListView,
    TeamMemberDetailView
)

urlpatterns = [
    path('', TeamListView.as_view(), name='team-list'),
    path('<int:pk>/', TeamDetailView.as_view(), name='team-detail'),
    path('<int:team_pk>/members/', TeamMemberListView.as_view(), name='team-members'),
    path('members/<int:pk>/', TeamMemberDetailView.as_view(), name='team-member-detail'),
]