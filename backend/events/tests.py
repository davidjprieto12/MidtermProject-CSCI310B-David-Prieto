from django.test import TestCase
from rest_framework.exceptions import ValidationError

from accounts.models import User
from .models import ActivityLog, Event
from .services import change_status

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
