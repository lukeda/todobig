import { create } from "zustand";
import { createTauriStore } from "@tauri-store/zustand";
import { arrayMove } from "@dnd-kit/sortable";
import { Todo, TodoStatus, parseTags } from "./types";

export type TagColor = { bg?: string; fg?: string };

interface AppState {
  todos: Todo[];
  tags: string[];
  selectedTags: string[];
  customTagColors: Record<string, TagColor>;
  tagPopoverOpened: boolean;
  migrated: boolean;
  now: number;

  addTodo: (todo: Todo) => void;
  updateTodo: (id: string, text: string) => void;
  setTodoStatus: (id: string, status: TodoStatus) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (activeId: string, overId: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setCustomTagColors: (colors: Record<string, TagColor>) => void;
  updateCustomTagColor: (tag: string, color: Partial<TagColor>) => void;
  setTagPopoverOpened: (opened: boolean) => void;
  [key: string]: unknown;
}

export const useStore = create<AppState>((set) => ({
  todos: [],
  tags: [],
  selectedTags: [],
  customTagColors: {},
  tagPopoverOpened: false,
  migrated: false,
  now: Date.now(),

  addTodo: (todo) =>
    set((state) => {
      const mergedTags = new Set([...state.tags, ...todo.tags]);
      return {
        todos: [todo, ...state.todos],
        tags: Array.from(mergedTags),
      };
    }),

  updateTodo: (id, text) =>
    set((state) => {
      const { tags } = parseTags(text);
      const mergedTags = new Set([...state.tags, ...tags]);
      return {
        todos: state.todos.map((t) =>
          t.id === id ? { ...t, text, tags } : t
        ),
        tags: Array.from(mergedTags),
      };
    }),

  setTodoStatus: (id, status) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              completedAt: status === "complete" ? Date.now() : undefined,
            }
          : t
      ),
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    })),

  reorderTodos: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.todos.findIndex((t) => t.id === activeId);
      const newIndex = state.todos.findIndex((t) => t.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return state;
      return { todos: arrayMove(state.todos, oldIndex, newIndex) };
    }),

  setSelectedTags: (tags) => set({ selectedTags: tags }),

  setCustomTagColors: (colors) => set({ customTagColors: colors }),

  updateCustomTagColor: (tag, color) =>
    set((state) => ({
      customTagColors: {
        ...state.customTagColors,
        [tag]: { ...state.customTagColors[tag], ...color },
      },
    })),

  setTagPopoverOpened: (opened) => set({ tagPopoverOpened: opened }),
}));

export const tauriHandler = createTauriStore("todobig-storage", useStore, {
  saveOnChange: true,
  saveStrategy: "debounce",
  saveInterval: 1000,
});

setInterval(() => {
  useStore.setState({ now: Date.now() });
}, 60000);
