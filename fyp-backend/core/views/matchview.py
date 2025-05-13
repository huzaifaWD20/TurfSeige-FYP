from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from core.models.teamsmodel import Team
from core.models.matchmodel import OpenMatch
from core.serializers.matchSerializers import OpenMatchSerializer
from django.shortcuts import get_object_or_404

class OpenMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        team_id = request.data.get('team_id')
        if not team_id:
            return Response({'error': 'Team ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        team = get_object_or_404(Team, id=team_id)

        # Only captain can create the match
        if team.captain != request.user:
            return Response({'error': 'Only the team captain can create a match.'}, status=status.HTTP_403_FORBIDDEN)

        match_data = request.data.copy()
        match_data.pop('team_id', None)

        match_format = match_data.get('match_format')
        if not match_format or match_format not in ['5v5', '6v6', '7v7', '11v11']:
            return Response({'error': 'Invalid or missing match format.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            required_players = int(match_format.split('v')[0])
        except ValueError:
            return Response({'error': 'Invalid match format.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get confirmed team members including captain
        team_members = list(team.members.all())
        if request.user not in team_members:
            team_members.append(request.user)

        confirmed_count = len(team_members)

        # Save the match
        serializer = OpenMatchSerializer(data=match_data)
        if serializer.is_valid():
            open_match = serializer.save(team=team)

            open_match.required_players = required_players
            open_match.confirmed_players.set(team_members)
            open_match.save()

            return Response({
                'message': 'Open match created successfully.',
                'data': OpenMatchSerializer(open_match).data,
                'confirmed_players_count': confirmed_count,
                'required_players': required_players
            }, status=status.HTTP_201_CREATED)

        return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)




    def get(self, request):
        open_matches = OpenMatch.objects.all().order_by('-date', '-time')
        serializer = OpenMatchSerializer(open_matches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



