from django.db import transaction
from rest_framework.exceptions import ValidationError, NotFound

from .models import ActivityLog, Event, RSVP

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

RSVP_OPEN_STATUS = ("open", "confirmed")

def _lock_event(event):
    # Reread the event with a row low, or raise a clean 401 if it was deleted meanwhile
    try:
        return Event.objects.select_for_update().get(pk=event.pk)
    except Event.DoesNotExist:
        raise NotFound("This event no longer exists.")

def change_status(event, new_status, user):
    # Move an event to a new status, enforcing the new workflow rules
    # The status change and activity log entry are saved together | not at all
    
    with transaction.atomic():
        event = _lock_event(event)
        old_status = event.status

        if new_status not in ALLOWED_TRANSACTIONS[old_status]:
            raise ValidationError(
                {"status": [f"Can't move an event from {old_status} to {new_status}."]}
            )

        if new_status == "confirmed" and not (event.starts_at and event.location):
            raise ValidationError(
                {"status": ["An event needs a date and a location before it can be confirmed."]}
            )

        event.status = new_status
        event.save(update_fields=["status"])
        ActivityLog.objects.create(
            event=event,
            actor=user,
            action="status_changed",
            old_value=old_status,
            new_value=new_status,
        )
    return event

def set_rsvp(event, user, response):
    # Create or change a user's RSVP, enforcing status & capacity rules
    with transaction.atomic():
        # Lock the event row so two people can't both grab the last post
        # NOTE: This project is built on SQLite, which doesn't enforce this. However, I would like to fork this and expand it later on, so this
        # is perfect for if I would like to eventually use something like Postgres or MySQL in later, less primitive iterations
        event = _lock_event(event)

        if event.status not in RSVP_OPEN_STATUS:
            raise ValidationError(
                {"response": ["RSVPs are only open while an event is Open or Confirmed."]}
            )

        if response == RSVP.Response.GOING and event.max_attendees is not None:
            # Exclude this user, so someone already going can resubmit when the event is full
            going = (
                RSVP.objects.filter(event=event, response=RSVP.Response.GOING)
                .exclude(user=user)
                .count()
            )
            if going >= event.max_attendees:
                raise ValidationError({"response": ["This event is full."]})

        rsvp, _ = RSVP.objects.update_or_create(
            event=event, user=user, defaults={"response": response}
        )
    return rsvp

def remove_rsvp(event, user):
    RSVP.objects.filter(event=event, user=user).delete()
