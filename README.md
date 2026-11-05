# Hangout Board — Web App Midterm

## Overview
Hangout Board is a full-stack web application meant to address the least fun part about seeing your friends: Planning. The site hosts what is essentially a ticketing hub, except for upcoming hangouts. Upon creating an account with a join code, users can view events on a shared board and interact with them, along with being able to create/pitch events and edit their status as plans develop. 

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
        - Join Code: the code for the board (given in .env), in our case "friends2026"
        - Password: the password used for login

- **Creating an Admin Account:**
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

- **Optional: Seed Data:**
    - TODO: Add instructions related to seed data / generated logins here

## Tests
> ```bash
> cd backend
> python manage.py test events
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

## Design Notes
- Status changes and RSVPs run inside `transaction.atomic()`; the status change and its `ActivityLog` row are saved together or not at all.
- RSVP capacity and status changes use `select_for_update()` to prevent overbooking under concurrent requests. SQLite ignores the row lock (it serializes writes at the database level), but the code is written for a database like PostgreSQL where the lock is enforced.
- The event list uses `select_related` and annotations so its query count stays flat as events are added (covered by a test in `backend/events/tests.py`).

## Known Limitations
- Access tokens last 12 hours and there is no refresh flow.
- Tokens are stored in `localStorage`, which is fine for a class project but not for production.
- The event list is not paginated.


## Rubric Map
### 1. Django Backend Architecture & Database
* Implementation of Django models, migrations, and model relationships: [/backend/events](/backend/events) contains the event, RSVP, and comment models and their migrations; [/backend/accounts](/backend/accounts) contains account models and migrations.
* Efficient query design: [/backend/events](/backend/events) uses annotated and related querysets for event lists and related activity/comments.
* Solid input validation on models/serializers: [/backend/events](/backend/events) and [/backend/accounts](/backend/accounts) define serializers that validate incoming API data.

### 2. API Design & Authentication
* Proper implementation of REST with DRF: [/backend/events](/backend/events) and [/backend/accounts](/backend/accounts) define API views, serializers, and URL routes.
* Secure authentication & permissions checking: [/backend/accounts](/backend/accounts) handles authentication; [/backend/events](/backend/events) applies authenticated access and creator/admin permissions.

### 3. React & TypeScript Architecture
* Component tree design / separation of smart and dumb components: [/frontend/src/pages](/frontend/src/pages) composes page-level views, while [/frontend/src/components](/frontend/src/components) holds reusable UI components.
* No use of "any" keyword; adherence to TS types/interfaces: [/frontend/src/types](/frontend/src/types) centralizes shared interfaces and types used by [/frontend/src](/frontend/src).

### 4. State Management & API Client
* Efficient state management: [/frontend/src/context](/frontend/src/context) provides authentication state, and [/frontend/src/hooks](/frontend/src/hooks) manages server state with React Query.
* Asynchronous network layering & custom React Query hooks: [/frontend/src/api](/frontend/src/api) separates network calls; [/frontend/src/hooks](/frontend/src/hooks) wraps them in query and mutation hooks.

### 5. Error Handling, UI, & Resilience
* Front-end handling of API error codes: [/frontend/src/api](/frontend/src/api) handles common HTTP failures, and [/frontend/src/utils](/frontend/src/utils) parses API errors for forms and actions.
* Back-end protection and database transaction management: [/backend/events](/backend/events) validates workflow rules and uses atomic transactions for status changes, activity logs, and RSVPs.
* Clean layout: [/frontend/src/components](/frontend/src/components), [/frontend/src/pages](/frontend/src/pages), and [/frontend/src](/frontend/src) styles support a consistent UI.

### 6. Project Organization & Git Workflow
* Logical codebase separation: [/backend](/backend) and [/frontend](/frontend) separate the full-stack, with subfolders in each organizing parts of each side
* Proper code formatting throughout each file
* .gitignore and .env config: .gitignore ensures no internal .env or db.sqlite3 files are comitted, [/backend/.env.example](/backend/.env.example) and [/frontend/.env.example](/frontend/.env.example) provide templates for the user's individual .env files as not to expose JWT verification / endpoint / sign-in variables
* Consistent and clean commits showing steady development leading up to submission