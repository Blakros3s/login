from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    fullname = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'fullname']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        fullname = validated_data.pop('fullname')
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=fullname  # Storing fullname in first_name
        )
        return user
