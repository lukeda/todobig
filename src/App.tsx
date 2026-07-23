import { Routes, Route, useNavigate } from "react-router-dom";
import { Box, ActionIcon, Group } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { X, Settings } from "lucide-react";
import { useWindow } from "./hooks/useWindow";
import { HomePage } from "./pages/HomePage";
import { TodoDetailPage } from "./pages/TodoDetailPage";
import { SettingsPage } from "./components/SettingsPage";

function App() {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { hideWindow } = useWindow();

  return (
    <Box
      mih="100vh"
      style={{
        background: `linear-gradient(180deg, ${theme.colors.gray[0]}, ${theme.colors.gray[1]})`,
      }}
    >
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
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={() => navigate("/settings")}
          title="Settings"
        >
          <Settings size={16} />
        </ActionIcon>
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

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/todo/:todoId" element={<TodoDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Box>
  );
}

export default App;