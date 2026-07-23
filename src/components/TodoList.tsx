import { Stack, Text } from "@mantine/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Todo, TodoStatus } from "../types";
import { SortableTodoRow } from "./TodoRow";

export function TodoList({
  todos,
  title,
  dimmed,
  onSetStatus,
  onDelete,
  onUpdate,
  onReorder,
  subTodoCounts,
}: {
  todos: Todo[];
  title: string;
  dimmed?: boolean;
  onSetStatus: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  subTodoCounts?: Record<string, { total: number; completed: number }>;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (todos.length === 0) return null;

  return (
    <Stack gap="xs" style={dimmed ? { opacity: 0.5 } : undefined}>
      <Text size="sm" fw={600} c="gray.5">
        {title} ({todos.length})
      </Text>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event: DragEndEvent) => {
          const { active, over } = event;
          if (over && active.id !== over.id) {
            onReorder(String(active.id), String(over.id));
          }
        }}
      >
        <SortableContext
          items={todos.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {todos.map((t) => (
            <SortableTodoRow
              key={t.id}
              todo={t}
              onSetStatus={onSetStatus}
              onDelete={onDelete}
              onUpdate={onUpdate}
              subTodoCount={subTodoCounts?.[t.id]?.total}
              subTodoCompleted={subTodoCounts?.[t.id]?.completed}
            />
          ))}
        </SortableContext>
      </DndContext>
    </Stack>
  );
}
