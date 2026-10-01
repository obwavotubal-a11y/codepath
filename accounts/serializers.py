from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'name',
            'email',
            'role',
            'phone',
            'gender',
            'country',
            'city',
            'bio',
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(required=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'name',
            'email',
            'password',
            'role',
            'phone',
            'gender',
            'country',
            'city',
            'bio',
        ]

    def validate_role(self, value):
        if value not in ('student', 'instructor'):
            raise serializers.ValidationError(
                'Choose Student or Instructor when creating an account.'
            )
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                'An account with this email already exists.'
            )
        return value.lower()

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=validated_data['role'],
            phone=validated_data.get('phone', ''),
            gender=validated_data.get('gender', ''),
            country=validated_data.get('country', ''),
            city=validated_data.get('city', ''),
            bio=validated_data.get('bio', ''),
        )