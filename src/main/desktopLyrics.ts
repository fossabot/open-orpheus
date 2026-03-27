import { join } from "node:path";

import {
  createOsrBrowserWindow,
  type OsrBrowserWindowHandle,
} from "./osrWindow";

let handle: OsrBrowserWindowHandle | null = null;

export default async function createDesktopLyricsWindow() {
  handle = await createOsrBrowserWindow({
    width: 1000,
    height: 300,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    show: false,
    webPreferences: {
      partition: "open-orpheus",
      preload: join(__dirname, "desktop-lyrics.js"),
    },
  });

  if (GUI_VITE_DEV_SERVER_URL) {
    handle.browserWindow.loadURL(`${GUI_VITE_DEV_SERVER_URL}/desktop-lyrics`);
  } else {
    handle.browserWindow.loadFile(join(__dirname, "gui/desktop-lyrics.html"));
  }

  handle.browserWindow.webContents.ipc.on("drag-window", () => {
    handle?.osrWindow.drag();
  });

  handle.browserWindow.webContents.openDevTools();
}

export function getDesktopLyricsHandle(): OsrBrowserWindowHandle | null {
  return handle;
}
