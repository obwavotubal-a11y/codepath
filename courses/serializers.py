from rest_framework import serializers
from .models import (
    Course, Enrollment, Module, Lesson,
    Activity, Submission,
    Question, Answer, QuizAttempt,
)


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            'id',
            'title',
            'content',
            'video_url',
            'order',
            'duration_minutes',
        ]

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    activities = serializers.SerializerMethodField()
    is_locked = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = [
            'id',
            'title',
            'description',
            'order',
            'lessons',
            'activities',
            'is_locked',
            'is_completed',
        ]

    def get_activities(self, obj):
        return [
            {
                'id': a.id,
                'title': a.title,
                'activity_type': a.activity_type,
                'points': a.points,
            }
            for a in obj.activities.all()
        ]

    def _is_module_completed(self, module, user):
        """A module is complete when every activity in it has been submitted."""
        activities = module.activities.all()
        if not activities.exists():
            return False
        submitted_ids = set(
            Submission.objects.filter(student=user, activity__in=activities)
            .values_list('activity_id', flat=True)
        )
        return all(a.id in submitted_ids for a in activities)

    def get_is_completed(self, obj):
        user = self.context.get('user')
        if not user or not user.is_authenticated:
            return False
        return self._is_module_completed(obj, user)

    def get_is_locked(self, obj):
        user = self.context.get('user')
        if not user or not user.is_authenticated:
            return False

        earlier = Module.objects.filter(
            course=obj.course,
            order__lt=obj.order,
        )
        for m in earlier:
            if not self._is_module_completed(m, user):
                return True
        return False 


class CourseSerializer(serializers.ModelSerializer):
    module_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'level',
            'published',
            'created_at',
            'module_count',
        ]

    def get_module_count(self, obj):
        return obj.modules.count()


class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'level',
            'published',
            'created_at',
            'modules',
        ]


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'progress_percent', 'enrolled_at']

class ActivitySerializer(serializers.ModelSerializer):
    submission_count = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id',
            'title',
            'description',
            'activity_type',
            'order',
            'points',
            'max_attempts',
            'due_date',
            'submission_count',
        ]

    def get_submission_count(self, obj):
        return obj.submissions.count()


class SubmissionSerializer(serializers.ModelSerializer):
    activity_title = serializers.CharField(source='activity.title', read_only=True)
    student_name = serializers.CharField(source='student.name', read_only=True)

    class Meta:
        model = Submission
        fields = [
            'id',
            'activity',
            'activity_title',
            'student',
            'student_name',
            'content',
            'repo_url',
            'status',
            'grade',
            'feedback',
            'submitted_at',
            'graded_at',
        ]
class AnswerSerializer(serializers.ModelSerializer):
   class Meta:
        model = Answer
        fields = ['id', 'text']


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'points', 'answers']


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'activity', 'score', 'total_points', 'passed', 'submitted_at']