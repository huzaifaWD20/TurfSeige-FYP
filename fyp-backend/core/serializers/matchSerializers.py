from rest_framework import serializers
from core.models.matchmodel import OpenMatch, MatchRequest
from core.models.teamsmodel import Team
from rest_framework.exceptions import ValidationError
from core.models.authmodel import User
from core.models.teamsmodel import Team
from core.models.matchmodel import OpenMatch

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


class MatchRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchRequest
        fields = '__all__'