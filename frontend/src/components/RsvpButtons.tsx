import type { EventStatus, RsvpResponse } from "../types/event";

const OPTIONS: { value: RsvpResponse; label: string }[] = [
  { value: "going", label: "Going" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "Can't go" },
];

// Mirrors RSVP_OPEN_STATUSES in backend/events/services.py
const RSVP_OPEN_STATUSES: EventStatus[] = ["open", "confirmed"];

interface RsvpButtonsProps {
  status: EventStatus;
  myRsvp: RsvpResponse | null;
  goingCount: number;
  maxAttendees: number | null;
  onChange: (response: RsvpResponse | null) => void;
  disabled?: boolean;
}

export function RsvpButtons({
  status, myRsvp, goingCount, maxAttendees, onChange, disabled,
}: RsvpButtonsProps) {
  const isOpen = RSVP_OPEN_STATUSES.includes(status);
  const isFull = maxAttendees !== null && goingCount >= maxAttendees;

  return (
    <section aria-label="RSVP">
      <h2>RSVP</h2>
      <p>
        {goingCount} going{maxAttendees !== null && ` of ${maxAttendees}`}
        {isFull && " (full)"}
      </p>
      {!isOpen && <p>RSVPs open once the event is Open or Confirmed.</p>}
      <div role="group" aria-label="Your response">
        {OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={myRsvp === value}
            disabled={
              disabled || !isOpen || (value === "going" && isFull && myRsvp !== "going")
            }
            onClick={() => onChange(value)}
          >
            {label}
          </button>
        ))}
        {myRsvp && (
          <button type="button" disabled={disabled} onClick={() => onChange(null)}>
            Clear
          </button>
        )}
      </div>
    </section>
  );
}