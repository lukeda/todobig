import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Group, Stack, Text, ActionIcon } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { useStore } from "../store";
import { TodoInput } from "../components/TodoInput";
import { TodoList } from "../components/TodoList";
import { SortableTodoRow } from "../components/TodoRow";

export function TodoDetailPage() {
  const { todoId } = useParams<{ todoId: string }>();
  const navigate = useNavigate();
  const todos = useStore((s) => s.todos);
  const tags = useStore((s) => s.tags);
  const addTodo = useStore((s) => s.addTodo);
  const updateTodo = useStore((s) => s.updateTodo);
  const setTodoStatus = useStore((s) => s.setTodoStatus);
  const deleteTodo = useStore((s) => s.deleteTodo);
  const reorderTodos = useStore((s) => s.reorderTodos);

  const currentTodo = useMemo(() => {
    return todos.find((t) => t.id === todoId);
  }, [todos, todoId]);

  const parentChain = useMemo(() => {
    if (!currentTodo) return [];
    const chain: typeof todos = [];
    let current = currentTodo;
    while (current.parentId) {
      const parent = todos.find((t) => t.id === current.parentId);
      if (parent) {
        chain.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return chain;
  }, [currentTodo, todos]);

  const subTodos = useMemo(() => {
    return todos.filter((t) => t.parentId === todoId);
  }, [todos, todoId]);

  const subTodoCounts = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {};
    todos.forEach((t) => {
      if (t.parentId) {
        if (!counts[t.parentId]) {
          counts[t.parentId] = { total: 0, completed: 0 };
        }
        counts[t.parentId].total++;
        if (t.status === "complete") {
          counts[t.parentId].completed++;
        }
      }
    });
    return counts;
  }, [todos]);

  const { active, completed } = useMemo(() => {
    return {
      active: subTodos.filter((t) => t.status !== "complete"),
      completed: subTodos.filter((t) => t.status === "complete"),
    };
  }, [subTodos]);

  const handleBack = () => {
    if (parentChain.length > 0) {
      const parent = parentChain[parentChain.length - 1];
      navigate(`/todo/${parent.id}`);
    } else {
      navigate("/");
    }
  };

  if (!currentTodo) {
    return (
      <Box mx="auto" maw={640} px="md" py="md">
        <Text>Todo not found</Text>
      </Box>
    );
  }

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
          onClick={handleBack}
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
          {parentChain.length > 0 && (
            <Stack gap="xs">
              {parentChain.map((parent) => (
                <SortableTodoRow
                  key={parent.id}
                  todo={parent}
                  onSetStatus={setTodoStatus}
                  onDelete={deleteTodo}
                  onUpdate={updateTodo}
                  draggable={false}
                />
              ))}
            </Stack>
          )}

          <SortableTodoRow
            todo={currentTodo}
            onSetStatus={setTodoStatus}
            onDelete={deleteTodo}
            onUpdate={updateTodo}
            draggable={false}
          />

          <TodoInput onAdd={addTodo} tags={tags} parentId={currentTodo.id} />

          <TodoList
            todos={active}
            title="To do"
            onSetStatus={setTodoStatus}
            onDelete={deleteTodo}
            onUpdate={updateTodo}
            onReorder={reorderTodos}
            subTodoCounts={subTodoCounts}
          />

          <TodoList
            todos={completed}
            title="Completed"
            dimmed
            onSetStatus={setTodoStatus}
            onDelete={deleteTodo}
            onUpdate={updateTodo}
            onReorder={reorderTodos}
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
