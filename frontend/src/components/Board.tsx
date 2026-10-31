import { EventCard } from "./EventCard";
import { STATUS_LABELS, STATUS_ORDER } from "../types/status";
import type { EventStatus, HangoutEvent } from "../types/event";

interface BoardProps {
  events: HangoutEvent[];
  canDelete: (event: HangoutEvent) => boolean;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: EventStatus) => void;
}

export function Board({ events, canDelete, onDelete, onStatusChange }: BoardProps) {
  return (
    <div className="board">
      {STATUS_ORDER.map((status) => {
        const items = events.filter((e) => e.status === status);
        return (
          <section key={status} className="board-column" aria-label={STATUS_LABELS[status]}>
            <h2>
              {STATUS_LABELS[status]} ({items.length})
            </h2>
            {items.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                canDelete={canDelete(event)}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}