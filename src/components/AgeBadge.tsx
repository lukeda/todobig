import { Badge, Tooltip } from "@mantine/core";
import { useStore } from "../store";

function lerpColor(a: number[], b: number[], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

const GREEN = [34, 197, 94];
const YELLOW = [234, 179, 8];
const RED = [239, 68, 68];

function ageColor(ms: number): string {
  const days = ms / (1000 * 60 * 60 * 24);
  if (days < 1) return lerpColor(GREEN, GREEN, 0);
  if (days < 7) return lerpColor(GREEN, YELLOW, (days - 1) / 6);
  if (days < 14) return lerpColor(YELLOW, RED, (days - 7) / 7);
  return lerpColor(RED, RED, 0);
}

function formatAge(ms: number): string {
  const minutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (minutes < 1 || minutes === 0) return "now";
  if (days > 0) return `${Math.min(days, 99).toString().padStart(2, "0")}d`;
  if (hours > 0) return `${hours.toString().padStart(2, "0")}h`;
  return `${minutes.toString().padStart(2, "0")}m`;
}

export function AgeBadge({
  createdAt,
  completedAt,
}: {
  createdAt: number;
  completedAt?: number;
}) {
  const now = useStore((s) => s.now);
  const elapsed = completedAt ? completedAt - createdAt : now - createdAt;
  const label = formatAge(elapsed);
  const color = ageColor(elapsed);

  return (
    <Tooltip
      openDelay={0}
      label={
        completedAt
          ? `Completed at ${new Date(completedAt).toLocaleString()}`
          : `Created at ${new Date(createdAt).toLocaleString()}`
      }
      withArrow
    >
      <Badge
        variant="light"
        radius="sm"
        color="gray"
        style={{
          fontSize: 12,
          color,
          padding: "0 4px",
          fontWeight: 400,
          textTransform: "none",
          textShadow: "1px 1px white",
        }}
      >
        {label}
      </Badge>
    </Tooltip>
  );
}