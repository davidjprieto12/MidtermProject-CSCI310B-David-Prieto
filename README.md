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
- **Back End (Terminal 1):**
    > ```bash
    > cd backend
    > python -m venv venv
    > venv\Scripts\activate                # macOS/Linux: source venv/bin/activate
    > pip install -r requirements.txt
    > copy .env.example .env               # macOS/Linux: cp .env.example .env
    > python manage.py migrate
    > python manage.py runserver
    >```
    - Runs on http://localhost:8000
- **Front End (Terminal 2):**
    >```bash
    > cd frontend
    > npm install
    > copy .env.example .env               # macOS/Linux: cp .env.example .env
    > npm run dev
    - Runs on: http://locahost:5173
    
    ### TODO: Add join code & admin account instructions here after implementing said features


## Data Model
- **User (accounts):**    username, display_name, role (admin | member)
- **Event:**              title, description, location, starts_at (nullable), status, max_attendees (nullable), created_at, created_by -> User
- **ActivityLog:**        event -> Event, actor -> User, action, old_value, new_value, created_at
- **RSVP (planned):**     user -> User, event -> Event, response (going|maybe|no)
(also makes Event <-> User many-to-many through RSVP)
- **Comment (planned):**  event -> Event, author -> User, body, created_at

## Status Workflow
### Statuses are restricted from how they may shift from one to another.
- **Idea** => Planning, On Hold, Cancelled
- **Planning** => Open, On Hold, Cancelled
- **Open** => Confirmed, Planning, On Hold, Cancelled
- **Confirmed** => Done, Open, Cancelled
- **On Hold** => Planning, Cancelled
- **Cancelled** => Idea (If Reopening)
- **Done** => None (Final Status)


## Rubric Map
- 
    ### TODO: Upon completing the project, map each part of the rubric to its corresponding parts of the project repository