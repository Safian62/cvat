from django.urls import path

from .views import TaskAnnotationStatsView


urlpatterns = [
    path(
        "tasks/<int:task_id>/annotation-stats",
        TaskAnnotationStatsView.as_view(),
        name="task-annotation-stats",
    ),
]
