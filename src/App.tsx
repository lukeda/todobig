import { useMemo } from 'react';
import { Box, Stack, Text, useMantineTheme, ActionIcon, Group } from '@mantine/core';
import { X } from 'lucide-react';
import { useStore } from './store';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { FilterBar } from './components/FilterBar';
import { useWindow } from './hooks/useWindow';

function App() {
  const theme = useMantineTheme();
  const { hideWindow } = useWindow();
  const todos = useStore((s) => s.todos);
  const selectedTags = useStore((s) => s.selectedTags);
  const addTodo = useStore((s) => s.addTodo);
  const setTodoStatus = useStore((s) => s.setTodoStatus);
  const deleteTodo = useStore((s) => s.deleteTodo);
  const tags = useStore((s) => s.tags);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    todos.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [todos]);

  const { active, completed } = useMemo(() => {
    const sorted = [...todos].sort((a, b) => b.createdAt - a.createdAt);
    return {
      active: sorted.filter((t) => t.status !== 'complete'),
      completed: sorted.filter((t) => t.status === 'complete'),
    };
  }, [todos]);

  const filteredActive = useMemo(() => {
    if (selectedTags.length === 0) return active;
    return active.filter((t) => t.tags.some((tag) => selectedTags.includes(tag)));
  }, [active, selectedTags]);

  const filteredCompleted = useMemo(() => {
    if (selectedTags.length === 0) return completed;
    return completed.filter((t) => t.tags.some((tag) => selectedTags.includes(tag)));
  }, [completed, selectedTags]);

  return (
    <Box
      mih="100vh"
      style={{
        background: `linear-gradient(180deg, ${theme.colors.gray[0]}, ${theme.colors.gray[1]})`,
      }}
    >
      <Group
        justify="flex-end"
        px="xs"
        py="xs"
        style={{
          position: 'sticky',
          top: 0,
          background: theme.white,
          borderBottom: `1px solid ${theme.colors.gray[2]}`,
          zIndex: 100,
        }}
        data-tauri-drag-region
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={hideWindow}
          title="Hide window (Ctrl+Shift+T to show)"
        >
          <X size={16} />
        </ActionIcon>
      </Group>

      <Box mx="auto" maw={640} px="md" py="md">
        <Stack gap="lg">
          <FilterBar availableTags={availableTags} />

          <TodoInput onAdd={addTodo} tags={tags} />

          <TodoList
            todos={filteredActive}
            title="To do"
            onSetStatus={setTodoStatus}
            onDelete={deleteTodo}
          />

          <TodoList
            todos={filteredCompleted}
            title="Completed"
            dimmed
            onSetStatus={setTodoStatus}
            onDelete={deleteTodo}
          />

          {todos.length === 0 && (
            <Text ta="center" c="gray.5" size="sm" mt="xl">
              Nothing here yet. Add your first task above.
            </Text>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

export default App;
