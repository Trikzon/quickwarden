import { contextBridge, ipcRenderer } from 'electron'
import { BitwardenItem } from '../external/bitwarden'

declare global {
    interface Window {
        ipc: {
            loginWithApi(clientId: string, clientSecret: string, masterPassword: string): Promise<string | string>;
            openSearch(sessionKey: string): void;
            listItems(): Promise<Array<BitwardenItem> | string>;
            writeToClipboard(text: string): void;
        }
    }
}

contextBridge.exposeInMainWorld("ipc", {
    async loginWithApi(clientId: string, clientSecret: string, masterPassword: string): Promise<string | string> {
        return invoke("loginWithApi", clientId, clientSecret, masterPassword);
    },
    openSearch(sessionKey: string) {
        ipcRenderer.send("openSearch", sessionKey);
    },
    async listItems(): Promise<Array<BitwardenItem> | string> {
        return invoke("listItems");
    },
    writeToClipboard(text: string) {
        ipcRenderer.send("writeToClipboard", text);
    }
});

// Undo the stupid extra fluff that the IPC module adds to the error message
async function invoke(channel: string, ...args: any[]): Promise<any> {
    return ipcRenderer.invoke(channel, ...args).catch((error: any) => {
        const needle = `Error invoking remote method '${channel}':`;
        if (error?.message?.toString?.().startsWith(needle)) {
            return Promise.reject(error.message.toString().substring(needle.length).trim());
        }
        return Promise.reject(error);
    });
}
