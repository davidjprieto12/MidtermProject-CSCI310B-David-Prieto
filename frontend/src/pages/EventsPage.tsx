import { useState } from "react";
import { useEvents, useDeleteEvent, useChangeStatus } from "../hooks/useEvents";
import { Board } from "../components/Board";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { FilterBar } from "../components/FilterBar";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  EMPTY_FILTERS,
  type EventFilters,
  type EventStatus,
  type HangoutEvent,
} from "../types/event"; 

export function EventsPage() {
    const { user, logout } = useAuth();
    const [filters, setFilters] = useState<EventFilters>(EMPTY_FILTERS);
    const debouncedSearch = useDebouncedValue(filters.search);
    const { data, isLoading, isError, refetch } = useEvents({
      ...filters,
      search: debouncedSearch,
    });
    const deleteEvent = useDeleteEvent();
    const changeStatus = useChangeStatus();

    const hasFilters = filters.search.trim() !== "" || filters.status !== "";

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

      <FilterBar filters={filters} onChange={setFilters} />

      {isLoading && <p>Loading…</p>}
      {isError && (
        <div role="alert">
          <p>Couldn't load events.</p>
          <button type="button" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      )}
      {data && data.length === 0 && (
        <p>{hasFilters ? "No events match your filters." : "No events yet."}</p>
      )}
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