let sessionKey: string | null = null;

export function getSessionKey(): string | null {
    return sessionKey;
}

export function setSessionKey(_sessionKey: string | null) {
    sessionKey = _sessionKey;
}
