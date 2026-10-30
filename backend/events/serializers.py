from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ["created_by", "status"]

    def validate_max_attendees(self, value):
        if value is not None and value < 1:
            raise serializers.ValidationError("Capacity must be at least 1.")
        return value

class TransitionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Event.Status.choices)