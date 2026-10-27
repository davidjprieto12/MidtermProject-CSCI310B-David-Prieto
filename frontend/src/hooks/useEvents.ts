import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "../api/events";

export const useEvents = () =>
    useQuery({ queryKey: ["events"], queryFn: eventsApi.list });