import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { eventsApi } from "../api/events";
import toast from "react-hot-toast";
import axios from "axios";
import { parseApiError } from "../utils/errors";
import { STATUS_LABELS } from "../types/status";
import type { EventStatus, RsvpResponse, EventInput, EventFilters } from "../types/event";
import { EMPTY_FILTERS } from "../types/event";

// Fetches a list of events
export const useEvents = (filters: EventFilters = EMPTY_FILTERS) =>
  useQuery({
    queryKey: ["events", filters],
    queryFn: () => eventsApi.list(filters),
    placeholderData: keepPreviousData,
  });

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
            queryClient.invalidateQueries({ queryKey: ["activity", event.id] });
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

export const useRsvp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, response }: { id: number; response: RsvpResponse | null }) =>
      response === null ? eventsApi.removeRsvp(id) : eventsApi.setRsvp(id, response),
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", event.id] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error(parseApiError(error).fields.response?.[0] ?? "Couldn't update your RSVP.");
      }
    },
  });
};

export const useUpdateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: EventInput }) =>
            eventsApi.update(id, data),
        onSuccess: (event) => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            queryClient.invalidateQueries({ queryKey: ["event", event.id] });
            toast.success("Event updated");
        },
    });
};

