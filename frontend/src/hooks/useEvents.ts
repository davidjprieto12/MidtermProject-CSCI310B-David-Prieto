import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "../api/events";
import { toast } from "react-hot-toast";

export const useEvents = () =>
    useQuery({ queryKey: ["events"], queryFn: eventsApi.list });

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