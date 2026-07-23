import { Box, Stack, Text, ActionIcon, Group } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { MonitorSelector } from "./MonitorSelector";

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  return (
    <Box mih="100vh">
      <Group
        justify="flex-start"
        px="xs"
        py="xs"
        style={{
          position: "sticky",
          top: 0,
          borderBottom: "1px solid #e9ecef",
          zIndex: 100,
        }}
        data-tauri-drag-region
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={onBack}
          title="Back to tasks"
        >
          <ArrowLeft size={16} />
        </ActionIcon>
        <Text fw={500} size="sm">
          Settings
        </Text>
      </Group>

      <Box mx="auto" maw={640} px="md" py="md">
        <Stack gap="lg">
          <Box>
            <Text fw={500} mb="xs">
              Display
            </Text>
            <MonitorSelector />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}