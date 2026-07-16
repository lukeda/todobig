import { create } from 'zustand';
import { createTauriStore } from '@tauri-store/zustand';
import { Todo } from './types';

interface AppState {
  todos: Todo[];
  tags: string[];
  selectedTags: string[];
  customTagColors: Record<string, string>;

  addTodo: (todo: Todo) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setCustomTagColors: (colors: Record<string, string>) => void;
  updateCustomTagColor: (tag: string, color: string) => void;
  [key: string]: unknown;
}

export const useStore = create<AppState>((set) => ({
  todos: [],
  tags: [],
  selectedTags: [],
  customTagColors: {},

  addTodo: (todo) =>
    set((state) => {
      const mergedTags = new Set([...state.tags, ...todo.tags]);
      return {
        todos: [todo, ...state.todos],
        tags: Array.from(mergedTags),
      };
    }),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    })),

  setSelectedTags: (tags) => set({ selectedTags: tags }),

  setCustomTagColors: (colors) => set({ customTagColors: colors }),

  updateCustomTagColor: (tag, color) =>
    set((state) => ({
      customTagColors: { ...state.customTagColors, [tag]: color },
    })),
}));

export const tauriHandler = createTauriStore('todobig-storage', useStore, {
  saveOnChange: true,
  saveStrategy: 'debounce',
  saveInterval: 1000,
});
