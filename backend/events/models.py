from django.db import models

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
