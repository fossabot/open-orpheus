#![deny(clippy::all)]

use napi::{
    Env, Result, Unknown,
    bindgen_prelude::{Array, FnArgs, Function},
};
use napi_derive::napi;

use crate::linux::{
    capture_next_window_first_cursor_enter as capture_next_window_first_cursor_enter_impl,
    get_last_created_window_id as get_last_created_window_id_impl,
    set_input_region as set_input_region_impl,
};

#[cfg(windows)]
pub mod windows;

#[cfg(target_os = "linux")]
pub mod linux;

#[cfg(target_os = "macos")]
pub mod macos;

#[napi]
pub enum DesktopEnvironment {
    Wayland,
    X11,
    Windows,
    Darwin,
    Unknown,
}

/// Get current detected desktop environment.
///
/// Mostly for Linux to use, on Windows/macOS, returns hardcoded values.
#[napi]
pub fn get_desktop_environment() -> DesktopEnvironment {
    if cfg!(target_os = "macos") {
        DesktopEnvironment::Darwin
    } else if cfg!(windows) {
        DesktopEnvironment::Windows
    } else if cfg!(target_os = "linux") {
        use crate::linux::{is_wayland, is_x11};
        if is_wayland() {
            DesktopEnvironment::Wayland
        } else if is_x11() {
            DesktopEnvironment::X11
        } else {
            DesktopEnvironment::Unknown
        }
    } else {
        DesktopEnvironment::Unknown
    }
}

// region: Linux methods

/// Get the last created window's ID that represents it.
///
/// Only for Linux.
#[napi]
pub fn get_last_created_window_id() -> Option<String> {
    if cfg!(target_os = "linux") {
        get_last_created_window_id_impl()
    } else {
        None
    }
}

/// Set regions that the window is used to receive inputs.
///
/// Only for Linux.
#[napi]
pub fn set_input_region(
    #[napi(ts_arg_type = "string | Buffer")] window_handle: Unknown,
    #[napi(ts_arg_type = "{ x: number, y: number, w: number, h: number }[] | null")] rects: Option<
        Array,
    >,
) -> Result<bool> {
    if cfg!(target_os = "linux") {
        set_input_region_impl(window_handle, rects)
    } else {
        Ok(false)
    }
}

/// Listen for first CursorEnter event of the next created window.
///
/// Only for Wayland on Linux.
#[napi]
pub fn capture_next_window_first_cursor_enter(
    env: Env,
    #[napi(ts_arg_type = "(x: number, y: number) => void")] callback: Function<
        FnArgs<(i32, i32)>,
        (),
    >,
) -> Result<()> {
    if cfg!(target_os = "linux") {
        capture_next_window_first_cursor_enter_impl(env, callback)
    } else {
        env.throw("Only supports Linux")
    }
}

// endregion
