from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from cvat.apps.engine.models import LabeledShape, Task
from cvat.apps.engine.permissions import TaskPermission


class TaskAnnotationStatsView(APIView):
    def get(self, request, task_id):
        task = get_object_or_404(Task, pk=task_id)

        permission = TaskPermission.create_scope_view(request, task)
        if not permission.check_access().allow:
            raise PermissionDenied()

        shape_type = request.query_params.get("shape_type")

        annotations = LabeledShape.objects.filter(
            job__segment__task_id=task_id,
        )

        if shape_type:
            annotations = annotations.filter(type=shape_type)

        counts = list(
            annotations
            .values("label__name")
            .annotate(count=Count("id"))
            .order_by("-count", "label__name")
        )

        total = sum(item["count"] for item in counts)

        return Response({
            "task_id": task_id,
            "total": total,
            "filter": {
                "shape_type": shape_type,
            },
            "counts": [
                {
                    "label": item["label__name"],
                    "count": item["count"],
                }
                for item in counts
            ],
        })
