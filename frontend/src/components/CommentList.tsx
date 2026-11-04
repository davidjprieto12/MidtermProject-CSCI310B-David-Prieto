import type { EventComment } from "../types/comment";

interface CommentListProps {
  comments: EventComment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) return <p>No comments yet.</p>;
  return (
    <ul>
      {comments.map((c) => (
        <li key={c.id}>
          <strong>{c.author.display_name || c.author.username}</strong>{" "}
          <time dateTime={c.created_at}>
            {new Date(c.created_at).toLocaleString()}
          </time>
          <p>{c.body}</p>
        </li>
      ))}
    </ul>
  );
}