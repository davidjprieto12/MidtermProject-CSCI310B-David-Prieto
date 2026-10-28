from django.db import models
from django.conf import settings

class Event(models.Model):
    class Status(models.TextChoices):
        IDEA = "idea", "Idea"
        PLANNING = "planning", "Planning"
        OPEN = "open", "Open"
        CONFIRMED = "confirmed", "Confirmed"
        DONE = "done", "Done"
        ON_HOLD = "on_hold", "On Hold"
        CANCELLED = "cancelled", "Cancelled"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.IDEA)
    created_at = models.DateTimeField(auto_now_add=True)

    max_attendees = models.PositiveIntegerField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL,
        related_name="created_events",
    )

class ActivityLog(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="activity")
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL,
        related_name="activity_logs"
    )
    action = models.CharField(max_length=50)
    old_value = models.CharField(max_length=100, blank=True)
    new_value = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
