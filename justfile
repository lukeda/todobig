# Build Tauri and install to ~/.local/bin
tauri-install:
    NO_STRIP=true cargo tauri build
    mkdir -p ~/.local/bin
    cp src-tauri/target/release/app ~/.local/bin/todobig
    chmod +x ~/.local/bin/todobig

# Setup autostart with OS
tauri-autostart:
    mkdir -p ~/.config/autostart
    cp todobig.desktop ~/.config/autostart/

# Install + autostart in one command
tauri-setup: tauri-install tauri-autostart

# Remove from system
tauri-uninstall:
    rm -f ~/.local/bin/todobig
    rm -f ~/.config/autostart/todobig.desktop
