import { useMemo } from "react";
import { Box, Group, Stack, Text, ActionIcon } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import type { Todo, TodoStatus } from "../types";
import { TodoInput } from "./TodoInput";
import { TodoList } from "./TodoList";
import { SortableTodoRow } from "./TodoRow";

interface SubTodoPageProps {
  parentTodo: Todo;
  subTodos: Todo[];
  tags: string[];
  subTodoCounts: Record<string, { total: number; completed: number }>;
  onBack: () => void;
  onAddSubTodo: (todo: Todo) => void;
  onSetStatus: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export function SubTodoPage({
  parentTodo,
  subTodos,
  tags,
  subTodoCounts,
  onBack,
  onAddSubTodo,
  onSetStatus,
  onDelete,
  onUpdate,
  onReorder,
}: SubTodoPageProps) {
  const { active, completed } = useMemo(() => {
    return {
      active: subTodos.filter((t) => t.status !== "complete"),
      completed: subTodos.filter((t) => t.status === "complete"),
    };
  }, [subTodos]);

  return (
    <Box mih="100vh">
      <Group
        justify="flex-start"
        px="xs"
        py="xs"
        style={{
          position: "sticky",
          top: 0,
          borderBottom: "1px solid #e9ecef",
          zIndex: 100,
          background: "white",
        }}
        data-tauri-drag-region
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={onBack}
          title="Back to tasks"
        >
          <ArrowLeft size={16} />
        </ActionIcon>
        <Text fw={500} size="sm">
          Sub-tasks
        </Text>
      </Group>

      <Box mx="auto" maw={640} px="md" py="md">
        <Stack gap="lg">
          <SortableTodoRow
            todo={parentTodo}
            onSetStatus={onSetStatus}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />

          <TodoInput
            onAdd={onAddSubTodo}
            tags={tags}
            parentId={parentTodo.id}
          />

          <TodoList
            todos={active}
            title="To do"
            onSetStatus={onSetStatus}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onReorder={onReorder}
            subTodoCounts={subTodoCounts}
          />

          <TodoList
            todos={completed}
            title="Completed"
            dimmed
            onSetStatus={onSetStatus}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onReorder={onReorder}
            subTodoCounts={subTodoCounts}
          />

          {subTodos.length === 0 && (
            <Text ta="center" c="gray.5" size="sm" mt="xl">
              No sub-tasks yet. Add one above.
            </Text>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
