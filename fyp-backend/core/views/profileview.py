from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from core.models.authmodel import User
from core.serializers.authserializers import UserSerializer

class UserProfile(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user  # Automatically decoded from JWT
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
