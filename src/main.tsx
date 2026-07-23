import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import App from "./App.tsx";
import { tauriHandler } from "./store";
import "./index.css";
import { theme } from "./theme.tsx";

tauriHandler.start().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <HashRouter>
        <MantineProvider defaultColorScheme="light" theme={theme}>
          <App />
        </MantineProvider>
      </HashRouter>
    </StrictMode>,
  );
});
