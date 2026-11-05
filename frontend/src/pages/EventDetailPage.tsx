import { Link, useParams } from "react-router-dom";
import { StatusSelect } from "../components/StatusSelect";
import { RsvpButtons } from "../components/RsvpButtons";
import { CommentSection } from "../components/CommentSection";
import { ActivitySection } from "../components/ActivitySection";
import { useChangeStatus, useEvent, useRsvp } from "../hooks/useEvents";
import { useAuth } from "../hooks/useAuth";
import { STATUS_LABELS } from "../types/status";
import { displayName } from "../utils/users";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);
  const { data: event, isLoading, isError } = useEvent(eventId);
  const changeStatus = useChangeStatus();
  const rsvp = useRsvp();
  const { user } = useAuth();

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

  return (
    <main>
      <Link to="/">← Back to board</Link>
      <h1>{event.title}</h1>
      {event.creator && <p>Created by {displayName(event.creator)}</p>}
      {canEdit && <Link to={`/events/${event.id}/edit`}>Edit</Link>}
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
      <RsvpButtons
        status={event.status}
        myRsvp={event.my_rsvp}
        goingCount={event.going_count}
        maxAttendees={event.max_attendees}
        onChange={(response) => rsvp.mutate({ id: event.id, response })}
        disabled={rsvp.isPending}
      />
      <CommentSection eventId={event.id} />
      <ActivitySection eventId={event.id} />
    </main>
  );
}