import { useNavigate } from "react-router-dom";
import { ActionIcon, Group, useMantineTheme } from "@mantine/core";
import { X, Settings } from "lucide-react";
import { useWindow } from "../hooks/useWindow";
import { TagManagerPopover } from "./TagManagerPopover";
import { useStore } from "../store";

export function AppHeader() {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { hideWindow } = useWindow();
  const availableTags = useStore((s) => s.availableTags);

  return (
    <Group
      justify="space-between"
      px="xs"
      py="xs"
      style={{
        position: "sticky",
        top: 0,
        background: theme.white,
        borderBottom: `1px solid ${theme.colors.gray[2]}`,
        zIndex: 100,
      }}
      data-tauri-drag-region
    >
      <Group gap="xs">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={() => navigate("/settings")}
          title="Settings"
        >
          <Settings size={16} />
        </ActionIcon>
        <TagManagerPopover availableTags={availableTags} />
      </Group>
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
  );
}
