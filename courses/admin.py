from django.contrib import admin
from .models import (
    Course, Enrollment, Module, Lesson, Activity, Submission,
    Question, Answer, QuizAttempt,
)


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1


class ActivityInline(admin.TabularInline):
    model = Activity
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'level', 'published', 'created_at', 'id')
    list_display_links = ('title',)
    list_filter = ('level', 'published')
    inlines = [ModuleInline]


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'id')
    list_display_links = ('title',)
    list_filter = ('course',)
    inlines = [LessonInline, ActivityInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'order', 'duration_minutes', 'id')
    list_display_links = ('title',)
    list_filter = ('module',)


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'activity_type', 'module', 'order', 'points', 'id')
    list_display_links = ('title',)
    list_filter = ('activity_type', 'module')


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'activity', 'status', 'grade', 'submitted_at')
    list_display_links = ('id',)
    list_filter = ('status', 'activity')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'course', 'progress_percent')
class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 4


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'activity', 'order', 'text')
    list_filter = ('activity',)
    inlines = [AnswerInline]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'activity', 'score', 'total_points', 'passed', 'submitted_at')
    list_filter = ('passed', 'activity')