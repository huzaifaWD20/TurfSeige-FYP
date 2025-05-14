from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from core.models.matchmodel import MatchRequest, OpenMatch, MatchJoinRequest, MatchInvitation
from core.models.teamsmodel import Team
from core.serializers.matchSerializers import MatchRequestSerializer, MatchJoinRequestSerializer, MatchInvitationSerializer,  TeamCaptainSerializer
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q  # Add this import at the top of your file

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

        requesting_team_id = request.data.get('requestingTeamId')
        target_team_id = request.data.get('targetTeamId')
        message = request.data.get('message', '')
        date = request.data.get('date')
        location = request.data.get('location')
        match_format = request.data.get('format')

        try:
            requesting_team = Team.objects.get(id=requesting_team_id)
            target_team = Team.objects.get(id=target_team_id)
        except Team.DoesNotExist:
            return Response({'error': 'Invalid team ID(s).'}, status=status.HTTP_404_NOT_FOUND)

        if user in target_team.members.all() or user == target_team.captain:
            return Response({'error': 'You cannot send request to your own team.'}, status=status.HTTP_400_BAD_REQUEST)

        if requesting_team.captain != user:
            return Response({'error': 'Only captain can send match request.'}, status=status.HTTP_403_FORBIDDEN)

        if MatchRequest.objects.filter(requesting_team=requesting_team, target_team=target_team, date=date).exists():
            return Response({'error': 'Request already sent for this date.'}, status=status.HTTP_400_BAD_REQUEST)

        required_players = int(match_format.split('v')[0])
        members_requesting = requesting_team.members.count()
        members_target = target_team.members.count()

        required_req = max(required_players - members_requesting, 0)
        required_tar = max(required_players - members_target, 0)

        status_req = 'complete' if required_req == 0 else 'incomplete'
        status_tar = 'complete' if required_tar == 0 else 'incomplete'

        print("Requesting Team Members:", list(requesting_team.members.values('id', 'name')))
        print("Target Team Members:", list(target_team.members.values('id', 'name')))

        match_request = MatchRequest.objects.create(
            requesting_team=requesting_team,
            target_team=target_team,
            requesting_team_name=requesting_team.name,
            target_team_name=target_team.name,
            match_format=match_format,
            date=date,
            location=location,
            message=message,
            requested_at=timezone.now(),
            requesting_required_players=required_req,
            requesting_confirmed_players=members_requesting,
            requesting_status=status_req,
            target_required_players=required_tar,
            target_confirmed_players=members_target,
            target_status=status_tar
        )

        serializer = MatchRequestSerializer(match_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MatchRespondView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, match_request_id):
        user = request.user
        action = request.data.get('action')  # accept / reject

        try:
            match_request = MatchRequest.objects.get(id=match_request_id)
        except MatchRequest.DoesNotExist:
            return Response({'error': 'Match request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if match_request.target_team.captain != user:
            return Response({'error': 'Only target team captain can respond to the match request.'}, 
                          status=status.HTTP_403_FORBIDDEN)

        if action not in ['accept', 'reject']:
            return Response({'error': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'accept':
            match_request.status = 'accepted'
            match_request.save()
            
            # Create invitations for all players (excluding captains) in both teams
            self._create_invitations(match_request)
            
            return Response({
                'message': 'Match request accepted. Invitations sent to all team members (excluding captains).',
                'match_status': 'accepted'
            }, status=status.HTTP_200_OK)
        else:
            match_request.delete()
            return Response({'message': 'Match request rejected and removed.'}, 
                          status=status.HTTP_200_OK)

    def _create_invitations(self, match_request):
        # Get captains for both teams
        requesting_captain = match_request.requesting_team.captain
        target_captain = match_request.target_team.captain
        
        # Create invitations for requesting team members (excluding captain)
        for player in match_request.requesting_team.members.exclude(id=requesting_captain.id):
            MatchInvitation.objects.get_or_create(
                match=match_request,
                user=player,
                team_side='requesting',
                defaults={'status': 'pending'}
            )
        
        # Create invitations for target team members (excluding captain)
        for player in match_request.target_team.members.exclude(id=target_captain.id):
            MatchInvitation.objects.get_or_create(
                match=match_request,
                user=player,
                team_side='target',
                defaults={'status': 'pending'}
            )


class OpenMatchListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Get accepted matches where at least one team is incomplete
        matches = MatchRequest.objects.filter(
            status='accepted'
        ).filter(
            Q(requesting_status='incomplete') | Q(target_status='incomplete')
        )

        data = []
        for match in matches:
            # Calculate open slots (only show positive numbers)
            open_slots_req = max(match.requesting_required_players, 0)
            open_slots_tar = max(match.target_required_players, 0)
            
            # Only include matches that actually have open slots
            if open_slots_req > 0 or open_slots_tar > 0:
                entry = MatchRequestSerializer(match).data
                entry['open_slots_requesting'] = open_slots_req
                entry['open_slots_target'] = open_slots_tar
                data.append(entry)

        return Response(data)

class JoinMatchSlotRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, match_id):
        user = request.user
        team_side = request.data.get('team_side')

        # Validate team_side choices
        if team_side not in ['requesting', 'target']:
            return Response({'error': 'Invalid team side. Must be either "requesting" or "target".'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        try:
            match = MatchRequest.objects.get(id=match_id)
        except MatchRequest.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if user is already a member or captain of either team
        is_requesting_team_member = match.requesting_team.members.filter(id=user.id).exists()
        is_target_team_member = match.target_team.members.filter(id=user.id).exists()
        is_requesting_captain = match.requesting_team.captain == user
        is_target_captain = match.target_team.captain == user

        if is_requesting_team_member or is_target_team_member or is_requesting_captain or is_target_captain:
            return Response({
                'error': 'You cannot send a join request as you are already a member or captain of one of the teams.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Check if user already has a pending request for this match
        existing_request = MatchJoinRequest.objects.filter(
            match=match,
            user=user,
            status='pending'
        ).exists()

        if existing_request:
            return Response({
                'error': 'You already have a pending join request for this match.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get user details
        user_name = user.name  # Assuming your User model has a name field
        user_position = request.data.get('position')  # Position from request data

        if not user_position:
            return Response({'error': 'Position is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the join request
        join_request = MatchJoinRequest.objects.create(
            match=match,
            user=user,
            name=user_name,
            position=user_position,
            team_side=team_side,
            status='pending'
        )
        
        serializer = MatchJoinRequestSerializer(join_request)
        return Response({
            'message': 'Join request submitted successfully.',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

class MatchJoinApprovalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, match_id, join_request_id):
        user = request.user
        action = request.data.get('action')  # accept / reject

        try:
            match = MatchRequest.objects.get(id=match_id)
            join_request = MatchJoinRequest.objects.get(id=join_request_id, match=match)
        except (MatchRequest.DoesNotExist, MatchJoinRequest.DoesNotExist):
            return Response({'error': 'Match or Join request not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if user is captain of either team
        is_captain = (match.requesting_team.captain == user or match.target_team.captain == user)
        if not is_captain:
            return Response({'error': 'Only captains can approve/reject join requests.'}, 
                           status=status.HTTP_403_FORBIDDEN)

        if action == 'accept':
            join_request.status = 'accepted'
            join_request.save()

            # Update match player counts based on which team the player joined
            if join_request.team_side == 'requesting':  # Changed from team_type to team_side
                match.requesting_confirmed_players += 1
                match.requesting_required_players = max(match.requesting_required_players - 1, 0)
                if match.requesting_required_players == 0:
                    match.requesting_status = 'complete'  # Changed from status_requesting
            else:
                match.target_confirmed_players += 1
                match.target_required_players = max(match.target_required_players - 1, 0)
                if match.target_required_players == 0:
                    match.target_status = 'complete'  # Changed from status_target
            match.save()
        elif action == 'reject':
            join_request.status = 'rejected'
            join_request.save()
        else:
            return Response({'error': 'Invalid action. Must be "accept" or "reject".'}, 
                           status=status.HTTP_400_BAD_REQUEST)

        return Response({'status': f'{action}ed'}, status=status.HTTP_200_OK)


class PendingJoinRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, match_id):
        user = request.user

        try:
            match = MatchRequest.objects.get(id=match_id)
        except MatchRequest.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)

        if user != match.requesting_team.captain and user != match.target_team.captain:
            return Response({'error': 'Only captains can view join requests.'}, status=status.HTTP_403_FORBIDDEN)

        join_requests = MatchJoinRequest.objects.filter(match=match, status='pending')
        serializer = MatchJoinRequestSerializer(join_requests, many=True)
        return Response(serializer.data)




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



class UserInvitationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        invitations = MatchInvitation.objects.filter(
            user=request.user
        ).select_related(
            'match',
            'match__requesting_team',
            'match__target_team'
        ).order_by('-created_at')
        
        serializer = MatchInvitationSerializer(invitations, many=True)
        
        return Response({
            'count': invitations.count(),
            'pending_count': invitations.filter(status='pending').count(),
            'invitations': serializer.data
        })


class MatchInvitationResponseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, invitation_id):
        """
        Handle invitation response (accept/reject)
        Example POST body: {"action": "accept"} or {"action": "reject"}
        """
        try:
            invitation = MatchInvitation.objects.get(
                id=invitation_id,
                user=request.user  # Ensure user can only respond to their own invitations
            )
        except MatchInvitation.DoesNotExist:
            return Response(
                {'error': 'Invitation not found or you are not authorized.'},
                status=status.HTTP_404_NOT_FOUND
            )

        action = request.data.get('action', '').lower()
        
        if action not in ['accept', 'reject']:
            return Response(
                {'error': 'Invalid action. Must be "accept" or "reject".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if invitation.status != 'pending':
            return Response(
                {'error': f'Invitation already {invitation.status}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Process the response
        if action == 'accept':
            return self._handle_accept(invitation)
        else:
            return self._handle_reject(invitation)

    def _handle_accept(self, invitation):
        match = invitation.match
        team_side = invitation.team_side

        # Update invitation status
        invitation.status = 'accepted'
        invitation.save()

        # Update match player counts
        if team_side == 'requesting':
            match.requesting_confirmed_players += 1
            # Update status if requirements are met
            if match.requesting_confirmed_players >= match.requesting_required_players:
                match.requesting_status = 'complete'
        else:
            match.target_confirmed_players += 1
            if match.target_confirmed_players >= match.target_required_players:
                match.target_status = 'complete'

        match.save()

        return Response(
            {
                'message': 'Invitation accepted successfully.',
                'invitation': MatchInvitationSerializer(invitation).data,
                'match_status': {
                    'requesting': {
                        'confirmed': match.requesting_confirmed_players,
                        'required': match.requesting_required_players,
                        'status': match.requesting_status
                    },
                    'target': {
                        'confirmed': match.target_confirmed_players,
                        'required': match.target_required_players,
                        'status': match.target_status
                    }
                }
            },
            status=status.HTTP_200_OK
        )

    def _handle_reject(self, invitation):
        invitation.status = 'rejected'
        invitation.save()

        return Response(
            {
                'message': 'Invitation rejected.',
                'invitation': MatchInvitationSerializer(invitation).data
            },
            status=status.HTTP_200_OK
        )


class CompletedMatchesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        completed_matches = MatchRequest.objects.filter(
            status='accepted'
        ).filter(
            requesting_team__captain=user
        ) | MatchRequest.objects.filter(
            status='accepted',
            target_team__captain=user
        )

        data = []

        for match in completed_matches:
            requesting_team = match.requesting_team
            target_team = match.target_team

            requesting_captain = requesting_team.captain if requesting_team else None
            target_captain = target_team.captain if target_team else None

            # ✅ Get confirmed players for requesting team from both models
            requesting_confirmed_players_invitation = MatchInvitation.objects.filter(
                match=match,
                team_side='requesting',
                status='accepted'
            ).select_related('user')

            requesting_confirmed_players_join_request = MatchJoinRequest.objects.filter(
                match=match,
                team_side='requesting',
                status='accepted'
            ).select_related('user')

            # ✅ Get confirmed players for target team from both models
            target_confirmed_players_invitation = MatchInvitation.objects.filter(
                match=match,
                team_side='target',
                status='accepted'
            ).select_related('user')

            target_confirmed_players_join_request = MatchJoinRequest.objects.filter(
                match=match,
                team_side='target',
                status='accepted'
            ).select_related('user')

            # Combine both invitation and join request players for each team
            requesting_confirmed_players = list(requesting_confirmed_players_invitation) + list(requesting_confirmed_players_join_request)
            target_confirmed_players = list(target_confirmed_players_invitation) + list(target_confirmed_players_join_request)

            def serialize_players(player_qs):
                return [
                    {
                        'id': player.user.id,
                        'name': player.user.name,
                        'role': getattr(player.user, 'role', None)  # adjust field if needed
                    }
                    for player in player_qs
                ]

            match_data = {
                'id': match.id,
                'date': match.date,
                'location': match.location,
                'format': match.match_format,
                'status': match.status,
                'requesting_team': {
                    'id': requesting_team.id if requesting_team else None,
                    'name': requesting_team.name if requesting_team else None,
                    'captain': TeamCaptainSerializer(requesting_captain).data if requesting_captain else None,
                    'required_players': match.requesting_required_players,
                    'confirmed_players_count': match.requesting_confirmed_players,
                    'confirmed_players': serialize_players(requesting_confirmed_players),
                    'team_status': match.requesting_status,
                },
                'target_team': {
                    'id': target_team.id if target_team else None,
                    'name': target_team.name if target_team else None,
                    'captain': TeamCaptainSerializer(target_captain).data if target_captain else None,
                    'required_players': match.target_required_players,
                    'confirmed_players_count': match.target_confirmed_players,
                    'confirmed_players': serialize_players(target_confirmed_players),
                    'team_status': match.target_status,
                }
            }

            data.append(match_data)

        return Response(data)
