// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    std::env::set_var("__NV_DISABLE_EXPLICIT_SYNC", "1");
    app_lib::run();
}
