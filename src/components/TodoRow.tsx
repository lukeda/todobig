import React from "react";
import {
  ActionIcon,
  Card,
  Checkbox,
  Group,
  Loader,
  Menu,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { ChevronDown, Circle, Clock, GripVertical, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Todo, TodoStatus } from "../types";
import { AgeBadge } from "./AgeBadge";
import { HashtagBadge } from "./HashtagBadge";

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
  onUpdate,
}: {
  todo: Todo;
  onSetStatus: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(todo.text);

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

  const handleSave = React.useCallback(() => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) {
      onUpdate(todo.id, trimmed);
    } else {
      setEditText(todo.text);
    }
    setIsEditing(false);
  }, [editText, todo.id, todo.text, onUpdate]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        setEditText(todo.text);
        setIsEditing(false);
      }
    },
    [handleSave, todo.text],
  );

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
          {isEditing ? (
            <TextInput
              value={editText}
              onChange={(e) => setEditText(e.currentTarget.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
              size="sm"
              style={{ flex: 1 }}
            />
          ) : (
            <Group
              gap={4}
              wrap="nowrap"
              align="center"
              style={{ flex: 1 }}
              className={
                "border border-transparent p-0.5 rounded hover:border-blue-300 transition"
              }
            >
              <Text
                size="sm"
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  textDecoration:
                    todo.status === "complete" ? "line-through" : undefined,
                  flex: 1,
                  cursor: "pointer",
                }}
                onClick={() => setIsEditing(true)}
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
            </Group>
          )}
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
