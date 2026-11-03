from django.shortcuts import render
from django.db.models import Count, OuterRef, Q, Subquery

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from . import services
from .permissions import IsCreatorOrAdmin
from .models import Event, RSVP
from .serializers import EventSerializer, TransitionSerializer, RSVPInputSerializer

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, IsCreatorOrAdmin]

    def get_queryset(self):
        my_rsvp = RSVP.objects.filter(
            event=OuterRef("pk"), user=self.request.user
        ).values("response")[:1]
        return (
            Event.objects.annotate(
                going_count=Count("rsvps", filter=Q(rsvps__response="going")),
                my_rsvp=Subquery(my_rsvp)
            )
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def _fresh(self, pk):
        # Reread through get_queryset so the response has the annotations
        return EventSerializer(self.get_queryset().get(pk=pk)).data

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def transition(self, request, pk=None):
        event = self.get_object()
        serializer = TransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = services.change_status(
            event, serializer.validated_data["status"], request.user
        )
        return Response(self._fresh(event.pk))

    @action(detail=True, methods=["put", "delete"], permission_classes=[IsAuthenticated])
    def rsvp(self, request, pk=None):
        event = self.get_object()
        if request.method == "PUT":
            serializer = RSVPInputSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            services.set_rsvp(event, request.user, serializer.validated_data["response"])
        else:
            services.remove_rsvp(event, request.user)
        return Response(self._fresh(event.pk))