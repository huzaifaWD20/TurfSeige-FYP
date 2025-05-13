from django.db import models
from django.conf import settings
from django.utils import timezone  # Make sure this is imported

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='team_logos/', blank=True, null=True)
    captain = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='captain_teams', null=True
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name='member_teams'
    )
    is_public = models.BooleanField(default=False)

    # Stats fields
    matches_played = models.PositiveIntegerField(default=0)
    wins = models.PositiveIntegerField(default=0)
    losses = models.PositiveIntegerField(default=0)
    draws = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name



class TeamInvitation(models.Model):
    INVITATION_TYPES = [
        ('ToTeam', 'User → Team'),
        ('ToUser', 'Team → User'),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='invitations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[('Pending', 'Pending'), ('Accepted', 'Accepted'), ('Rejected', 'Rejected')],
        default='Pending'
    )
    invited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_invitations')

    type = models.CharField(
        max_length=10,
        choices=INVITATION_TYPES,
        default='ToUser'  # ✅ Default added here
    )

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.get_type_display()} Invitation: {self.user.username} ↔ {self.team.name} - {self.status}"
