import { ActionIcon, Card, Checkbox, Group, Stack, Text } from '@mantine/core';
import { X } from 'lucide-react';
import type { Todo } from '../types';
import { HashtagBadge } from './HashtagBadge';

export function TodoRow({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card withBorder shadow="xs" padding="sm" radius="md">
      <Group gap="xs" align="center" wrap="nowrap">
        <Checkbox
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
          size="md"
          mt={2}
          aria-label="Toggle complete"
        />
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text
            size="sm"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              textDecoration: todo.done ? 'line-through' : undefined,
            }}
          >
            {todo.text.split(/(#\w+)/g).map((part, i) =>
              part.startsWith('#') ? (
                <HashtagBadge key={i} tag={part.slice(1)} />
              ) : (
                <span key={i}>{part}</span>
              )
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
