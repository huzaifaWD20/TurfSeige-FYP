from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models import User
from core.models.teamsmodel import Team, TeamInvitation
#from core.models.matchmodel import OpenMatch  # Make sure this import is correct
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from core.serializers.teamSerializers import TeamSerializer
from django.db.models import Q

class TeamsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("POST data:", request.data)

        name = request.data.get('name')
        description = request.data.get('description', '')
        logo = request.FILES.get('logo')
        player_ids = request.data.get('player_ids', [])
        is_public = request.data.get('is_public', False)

        if not name:
            return Response({'error': 'Team name is required'}, status=status.HTTP_400_BAD_REQUEST)

        if Team.objects.filter(name=name).exists():
            return Response({'error': 'Team with this name already exists'}, status=status.HTTP_400_BAD_REQUEST)

        all_user_ids = list(set(player_ids + [request.user.id]))
        users = User.objects.filter(id__in=all_user_ids)

        if users.count() != len(all_user_ids):
            return Response({'error': 'One or more user IDs are invalid'}, status=status.HTTP_400_BAD_REQUEST)

        if Team.objects.filter(members__id__in=all_user_ids).exists():
            return Response({'error': 'One or more users are already in another team'}, status=status.HTTP_400_BAD_REQUEST)

        team = Team.objects.create(
            name=name,
            captain=request.user,
            description=description,
            logo=logo,
            is_public=is_public  # <-- NEW
        )
        team.members.add(*users)

        return Response({
            'message': 'Team created successfully',
            'team_id': team.id,
            'team_name': team.name,
            'is_public': team.is_public  # Optionally return this
        }, status=status.HTTP_201_CREATED)


    def get(self, request, team_id=None):
        if request.path.endswith('/public/'):
            auth_header = request.headers.get('Authorization')
            print("Authorization header:", auth_header)

            search_query = request.query_params.get('search', '')
            user = request.user

            # Get public teams
            public_teams = Team.objects.filter(is_public=True)

            # Exclude teams where the user is a captain or a member
            public_teams = public_teams.exclude(
                Q(captain=user) | Q(members=user)
            )

            # Apply search filter if provided
            if search_query:
                public_teams = public_teams.filter(name__icontains=search_query)

            serializer = TeamSerializer(public_teams, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Handle team details by ID
        if team_id:
            team = get_object_or_404(Team, id=team_id)

            if not team.is_public and not team.members.filter(id=request.user.id).exists() and request.user != team.captain:
                return Response({'error': 'You are not a member of this team'}, status=status.HTTP_403_FORBIDDEN)

            serializer = TeamSerializer(team)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, team_id):
        team = get_object_or_404(Team, id=team_id)

        if request.user != team.captain:
            return Response({'error': 'Only the team captain can edit the team'}, status=status.HTTP_403_FORBIDDEN)

        new_name = request.data.get('name')
        new_captain_id = request.data.get('new_captain_id')
        new_logo = request.FILES.get('logo')
        is_public = request.data.get('is_public')

        if new_name:
            if Team.objects.filter(name=new_name).exclude(id=team.id).exists():
                return Response({'error': 'Another team already has this name'}, status=status.HTTP_400_BAD_REQUEST)
            team.name = new_name

        if new_logo:
            team.logo = new_logo

        if new_captain_id:
            if int(new_captain_id) == request.user.id:
                return Response({'error': 'You are already the captain'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                new_captain = team.members.get(id=new_captain_id)
            except User.DoesNotExist:
                return Response({'error': 'The new captain must be a current team member'}, status=status.HTTP_400_BAD_REQUEST)
            team.captain = new_captain

        if is_public is not None:
            team.is_public = bool(is_public)

        team.save()

        return Response({'message': 'Team updated successfully'}, status=status.HTTP_200_OK)


class RemovePlayerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, team_id):
        team = get_object_or_404(Team, id=team_id)

        if request.user != team.captain:
            return Response({'error': 'Only the team captain can remove players'}, status=status.HTTP_403_FORBIDDEN)

        player_id = request.data.get('player_id')
        if not player_id:
            return Response({'error': 'Player ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            player_to_remove = team.members.get(id=player_id)
        except User.DoesNotExist:
            return Response({'error': 'Player not found in the team'}, status=status.HTTP_404_NOT_FOUND)

        if player_to_remove == team.captain:
            return Response({'error': 'Captain cannot remove themselves from the team'}, status=status.HTTP_400_BAD_REQUEST)

        team.members.remove(player_to_remove)
        return Response({'message': f'Player {player_to_remove.name} removed from the team successfully'}, status=status.HTTP_200_OK)


class CheckTeamStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Check if the user is a captain
        team_as_captain = Team.objects.filter(captain=user).first()
        if team_as_captain:
            serializer = TeamSerializer(team_as_captain)
            return Response({
                'status': 'captain',
                'team': serializer.data
            }, status=status.HTTP_200_OK)

        # Check if the user is a member of any team
        team_as_member = Team.objects.filter(members=user).first()
        if team_as_member:
            serializer = TeamSerializer(team_as_member)
            return Response({
                'status': 'member',
                'team': serializer.data
            }, status=status.HTTP_200_OK)

        # User is in no team
        return Response({'status': 'no_team'}, status=status.HTTP_200_OK)


class AvailablePlayersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get IDs of users who are captains or members
        captains_ids = Team.objects.values_list('captain__id', flat=True)
        member_ids = Team.objects.values_list('members__id', flat=True)
        excluded_user_ids = set(captains_ids).union(set(member_ids))

        # Get IDs of users already invited by the logged-in user and still pending
        already_invited_ids = TeamInvitation.objects.filter(
            invited_by=user,
            status='Pending'
        ).values_list('user__id', flat=True)

        # Combine all exclusions
        excluded_user_ids.update(already_invited_ids)

        # Final list of available users
        available_users = User.objects.exclude(id__in=excluded_user_ids)

        data = [
            {'id': user.id, 'name': user.name, 'email': user.email}
            for user in available_users
        ]

        return Response(data, status=status.HTTP_200_OK)


class DeleteTeamView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, team_id):
        team = get_object_or_404(Team, id=team_id)

        if request.user != team.captain:
            return Response({'error': 'Only the team captain can delete the team'}, status=status.HTTP_403_FORBIDDEN)

        # Delete all related invitations
        TeamInvitation.objects.filter(team=team).delete()

        # Delete all related OpenMatches
        #OpenMatch.objects.filter(team=team).delete()

        # Remove members
        team.members.clear()

        # Delete the team itself
        team.delete()

        return Response({'message': 'Team and all related data (invitations, open matches, matches) deleted successfully.'}, status=status.HTTP_200_OK)