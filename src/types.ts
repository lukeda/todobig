export type TodoStatus = 'not_started' | 'in_progress' | 'complete';

export interface Todo {
  id: string;
  text: string;
  tags: string[];
  status: TodoStatus;
  createdAt: number;
}

export function parseTags(input: string): { text: string; tags: string[] } {
  const tagMatches = input.match(/#(\w+)/g) ?? [];
  const tags = tagMatches.map((t) => t.slice(1).toLowerCase());
  const uniqueTags = Array.from(new Set(tags));
  const text = input.trim();
  return { text, tags: uniqueTags };
}
