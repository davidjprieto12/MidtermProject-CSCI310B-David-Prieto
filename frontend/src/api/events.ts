import { api } from "./client";
import type { HangoutEvent } from "../types/event";

export const eventsApi = {
    list: () => api.get<HangoutEvent[]>("/events/").then((r) => r.data),
};