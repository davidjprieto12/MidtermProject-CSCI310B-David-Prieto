# Hangout Board — Web App Midterm

## Overview
Hangout Board is a full-stack web application meant to address the least fun part about seeing your friends: Planning. The site hosts what is essentially a ticketing hub, except for upcoming hangouts. Upon creating an account with a join code, users can view events on a shared board and interact with them, along with being able to create/pitch events and edit their status as plans develop. 

## Features
### Accounts & Access
- **Registration with a join code:** Only people with the board's code can create an account
- **JWT login with a persistent session:** Stay logged in across refreshes, with logout
- **Role-based permissions:** Members and admins; only an event's creator or an admin can edit or delete it

### Events
- **Create events:** Title, description, location, optional date and capacity
- **Edit events:** Capacity can't be lowered below the number of people already going
- **Delete events:** With a confirmation prompt
- **Event detail page:** Everything about an event in one place
- **Search and status filter:** Find events by text or narrow the board to one status

### Workflow
- **Status workflow with validated transitions:** Illegal moves are rejected, and Confirmed requires a date and location
- **Board view:** One column per status, with a control offering only the legal next moves
- **Activity timeline:** Who created an event and who changed its status, and when

### Collaboration
- **RSVP:** Going, Maybe, or Can't go, with live counts
- **Capacity limit:** "Going" is rejected once an event is full, enforced atomically on the server
- **Comments:** A discussion thread on each event
- **Creator attribution:** Shown on cards and the detail page

### Quality
- **Global error handling:** Toasts, form errors, login redirect on expired sessions, a not-found page, an error boundary, and retry on load failures
- **Also included:** a `seed_data` command with demo users and events, automated backend tests, and a documented setup verified from a fresh clone

## Stack
- **Back End:** Utilizes **Django** and its libraries to receive, store, and provide event and user information
    - **Django REST Framework (DRF):** Equips Django to be a JSON API in line with REST
    - **SimpleJWT:** Login endpoint that allows for token-based authentication for users
    - **django-cors-headers:** Enables the React page (at Port 5173) to call the Django page (at Port 8000)
    - **django-filter:** Lets the back end define filters for rows by query parameters, so only matching events are returned
    - **python-dotenv:** Loads secret values from .env files into settings.py so they are not uploaded to Git/Github (the example .env can be used instead)
    - **SQLite:** Stores all data in a .sqlite3 database file
- **Front End:** Uses **React** to smoothly update components as they change (like event cards), with **TypeScript** in place to enforce proper typing in line with Django's serialization
    - **Vite:** Runs the development server with live reload and builds the app
    - **React Router:** Manages pages / URLs without needing full reloads
    - **Axios:** Sends HTTP requests, with an interceptor attaching JWT to each
    - **TanStack Query:** Fetches and caches data, tracks loading and error states, and refetches with changes
    - **react-hot-toast:** For pop-ups related to successes and errors

## Setup
- **Prerequisites:** Python 3.12 or newer (developed on 3.14) and Node.js (current LTS).
- **Back End (Terminal 1):**
    > ```bash
    > cd backend
    > python -m venv venv
    > venv\Scripts\activate                # macOS/Linux: source venv/bin/activate
    > pip install -r requirements.txt
    > copy .env.example .env               # macOS/Linux: cp .env.example .env
    > python manage.py migrate
    > python manage.py runserver
    > ```
    - Runs on http://localhost:8000
- **Front End (Terminal 2):**
    >```bash
    > cd frontend
    > npm install
    > copy .env.example .env               # macOS/Linux: cp .env.example .env
    > npm run dev
    > ```
    - Runs on: http://localhost:5173
    
- **Account Creation:**
    - Upon reaching the front page, click the "Need an account? Register" button below the login prompt
    - Enter the following fields:
        - Username: the username used for login
        - Display Name: how users will see you on the platform, e.g. "Created by (Display Name)"
        - Join Code: the code for the board (given in .env), in the default example.env "friends2026"
        - Password: the password used for login

- **Creating an Admin Account / Seed Data:**
    - Admin accounts are a developer tool, not a feature currently available to be executed by users on the site
    - After creating an account, run the following commands in a new terminal (or in the backend venv Terminal 1 after killing the server process)
    > ```bash
    > cd backend
    > venv\Scripts\activate                # macOS/Linux: source venv/bin/activate
    > python manage.py shell
    > from accounts.models import User
    > u = User.objects.get(username="(enter username here)"); u.role = "admin"; u.save()
    > exit()
    > ```
    - Optionally, you may also add artificial / seed data using the following command:
    >```bash
    > python manage.py seed_data
    >```
- **Demo Accounts (after running seed_data):**
    - `demo_admin` (admin), `demo_alex`, `demo_sam`, `demo_jordan` (members)
    - Password for all: `demo1234` (for class demo use only)
    - Re-running `seed_data` resets the demo events back to their starting state

## Suggested Walkthrough
1. Run the setup steps and `python manage.py seed_data`, then log in as `demo_admin` / `demo1234`.
2. **Board and workflow:** events appear in a column per status. On "Birthday dinner", use "Move to" to reach Open, then try Confirmed; it is rejected because the event has no location.
3. **RSVP and capacity:** "Escape room" is full, so "Going" is disabled for anyone not already attending.
4. **History:** open "Movie marathon" to see its activity timeline and comments.
5. **Search and filter:** type "movie", or filter the board by Open.
6. **Permissions:** log out and log in as `demo_alex`; Delete and Edit only appear on events Alex created. The admin sees them everywhere.
7. **Registration:** create a new account using the join code.
8. **Error handling:** visit `/events/9999` to see the not-found page.

## Tests
### Backend
> ```bash
> cd backend
> python manage.py test events
> ```

### Frontend
> ```bash
> cd frontend
> npm run build        # type-checks the project and bundles it
> ```


## Data Model
- **User (accounts):**    username, display_name, role (admin | member)
- **Event:**              title, description, location, starts_at (nullable), status, max_attendees (nullable), created_at, created_by -> User
- **ActivityLog:**        event -> Event, actor -> User, action, old_value, new_value, created_at
- **RSVP:**     user -> User, event -> Event, response (going|maybe|no)
(also makes Event <-> User many-to-many through RSVP)
- **Comment:**  event -> Event, author -> User, body, created_at

## Status Workflow
### Statuses are restricted from how they may shift from one to another.
- **Idea** => Planning, On Hold, Cancelled
- **Planning** => Open, On Hold, Cancelled
- **Open** => Confirmed, Planning, On Hold, Cancelled
- **Confirmed** => Done, Open, Cancelled
- **On Hold** => Planning, Cancelled
- **Cancelled** => Idea (If Reopening)
- **Done** => None (Final Status)

### Additional Event Detail Rules
- An event can only be moved to Confirmed if it has a date and a location.
- RSVPs are only accepted while an event is Open or Confirmed.
- If an event has a capacity, new "Going" RSVPs are rejected once it is full.
- Any logged-in member can change an event's status. Only the creator or an admin can edit or delete an event.

## API Overview
| Endpoint | Purpose |
|---|---|
| `POST /api/auth/register/`, `login/`, `refresh/` | Register (join code required), log in, refresh token |
| `GET /api/auth/me/` | Current user and role |
| `GET, POST /api/events/` | List (with `?search=` and `?status=`) and create |
| `GET, PATCH, DELETE /api/events/{id}/` | Detail, edit, delete (creator or admin) |
| `POST /api/events/{id}/transition/` | Change status (validated) |
| `PUT, DELETE /api/events/{id}/rsvp/` | Set or clear my RSVP |
| `GET, POST /api/events/{id}/comments/` | Comment thread |
| `GET /api/events/{id}/activity/` | Activity timeline |

## Design Notes
- Status changes and RSVPs run inside `transaction.atomic()`; the status change and its `ActivityLog` row are saved together or not at all.
- RSVP capacity and status changes use `select_for_update()` to prevent overbooking under concurrent requests. SQLite ignores the row lock (it serializes writes at the database level), but the code is written for a database like PostgreSQL where the lock is enforced.
- The event list uses `select_related` and annotations so its query count stays flat as events are added (covered by a test in `backend/events/tests.py`).

## Known Limitations
- All users share one board; there are no separate groups.
- Admin status is assigned from the Django shell (or the seed command), not from the site.
- Comments cannot be edited or deleted.
- Search matches text in the title, description, and location; there are no other filters.


## Rubric Map

### 1. Django Backend Architecture & Database
* Implementation of Django models, migrations, and model relationships: [/backend/events/models.py](/backend/events/models.py) defines `Event`, `RSVP`, `Comment`, and `ActivityLog` with foreign keys (e.g. `Event.created_by`, `RSVP.event`, `Comment.author`), a many-to-many (`Event.attendees` through `RSVP`), and a unique constraint on (user, event); [/backend/accounts/models.py](/backend/accounts/models.py) defines the custom `User` with a `role` field. Migrations live in [/backend/events/migrations](/backend/events/migrations) and [/backend/accounts/migrations](/backend/accounts/migrations).
* Efficient query design: `get_queryset` in [/backend/events/views.py](/backend/events/views.py) uses `select_related` plus annotations (`going_count`, `my_rsvp`), and the comments and activity endpoints use `select_related`, so the list never runs a query per event. `EventListQueryTests` in [/backend/events/tests.py](/backend/events/tests.py) checks that the query count stays flat as events are added.
* Solid input validation on models/serializers: [/backend/events/serializers.py](/backend/events/serializers.py) validates capacity (at least 1, and never below the current going count), comment length, and status and RSVP choices; [/backend/accounts/serializers.py](/backend/accounts/serializers.py) validates the join code and password length; workflow rules are enforced in [/backend/events/services.py](/backend/events/services.py).

### 2. API Design & Authentication
* Proper implementation of REST with DRF: `EventViewSet` in [/backend/events/views.py](/backend/events/views.py) is registered with a `DefaultRouter` in [/backend/events/urls.py](/backend/events/urls.py), with custom actions for `transition`, `rsvp`, `comments`, and `activity`; account endpoints are in [/backend/accounts/urls.py](/backend/accounts/urls.py); search and status filtering use [/backend/events/filters.py](/backend/events/filters.py) with DRF's search and ordering backends.
* Secure authentication: SimpleJWT login and refresh endpoints in [/backend/accounts/urls.py](/backend/accounts/urls.py), JWT authentication with `IsAuthenticated` as the default in [/backend/config/settings.py](/backend/config/settings.py), and registration gated by a join code from `.env`.
* Permissions checking: `IsCreatorOrAdmin` in [/backend/events/permissions.py](/backend/events/permissions.py) limits editing and deleting to the creator or an admin (role stored on the `User` model); `status` and `created_by` are read-only in the serializer so they can only change through the server's rules.

### 3. React & TypeScript Architecture
* Component tree design / separation of smart and dumb components: container pages in [/frontend/src/pages](/frontend/src/pages) fetch data and own state (`EventsPage`, `EventDetailPage`), while [/frontend/src/components](/frontend/src/components) holds presentational components that only take typed props (`Board`, `EventCard`, `StatusSelect`, `RsvpButtons`, `CommentList`, `ActivityTimeline`); `CommentSection` and `ActivitySection` are small containers.
* No use of "any" keyword; adherence to TS types/interfaces: [/frontend/src/types](/frontend/src/types) holds interfaces that mirror the API serializers, union types such as `EventStatus` and `RsvpResponse`, and `Record<EventStatus, ...>` tables so a missing status is a compile error. `npm run build` type-checks the project in strict mode.

### 4. State Management & API Client
* Efficient state management: [/frontend/src/context](/frontend/src/context) provides authentication state through `AuthProvider` and `useAuth`; server state is managed with TanStack Query in [/frontend/src/hooks](/frontend/src/hooks), with cache keys per resource and filter, targeted invalidation after mutations, and a debounced search input to limit requests.
* Asynchronous network layering & custom React Query hooks: [/frontend/src/api](/frontend/src/api) has one module per resource on top of a shared Axios instance in [client.ts](/frontend/src/api/client.ts), whose request interceptor attaches the JWT; [/frontend/src/hooks](/frontend/src/hooks) wraps those calls in query and mutation hooks.

### 5. Error Handling, UI, & Resilience
* Front-end handling of API error codes: the response interceptor in [/frontend/src/api/client.ts](/frontend/src/api/client.ts) handles 401 (clears the token and redirects to login), 403, 404, 5xx, and network failures with toasts; [/frontend/src/utils/errors.ts](/frontend/src/utils/errors.ts) turns 400 field errors into messages shown beside form fields; [/frontend/src/components/ErrorBoundary.tsx](/frontend/src/components/ErrorBoundary.tsx), a not-found page with a catch-all route, and loading, empty, and retry states cover the rest.
* Back-end protection and database transaction management: [/backend/events/services.py](/backend/events/services.py) runs status changes (with their activity log entry) and RSVPs inside `transaction.atomic()` with `select_for_update()`, rejects illegal moves and full events with `ValidationError`, and uses try/except to turn a race with a deleted event into a clean 404. Tests in [/backend/events/tests.py](/backend/events/tests.py) cover these paths.
* Clean, accessible layout: styles in [/frontend/src/index.css](/frontend/src/index.css); form controls have labels, error messages use `role="alert"`, RSVP buttons expose `aria-pressed`, and board columns are labelled.

### 6. Project Organization & Git Workflow
* Logical codebase separation: [/backend](/backend) and [/frontend](/frontend) separate the full stack; the backend is split into [config](/backend/config), [accounts](/backend/accounts), and [events](/backend/events) apps, and the frontend into `api`, `components`, `context`, `hooks`, `pages`, `types`, and `utils`.
* Proper code formatting throughout each file
* .gitignore and .env config: [/.gitignore](/.gitignore) keeps `.env` files, `db.sqlite3`, `venv/`, and `node_modules/` out of Git; [/backend/.env.example](/backend/.env.example) and [/frontend/.env.example](/frontend/.env.example) are templates for each user's own `.env`, so secrets and endpoint settings are not exposed.
* Reproducible setup: [/backend/requirements.txt](/backend/requirements.txt), the frontend lockfile, a `seed_data` command in [/backend/events/management/commands](/backend/events/management/commands), and the Tests section above.
* Consistent and clean commits showing steady development leading up to submission

## Project Structure
```
hangout-board/
├─ backend/
│  ├─ config/       settings and root URLs
│  ├─ accounts/     custom User, registration, /me
│  ├─ events/       models, serializers, views, permissions, services, filters, tests, seed command
│  └─ requirements.txt
├─ frontend/
│  └─ src/          api, components, context, hooks, pages, types, utils
└─ README.md
```