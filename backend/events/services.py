from django.db import transaction
from rest_framework.exceptions import ValidationError

from .models import ActivityLog, Event

# Should remain identical to README's status table / section
ALLOWED_TRANSACTIONS = {
    "idea": ["planning", "on_hold", "cancelled"],
    "planning": ["open", "on_hold", "cancelled"],
    "open": ["confirmed", "planning", "on_hold", "cancelled"],
    "confirmed": ["done", "open", "cancelled"],
    "on_hold": ["planning", "cancelled"],
    "cancelled": ["idea"],
    "done": [],
}

def change_status(event, new_status, user):
    # Move an event to a new status, enforcing the new workflow rules
    # The status change and activity log entry are saved together | not at all
    
    with transaction.atomic():
        event = Event.objects.select_for_update().get(pk=event.pk)
        old_status = event.status

        if new_status not in ALLOWED_TRANSACTIONS[old_status]:
            raise ValidationError(
                {"status": [f"Can't move an event from {old_status} to {new_status}."]}
            )

        if new_status == "confirmed" and not (event.starts_at and event.location):
            raise ValidationError(
                {"status": {f"An event needs a date and a location before it can be confirmed."}}
            )

        event.status = new_status
        event.save(update_fields=["status"])
        ActivityLog.objects.create(
            event=event,
            actor=user,
            action="status.changed",
            old_value=old_status,
            new_value=new_status,
        )
    return event
