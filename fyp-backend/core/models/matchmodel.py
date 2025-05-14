from django.db import models
from django.conf import settings
from .teamsmodel import Team

class OpenMatch(models.Model):
    MATCH_FORMAT_CHOICES = [
        ('5v5', '5v5'),
        ('6v6', '6v6'),
        ('7v7', '7v7'),
        ('11v11', '11v11'),
    ]

    PAYMENT_CHOICES = [
        ('lose_to_pay', 'Lose to pay'),
        ('50_50', '50/50 split'),
        ('70_30', '70/30 split'),
    ]

    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='open_matches'
    )
    match_format = models.CharField(max_length=10, choices=MATCH_FORMAT_CHOICES)
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=200)
    payment_condition = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    message = models.TextField(blank=True, null=True)

    required_players = models.PositiveIntegerField(default=0)
    confirmed_players = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='confirmed_matches',
        blank=True
    )

    def __str__(self):
        return f"{self.team.name} open match on {self.date}"


class MatchRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    open_match = models.ForeignKey(
        OpenMatch,
        on_delete=models.CASCADE,
        related_name='match_requests',
        null=True,
        blank=True
    )

    requesting_team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='sent_match_requests'
    )
    requesting_team_name = models.CharField(max_length=100, null=True, blank=True)  # ✅ Add this

    target_team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='received_match_requests',
        null=True,
        blank=True
    )
    target_team_name = models.CharField(max_length=100, null=True, blank=True)  # ✅ Add this

    match_format = models.CharField(
        max_length=10,
        choices=OpenMatch.MATCH_FORMAT_CHOICES,
        null=True,
        blank=True
    )

    date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=200, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True, null=True)
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.open_match:
            return f"Request by {self.requesting_team.name} for {self.open_match}"
        elif self.target_team:
            return f"Direct request: {self.requesting_team.name} → {self.target_team.name}"
        return f"Match Request by {self.requesting_team.name}"
