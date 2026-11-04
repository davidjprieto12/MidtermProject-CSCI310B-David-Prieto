import { useState, type SubmitEvent } from "react";

interface CommentFormProps {
  onSubmit: (body: string) => Promise<boolean>;
  submitting: boolean;
  error: string | null;
}

export function CommentForm({ onSubmit, submitting, error }: CommentFormProps) {
  const [body, setBody] = useState("");

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (await onSubmit(body)) setBody("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="comment-body">Add a comment</label>
      <textarea
        id="comment-body"
        value={body}
        maxLength={1000}
        onChange={(e) => setBody(e.target.value)}
      />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={submitting || body.trim() === ""}>
        Post
      </button>
    </form>
  );
}