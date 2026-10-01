from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Course, Enrollment, Lesson, Activity, Submission
from .serializers import (
    CourseSerializer,
    CourseDetailSerializer,
    ActivitySerializer,
    SubmissionSerializer,
)


class CourseListView(APIView):
    """GET /api/courses/ — all published courses, with is_enrolled flag."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        courses = Course.objects.filter(published=True)
        enrolled_ids = set(
            Enrollment.objects.filter(student=request.user)
            .values_list('course_id', flat=True)
        )
        data = CourseSerializer(courses, many=True).data
        for item in data:
            item['is_enrolled'] = item['id'] in enrolled_ids
        return Response({'courses': data})


class CourseDetailView(APIView):
    """GET /api/courses/<id>/ — one course with modules + lessons."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk, published=True)
        data = CourseDetailSerializer(course, context={'user': request.user}).data
        return Response({'course': data})


class EnrollView(APIView):
    """POST /api/courses/<id>/enroll/ — enrolls the current user."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk, published=True)
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course,
            defaults={'progress_percent': 0},
        )
        return Response(
            {
                'enrolled': True,
                'created': created,
                'course_id': course.id,
                'progress_percent': str(enrollment.progress_percent),
            },
            status=201 if created else 200,
        )


class FeedListView(APIView):
    """GET /api/activity/ — recent enrollment events for the current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enrollments = (
            Enrollment.objects
            .filter(student=request.user)
            .select_related('course')
            .order_by('-enrolled_at')[:10]
        )
        activities = [
            {
                'type': 'success',
                'icon': '✓',
                'title': f"Enrolled in {e.course.title}",
                'detail': f"{e.course.level.capitalize()} course",
                'time': e.enrolled_at.strftime('%b %d, %Y'),
            }
            for e in enrollments
        ]
        return Response({'activities': activities})


class ActivityListView(APIView):
    """GET /api/activities/ — activities from courses the user is enrolled in."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enrolled_courses = Course.objects.filter(
            enrollments__student=request.user,
            published=True,
        ).distinct()

        activities = Activity.objects.filter(
            module__course__in=enrolled_courses,
        )

        # Optional filter: ?type=lab, ?type=assignment, etc.
        activity_type = request.query_params.get('type')
        if activity_type:
            activities = activities.filter(activity_type=activity_type)

        activities = activities.select_related(
            'module', 'module__course',
        ).order_by('module__course__title', 'module__order', 'order')

        data = []
        for a in activities:
            item = ActivitySerializer(a).data
            item['module_title'] = a.module.title
            item['course_title'] = a.module.course.title
            data.append(item)

        return Response({'activities': data})


class ActivityDetailView(APIView):
    """GET /api/activities/<id>/ — one activity with the user's submission info."""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        activity = get_object_or_404(Activity, pk=pk)
        data = ActivitySerializer(activity).data
        my_submissions = Submission.objects.filter(
            student=request.user, activity=activity,
        )
        data['my_submission_count'] = my_submissions.count()
        data['my_latest_submission'] = (
            SubmissionSerializer(my_submissions.first()).data
            if my_submissions.exists() else None
        )
        return Response({'activity': data})


class SubmitActivityView(APIView):
    """POST /api/activities/<id>/submit/ — record a submission."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        activity = get_object_or_404(Activity, pk=pk)
        existing = Submission.objects.filter(student=request.user, activity=activity)
        if existing.count() >= activity.max_attempts:
            return Response(
                {'message': f'You have used all {activity.max_attempts} attempt(s).'},
                status=400,
            )
        submission = Submission.objects.create(
            student=request.user,
            activity=activity,
            content=request.data.get('content', 'Marked as complete'),
            repo_url=request.data.get('repo_url', ''),
            status='submitted',
        )
        return Response(
            {'submission': SubmissionSerializer(submission).data},
            status=201,
        )


class SubmissionListView(APIView):
    """GET /api/submissions/ — all of the user's submissions."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        subs = Submission.objects.filter(
            student=request.user,
        ).select_related('activity').order_by('-submitted_at')
        return Response({'submissions': SubmissionSerializer(subs, many=True).data})


class DashboardStatsView(APIView):
    """GET /api/dashboard/stats/ — summary numbers for the student dashboard."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        enrollments = Enrollment.objects.filter(student=user)
        enrolled_courses = Course.objects.filter(
            enrollments__student=user, published=True,
        ).distinct()
        total_lessons = Lesson.objects.filter(
            module__course__in=enrolled_courses,
        ).count()
        latest = (
            enrollments
            .select_related('course')
            .order_by('-enrolled_at')
            .first()
        )
        latest_data = None
        if latest:
            latest_data = {
                'course_id': latest.course.id,
                'course_title': latest.course.title,
                'course_description': latest.course.description,
                'level': latest.course.level,
                'progress_percent': float(latest.progress_percent),
            }
        return Response({
            'enrolled_courses_count': enrolled_courses.count(),
            'total_lessons_count': total_lessons,
            'latest_enrollment': latest_data,
        })
class SubmissionDetailView(APIView):
     """GET /api/submissions/<id>/ — one submission (owner or staff only)."""
     permission_classes = [IsAuthenticated]

     def get(self, request, pk):
        submission = get_object_or_404(Submission, pk=pk)
        if submission.student_id != request.user.id and request.user.role not in ('instructor', 'admin'):
            return Response(
                {'message': 'You do not have pemission.'},
                status=403,
            )
        return Response({'submission': SubmissionSerializer(submission).data})