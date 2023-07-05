import { app } from 'electron';
import { logout } from '../external/bitwarden';
import { openLoginOrSearch } from './window';
import { initShortcuts } from './shortcuts';
import { initIpc } from './ipc';

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
});

// Prevent main process from quitting when all windows are closed.
app.on('window-all-closed', () => {});

// Logout of Bitwarden CLI when main process quits.
app.on('will-quit', logout);
