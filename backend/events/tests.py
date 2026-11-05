from django.test import TestCase
from django.db import connection
from django.test.utils import CaptureQueriesContext

from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

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

class EventEditTests(APITestCase):
    def setUp(self):
        self.alex = User.objects.create_user(username="alex", password="testpass123")
        self.sam = User.objects.create_user(username="sam", password="testpass123")
        self.event = Event.objects.create(
            title="Pizza", status="open", max_attendees=5, created_by=self.alex
        )
        self.url = f"/api/events/{self.event.pk}/"

    def test_creator_can_edit(self):
        self.client.force_authenticate(self.alex)
        response = self.client.patch(self.url, {"title": "Pizza night"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["title"], "Pizza night")

    def test_other_member_cannot_edit(self):
        self.client.force_authenticate(self.sam)
        response = self.client.patch(self.url, {"title": "Hijacked"}, format="json")
        self.assertEqual(response.status_code, 403)

    def test_cannot_lower_capacity_below_going_count(self):
        RSVP.objects.create(event=self.event, user=self.alex, response="going")
        RSVP.objects.create(event=self.event, user=self.sam, response="going")
        self.client.force_authenticate(self.alex)
        response = self.client.patch(self.url, {"max_attendees": 1}, format="json")
        self.assertEqual(response.status_code, 400)

class CommentApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="alex", password="testpass123")
        self.event = Event.objects.create(title="Pizza", status="open")
        self.url = f"/api/events/{self.event.pk}/comments/"

    def test_requires_login(self):
        self.assertEqual(self.client.get(self.url).status_code, 401)

    def test_post_sets_author_from_logged_in_user(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(self.url, {"body": "I'll bring snacks"}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["author"]["username"], "alex")

    def test_blank_body_is_rejected(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(self.url, {"body": "   "}, format="json")
        self.assertEqual(response.status_code, 400)

class EventListQueryTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="alex", password="testpass123")
        self.client.force_authenticate(self.user)

    def count_list_queries(self):
        with CaptureQueriesContext(connection) as ctx:
            response = self.client.get("/api/events/")
        self.assertEqual(response.status_code, 200)
        return len(ctx)

    def test_query_count_does_not_grow_with_events(self):
        for i in range(3):
            Event.objects.create(title=f"Event {i}", created_by=self.user)
        few = self.count_list_queries()
        for i in range(10):
            Event.objects.create(title=f"More {i}", created_by=self.user)
        many = self.count_list_queries()
        self.assertEqual(few, many)

    def test_list_includes_creator_name(self):
        Event.objects.create(title="Pizza", created_by=self.user)
        response = self.client.get("/api/events/")
        self.assertEqual(response.data[0]["creator"]["username"], "alex")

class ActivityApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="alex", password="testpass123")
        self.client.force_authenticate(self.user)

    def test_create_and_status_change_are_both_logged(self):
        created = self.client.post("/api/events/", {"title": "Pizza"}, format="json")
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data["creator"]["username"], "alex")

        event_id = created.data["id"]
        self.client.post(
            f"/api/events/{event_id}/transition/", {"status": "planning"}, format="json"
        )
        response = self.client.get(f"/api/events/{event_id}/activity/")
        self.assertEqual(response.status_code, 200)
        actions = sorted(entry["action"] for entry in response.data)
        self.assertEqual(actions, ["created", "status_changed"])