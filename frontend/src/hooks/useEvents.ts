import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "../api/events";
import toast from "react-hot-toast";
import axios from "axios";
import { parseApiError } from "../utils/errors";
import { STATUS_LABELS } from "../types/status";
import type { EventStatus } from "../types/event";

// Fetches the whole list
export const useEvents = () =>
    useQuery({ queryKey: ["events"], queryFn: eventsApi.list });

// Fetches one single and specific event
export const useEvent = (id: number) =>
    useQuery({
        queryKey: ["event", id],
        queryFn: () => eventsApi.get(id),
        enabled: Number.isFinite(id),
    });

export const useCreateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: eventsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            toast.success("Event created");
        },
    });
};

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: eventsApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            toast.success("Event deleted");
        },
    });
};

export const useChangeStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: EventStatus }) =>
            eventsApi.transition(id, status),
        onSuccess: (event) => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            queryClient.invalidateQueries({ queryKey: ["event", event.id] });
            toast.success(`Moved to ${STATUS_LABELS[event.status]}`);
        },
        onError: (error) => {
            // 403, 404, and 500 are already toasted by the Axios interceptor,
            // so only the 400 (rule violation) message is handled here
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                toast.error(parseApiError(error).fields.status?.[0] ?? "That change isn't allowed.");
            }
        },
    });
};