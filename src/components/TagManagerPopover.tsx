import {
  ActionIcon,
  Popover,
  Stack,
  Text,
  Table,
  ScrollArea,
} from "@mantine/core";
import { Settings2 } from "lucide-react";
import { useStore } from "../store";
import { TagManagerItem } from "./TagManagerItem";

interface TagManagerPopoverProps {
  availableTags: string[];
}

export function TagManagerPopover({ availableTags }: TagManagerPopoverProps) {
  const popoverOpened = useStore((s) => s.tagPopoverOpened);
  const setPopoverOpened = useStore((s) => s.setTagPopoverOpened);
  const customTagColors = useStore((s) => s.customTagColors);
  const updateCustomTagColor = useStore((s) => s.updateCustomTagColor);

  return (
    <Popover opened={popoverOpened} position="bottom-end" withArrow shadow="md">
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={() => setPopoverOpened(!popoverOpened)}
          aria-label="Manage tags"
        >
          <Settings2 size={18} />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap="sm" maw={320}>
          <Text size="sm" fw={600} c="gray.7">
            Tag Colors
          </Text>
          {availableTags.length === 0 ? (
            <Text size="sm" c="gray.5">
              No tags yet
            </Text>
          ) : (
            <ScrollArea>
              <Table>
                <Table.Tbody>
                  {availableTags.map((tag) => (
                    <TagManagerItem
                      key={tag}
                      tag={tag}
                      customColor={customTagColors[tag]}
                      onUpdateColor={updateCustomTagColor}
                    />
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
