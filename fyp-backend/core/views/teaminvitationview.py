from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models import User
from core.models.teamsmodel import Team
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from core.serializers.teamSerializers import TeamSerializer
from core.models.teamsmodel import TeamInvitation

class JoinTeamView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        team_id = request.data.get('team_id')
        team = get_object_or_404(Team, id=team_id)

        # Self-checks
        if request.user == team.captain:
            return Response({'error': 'You are the team captain'}, status=status.HTTP_400_BAD_REQUEST)

        if team.members.filter(id=request.user.id).exists():
            return Response({'error': 'You are already a member of this team'}, status=status.HTTP_400_BAD_REQUEST)

        if Team.objects.filter(members=request.user).exists():
            return Response({'error': 'You are already in another team'}, status=status.HTTP_400_BAD_REQUEST)

        if TeamInvitation.objects.filter(team=team, user=request.user, status='Pending', type='ToTeam').exists():
            return Response({'error': 'You already have a pending join request to this team'}, status=status.HTTP_400_BAD_REQUEST)

        TeamInvitation.objects.create(
            team=team,
            user=request.user,
            invited_by=request.user,  # The user is sending the request
            type='ToTeam'             # 🔥 Important: Specify type explicitly
        )

        return Response({'message': 'Join request sent to the team captain'}, status=status.HTTP_200_OK)


class InvitationRespondView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        invitation_id = request.data.get('invitation_id')
        action = request.data.get('action')  # "accept" or "reject"

        invitation = get_object_or_404(TeamInvitation, id=invitation_id)

        if invitation.type == 'ToTeam':
            # Only captain can respond to join requests
            if request.user != invitation.team.captain:
                return Response({"error": "Only team captain can respond to this invitation"}, status=403)

        elif invitation.type == 'ToUser':
            # Only user can respond to invitations sent by team
            if request.user != invitation.user:
                return Response({"error": "Only the invited user can respond to this invitation"}, status=403)

        else:
            return Response({'error': 'Unauthorized to respond to this invitation'}, status=status.HTTP_403_FORBIDDEN)

        if invitation.status != 'Pending':
            return Response({'error': 'Invitation already responded to'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'accept':
            # Reject if user already in another team
            if Team.objects.filter(members=invitation.user).exclude(id=invitation.team.id).exists():
                invitation.status = 'Rejected'
                invitation.save()
                return Response({'error': 'User is already in another team'}, status=status.HTTP_400_BAD_REQUEST)

            invitation.team.members.add(invitation.user)
            invitation.status = 'Accepted'
            invitation.save()
            return Response({'message': 'Invitation accepted'}, status=status.HTTP_200_OK)

        elif action == 'reject':
            invitation.status = 'Rejected'
            invitation.save()
            return Response({'message': 'Invitation rejected'}, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

class ListPendingInvitationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get all teams where the user is captain
        captain_teams = Team.objects.filter(captain=request.user)

        # Get all pending invitations for those teams
        pending_invitations = TeamInvitation.objects.filter(team__in=captain_teams, status='Pending')

        data = [
            {
                'invitation_id': invitation.id,
                'team_id': invitation.team.id,
                'team_name': invitation.team.name,
                'user_id': invitation.user.id,
                #'username': invitation.user.username,
                'status': invitation.status,
                'requested_on': invitation.created_at if hasattr(invitation, 'created_at') else None
            }
            for invitation in pending_invitations
        ]

        return Response(data, status=status.HTTP_200_OK)

class TeamInvitesUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, team_id):
        user_id = request.data.get('user_id')

        # ✅ Console log equivalent in Python
        print(f"[Invite Log] Captain: {request.user.id}, Team ID: {team_id}, Inviting User ID: {user_id}")

        team = get_object_or_404(Team, id=team_id)
        user = get_object_or_404(User, id=user_id)

        if request.user != team.captain:
            return Response({'error': 'Only the team captain can send invitations'}, status=status.HTTP_403_FORBIDDEN)

        if Team.objects.filter(members=user).exists():
            return Response({'error': 'User is already in another team'}, status=status.HTTP_400_BAD_REQUEST)

        if TeamInvitation.objects.filter(team=team, user=user, status='Pending', type='ToUser').exists():
            return Response({'error': 'Invitation already sent to this user'}, status=status.HTTP_400_BAD_REQUEST)

        TeamInvitation.objects.create(
            team=team,
            user=user,
            invited_by=request.user,
            type='ToUser'
        )

        return Response({'message': f'Invitation sent to {user} to join {team.name}'}, status=status.HTTP_201_CREATED)

class ViewInvitationsSentToUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        invitations = TeamInvitation.objects.filter(user=request.user, status='Pending', type='ToUser')

        data = [
            {
                'invitation_id': invitation.id,
                'team_id': invitation.team.id,
                'team_name': invitation.team.name,
                'invited_by': invitation.invited_by.name,
                'status': invitation.status,
                'invited_on': invitation.created_at if hasattr(invitation, 'created_at') else None
            }
            for invitation in invitations
        ]

        return Response(data, status=status.HTTP_200_OK)
