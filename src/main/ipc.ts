import { clipboard, ipcMain } from 'electron';
import { listItems, loginWithApi } from '../external/bitwarden';
import { openSearch } from './window';
import { getSessionKey } from './session';

export function initIpc() {
    ipcMain.on("openSearch", (_event, sessionKey: string) => {
        openSearch(sessionKey);
    });
    ipcMain.handle("loginWithApi", async (_event, clientId: string, clientSecret: string, masterPassword: string) => {
        return loginWithApi(clientId, clientSecret, masterPassword);
    });
    ipcMain.handle("listItems", async (_event) => {
        return listItems(getSessionKey());
    });
    ipcMain.on("writeToClipboard", (_event, text: string) => {
        clipboard.writeText(text);
    });
}
