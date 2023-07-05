import { exec, ExecException } from 'child_process';
import { BitwardenItem } from './BitwardenItem';

let cachedItems: Array<BitwardenItem> | null = null;

/**
 * Logs in and unlocks the Bitwarden CLI using the API key.
 * 
 * @param clientId The client ID.
 * @param clientSecret The client secret.
 * @param password The master password.
 * @returns The session key.
 * @throws An error message if the client ID, client secret, or master password is invalid.
 */
export async function loginWithApi(clientId: string, clientSecret: string, password: string): Promise<string | string> {
    await logout();
    await bwPre(`BW_CLIENTID=${clientId} BW_CLIENTSECRET=${clientSecret}`, "login --apikey").catch((error: ExecException | string | null) => {
        if (error && typeof error !== "string" && error.code && error.code === 127) {
            return Promise.reject("Bitwarden CLI is not installed.");
        }
        return Promise.reject("Client ID or client secret is invalid. Try again.");
    });
    return await bwPre(`BW_PASSWORD=${password}`, "unlock --raw --passwordenv BW_PASSWORD").catch((_error) => {
        return Promise.reject("Master password is invalid. Try again.");
    });
}

/**
 * Logs out of the Bitwarden CLI.
 */
export async function logout() {
    await bw("logout").catch((_error) => { });  // Ignore error if not logged in.
}

/**
 * Gets the list of items from the Bitwarden CLI.
 * 
 * @param sessionKey The session key.
 * @returns The list of items.
 * @throws An error message if the session key is invalid.
 */
export async function listItems(sessionKey: string, invalidateCache: boolean = false): Promise<Array<BitwardenItem> | string> {
    if (cachedItems && !invalidateCache) {
        return cachedItems;
    }

    const itemsJson = await bw(`list items --session ${sessionKey}`).catch((_error) => {
        return Promise.reject("Session key is invalid.");
    });

    try {
        const items = JSON.parse(itemsJson);
        if (items && items.length > 0) {
            cachedItems = items;
        }
        return items;
    } catch (error) {
        return Promise.reject("Session key is invalid.");
    }
}

/**
 * Syncs the Bitwarden CLI and gets the updated list of items from the Bitwarden CLI.
 * 
 * @param sessionKey The session key.
 * @returns The list of items.
 * @throws An error message if the session key is invalid.
 */
export async function sync(sessionKey: string): Promise<Array<BitwardenItem> | string> {
    await bw("sync").catch((_error) => { });
    return listItems(sessionKey, true);
}

async function bw(command: string): Promise<string> {
    return bwPre("", command);
}

async function bwPre(preCommand: string, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(
            `${preCommand} bw ${command}`.trim(),
            { timeout: 10000 },
            (error: ExecException | null, stdout: string, stderr: string) => {
                if (error) { reject(error); }
                if (stderr) { reject(stderr.trim()); }
                resolve(stdout.trim());
            }
        );
    });
}
