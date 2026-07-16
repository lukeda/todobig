import { useState } from "react";
import {
  ActionIcon,
  Group,
  MultiSelect,
  Popover,
  Stack,
  Text,
  ColorInput,
} from "@mantine/core";
import { Filter, Settings2 } from "lucide-react";
import { colorForTag } from "../hashtagColors";
import { useStore } from "../store";

export function FilterBar({
  availableTags,
}: {
  availableTags: string[];
}) {
  const [popoverOpened, setPopoverOpened] = useState(false);
  const selectedTags = useStore((s) => s.selectedTags);
  const setSelectedTags = useStore((s) => s.setSelectedTags);
  const customTagColors = useStore((s) => s.customTagColors);
  const updateCustomTagColor = useStore((s) => s.updateCustomTagColor);

  const [editingColor, setEditingColor] = useState<string | null>(null);
  const [tempColor, setTempColor] = useState<string>("");

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

      <Popover
        opened={popoverOpened}
        onChange={setPopoverOpened}
        position="bottom-end"
        withArrow
        shadow="md"
        closeOnClickOutside={!editingColor}
      >
        <Popover.Target>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => setPopoverOpened((o) => !o)}
            aria-label="Manage tags"
          >
            <Settings2 size={18} />
          </ActionIcon>
        </Popover.Target>

        <Popover.Dropdown>
          <Stack gap="sm" maw={240}>
            <Text size="sm" fw={600} c="gray.7">
              Tag Colors
            </Text>
            {availableTags.length === 0 ? (
              <Text size="sm" c="gray.5">
                No tags yet
              </Text>
            ) : (
              <Stack gap="xs">
                {availableTags.map((tag) => {
                  const currentColor = editingColor === tag ? tempColor : (customTagColors[tag] || "#3b82f6");
                  const colors = colorForTag(tag, customTagColors);
                  return (
                    <Group key={tag} gap="xs" align="center" wrap="nowrap">
                      <Text
                        size="sm"
                        fw={500}
                        style={{ minWidth: 80 }}
                        c={colors.fg}
                        bg={colors.bg}
                        px={6}
                        py={2}
                        bd="md"
                      >
                        #{tag}
                      </Text>
                      <ColorInput
                        disallowInput={false}
                        size="xs"
                        format="hex"
                        value={currentColor}
                        onChange={(color) => {
                          setEditingColor(tag);
                          setTempColor(color);
                        }}
                        onChangeEnd={(color) => {
                          updateCustomTagColor(tag, color);
                          setEditingColor(null);
                        }}
                        popoverProps={{ withinPortal: true }}
                        style={{ flex: 1 }}
                      />
                    </Group>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
}
