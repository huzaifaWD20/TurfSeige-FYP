from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from core.models.authmodel import User
from core.serializers.authserializers import UserSerializer

class SignUpView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        # Generate the access and refresh tokens
        response = super().post(request, *args, **kwargs)

        # Check if login is successful and attach user info
        if response.status_code == 200:
            user = User.objects.get(email=request.data['email'])
            response.data.update({
                'userId': user.id,
                'userEmail': user.email,
                'userName': user.name
            })
        return response
