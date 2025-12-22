from django.db import models


class Team(models.Model):
    name = models.CharField(max_length=50, unique=True)
    can_view_all_tickets = models.BooleanField(default=False)
    can_assign_tickets = models.BooleanField(default=False)
    can_close_tickets = models.BooleanField(default=False)
    can_delete_tickets = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    members = models.ManyToManyField(
        'User_app.User',
        through='TeamMembership',
        related_name='teams'
    )
    
    def __str__(self):
        return self.name


class TeamMembership(models.Model):
    class TeamRole(models.TextChoices):
        MEMBER = 'member', 'Member'
        LEAD = 'lead', 'Team Lead'
    
    user = models.ForeignKey(
        'User_app.User',
        on_delete=models.CASCADE,
        related_name='team_memberships'
    )
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    role = models.CharField(
        max_length=20,
        choices=TeamRole.choices,
        default=TeamRole.MEMBER
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'team']
    
    def __str__(self):
        return f"{self.user.email} - {self.team.name} ({self.role})"