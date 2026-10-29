export type EventStatus = 
    | "idea" | "planning" | "open" | "confirmed"
    | "done" | "on_hold" | "cancelled";

export interface HangoutEvent {
    id: number;
    title: string;
    description: string;
    location: string;
    starts_at: string | null;
    status: EventStatus;
    created_at: string;
    created_by: number | null;
    max_attendees: number | null;
}

export interface EventInput {
    title: string;
    description: string;
    location: string;
    starts_at: string | null;
    max_attendees: number | null;
}