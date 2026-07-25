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
  preferredMonitor: string | null;
  rootTodos: Todo[];
  availableTags: string[];

  addTodo: (todo: Todo) => void;
  updateTodo: (id: string, text: string) => void;
  setTodoStatus: (id: string, status: TodoStatus) => void;
  deleteTodo: (id: string) => void;
  reorderTodos: (activeId: string, overId: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setCustomTagColors: (colors: Record<string, TagColor>) => void;
  updateCustomTagColor: (tag: string, color: Partial<TagColor>) => void;
  setTagPopoverOpened: (opened: boolean) => void;
  setPreferredMonitor: (monitor: string | null) => void;
  [key: string]: unknown;
}

function computeRootTodos(todos: Todo[]): Todo[] {
  return todos.filter((t) => !t.parentId);
}

function computeAvailableTags(rootTodos: Todo[]): string[] {
  const tagSet = new Set<string>();
  rootTodos.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

export const useStore = create<AppState>((set) => ({
  todos: [],
  tags: [],
  selectedTags: [],
  customTagColors: {},
  tagPopoverOpened: false,
  migrated: false,
  now: Date.now(),
  preferredMonitor: null,
  rootTodos: [],
  availableTags: [],

  addTodo: (todo) =>
    set((state) => {
      const mergedTags = new Set([...state.tags, ...todo.tags]);
      const newTodos = [todo, ...state.todos];
      const rootTodos = computeRootTodos(newTodos);
      return {
        todos: newTodos,
        tags: Array.from(mergedTags),
        rootTodos,
        availableTags: computeAvailableTags(rootTodos),
      };
    }),

  updateTodo: (id, text) =>
    set((state) => {
      const { tags } = parseTags(text);
      const mergedTags = new Set([...state.tags, ...tags]);
      const newTodos = state.todos.map((t) =>
        t.id === id ? { ...t, text, tags } : t
      );
      const rootTodos = computeRootTodos(newTodos);
      return {
        todos: newTodos,
        tags: Array.from(mergedTags),
        rootTodos,
        availableTags: computeAvailableTags(rootTodos),
      };
    }),

  setTodoStatus: (id, status) =>
    set((state) => {
      const newTodos = state.todos.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              completedAt: status === "complete" ? Date.now() : undefined,
            }
          : t
      );
      const rootTodos = computeRootTodos(newTodos);
      return {
        todos: newTodos,
        rootTodos,
        availableTags: computeAvailableTags(rootTodos),
      };
    }),

  deleteTodo: (id) =>
    set((state) => {
      const newTodos = state.todos.filter((t) => t.id !== id);
      const rootTodos = computeRootTodos(newTodos);
      return {
        todos: newTodos,
        rootTodos,
        availableTags: computeAvailableTags(rootTodos),
      };
    }),

  reorderTodos: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.todos.findIndex((t) => t.id === activeId);
      const newIndex = state.todos.findIndex((t) => t.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return state;
      const newTodos = arrayMove(state.todos, oldIndex, newIndex);
      const rootTodos = computeRootTodos(newTodos);
      return {
        todos: newTodos,
        rootTodos,
        availableTags: computeAvailableTags(rootTodos),
      };
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
  
  setPreferredMonitor: (monitor) => set({ preferredMonitor: monitor }),
}));

export const tauriHandler = createTauriStore("todobig-storage", useStore, {
  saveOnChange: true,
  saveStrategy: "debounce",
  saveInterval: 1000,
  hooks: {
    beforeFrontendSync: (state) => {
      if (state.todos) {
        const rootTodos = computeRootTodos(state.todos as Todo[]);
        return {
          ...state,
          rootTodos,
          availableTags: computeAvailableTags(rootTodos),
        };
      }
      return state;
    },
  },
});

setInterval(() => {
  useStore.setState({ now: Date.now() });
}, 60000);
