import { useQuery } from "@tanstack/react-query";
import { activityApi } from "../api/activity";

export const useActivity = (eventId: number) =>
    useQuery({
        queryKey: ["activity", eventId],
        queryFn: () => activityApi.list(eventId),
    });