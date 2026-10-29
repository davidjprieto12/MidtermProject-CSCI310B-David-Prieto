import { useEvents } from "../hooks/useEvents";
import { EventCard } from "../components/EventCard";
import { useAuth } from "../hooks/useAuth";

export function EventsPage() {
    const { user, logout } = useAuth();
    const { data, isLoading, isError } = useEvents();

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
                <EventCard key={event.id} event={event} />
            ))}
            </section>
        )}
     </main>
  );
}