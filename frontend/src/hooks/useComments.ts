import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../api/comments";

export const useComments = (eventId: number) =>
  useQuery({
    queryKey: ["comments", eventId],
    queryFn: () => commentsApi.list(eventId),
  });

export const useAddComment = (eventId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => commentsApi.add(eventId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["comments", eventId] }),
  });
};