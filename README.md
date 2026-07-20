# TodoBig

A lightweight system-tray todo panel that stays out of your way. Toggle it with a hotkey, jot down tasks, organize with hashtags, and get back to work.

## Features

- **System tray icon** — click to show/hide the panel
- **Global hotkey** (`Ctrl+Alt+T`) to toggle visibility
- **Always-on-top panel** — docks to the right third of your screen
- **Todo management** — create, reorder (drag & drop), and delete tasks
- **Status tracking** — not started, in progress, complete
- **Hashtag support** — auto-extract tags from text (e.g. `#work #urgent`), with color coding and custom colors
- **Tag filtering** — filter your view by tag
- **Persistent storage** — state saved via Tauri + Zustand, survives restarts
- **Supabase ready** — optional cloud sync backend available

## Tech Stack

| Layer | Tech |
|-------|------|
| Desktop | Tauri 2 (Rust) |
| Frontend | React 19, TypeScript |
| Build | Vite |
| UI | Mantine, Tailwind CSS |
| State | Zustand (with Tauri persistence) |
| Drag & Drop | dnd-kit |
| Icons | Lucide React |

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install) (1.77.2+)
- Linux system libraries for Tauri/WebKitGTK:

  ```bash
  # Debian/Ubuntu
  sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev

  # Fedora
  sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget file libappindicator-gtk3-devel

  # Arch
  sudo pacman -S webkit2gtk-4.1 base-devel openssl curl wget file libappindicator-gtk3
  ```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the dev server (Vite + Tauri)
pnpm tauri dev
```

The Vite dev server runs on `http://localhost:7010` with hot reload. Tauri will open the native window automatically.

If you only need the frontend:

```bash
pnpm dev
```

## Building

```bash
# Production build (Vite + Tauri)
pnpm tauri build
```

Or install directly to `~/.local/bin` using [just](https://github.com/casey/just):

```bash
just tauri-install
```

## Linux Setup

Install and configure autostart in one command:

```bash
just tauri-setup
```

This runs `tauri-install` and copies the desktop entry to `~/.config/autostart/` so TodoBig launches on login.

To uninstall:

```bash
just tauri-uninstall
```

### Wayland Note

The global shortcut (`Ctrl+Alt+T`) relies on X11 key grabs, which don't work reliably under Wayland. TodoBig works around this via a `--toggle` flag — configure your desktop environment's custom shortcut to run:

```
~/.local/bin/todobig --toggle
```

This signals the running instance over D-Bus and toggles the panel.

## Project Structure

```
todobig/
├── src/                    # React frontend
│   ├── components/         # UI components (TodoInput, TodoList, FilterBar, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── store.ts            # Zustand state + Tauri persistence
│   ├── types.ts            # TypeScript types and tag parser
│   ├── theme.tsx           # Mantine theme config
│   └── hashtagColors.ts    # Default tag color palette
├── src-tauri/              # Rust backend
│   ├── src/lib.rs          # Tauri setup, tray icon, window toggle logic
│   └── tauri.conf.json     # Tauri config (window size, permissions, etc.)
├── justfile                # Build & install recipes
└── todobig.desktop         # XDG desktop entry for autostart
```

## License

[MIT](LICENSE)
