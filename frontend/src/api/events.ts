import { api } from "./client";
import type { HangoutEvent, EventInput, EventStatus } from "../types/event";

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
};