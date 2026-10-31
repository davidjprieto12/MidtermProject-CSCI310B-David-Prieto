import { useEvents, useDeleteEvent, useChangeStatus } from "../hooks/useEvents";
import { Board } from "../components/Board";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import type { EventStatus, HangoutEvent } from "../types/event";

export function EventsPage() {
    const { user, logout } = useAuth();
    const { data, isLoading, isError } = useEvents();
    const deleteEvent = useDeleteEvent();
    const changeStatus = useChangeStatus();

    const canDelete = (event: HangoutEvent) => 
        user?.role === "admin" || event.created_by === user?.id;
    

    const handleDelete = (id: number) => {
        if (window.confirm("Delete this event?")) deleteEvent.mutate(id);
    };

    const handleStatusChange = (id: number, status: EventStatus) => 
        changeStatus.mutate({ id, status });

    return (
    <main>
      <header>
        <h1>Hangout Board</h1>
        <div>
          <span>{user?.display_name || user?.username}</span>
          <Link to="/events/new">New event</Link>
          <button type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {isLoading && <p>Loading…</p>}
      {isError && <p role="alert">Couldn't load events.</p>}
      {data && (
        <Board
          events={data}
          canDelete={canDelete}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    </main>
  );
}