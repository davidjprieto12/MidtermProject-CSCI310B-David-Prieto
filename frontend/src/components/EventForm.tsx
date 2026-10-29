import { useState, type SubmitEvent } from "react";
import type { EventInput } from "../types/event";
import type { FieldErrors } from "../utils/errors";

interface EventFormProps {
  onSubmit: (data: EventInput) => void;
  submitting: boolean;
  fieldErrors: FieldErrors;
}

export function EventForm({ onSubmit, submitting, fieldErrors }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");

  const showErrors = (name: string) =>
    (fieldErrors[name] ?? []).map((m) => <p key={m} role="alert">{m}</p>);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      location,
      // datetime-local gives "2026-11-14T19:00"; Django wants a full ISO string
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      max_attendees: maxAttendees === "" ? null : Number(maxAttendees),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="title">Title</label>
      <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      {showErrors("title")}

      <label htmlFor="description">Description</label>
      <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />

      <label htmlFor="location">Location</label>
      <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />

      <label htmlFor="startsAt">Date and time (optional)</label>
      <input id="startsAt" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
      {showErrors("starts_at")}

      <label htmlFor="maxAttendees">Max attendees (optional)</label>
      <input id="maxAttendees" type="number" value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} />
      {showErrors("max_attendees")}

      <button type="submit" disabled={submitting}>Create event</button>
    </form>
  );
}