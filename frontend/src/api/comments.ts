import { api } from "./client";
import type { EventComment } from "../types/comment";

export const commentsApi = {
    list: (eventId: number) =>
        api.get<EventComment[]>(`/events/${eventId}/comments/`).then((r) => r.data),
    add: (eventId: number, body: string) =>
        api.post<EventComment>(`events/${eventId}/comments/`, { body }).then((r) => r.data),
};