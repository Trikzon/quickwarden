import { contextBridge, ipcRenderer } from "electron";
import { BitwardenItem } from "./daemon/bitwarden";

declare global {
    interface Window {
        bitwarden: {
            loginWithApi: (clientId: string, clientSecret: string, masterPassword: string) => Promise<boolean>;
            search: (query: string) => Promise<[Array<BitwardenItem>, string]>;
        }
    }
}

contextBridge.exposeInMainWorld("bitwarden", {
    async loginWithApi(clientId: string, clientSecret: string, masterPassword: string): Promise<boolean> {
        return ipcRenderer.invoke("loginWithApi", clientId, clientSecret, masterPassword);
    },
    async search(query: string): Promise<[Array<BitwardenItem>, string]> {
        const response = await ipcRenderer.invoke("search", query);
        return [JSON.parse(response), query];
    }
});
