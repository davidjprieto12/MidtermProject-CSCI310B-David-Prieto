import { api } from "./client";
import type { HangoutEvent, EventInput } from "../types/event";

export const eventsApi = {
    list: () => api.get<HangoutEvent[]>("/events/").then((r) => r.data),
    create: (data: EventInput) =>
        api.post<HangoutEvent>("/events/", data).then((r) => r.data),
    remove: (id: number) =>
        api.delete<void>(`/events/${id}/`).then(() => undefined),
};