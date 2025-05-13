from rest_framework import serializers
from core.models.matchmodel import OpenMatch, MatchRequest, PendingLineup
from core.models.teamsmodel import Team
from rest_framework.exceptions import ValidationError
from core.models.authmodel import User
from core.models.teamsmodel import Team
from core.models.matchmodel import OpenMatch

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email']
class TeamCaptainSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email']  # Add more fields as needed

class OpenMatchSerializer(serializers.ModelSerializer):
    teamId = serializers.SerializerMethodField()
    teamName = serializers.SerializerMethodField()
    teamLogo = serializers.SerializerMethodField()
    format = serializers.CharField(source='match_format')
    paymentCondition = serializers.CharField(source='payment_condition')
    confirmed_players = serializers.SerializerMethodField()
    captain = serializers.SerializerMethodField()
    
    class Meta:
        model = OpenMatch
        fields = [
            'teamId',
            'teamName',
            'teamLogo',
            'date',
            'location',
            'format',
            'paymentCondition',
            'required_players',
            'confirmed_players',
            'captain',
        ]

    def get_teamId(self, obj):
        return obj.team.id

    def get_teamName(self, obj):
        return obj.team.name

    def get_teamLogo(self, obj):
        if obj.team.logo:
            return obj.team.logo.url
        return None

    def get_confirmed_players(self, obj):
        return obj.confirmed_players.count()


    def get_captain(self, obj):
        captain = obj.team.captain
        if captain:
            return TeamCaptainSerializer(captain).data
        return None


class PendingLineupSerializer(serializers.ModelSerializer):
    players = UserMiniSerializer(many=True, read_only=True)

    class Meta:
        model = PendingLineup
        fields = ['id', 'match_request', 'team_type', 'status', 'players']


class MatchRequestSerializer(serializers.ModelSerializer):
    requesting_team_name = serializers.CharField(source='requesting_team.name', read_only=True)
    target_team_name = serializers.CharField(source='target_team.name', read_only=True)
    requesting_team_lineup = serializers.SerializerMethodField()
    target_team_lineup = serializers.SerializerMethodField()

    class Meta:
        model = MatchRequest
        fields = [
            'id',
            'requesting_team',
            'requesting_team_name',
            'target_team',
            'target_team_name',
            'date',
            'location',
            'match_format',
            'message',
            'requested_at',
            'requesting_team_lineup',
            'target_team_lineup',
        ]

    def get_requesting_team_lineup(self, obj):
        lineup = PendingLineup.objects.filter(match_request=obj, team_type='requesting').first()
        return PendingLineupSerializer(lineup).data if lineup else None

    def get_target_team_lineup(self, obj):
        lineup = PendingLineup.objects.filter(match_request=obj, team_type='target').first()
        return PendingLineupSerializer(lineup).data if lineup else None