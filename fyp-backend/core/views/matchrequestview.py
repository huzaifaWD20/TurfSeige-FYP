from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from core.models.matchmodel import MatchRequest, OpenMatch, PendingLineup
from core.models.teamsmodel import Team
from core.serializers.matchSerializers import MatchRequestSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
import re

class MatchRequestCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        open_match_id = request.data.get('open_match')
        requesting_team_id = request.data.get('requesting_team')
        message = request.data.get('message', '')

        try:
            open_match = OpenMatch.objects.get(id=open_match_id)
            requesting_team = Team.objects.get(id=requesting_team_id)
        except (OpenMatch.DoesNotExist, Team.DoesNotExist):
            return Response({'error': 'Invalid match or team ID.'}, status=status.HTTP_404_NOT_FOUND)

        # Condition 1: User can't send request to their own team (whether member or captain)
        if user in open_match.team.members.all() or open_match.team.captain == user:
            return Response({'error': 'You cannot send a match request to your own team.'}, status=status.HTTP_400_BAD_REQUEST)

        # Condition 2: Only the captain of the requesting team can send request
        if requesting_team.captain != user:
            return Response({'error': 'Only the captain of the team can send a match request.'}, status=status.HTTP_403_FORBIDDEN)

        # Condition 3: Requesting team cannot be the same as open match's team
        if open_match.team.id == requesting_team.id:
            return Response({'error': 'Requesting team cannot be the same as the match hosting team.'}, status=status.HTTP_400_BAD_REQUEST)

        # Condition 4: User must be a captain of any team (already enforced by condition 2), still double-check
        if not Team.objects.filter(captain=user).exists():
            return Response({'error': 'You must be a captain of a team to send a request.'}, status=status.HTTP_403_FORBIDDEN)

        # Prevent duplicate requests
        if MatchRequest.objects.filter(open_match=open_match, requesting_team=requesting_team).exists():
            return Response({'error': 'Request already sent.'}, status=status.HTTP_400_BAD_REQUEST)

        # All checks passed: create match request
        match_request = MatchRequest.objects.create(
            open_match=open_match,
            requesting_team=requesting_team,
            message=message
        )

        serializer = MatchRequestSerializer(match_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MatchRequestListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, open_match_id):
        open_match = get_object_or_404(OpenMatch, id=open_match_id)

        # Only the captain of the team that created the open match can see the requests
        if open_match.team.captain != request.user:
            return Response({'error': 'Only the team captain can view match requests.'}, status=status.HTTP_403_FORBIDDEN)

        match_requests = MatchRequest.objects.filter(open_match=open_match).order_by('-requested_at')
        serializer = MatchRequestSerializer(match_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class CustomMatchRequestCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user

        # Extract data
        requesting_team_id = request.data.get('requestingTeamId')
        target_team_id = request.data.get('targetTeamId')
        message = request.data.get('message', '')
        date = request.data.get('date')
        location = request.data.get('location')
        match_format = request.data.get('format')

        # Validate teams
        try:
            requesting_team = Team.objects.get(id=requesting_team_id)
            target_team = Team.objects.get(id=target_team_id)
        except Team.DoesNotExist:
            return Response({'error': 'One or both team IDs are invalid.'}, status=status.HTTP_404_NOT_FOUND)

        # Prevent sending to own team
        if user in target_team.members.all() or target_team.captain == user:
            return Response({'error': 'You cannot send a match request to your own team.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure sender is captain
        if requesting_team.captain != user:
            return Response({'error': 'Only the captain of the team can send a match request.'}, status=status.HTTP_403_FORBIDDEN)

        # Prevent duplicate request
        if MatchRequest.objects.filter(
            requesting_team=requesting_team,
            target_team=target_team,
            date=date
        ).exists():
            return Response({'error': 'Match request already sent for that date.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get team sizes (including captain)
        requesting_team_players = list(requesting_team.members.all()) + [requesting_team.captain]
        target_team_players = list(target_team.members.all()) + [target_team.captain]

        requesting_team_count = len(requesting_team_players)
        target_team_count = len(target_team_players)

        # Extract format value
        match_format_number = None
        match = re.match(r"(\d+)[vV](\d+)", match_format)
        if match:
            match_format_number = int(match.group(1))
        else:
            return Response({'error': 'Invalid match format. Use like "5v5".'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate missing players
        required_requesting = max(0, match_format_number - requesting_team_count)
        required_target = max(0, match_format_number - target_team_count)

        # Create MatchRequest
        match_request = MatchRequest.objects.create(
            requesting_team=requesting_team,
            requesting_team_name=requesting_team.name,
            target_team=target_team,
            target_team_name=target_team.name,
            date=date,
            location=location,
            match_format=match_format,
            message=message,
            requested_at=timezone.now()
        )

        # Create PendingLineup entries with prefilled players
        requesting_lineup = PendingLineup.objects.create(
            match_request=match_request,
            team_type='requesting',
            status='complete' if required_requesting == 0 else 'pending'
        )
        requesting_lineup.players.set(requesting_team_players)

        target_lineup = PendingLineup.objects.create(
            match_request=match_request,
            team_type='target',
            status='complete' if required_target == 0 else 'pending'
        )
        target_lineup.players.set(target_team_players)

        serializer = MatchRequestSerializer(match_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DirectMatchRequestListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Check if user is captain of any team
        try:
            captain_team = Team.objects.get(captain=user)
        except Team.DoesNotExist:
            return Response({'error': 'You are not the captain of any team.'}, status=status.HTTP_403_FORBIDDEN)

        # Filter direct match requests (where open_match is null and target_team is the user's team)
        direct_requests = MatchRequest.objects.filter(
            open_match__isnull=True,
            target_team=captain_team
        ).order_by('-requested_at')

        serializer = MatchRequestSerializer(direct_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)