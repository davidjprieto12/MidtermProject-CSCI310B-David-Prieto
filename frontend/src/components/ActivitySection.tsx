import { useActivity } from "../hooks/useActivity";
import { ActivityTimeline } from "./ActivityTimeline";

interface ActivitySectionProps {
  eventId: number;
}

export function ActivitySection({ eventId }: ActivitySectionProps) {
  const { data, isLoading, isError } = useActivity(eventId);

  return (
    <section aria-label="Activity">
      <h2>History</h2>
      {isLoading && <p>Loading…</p>}
      {isError && <p role="alert">Couldn't load history.</p>}
      {data && <ActivityTimeline entries={data} />}
    </section>
  );
}