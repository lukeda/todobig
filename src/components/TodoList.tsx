import { Stack, Text } from '@mantine/core';
import type { Todo } from '../types';
import { TodoRow } from './TodoRow';

export function TodoList({
  todos,
  title,
  dimmed,
  onToggle,
  onDelete,
}: {
  todos: Todo[];
  title: string;
  dimmed?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (todos.length === 0) return null;

  return (
    <Stack gap="xs" style={dimmed ? { opacity: 0.5 } : undefined}>
      <Text size="sm" fw={600} c="gray.5">
        {title} ({todos.length})
      </Text>
      {todos.map((t) => (
        <TodoRow
          key={t.id}
          todo={t}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}
