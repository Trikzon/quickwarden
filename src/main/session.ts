let sessionKey: string | null = null;

export function getSessionKey(): string | null {
    return sessionKey;
}

export function setSessionKey(_sessionKey: string | null) {
    sessionKey = _sessionKey;
}

let lastSearch: string | null = null;
let lastSearchIndex: number = 0
let lastSearchTimeStamp = 0;

export function getLastSearch(): [string, number] | null {
    // Only return the last search if it was performed within the last 10 seconds.
    if (Date.now() - lastSearchTimeStamp > 1000 * 10 || lastSearch === null) {
        return null;
    }
    return [lastSearch, lastSearchIndex];
}

export function setLastSearch(value: string, index: number) {
    lastSearch = value;
    lastSearchIndex = index;
    lastSearchTimeStamp = Date.now();
}
