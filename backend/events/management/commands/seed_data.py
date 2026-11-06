from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from events.models import ActivityLog, Comment, Event
from events.services import change_status, set_rsvp

DEMO_PASSWORD = "demo1234"

# The demo_ prefix means the seed never overwrites an account a real person registered
DEMO_USERS = [
    # (username, display name, role)
    ("demo_admin", "Dana (Admin)", "admin"),
    ("demo_alex", "Alex", "member"),
    ("demo_sam", "Sam", "member"),
    ("demo_jordan", "Jordan", "member"),
]

# "path" is the list of statuses the event is moved through after it is created as an Idea.
# RSVPs are applied the first time the event reaches Open, because the rules only accept them then.
EVENTS = [
    {
        "title": "Beach day?",
        "description": "Anyone up for the beach if the weather holds?",
        "creator": "demo_sam",
        "comments": [("demo_alex", "Count me in if we leave early.")],
    },
    {
        "title": "Birthday dinner for Jordan",
        "description": "Need a place and a date that works for everyone.",
        "creator": "demo_alex",
        "days": 14,
        "path": ["planning"],
        "comments": [("demo_jordan", "Anywhere but sushi, please!")],
    },
    {
        "title": "Board game night",
        "description": "Bring snacks and your favorite game.",
        "location": "Alex's place",
        "creator": "demo_alex",
        "days": 5,
        "max_attendees": 8,
        "path": ["planning", "open"],
        "rsvps": {"demo_alex": "going", "demo_sam": "going", "demo_jordan": "maybe"},
        "comments": [("demo_sam", "I'll bring Catan.")],
    },
    {
        "title": "Escape room",
        "description": "Only three spots left on the booking.",
        "location": "Downtown",
        "creator": "demo_sam",
        "days": 9,
        "max_attendees": 3,
        "path": ["planning", "open"],
        "rsvps": {"demo_alex": "going", "demo_sam": "going", "demo_jordan": "going"},
    },
    {
        "title": "Movie marathon",
        "description": "Three movies, one couch.",
        "location": "Sam's place",
        "creator": "demo_sam",
        "mover": "demo_admin",
        "days": 3,
        "max_attendees": 6,
        "path": ["planning", "open", "confirmed"],
        "rsvps": {"demo_alex": "going", "demo_sam": "going", "demo_jordan": "maybe"},
        "comments": [("demo_alex", "Do we have popcorn?")],
    },
    {
        "title": "Hiking trip",
        "description": "Easy trail, good views.",
        "location": "Riverside trail",
        "creator": "demo_jordan",
        "days": -7,
        "path": ["planning", "open", "confirmed", "done"],
        "rsvps": {"demo_alex": "going", "demo_jordan": "going"},
        "comments": [("demo_alex", "That was great, let's do it again.")],
    },
    {
        "title": "Camping weekend",
        "description": "Waiting on everyone's schedules.",
        "creator": "demo_jordan",
        "path": ["planning", "on_hold"],
        "comments": [("demo_jordan", "Revisiting this next month.")],
    },
    {
        "title": "Concert night",
        "description": "Tickets sold out before we could book.",
        "creator": "demo_sam",
        "path": ["cancelled"],
    },
]


def at(days_from_now, hour=19):
    when = timezone.now() + timedelta(days=days_from_now)
    return when.replace(hour=hour, minute=0, second=0, microsecond=0)


class Command(BaseCommand):
    help = "Create demo users and events. Safe to run more than once."

    @transaction.atomic
    def handle(self, *args, **options):
        users = self._create_users()
        # Clear earlier demo events (comments, RSVPs, and history go with them)
        Event.objects.filter(created_by__in=list(users.values())).delete()
        for spec in EVENTS:
            self._create_event(spec, users)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(users)} demo users and {len(EVENTS)} events. "
                f"Log in as demo_admin or demo_alex with password {DEMO_PASSWORD}."
            )
        )

    def _create_users(self):
        users = {}
        for username, display_name, role in DEMO_USERS:
            user, _ = User.objects.get_or_create(username=username)
            user.display_name = display_name
            user.role = role
            user.set_password(DEMO_PASSWORD)  # hashes it, so the login actually works
            user.save()
            users[username] = user
        return users

    def _create_event(self, spec, users):
        creator = users[spec["creator"]]
        mover = users[spec.get("mover", spec["creator"])]
        starts_at = at(spec["days"]) if spec.get("days") is not None else None

        event = Event.objects.create(
            title=spec["title"],
            description=spec.get("description", ""),
            location=spec.get("location", ""),
            starts_at=starts_at,
            max_attendees=spec.get("max_attendees"),
            created_by=creator,
        )
        ActivityLog.objects.create(
            event=event, actor=creator, action="created", new_value=event.status
        )

        rsvps_done = False
        for status in spec.get("path", []):
            # Goes through the real rules, so the history timeline is genuine
            change_status(event, status, mover)
            if status == "open" and not rsvps_done:
                for username, response in spec.get("rsvps", {}).items():
                    set_rsvp(event, users[username], response)
                rsvps_done = True

        for username, body in spec.get("comments", []):
            Comment.objects.create(event=event, author=users[username], body=body)