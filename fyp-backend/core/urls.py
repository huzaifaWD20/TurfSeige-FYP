from django.urls import path
from core.views.authview import SignUpView, LoginView
from core.views.profileview import UserProfile
from core.views.teamsview import TeamsView, CheckTeamStatusView, AvailablePlayersView, DeleteTeamView, RemovePlayerView
from core.views.teaminvitationview import JoinTeamView, InvitationRespondView, ListPendingInvitationsView,TeamInvitesUserView, ViewInvitationsSentToUserView
from core.views.matchview import OpenMatchView
from core.views.matchrequestview import MatchRequestCreateView,  MatchRequestListView, CustomMatchRequestCreateView, DirectMatchRequestListView

urlpatterns = [
    # authview
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),

    #profileview
    path('profile/', UserProfile.as_view(), name='user-profile'),

    #teamsview
    path('teams/create/', TeamsView.as_view(), name='create-team'),
    path('teams/public/', TeamsView.as_view(), name='public-teams'),  # ✅ New public teams route
    path('teams/<int:team_id>/', TeamsView.as_view(), name='edit-team'),
    path('teams/<int:team_id>/remove-player/', RemovePlayerView.as_view(), name='remove-player'),
    path('teams/check-status/', CheckTeamStatusView.as_view(), name='check-team-status'),
    path('teams/available-players/', AvailablePlayersView.as_view(), name='available_players'),
    path('teams/<int:team_id>/delete/', DeleteTeamView.as_view(), name='delete-team'),

    #teaminvitationview
    path('teams/join/', JoinTeamView.as_view(), name='join-team'),
    path('teams/<int:team_id>/invite/', TeamInvitesUserView.as_view(), name='team-invite-user'),
    path('teams/invitation/respond/', InvitationRespondView.as_view(), name='invitation-respond'),
    path('teams/invitations/pending/', ListPendingInvitationsView.as_view(), name='pending-invitations'),
    path('teams/invitations/received/', ViewInvitationsSentToUserView.as_view(), name='received-invitations'),

    #matchview
    path('match/create-match/', OpenMatchView.as_view(), name='create_match'),
    path('match/open-matches/', OpenMatchView.as_view(), name='open_matches'),  # ✅ New URL for viewing all open matches
    path('match/requests/', MatchRequestCreateView.as_view(), name='match-request-create'),
    path('match/requests/<int:open_match_id>/', MatchRequestListView.as_view(), name='match-requests'),
    path('match/request/custom/', CustomMatchRequestCreateView.as_view(), name='custom-match-request'),
    path('match/request/direct/', DirectMatchRequestListView.as_view(), name='direct-match-requests'),

]
