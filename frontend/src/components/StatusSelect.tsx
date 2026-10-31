import { ALLOWED_TRANSITIONS, STATUS_LABELS } from "../types/status";
import type { EventStatus } from "../types/event";

interface StatusSelectProps {
    eventId: number;
    status: EventStatus;
    onChange: (id: number, status: EventStatus) => void;
    disabled?: boolean;
}

export function StatusSelect({ eventId, status, onChange, disabled }: StatusSelectProps) {
    const nextStatuses = ALLOWED_TRANSITIONS[status];
    if (nextStatuses.length === 0) return null; // Done is final, there is no next status

    return (
        <>
        <label htmlFor={`move-${eventId}`}>Move to</label>
        <select
            id={`move-${eventId}`}
            value=""
            disabled={disabled}
            onChange={(e) => {
            const chosen = nextStatuses.find((s) => s === e.target.value);
            if (chosen) onChange(eventId, chosen);
            }}
        >
            <option value="">Choose…</option>
            {nextStatuses.map((s) => (
            <option key={s} value={s}>
                {STATUS_LABELS[s]}
            </option>
            ))}
        </select>
        </>
    );
}


