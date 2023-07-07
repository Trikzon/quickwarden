import { app } from 'electron';
import { sync } from '../external/bitwarden';
import { openLoginOrSearch } from './window';
import { initShortcuts } from './shortcuts';
import { initIpc } from './ipc';
import { getSessionKey, invalidateSessionKey } from './session';

if (require('electron-squirrel-startup')) {
    app.quit();
}

app.on('ready', () => {
    if (process.platform !== "win32") {
        process.env.PATH = process.env.PATH + ":/usr/local/bin:/opt/homebrew/bin";
    }
    initIpc();
    initShortcuts();

    openLoginOrSearch();

    // Sync with Bitwarden CLI every 5 minutes.
    setInterval(() => {
        const sessionKey = getSessionKey();
        if (sessionKey !== null) {
            sync(sessionKey);
        }
    }, 1000 * 60 * 5);
});

// Prevent main process from quitting when all windows are closed.
app.on('window-all-closed', () => {});

// Logout of Bitwarden CLI when main process quits.
app.on('will-quit', invalidateSessionKey);
