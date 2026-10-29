import { useEvents, useDeleteEvent } from "../hooks/useEvents";
import { EventCard } from "../components/EventCard";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export function EventsPage() {
    const { user, logout } = useAuth();
    const deleteEvent = useDeleteEvent();
    const { data, isLoading, isError } = useEvents();

    const handleDelete = (id: number) => {
        if (window.confirm("Delete this event?")) deleteEvent.mutate(id);
    };

    return (
     <main>
        <header>
            <h1>Hangout Board</h1>
            <div>
            <span>{user?.display_name || user?.username}</span>
            <button type="button" onClick={logout}>
                Log out
            </button>
            </div>
        </header>

        {isLoading && <p>Loading…</p>}
        {isError && <p role="alert">Couldn't load events.</p>}
        {data && data.length === 0 && <p>No events yet.</p>}
        {data && (
            <section>
            {data.map((event) => (
                <EventCard
                 key={event.id} 
                 event={event} 
                 canDelete={user?.role === "admin" || event.created_by === user?.id}
                 onDelete={handleDelete}
                 />
            ))}
            </section>
        )}
        <Link to="/events/new">New event</Link>
     </main>
  );
}