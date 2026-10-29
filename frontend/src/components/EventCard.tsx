import type { HangoutEvent } from "../types/event";

interface EventCardProps {
    event: HangoutEvent;
    canDelete: boolean;
    onDelete: (id: number) => void;
}

export function EventCard({ event, canDelete, onDelete }: EventCardProps) {
    return (
        <article>
            <h3>{event.title}</h3>
            <p>
                {event.status} ·{" "}
                {event.starts_at ? new Date(event.starts_at).toLocaleString() : "Date TBD"}
            </p>
            {event.location && <p>{event.location}</p>}
            {canDelete && <button onClick={() => onDelete(event.id)}>Delete</button>}
        </article>
    );
}