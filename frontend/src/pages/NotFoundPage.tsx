import { Link } from "react-router-dom";

interface NotFoundPageProps {
  message?: string;
}

export function NotFoundPage({
  message = "That page doesn't exist.",
}: NotFoundPageProps) {
  return (
    <main>
      <h1>Not found</h1>
      <p role="alert">{message}</p>
      <Link to="/">Back to the board</Link>
    </main>
  );
}