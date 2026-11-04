import { useState } from "react";
import { useAddComment, useComments } from "../hooks/useComments";
import { parseApiError } from "../utils/errors";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

interface CommentSectionProps {
  eventId: number;
}

export function CommentSection({ eventId }: CommentSectionProps) {
  const { data, isLoading, isError } = useComments(eventId);
  const addComment = useAddComment(eventId);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (body: string): Promise<boolean> => {
    setError(null);
    try {
      await addComment.mutateAsync(body);
      return true;
    } catch (e) {
      // 403/404/500 are already toasted by the Axios interceptor,
      // so only a 400 field error is shown next to the form
      setError(parseApiError(e).fields.body?.[0] ?? null);
      return false;
    }
  };

  return (
    <section aria-label="Comments">
      <h2>Comments</h2>
      {isLoading && <p>Loading…</p>}
      {isError && <p role="alert">Couldn't load comments.</p>}
      {data && <CommentList comments={data} />}
      <CommentForm
        onSubmit={handleSubmit}
        submitting={addComment.isPending}
        error={error}
      />
    </section>
  );
}