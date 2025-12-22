from django.urls import path
from .views import (
    CategoryListView,
    CategoryDetailView,
    TicketListView,
    TicketDetailView,
    TicketAssignView,
    CommentListView,
    CommentDetailView
)

urlpatterns = [
    # Categories
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='category-detail'),
    
    # Tickets
    path('tickets/', TicketListView.as_view(), name='ticket-list'),
    path('tickets/<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),
    path('tickets/<int:pk>/assign/', TicketAssignView.as_view(), name='ticket-assign'),
    
    # Comments
    path('tickets/<int:ticket_pk>/comments/', CommentListView.as_view(), name='comment-list'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
]