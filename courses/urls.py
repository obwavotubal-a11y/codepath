from django.urls import path
from .views import (
    CourseListView,
    CourseDetailView,
    EnrollView,
    FeedListView,
    ActivityListView,
    ActivityDetailView,
    SubmitActivityView,
    SubmissionListView,
    SubmissionDetailView,
    DashboardStatsView,
)

urlpatterns = [
    path('courses/', CourseListView.as_view(), name='course-list'),
    path('courses/<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('courses/<int:pk>/enroll/', EnrollView.as_view(), name='course-enroll'),

    path('activity/', FeedListView.as_view(), name='feed-list'),
    path('activities/', ActivityListView.as_view(), name='activities-list'),
    path('activities/<int:pk>/', ActivityDetailView.as_view(), name='activity-detail'),
    path('activities/<int:pk>/submit/', SubmitActivityView.as_view(), name='activity-submit'),
    path('submissions/', SubmissionListView.as_view(), name='submissions-list'),
        path('submissions/<int:pk>/', SubmissionDetailView.as_view(), name='submission-detail'),

    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]