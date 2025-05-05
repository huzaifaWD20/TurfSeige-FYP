from rest_framework import serializers
from core.models.authmodel import User
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 
            'email', 
            'name', 
            'phone', 
            'position', 
            'skill_level', 
            'age', 
            'nationality', 
            'club', 
            'individual_rating', 
            'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'email': {'required': False},
        }

    def create(self, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)
