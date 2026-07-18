import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import App from "./App.tsx";
import { tauriHandler } from "./store";
import "./index.css";

tauriHandler.start().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <MantineProvider defaultColorScheme="light">
        <App />
      </MantineProvider>
    </StrictMode>,
  );
});
