import { create } from "zustand";
import { createTauriStore } from "@tauri-store/zustand";
import { Todo, TodoStatus } from "./types";

export type TagColor = { bg?: string; fg?: string };

interface AppState {
  todos: Todo[];
  tags: string[];
  selectedTags: string[];
  customTagColors: Record<string, TagColor>;
  tagPopoverOpened: boolean;
  migrated: boolean;

  addTodo: (todo: Todo) => void;
  setTodoStatus: (id: string, status: TodoStatus) => void;
  deleteTodo: (id: string) => void;
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

  addTodo: (todo) =>
    set((state) => {
      const mergedTags = new Set([...state.tags, ...todo.tags]);
      return {
        todos: [todo, ...state.todos],
        tags: Array.from(mergedTags),
      };
    }),

  setTodoStatus: (id, status) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, status } : t)),
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    })),

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
