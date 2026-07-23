import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stack, Text } from "@mantine/core";
import { useStore } from "../store";
import { TodoInput } from "../components/TodoInput";
import { TodoList } from "../components/TodoList";
import { FilterBar } from "../components/FilterBar";

export function HomePage() {
  const navigate = useNavigate();
  const todos = useStore((s) => s.todos);
  const selectedTags = useStore((s) => s.selectedTags);
  const addTodo = useStore((s) => s.addTodo);
  const updateTodo = useStore((s) => s.updateTodo);
  const setTodoStatus = useStore((s) => s.setTodoStatus);
  const deleteTodo = useStore((s) => s.deleteTodo);
  const reorderTodos = useStore((s) => s.reorderTodos);
  const tags = useStore((s) => s.tags);

  const rootTodos = useMemo(() => {
    return todos.filter((t) => !t.parentId);
  }, [todos]);

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

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    rootTodos.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [rootTodos]);

  const { active, completed } = useMemo(() => {
    return {
      active: rootTodos.filter((t) => t.status !== "complete"),
      completed: rootTodos.filter((t) => t.status === "complete"),
    };
  }, [rootTodos]);

  const filteredActive = useMemo(() => {
    if (selectedTags.length === 0) return active;
    return active.filter((t) =>
      t.tags.some((tag) => selectedTags.includes(tag)),
    );
  }, [active, selectedTags]);

  const filteredCompleted = useMemo(() => {
    if (selectedTags.length === 0) return completed;
    return completed.filter((t) =>
      t.tags.some((tag) => selectedTags.includes(tag)),
    );
  }, [completed, selectedTags]);

  return (
    <Box mx="auto" maw={640} px="md" py="md">
      <Stack gap="lg">
        <FilterBar availableTags={availableTags} />

        <TodoInput onAdd={addTodo} tags={tags} />

        <TodoList
          todos={filteredActive}
          title="To do"
          onSetStatus={setTodoStatus}
          onDelete={deleteTodo}
          onUpdate={updateTodo}
          onReorder={reorderTodos}
          onClick={(id) => navigate(`/todo/${id}`)}
          subTodoCounts={subTodoCounts}
        />

        <TodoList
          todos={filteredCompleted}
          title="Completed"
          dimmed
          onSetStatus={setTodoStatus}
          onDelete={deleteTodo}
          onUpdate={updateTodo}
          onReorder={reorderTodos}
          onClick={(id) => navigate(`/todo/${id}`)}
          subTodoCounts={subTodoCounts}
        />

        {rootTodos.length === 0 && (
          <Text ta="center" c="gray.5" size="sm" mt="xl">
            Nothing here yet. Add your first task above.
          </Text>
        )}
      </Stack>
    </Box>
  );
}