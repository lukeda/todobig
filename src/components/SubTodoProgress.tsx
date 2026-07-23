import { Badge, Tooltip } from "@mantine/core";

function lerpColor(a: number[], b: number[], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

const GREEN = [34, 197, 94];
const YELLOW = [234, 179, 8];
const RED = [239, 68, 68];

function progressColor(ratio: number): string {
  if (ratio >= 0.5) {
    return lerpColor(YELLOW, GREEN, (ratio - 0.5) * 2);
  }
  return lerpColor(RED, YELLOW, ratio * 2);
}

export function SubTodoProgress({
  completed,
  total,
  onClick,
}: {
  completed: number;
  total: number;
  onClick?: () => void;
}) {
  const ratio = total > 0 ? completed / total : 0;
  const color = progressColor(ratio);

  return (
    <Tooltip label={`${completed} of ${total} sub-tasks completed`} withArrow>
      <Badge
        variant="light"
        radius="sm"
        color="gray"
        onClick={onClick}
        style={{
          fontSize: 12,
          color,
          padding: "0 4px",
          fontWeight: 400,
          textTransform: "none",
          textShadow: "1px 1px white",
          cursor: "pointer",
        }}
        className="hover:opacity-80 transition-opacity duration-200"
      >
        {completed}/{total}
      </Badge>
    </Tooltip>
  );
}
