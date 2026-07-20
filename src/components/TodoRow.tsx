import {
  ActionIcon,
  Badge,
  Card,
  Checkbox,
  Group,
  Loader,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { ChevronDown, Circle, Clock, GripVertical, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Todo, TodoStatus } from "../types";
import { HashtagBadge } from "./HashtagBadge";
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
  if (days > 0) return `${Math.min(days, 99).toString().padStart(2, "0")}d`;
  if (hours > 0) return `${hours.toString().padStart(2, "0")}h`;
  return `${minutes.toString().padStart(2, "0")}m`;
}

function AgeBadge({
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
    <Badge
      variant="light"
      radius="sm"
      color="gray"
      style={{
        fontSize: 12,
        color,
        padding: "0 4px",
        fontWeight: 400,
      }}
    >
      {label}
    </Badge>
  );
}

const statusLabels: Record<TodoStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Complete",
};

function StatusIndicator({
  status,
  onSetStatus,
}: {
  status: TodoStatus;
  onSetStatus: (status: TodoStatus) => void;
}) {
  const target = (
    <Group gap={4} wrap="nowrap" style={{ cursor: "pointer" }}>
      {status === "not_started" && (
        <Checkbox
          checked={false}
          size="md"
          mt={2}
          tabIndex={-1}
          styles={{ input: { cursor: "pointer" } }}
        />
      )}
      {status === "in_progress" && <Loader size={24} color="teal" />}
      {status === "complete" && (
        <Checkbox
          checked
          size="md"
          mt={2}
          tabIndex={-1}
          styles={{ input: { cursor: "pointer" } }}
        />
      )}
      <ChevronDown size={14} style={{ opacity: 0.4 }} />
    </Group>
  );

  return (
    <Menu shadow="md" width={160} position="bottom-start">
      <Menu.Target>{target}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<Circle size={14} />}
          onClick={() => onSetStatus("not_started")}
          fw={status === "not_started" ? 600 : 400}
        >
          {statusLabels.not_started}
        </Menu.Item>
        <Menu.Item
          leftSection={<Clock size={14} />}
          onClick={() => onSetStatus("in_progress")}
          fw={status === "in_progress" ? 600 : 400}
        >
          {statusLabels.in_progress}
        </Menu.Item>
        <Menu.Item
          leftSection={<Checkbox size="xs" checked readOnly />}
          onClick={() => onSetStatus("complete")}
          fw={status === "complete" ? 600 : 400}
        >
          {statusLabels.complete}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export function SortableTodoRow({
  todo,
  onSetStatus,
  onDelete,
}: {
  todo: Todo;
  onSetStatus: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      withBorder
      shadow="xs"
      padding="sm"
      radius="md"
      ref={setNodeRef}
      style={style}
    >
      <Group gap="xs" align="center" wrap="nowrap">
        <ActionIcon
          variant="subtle"
          color="gray"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          style={{ cursor: "grab" }}
        >
          <GripVertical size={14} />
        </ActionIcon>
        <StatusIndicator
          status={todo.status}
          onSetStatus={(status) => onSetStatus(todo.id, status)}
        />
        <AgeBadge createdAt={todo.createdAt} completedAt={todo.completedAt} />
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text
            size="sm"
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              textDecoration:
                todo.status === "complete" ? "line-through" : undefined,
            }}
          >
            {todo.text
              .split(/(#\w+)/g)
              .map((part, i) =>
                part.startsWith("#") ? (
                  <HashtagBadge key={i} tag={part.slice(1)} />
                ) : (
                  <span key={i}>{part}</span>
                ),
              )}
          </Text>
        </Stack>
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={() => onDelete(todo.id)}
          aria-label="Delete"
        >
          <X size={18} />
        </ActionIcon>
      </Group>
    </Card>
  );
}
