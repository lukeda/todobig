import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Box,
  Card,
  Stack,
  Text,
  Textarea,
  useMantineTheme,
} from "@mantine/core";
import { Plus } from "lucide-react";
import { parseTags, type Todo } from "../types";

export function TodoInput({
  onAdd,
  tags,
}: {
  onAdd: (todo: Todo) => void;
  tags: string[];
}) {
  const theme = useMantineTheme();
  const [draft, setDraft] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wasFocusedRef = useRef(true);

  useEffect(() => {
    const handleFocus = () => {
      if (!wasFocusedRef.current) {
        textareaRef.current?.focus();
      }
      wasFocusedRef.current = true;
    };

    const handleBlur = () => {
      wasFocusedRef.current = false;
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const addTodo = () => {
    const { text, tags: parsedTags } = parseTags(draft);
    if (!text) return;
    onAdd({
      id: crypto.randomUUID(),
      text,
      tags: parsedTags,
      status: "not_started",
      createdAt: Date.now(),
    });
    setDraft("");
  };

  const currentTag = useMemo(() => {
    const el = textareaRef.current;
    const value = draft;
    const cursor = el?.selectionStart ?? value.length;
    const before = value.slice(0, cursor);
    const match = before.match(/#(\w*)$/);
    return match ? match[1].toLowerCase() : null;
  }, [draft]);

  const suggestions = useMemo(() => {
    if (currentTag === null) return [];
    return tags
      .filter((t) => t.includes(currentTag) && t !== currentTag)
      .slice(0, 6)
      .map((t) => `#${t}`);
  }, [currentTag, tags]);

  const suggestionsVisible =
    suggestions.length > 0 && currentTag !== null && !dismissed;

  useEffect(() => {
    setHighlightedIndex(0);
    setDismissed(false);
  }, [suggestions]);

  const applySuggestion = useCallback(
    (val: string) => {
      const el = textareaRef.current;
      const value = draft;
      const cursor = el?.selectionStart ?? value.length;
      const before = value.slice(0, cursor);
      const after = value.slice(cursor);
      const replaced = before.replace(/#(\w*)$/, val);
      const next = replaced + after;
      setDraft(next);
      setDismissed(true);
      requestAnimationFrame(() => {
        const pos = replaced.length;
        el?.focus();
        el?.setSelectionRange(pos, pos);
      });
    },
    [draft],
  );

  return (
    <Box style={{ position: "relative" }}>
      <Textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => {
          setDraft(e.currentTarget.value);
          setDismissed(false);
        }}
        onKeyDown={(e) => {
          if (suggestionsVisible) {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlightedIndex((i) => (i + 1) % suggestions.length);
              return;
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightedIndex(
                (i) => (i - 1 + suggestions.length) % suggestions.length,
              );
              return;
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              applySuggestion(suggestions[highlightedIndex]);
              return;
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setDismissed(true);
              return;
            }
          }
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            addTodo();
          }
        }}
        placeholder="Type #hashtag then your task… (Enter to add)"
        autosize
        minRows={2}
        radius="md"
        size="md"
        autoFocus
        rightSection={
          <ActionIcon
            variant="filled"
            color="blue"
            onClick={addTodo}
            aria-label="Add todo"
            style={{ marginRight: 6 }}
          >
            <Plus size={18} />
          </ActionIcon>
        }
      />
      {suggestionsVisible && (
        <Box
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
          }}
          mt={4}
        >
          <Card
            shadow="md"
            padding={4}
            radius="md"
            withBorder
            style={{ overflow: "hidden" }}
          >
            <Stack gap={0}>
              {suggestions.map((s, i) => (
                <Box
                  key={s}
                  px="sm"
                  py={6}
                  style={{
                    cursor: "pointer",
                    borderRadius: 4,
                    backgroundColor:
                      i === highlightedIndex
                        ? theme.colors.gray[1]
                        : "transparent",
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applySuggestion(s);
                  }}
                  onMouseEnter={() => {
                    setHighlightedIndex(i);
                  }}
                >
                  <Text size="sm" c="gray.7">
                    {s}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Card>
        </Box>
      )}
    </Box>
  );
}
