import { api } from "./client";
import type { HangoutEvent, EventInput, EventStatus, RsvpResponse } from "../types/event";

export const eventsApi = {
    list: () => api.get<HangoutEvent[]>("/events/").then((r) => r.data),
    create: (data: EventInput) =>
        api.post<HangoutEvent>("/events/", data).then((r) => r.data),
    remove: (id: number) =>
        api.delete<void>(`/events/${id}/`).then(() => undefined),
    get: (id: number) =>
        api.get<HangoutEvent>(`/events/${id}/`).then((r) => r.data),
    transition: (id: number, status: EventStatus) =>
        api
            .post<HangoutEvent>(`/events/${id}/transition/`, { status })
            .then((r) => r.data),
    setRsvp: (id: number, response: RsvpResponse) =>
        api.put<HangoutEvent>(`/events/${id}/rsvp/`, { response }).then((r) => r.data),
    removeRsvp: (id: number) =>
        api.delete<HangoutEvent>(`/events/${id}/rsvp/`).then((r) => r.data),
};