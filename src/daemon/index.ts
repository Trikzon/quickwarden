import { app, BrowserWindow, BrowserWindowConstructorOptions, globalShortcut, ipcMain, shell } from 'electron';
import { Bitwarden } from './bitwarden';

declare const LOGIN_POPUP_WEBPACK_ENTRY: string;
declare const LOGIN_POPUP_PRELOAD_WEBPACK_ENTRY: string;
declare const SEARCH_POPUP_WEBPACK_ENTRY: string;
declare const SEARCH_POPUP_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const POPUP_BROWSER_WINDOW_OPTIONS: BrowserWindowConstructorOptions = {
    width: 600,
    height: 300,
    useContentSize: true,
    center: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    fullscreenable: false,
    frame: false
};

const bitwarden = new Bitwarden();
let window: BrowserWindow | null = null;

function openLoginPopupWindow() {
    window = new BrowserWindow({
        webPreferences: {
            preload: LOGIN_POPUP_PRELOAD_WEBPACK_ENTRY,
        },
        ...POPUP_BROWSER_WINDOW_OPTIONS
    });
    window.loadURL(LOGIN_POPUP_WEBPACK_ENTRY);

    window.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

function openSearchPopupWindow() {
    bitwarden.isLoggedIn().then((isLoggedIn) => {
        if (!isLoggedIn) {
            openLoginPopupWindow();
            return;
        }
        bitwarden.sync();

        window = new BrowserWindow({
            webPreferences: {
                preload: SEARCH_POPUP_PRELOAD_WEBPACK_ENTRY,
            },
            ...POPUP_BROWSER_WINDOW_OPTIONS
        });
        window.loadURL(SEARCH_POPUP_WEBPACK_ENTRY);
    });
}

ipcMain.handle('loginWithApi', async (_event, clientId: string, clientSecret: string, masterPassword: string) => {
    const result = await bitwarden.loginWithApi(clientId, clientSecret, masterPassword);
    if (result) {
        window?.close();
        openSearchPopupWindow();
    }
    return result;
});

ipcMain.handle('search', async (_event, query: string) => {
    return await bitwarden.search(query);
});

app.on('ready', () => {
    globalShortcut.register('CommandOrControl+Shift+Space', () => {
        openSearchPopupWindow();
    });
});

// Prevent main process from closing when all windows are closed
app.on('window-all-closed', () => {});

// Error: Claims that executeBitwardenCommand is undefined
// app.on('will-quit', bitwarden.logout);
