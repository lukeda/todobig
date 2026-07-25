import { Routes, Route } from "react-router-dom";
import { Box } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { HomePage } from "./pages/HomePage";
import { TodoDetailPage } from "./pages/TodoDetailPage";
import { SettingsPage } from "./components/SettingsPage";
import { AppHeader } from "./components/AppHeader";

function App() {
  const theme = useMantineTheme();

  return (
    <Box
      mih="100vh"
      style={{
        background: `linear-gradient(180deg, ${theme.colors.gray[0]}, ${theme.colors.gray[1]})`,
      }}
    >
      <AppHeader />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/todo/:todoId" element={<TodoDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Box>
  );
}

export default App;