import type { EventStatus } from "./event";

export const STATUS_ORDER: EventStatus[] = [
    "idea", "planning", "open", "confirmed", "done", "on_hold", "cancelled",
];

export const STATUS_LABELS: Record<EventStatus, string> = {
    idea: "Idea",
    planning: "Planning",
    open: "Open",
    confirmed: "Confirmed",
    done: "Done",
    on_hold: "On Hold",
    cancelled: "Cancelled",
};

// Must match ALLOWED_TRANSITIONS in backend/events/services.py.
// This only decides which options the UI offers; the server enforces the rules.
export const ALLOWED_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  idea: ["planning", "on_hold", "cancelled"],
  planning: ["open", "on_hold", "cancelled"],
  open: ["confirmed", "planning", "on_hold", "cancelled"],
  confirmed: ["done", "open", "cancelled"],
  on_hold: ["planning", "cancelled"],
  cancelled: ["idea"],
  done: [],
};