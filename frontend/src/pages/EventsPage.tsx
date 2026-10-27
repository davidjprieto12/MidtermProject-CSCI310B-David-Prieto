import { useEvents } from "../hooks/useEvents";
import { EventCard } from "../components/EventCard";

export function EventsPage() {
    const { data, isLoading, isError } = useEvents();
    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Couldn't load events.</p>
    return (
        <section>
            {data?.map((e) => <EventCard key={e.id} event={e} />)}
        </section>
    );
}