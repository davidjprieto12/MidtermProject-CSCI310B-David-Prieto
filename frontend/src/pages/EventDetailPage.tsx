import { Link, useParams } from "react-router-dom";
import { StatusSelect } from "../components/StatusSelect";
import { useChangeStatus, useEvent } from "../hooks/useEvents";
import { STATUS_LABELS } from "../types/status";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);
  const { data: event, isLoading, isError } = useEvent(eventId);
  const changeStatus = useChangeStatus();

  if (isLoading) return <p>Loading…</p>;
  if (isError || !event) {
    return (
      <main>
        <p role="alert">Event not found.</p>
        <Link to="/">Back to board</Link>
      </main>
    );
  }

  return (
    <main>
      <Link to="/">← Back to board</Link>
      <h1>{event.title}</h1>
      <p>Status: {STATUS_LABELS[event.status]}</p>
      <StatusSelect
        eventId={event.id}
        status={event.status}
        onChange={(eventId, status) => changeStatus.mutate({ id: eventId, status })}
        disabled={changeStatus.isPending}
      />
      <p>{event.starts_at ? new Date(event.starts_at).toLocaleString() : "Date TBD"}</p>
      {event.location && <p>Where: {event.location}</p>}
      {event.description && <p>{event.description}</p>}
      {event.max_attendees !== null && <p>Capacity: {event.max_attendees}</p>}
    </main>
  );
}