import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EventForm } from "../components/EventForm";
import { useCreateEvent } from "../hooks/useEvents";
import { parseApiError, type FieldErrors } from "../utils/errors";
import type { EventInput } from "../types/event";

export function NewEventPage() {
  const navigate = useNavigate();
  const createEvent = useCreateEvent();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = (data: EventInput) => {
    setFieldErrors({});
    createEvent.mutate(data, {
      onSuccess: () => navigate("/"),
      onError: (error) => setFieldErrors(parseApiError(error).fields),
    });
  };

  return (
    <main>
      <h1>New event</h1>
      <Link to="/">Back to board</Link>
      <EventForm onSubmit={handleSubmit} submitting={createEvent.isPending} fieldErrors={fieldErrors} />
    </main>
  );
}