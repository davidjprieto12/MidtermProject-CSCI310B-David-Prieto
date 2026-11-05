from rest_framework import serializers
from .models import Event, RSVP, Comment, ActivityLog
from accounts.serializers import UserSerializer

class EventSerializer(serializers.ModelSerializer):
    going_count = serializers.SerializerMethodField()
    my_rsvp = serializers.SerializerMethodField()
    creator = UserSerializer(source="created_by", read_only=True)


    class Meta:
        model = Event
        fields = [
            "id", "title", "description", "location", "starts_at", "status",
            "max_attendees", "created_by", "creator", "created_at", "going_count", "my_rsvp",
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

    def validate_max_attendees(self, value):
        if value is None:
            return value
        if value < 1:
            raise serializers.ValidationError("Capacity must be at least 1.")
        if self.instance is not None: # editing, not creating
            going = self.instance.rsvps.filter(response="going").count()
            if value < going:
                raise serializers.ValidationError(
                    f"{going} people are already going, so capacity can't be lower than that."
                )
        return value

class TransitionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Event.Status.choices)

class RSVPInputSerializer(serializers.Serializer):
    response = serializers.ChoiceField(choices=RSVP.Response.choices)

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "author", "body", "created_at"]
        extra_kwargs = {"body": {"max_length": 1000}}

class ActivityLogSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = ["id", "actor", "action", "old_value", "new_value", "created_at"]