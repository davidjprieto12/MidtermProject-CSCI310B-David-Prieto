from django.conf import settings
from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    join_code = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "display_name", "password", "join_code"]

    def validate_join_code(self, value):
        if value != settings.JOIN_CODE:
            raise serializers.ValidationError("Invalid join code.")
        return value

    def create(self, validated_data):
        validated_data.pop("join_code")
        return User.objects.create_user(**validated_data) # Hashes the password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "display_name", "role"]