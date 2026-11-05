import { api } from "./client";
import type { ActivityEntry } from "../types/activity";

export const activityApi = {
    list: (eventId: number) =>
        api.get<ActivityEntry[]>(`/events/${eventId}/activity/`).then((r) => r.data),
};
