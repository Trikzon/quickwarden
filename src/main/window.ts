import { BrowserWindow, BrowserWindowConstructorOptions, shell } from 'electron';
import { getSessionKey, setSessionKey } from './session';

declare const RENDER_PRELOAD_WEBPACK_ENTRY: string;
declare const LOGIN_WEBPACK_ENTRY: string;
declare const SEARCH_WEBPACK_ENTRY: string;

let window: BrowserWindow | null = null;

export function openLoginOrSearch() {
    if (getSessionKey() === null) {
        openLogin();
    } else {
        openSearch();
    }
}

export function openLogin() {
    setSessionKey(null);
    if (isWindowOpen()) {
        window?.focus();
    } else {
        if (openWindow({
            width: 800,
            height: 600,
            titleBarStyle: "hiddenInset"
        })) {
            window.once("ready-to-show", () => {
                window?.show();
            });
        }
        window.loadURL(LOGIN_WEBPACK_ENTRY);
    }
}

export function openSearch(sessionKey: string = null) {
    if (sessionKey) {
        setSessionKey(sessionKey);
    }
    
    // If the window is open, always close it before opening the search page.
    // However, if the search page is already open, don't re-open it.
    if (isWindowOpen()) {
        const url = window.webContents.getURL();
        window.close();
        if (url === SEARCH_WEBPACK_ENTRY) {
            return;
        }
    }

    if (openWindow({
        width: 600,
        height: 300,
        movable: false,
        minimizable: false,
        // TODO: See if setting the window type to "toolbar" works on Windows and Linux.
        type: process.platform === "darwin" ? "panel" : "normal",
        alwaysOnTop: true,
    })) {
        window.once("ready-to-show", () => {
            window?.showInactive();
        });
        window.on("blur", () => {
            window.close();
        });
    }
    window.loadURL(SEARCH_WEBPACK_ENTRY);
}

function openWindow(options: BrowserWindowConstructorOptions): boolean {
    window = new BrowserWindow({
        center: true,
        resizable: false,
        maximizable: false,
        fullscreenable: false,
        title: "Quickwarden",
        icon: process.platform !== "darwin" && process.platform !== "win32" ? "/src/assets/icons/icon-512x512.png" : undefined,
        show: false,
        frame: false,
        webPreferences: {
            preload: RENDER_PRELOAD_WEBPACK_ENTRY
        },
        ...options
    });

    window.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });

    window.on("show", () => {
        window?.focus();
    });

    return true;
}

function isWindowOpen(): boolean {
    return window !== null && !window.isDestroyed();
}
