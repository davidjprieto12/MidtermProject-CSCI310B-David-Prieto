from django.test import TestCase
from rest_framework.exceptions import ValidationError

from accounts.models import User
from .models import ActivityLog, Event, RSVP
from .services import change_status, remove_rsvp, set_rsvp

class ChangeStatusTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="alex", password="testpass123")

    def test_legal_move_saves_status_and_logs(self):
        event = Event.objects.create(title="Pizza", status="idea")
        change_status(event, "planning", self.user)
        event.refresh_from_db()
        self.assertEqual(event.status, "planning")
        self.assertEqual(ActivityLog.objects.filter(event=event).count(), 1)

    def test_illegal_move_is_rejected_and_not_logged(self):
        event = Event.objects.create(title="Pizza", status="idea")
        with self.assertRaises(ValidationError):
            change_status(event, "done", self.user)
        event.refresh_from_db()
        self.assertEqual(event.status, "idea")
        self.assertEqual(ActivityLog.objects.count(), 0)

    def test_confirming_requires_date_and_location(self):
        event = Event.objects.create(title="Pizza", status="open")
        with self.assertRaises(ValidationError):
            change_status(event, "confirmed", self.user)

class RsvpTests(TestCase):
    def setUp(self):
        self.alex = User.objects.create_user(username="alex", password="testpass123")
        self.sam = User.objects.create_user(username="sam", password="testpass123")

    def make_event(self, **kwargs):
        fields = {"title": "Pizza", "status": "open", "max_attendees": 1}
        fields.update(kwargs)
        return Event.objects.create(**fields)

    def test_going_saves_rsvp(self):
        event = self.make_event()
        set_rsvp(event, self.alex, "going")
        self.assertEqual(RSVP.objects.filter(event=event, response="going").count(), 1)

    def test_full_event_rejects_another_going(self):
        event = self.make_event(max_attendees=1)
        set_rsvp(event, self.alex, "going")
        with self.assertRaises(ValidationError):
            set_rsvp(event, self.sam, "going")
        self.assertEqual(RSVP.objects.filter(event=event).count(), 1)

    def test_full_event_still_allows_maybe(self):
        event = self.make_event(max_attendees=1)
        set_rsvp(event, self.alex, "going")
        set_rsvp(event, self.sam, "maybe")
        self.assertEqual(RSVP.objects.filter(event=event).count(), 2)

    def test_already_going_user_can_resubmit_when_full(self):
        event = self.make_event(max_attendees=1)
        set_rsvp(event, self.alex, "going")
        set_rsvp(event, self.alex, "going")  # must not raise
        self.assertEqual(RSVP.objects.filter(event=event).count(), 1)

    def test_rsvp_rejected_when_event_not_open(self):
        event = self.make_event(status="idea")
        with self.assertRaises(ValidationError):
            set_rsvp(event, self.alex, "going")

    def test_remove_deletes_rsvp(self):
        event = self.make_event()
        set_rsvp(event, self.alex, "going")
        remove_rsvp(event, self.alex)
        self.assertEqual(RSVP.objects.filter(event=event).count(), 0)

