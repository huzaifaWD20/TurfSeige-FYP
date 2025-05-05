from django.urls import path
from core.views.authview import SignUpView, LoginView
from core.views.profileview import UserProfile

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfile.as_view(), name='user-profile'),
]
