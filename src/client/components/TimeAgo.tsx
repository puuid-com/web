import { useTimeAgo } from "@/client/hooks/useTimeAgo";

export function TimeAgo({ date }: { date?: Date | string | number | null }) {
  const label = useTimeAgo(date);
  if (label == null) return null;

  const dt = new Date(
    date instanceof Date ? date.getTime() : typeof date === "number" ? date : String(date),
  );

  return (
    <time dateTime={dt.toISOString()} title={dt.toLocaleString()}>
      {label}
    </time>
  );
}
