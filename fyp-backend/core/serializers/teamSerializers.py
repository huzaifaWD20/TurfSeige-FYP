from rest_framework import serializers
from core.models.authmodel import User
from core.models.teamsmodel import Team

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'position']  # ← Include position

class TeamSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        source='members', many=True, queryset=User.objects.all(), write_only=True
    )
    description = serializers.CharField(required=False, allow_blank=True)
    logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Team
        fields = [
            'id', 'name', 'description', 'logo',
            'members', 'member_ids', 'is_public', 'captain',
            'matches_played', 'wins', 'losses', 'draws'
        ]
