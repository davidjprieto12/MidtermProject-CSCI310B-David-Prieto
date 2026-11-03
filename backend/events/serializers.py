from rest_framework import serializers
from .models import Event, RSVP

class EventSerializer(serializers.ModelSerializer):
    going_count = serializers.SerializerMethodField()
    my_rsvp = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id", "title", "description", "location", "starts_at", "status",
            "max_attendees", "created_by", "created_at", "going_count", "my_rsvp",
        ]
        read_only_fields = ["created_by", "status"]

    # The two following gets relate to get_queryset in the ViewSet
    # A newly created event has 0 people going and no RSVP yet, these methods ensure they fall to those defaults

    def get_going_count(self, obj):
        return getattr(obj, "going_count", 0)

    def get_my_rsvp(self, obj):
        return getattr(obj, "my_rsvp", None)

    def validate_max_attendees(self, value):
        if value is not None and value < 1:
            raise serializers.ValidationError("Capacity must be at least 1.")
        return value

class TransitionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Event.Status.choices)

class RSVPInputSerializer(serializers.Serializer):
    response = serializers.ChoiceField(choices=RSVP.Response.choices)