import { clipboard, ipcMain } from 'electron';
import { listItems, loginWithApi } from '../external/bitwarden';
import { openSearch } from './window';
import { getLastSearch, getSessionKey, setLastSearch } from './session';

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
    ipcMain.on("setLastSearch", (_event, value: string, index: number) => {
        setLastSearch(value, index);
    });
    ipcMain.handle("getLastSearch", async (_event) => {
        return getLastSearch();
    });
}
