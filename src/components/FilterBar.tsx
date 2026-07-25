import { Group, MultiSelect } from "@mantine/core";
import { Filter } from "lucide-react";
import { useStore } from "../store";

export function FilterBar({ availableTags }: { availableTags: string[] }) {
  const selectedTags = useStore((s) => s.selectedTags);
  const setSelectedTags = useStore((s) => s.setSelectedTags);

  const tagData = availableTags.map((tag) => ({
    value: tag,
    label: `#${tag}`,
  }));

  return (
    <Group gap="xs" align="center" wrap="nowrap">
      <Filter size={18} style={{ opacity: 0.5, flexShrink: 0 }} />

      <MultiSelect
        data={tagData}
        value={selectedTags}
        onChange={setSelectedTags}
        placeholder="Filter by tag..."
        clearable
        searchable
        size="sm"
        style={{ flex: 1 }}
        styles={{
          input: { backgroundColor: "white" },
        }}
      />
    </Group>
  );
}
