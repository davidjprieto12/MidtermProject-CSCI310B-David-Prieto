import type { ActivityEntry } from "../types/activity";
import { statusLabel } from "../types/status";
import { displayName } from "../utils/users";

function describe(entry: ActivityEntry): string {
  const who = entry.actor ? displayName(entry.actor) : "Someone";
  switch (entry.action) {
    case "created":
      return `${who} created this event`;
    case "status_changed":
      return `${who} moved it from ${statusLabel(entry.old_value)} to ${statusLabel(entry.new_value)}`;
    default:
      return `${who} ${entry.action}`;
  }
}

interface ActivityTimelineProps {
  entries: ActivityEntry[];
}

export function ActivityTimeline({ entries }: ActivityTimelineProps) {
  if (entries.length === 0) return <p>No activity yet.</p>;
  return (
    <ul>
      {entries.map((entry) => (
        <li key={entry.id}>
          {describe(entry)}{" "}
          <time dateTime={entry.created_at}>
            {new Date(entry.created_at).toLocaleString()}
          </time>
        </li>
      ))}
    </ul>
  );
}