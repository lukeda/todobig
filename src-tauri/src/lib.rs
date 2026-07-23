use tauri::{
  menu::{Menu, MenuItem},
  tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
  LogicalPosition, LogicalSize, Manager, Monitor, PhysicalPosition,
};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::RwLock;
use serde::{Deserialize, Serialize};

struct ToggleState {
  visible: AtomicBool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitorInfo {
  pub name: Option<String>,
  pub is_primary: bool,
  pub position: (i32, i32),
  pub size: (u32, u32),
  pub scale_factor: f64,
}

pub struct MonitorPreference {
  pub preferred_monitor: RwLock<Option<String>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  std::env::set_var("GDK_BACKEND", "x11");
  std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");

  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![get_monitors, set_preferred_monitor, get_preferred_monitor])
    // MUST be the first plugin registered, and on the Builder rather than inside
    // setup(): Tauri initializes plugins during build() BEFORE setup() runs and
    // creates the config windows, so registering it in setup() is too late.
    //
    // This is how the panel is toggled. X11 global-shortcut grabs are useless
    // under Wayland (XGrabKey on Xwayland never sees keys sent to native Wayland
    // clients), so KDE owns the ctrl+alt+t binding and runs `app --toggle`; that
    // second process signals this one over D-Bus and exits without a webview.
    .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
      // A bare launch must not toggle — only the KDE shortcut passes --toggle.
      if !argv.iter().any(|a| a == "--toggle") {
        return;
      }
      if let Some(window) = app.get_webview_window("main") {
        // Runs on zbus's executor thread, not GTK's main thread — toggle_window
        // dispatches to the main thread itself.
        toggle_window(&window, None);
      }
    }))
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      #[cfg(desktop)]
      {
        use tauri_plugin_global_shortcut::{
          Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
        };

        // Ctrl+Alt+T toggles the panel.
        //
        // Linux caveat: this plugin grabs via X11 XGrabKey, and the app forces
        // GDK_BACKEND=x11 (see run()), so it grabs as an Xwayland client. Under a
        // Wayland session the compositor routes keys to the focused client, so a
        // native-Wayland app having focus means Xwayland — and this grab — never
        // sees the press. Registration still returns Ok, so the failure is silent
        // and looks intermittent: it fires only while an X11 window holds focus.
        // The `--toggle` argv path above is the Wayland-proof alternative.
        let toggle_shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyT);

        app.handle().plugin(
          tauri_plugin_global_shortcut::Builder::new()
            .with_handler(move |app, shortcut, event| {
              // Fires on press AND release — without this the panel would toggle
              // twice per keypress and appear not to open at all.
              if event.state() != ShortcutState::Pressed || shortcut != &toggle_shortcut {
                return;
              }
              if let Some(window) = app.get_webview_window("main") {
                // Runs off the GTK main thread; toggle_window dispatches onto it.
                toggle_window(&window, None);
              }
            })
            .build(),
        )?;

        app.global_shortcut().register(toggle_shortcut)?;

        app.handle().plugin(tauri_plugin_positioner::init())?;

        app.manage(ToggleState {
          visible: AtomicBool::new(false),
        });

        app.manage(MonitorPreference {
          preferred_monitor: RwLock::new(None),
        });

        let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
        let menu = Menu::with_items(app, &[&quit_item])?;

        let tray = TrayIconBuilder::new()
          .icon(app.default_window_icon().unwrap().clone())
          .menu(&menu)
          .show_menu_on_left_click(false)
          .on_menu_event(|app, event| match event.id.as_ref() {
            "quit" => {
              app.exit(0);
            }
            _ => {}
          })
          .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
              button: MouseButton::Left,
              button_state: MouseButtonState::Up,
              position,
              ..
            } = event
            {
              let app = tray.app_handle();
              if let Some(window) = app.get_webview_window("main") {
                toggle_window(&window, Some(position));
              }
            }
          })
          .build(app)?;

        app.manage(tray);
      }

      app.handle().plugin(tauri_plugin_store::Builder::new().build())?;
      app.handle().plugin(tauri_plugin_zustand::init())?;

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

/// Resolve which monitor to show the panel on.
/// Priority: explicit hint (tray click position) -> stored preference (or next available) -> cursor position -> primary monitor.
/// NOTE: touches GTK/X11 — must be called on the GTK main thread.
fn resolve_monitor(
  window: &tauri::WebviewWindow,
  hint: Option<PhysicalPosition<f64>>,
) -> Result<Monitor, Box<dyn std::error::Error>> {
  if let Some(p) = hint {
    if let Ok(Some(m)) = window.monitor_from_point(p.x, p.y) {
      return Ok(m);
    }
  }
  
  let pref = window.app_handle().state::<MonitorPreference>();
  if let Ok(pref_guard) = pref.preferred_monitor.read() {
    if let Some(ref monitor_name) = *pref_guard {
      if let Ok(monitors) = window.available_monitors() {
        for m in &monitors {
          if m.name() == Some(&monitor_name) {
            return Ok(m.clone());
          }
        }
        
        if !monitors.is_empty() {
          return Ok(monitors[0].clone());
        }
      }
    }
  }
  
  if let Ok(cursor) = window.cursor_position() {
    if let Ok(Some(m)) = window.monitor_from_point(cursor.x, cursor.y) {
      return Ok(m);
    }
  }
  window.primary_monitor()?.ok_or_else(|| "no monitor found".into())
}

/// Toggle the panel. Safe to call from ANY thread — the tray and global-shortcut
/// callbacks run OFF the GTK main thread on Linux/X11, and GTK/X11 window ops
/// (show/hide/set_position/set_focus/monitor queries) intermittently no-op when
/// called off-thread. So all work is dispatched onto the main thread, and
/// ToggleState.visible is updated inside that closure.
///
/// Note that on Linux the window ops are only QUEUED onto the GTK main loop, so
/// a successful return does not mean the window has actually mapped — see the
/// ordering comment in the SHOW path.
fn toggle_window(window: &tauri::WebviewWindow, hint: Option<PhysicalPosition<f64>>) {
  // WebviewWindow is Clone (Arc-backed) — cheap. Move the clone into the closure
  // so it satisfies the Send + 'static bound of run_on_main_thread.
  let window = window.clone();
  let app = window.app_handle().clone();

  if let Err(e) = app.run_on_main_thread(move || {
    // --- everything below runs on the GTK main thread ---
    let state = window.app_handle().state::<ToggleState>();

    // HIDE path
    if state.visible.load(Ordering::SeqCst) {
      match window.hide() {
        Ok(()) => state.visible.store(false, Ordering::SeqCst),
        Err(e) => eprintln!("toggle_window: hide failed: {e}"),
      }
      return;
    }

    // SHOW path
    let monitor = match resolve_monitor(&window, hint) {
      Ok(m) => m,
      Err(e) => {
        eprintln!("toggle_window: resolve_monitor failed: {e}");
        return;
      }
    };
    let scale = monitor.scale_factor();
    let area = monitor.work_area(); // excludes KDE top + bottom panels

    // Convert the work area to logical units (correct on HiDPI/fractional scale).
    let area_x = area.position.x as f64 / scale;
    let area_y = area.position.y as f64 / scale;
    let area_w = area.size.width as f64 / scale;
    let area_h = area.size.height as f64 / scale;

    // 1/3 width, right-aligned; full work-area height (fills top-panel..taskbar gap).
    let win_w = area_w / 3.0;
    let win_h = area_h;
    let x = area_x + area_w - win_w;
    let y = area_y;

    // On Linux every tao window op is a message queued onto the GTK main loop
    // (tao linux/window.rs: set_visible/set_inner_size/set_outer_position only
    // `send` a WindowRequest), drained on a LATER loop iteration. Ok() therefore
    // means "queued", not "applied". Two consequences drive the order here:
    //
    //  1. Show FIRST. An unrealized window has no X window, so move_/resize land
    //     on nothing and the WM assigns geometry at map time. Requests drain in
    //     send order, so queueing show -> size -> position realizes the window
    //     before the geometry ops run against it.
    //  2. Focus and always_on_top must wait for a LATER iteration (see below).
    if let Err(e) = window.show() {
      // Leave state.visible == false so the next press retries the show.
      eprintln!("toggle_window: show failed: {e}");
      return;
    }

    if let Err(e) =
      window.set_size(tauri::Size::Logical(LogicalSize { width: win_w, height: win_h }))
    {
      eprintln!("toggle_window: set_size failed: {e}");
    }
    if let Err(e) = window.set_position(tauri::Position::Logical(LogicalPosition { x, y })) {
      eprintln!("toggle_window: set_position failed: {e}");
    }

    state.visible.store(true, Ordering::SeqCst);

    // tao's set_focus() early-returns unless the widget is ALREADY visible, and
    // the show() above has only been queued — so calling it here would silently
    // drop the request every time. always_on_top is lost across hide()+show() on
    // X11 for the same reason (tauri #13530). A second dispatch runs after GTK
    // has drained the Visible request and actually mapped the window.
    let window2 = window.clone();
    if let Err(e) = window.app_handle().run_on_main_thread(move || {
      if let Err(e) = window2.set_always_on_top(true) {
        eprintln!("toggle_window: set_always_on_top failed: {e}");
      }
      if let Err(e) = window2.set_focus() {
        eprintln!("toggle_window: set_focus failed: {e}");
      }
    }) {
      eprintln!("toggle_window: deferred focus dispatch failed: {e}");
    }
  }) {
    eprintln!("toggle_window: run_on_main_thread dispatch failed: {e}");
  }
}

#[tauri::command]
fn get_monitors(window: tauri::WebviewWindow) -> Result<Vec<MonitorInfo>, String> {
  let monitors = window.available_monitors().map_err(|e| e.to_string())?;
  let primary = window.primary_monitor().map_err(|e| e.to_string())?;
  
  let monitor_infos: Vec<MonitorInfo> = monitors
    .into_iter()
    .map(|m| {
      let is_primary = primary
        .as_ref()
        .map(|p| p.name() == m.name())
        .unwrap_or(false);
      
      MonitorInfo {
        name: m.name().map(|s| s.to_string()),
        is_primary,
        position: (m.position().x, m.position().y),
        size: (m.size().width, m.size().height),
        scale_factor: m.scale_factor(),
      }
    })
    .collect();
  
  Ok(monitor_infos)
}

#[tauri::command]
fn set_preferred_monitor(app: tauri::AppHandle, monitor_name: Option<String>) -> Result<(), String> {
  let pref = app.state::<MonitorPreference>();
  let mut pref_guard = pref.preferred_monitor.write().map_err(|e| e.to_string())?;
  *pref_guard = monitor_name;
  Ok(())
}

#[tauri::command]
fn get_preferred_monitor(app: tauri::AppHandle) -> Result<Option<String>, String> {
  let pref = app.state::<MonitorPreference>();
  let pref_guard = pref.preferred_monitor.read().map_err(|e| e.to_string())?;
  Ok(pref_guard.clone())
}