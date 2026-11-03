import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EventForm } from "../components/EventForm";
import { useAuth } from "../hooks/useAuth";
import { useEvent, useUpdateEvent } from "../hooks/useEvents";
import type { EventInput } from "../types/event";
import { parseApiError, type FieldErrors } from "../utils/errors";

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: event, isLoading, isError } = useEvent(eventId);
  const updateEvent = useUpdateEvent();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (isLoading) return <p>Loading…</p>;
  if (isError || !event) {
    return (
      <main>
        <p role="alert">Event not found.</p>
        <Link to="/">Back to board</Link>
      </main>
    );
  }

  const canEdit = user?.role === "admin" || event.created_by === user?.id;
  if (!canEdit) {
    return (
      <main>
        <p role="alert">Only the creator or an admin can edit this event.</p>
        <Link to={`/events/${event.id}`}>Back to event</Link>
      </main>
    );
  }

  const initialValues: EventInput = {
    title: event.title,
    description: event.description,
    location: event.location,
    starts_at: event.starts_at,
    max_attendees: event.max_attendees,
  };

  const handleSubmit = (data: EventInput) => {
    setFieldErrors({});
    updateEvent.mutate(
      { id: event.id, data },
      {
        onSuccess: () => navigate(`/events/${event.id}`),
        onError: (error) => setFieldErrors(parseApiError(error).fields),
      }
    );
  };

  return (
    <main>
      <h1>Edit event</h1>
      <Link to={`/events/${event.id}`}>Cancel</Link>
      <EventForm
        onSubmit={handleSubmit}
        submitting={updateEvent.isPending}
        fieldErrors={fieldErrors}
        submitLabel="Save changes"
        initialValues={initialValues}
      />
    </main>
  );
}