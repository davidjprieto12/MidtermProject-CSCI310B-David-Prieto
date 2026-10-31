import { Link } from "react-router-dom";
import { StatusSelect } from "./StatusSelect";
import type { EventStatus, HangoutEvent } from "../types/event";  

interface EventCardProps {
    event: HangoutEvent;
    canDelete: boolean;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, status: EventStatus) => void;
}

export function EventCard({ event, canDelete, onDelete, onStatusChange }: EventCardProps) {
    return (
    <article>
      <h3>
        <Link to={`/events/${event.id}`}>{event.title}</Link>
      </h3>
      <p>{event.starts_at ? new Date(event.starts_at).toLocaleString() : "Date TBD"}</p>
      {event.location && <p>{event.location}</p>}
      <StatusSelect eventId={event.id} status={event.status} onChange={onStatusChange} />
      {canDelete && (
        <button type="button" onClick={() => onDelete(event.id)}>
          Delete
        </button>
      )}
    </article>
  );
}