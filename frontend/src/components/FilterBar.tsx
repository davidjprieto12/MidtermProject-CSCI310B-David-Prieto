import { EMPTY_FILTERS, type EventFilters } from "../types/event";
import { STATUS_LABELS, STATUS_ORDER } from "../types/status";

interface FilterBarProps {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const hasFilters = filters.search !== "" || filters.status !== "";

  return (
    <form role="search" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="event-search">Search</label>
      <input
        id="event-search"
        type="search"
        placeholder="Title, description, or place"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />

      <label htmlFor="status-filter">Status</label>
      <select
        id="status-filter"
        value={filters.status}
        onChange={(e) => {
          const chosen = STATUS_ORDER.find((s) => s === e.target.value);
          onChange({ ...filters, status: chosen ?? "" });
        }}
      >
        <option value="">All statuses</option>
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button type="button" onClick={() => onChange(EMPTY_FILTERS)}>
          Clear
        </button>
      )}
    </form>
  );
}