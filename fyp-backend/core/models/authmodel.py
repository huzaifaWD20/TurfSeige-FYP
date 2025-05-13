from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self, email, name, phone=None, position=None, skill_level=None, age=None,
                    nationality=None, club=None, individual_rating=None, password=None):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)

        # Use default if individual_rating is None
        if individual_rating is None:
            individual_rating = 0

        user = self.model(
            email=email,
            name=name,
            phone=phone,
            position=position,
            skill_level=skill_level,
            age=age,
            nationality=nationality,
            club=club,
            individual_rating=individual_rating,
            is_active=True
        )
        user.set_password(password)
        user.save(using=self._db)
        return user



    def create_superuser(self, email, name, phone=None, position=None, skill_level=None, age=None, nationality=None, club=None, individual_rating=None, password=None):
        user = self.create_user(email, name, phone, position, skill_level, age, nationality, club, individual_rating, password)
        user.is_admin = True
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    position = models.CharField(max_length=50, blank=True, null=True)
    skill_level = models.CharField(max_length=50, blank=True, null=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    nationality = models.CharField(max_length=50, blank=True, null=True)
    club = models.CharField(max_length=100, blank=True, null=True)
    individual_rating = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email
