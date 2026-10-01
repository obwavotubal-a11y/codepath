from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health(request):
    """Simple health check — matches the old Express /api/health."""
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth endpoints:  /api/auth/register/  /api/auth/login/  /api/auth/me/
    path('api/auth/', include('accounts.urls')),

    # Course endpoints:  /api/courses/
    path('api/', include('courses.urls')),

    # Health check:  /api/health/
    path('api/health/', health, name='health'),
]