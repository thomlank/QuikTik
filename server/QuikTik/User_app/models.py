from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        USER = 'user', 'User'
        ADMIN = 'admin', 'Admin'

    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    email = models.EmailField(unique=True)
    username = None
    
    objects = UserManager()
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    
    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN
    
    @property
    def is_team_lead(self):
        return self.team_memberships.filter(role='lead').exists()
    
    @property
    def full_name(self):
        name = f"{self.first_name or ''} {self.last_name or ''}".strip()
        return name if name else self.email
    
    def get_led_teams(self):
        """Returns teams where this user is a lead"""
        return self.teams.filter(memberships__role='lead', memberships__user=self)
    
    def __str__(self):
        return self.email