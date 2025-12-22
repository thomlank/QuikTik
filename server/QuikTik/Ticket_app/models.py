from django.db import models
from User_app.models import User
from Team_app.models import Team


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Ticket(models.Model):
    class Status(models.IntegerChoices):
        OPEN = 1, 'Open'
        IN_PROGRESS = 2, 'In Progress'
        RESOLVED = 3, 'Resolved'
        CLOSED = 4, 'Closed'

    class Priority(models.IntegerChoices):
        LOW = 4, 'Low'
        MEDIUM = 3, 'Medium'
        HIGH = 2, 'High'
        URGENT = 1, 'Urgent'

    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.IntegerField(choices=Status.choices, default=Status.OPEN)
    priority = models.IntegerField(choices=Priority.choices, default=Priority.MEDIUM)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tickets')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    assigned_to_team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='team_tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Comment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.author} on {self.ticket}"