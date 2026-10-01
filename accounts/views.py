from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import User
from .serializers import UserSerializer, RegisterSerializer


def make_token(user):
    """Create a JWT access token for the given user."""
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


class RegisterView(APIView):
    """POST /api/auth/register/ — creates a Student or Instructor account."""

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            first_error = next(iter(serializer.errors.values()))[0]
            return Response(
                {'message': str(first_error)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()
        return Response(
            {
                'user': UserSerializer(user).data,
                'token': make_token(user),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/auth/login/ — returns user + token if credentials are valid."""

    def post(self, request):
        email = request.data.get('email', '').lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'message': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response(
                {'message': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response({
            'user': UserSerializer(user).data,
            'token': make_token(user),
        })


class MeView(APIView):
    """GET /api/auth/me/ — returns the logged-in user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'user': UserSerializer(request.user).data})


class ForgotPasswordView(APIView):
    """POST /api/auth/forgot-password/ — generate a reset token for the email."""

    permission_classes = []

    def post(self, request):
        email = request.data.get('email', '').strip().lower()

        if not email:
            return Response(
                {'message': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({
                'message': 'If an account exists for that email, a reset link has been sent.'
            })

        token = RefreshToken.for_user(user)
        reset_token = str(token.access_token)
        reset_link = f'http://localhost:5173/reset-password?token={reset_token}'

        print(f'\n=== PASSWORD RESET LINK for {email} ===')
        print(reset_link)
        print('======================================\n')

        response_data = {
            'message': 'If an account exists for that email, a reset link has been sent.'
        }

        from django.conf import settings
        if settings.DEBUG:
            response_data['reset_token'] = reset_token
            response_data['reset_link'] = reset_link

        return Response(response_data)


class ResetPasswordView(APIView):
    """POST /api/auth/reset-password/ — set a new password using a reset token."""

    permission_classes = []

    def post(self, request):
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework_simplejwt.exceptions import TokenError

        token = request.data.get('token', '')
        new_password = request.data.get('password', '')

        if not token or not new_password:
            return Response(
                {'message': 'Token and new password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 8:
            return Response(
                {'message': 'Password must contain at least 8 characters.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            access = AccessToken(token)
            user_id = access['user_id']
            user = User.objects.get(id=user_id)
        except (TokenError, User.DoesNotExist):
            return Response(
                {'message': 'This reset link is invalid or has expired.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()

        return Response({'message': 'Password updated. You can now log in.'})