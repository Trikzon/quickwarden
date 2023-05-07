import { exec, ExecException } from 'child_process';

export class Bitwarden {
    private sessionKey: string | undefined;

    public async loginWithApi(clientId: string, clientSecret: string, masterPassword: string): Promise<boolean> {
        await this.logout();
        await this.executeBitwardenCommandWithPre(
            `BW_CLIENTID=${clientId} BW_CLIENTSECRET=${clientSecret}`,
            "login --apikey"
        );
        const response = await this.executeBitwardenCommand("login --check");
        if (response.trim() === 'You are logged in!') {
            const response = await this.executeBitwardenCommandWithPre(
                `BW_PASSWORD=${masterPassword}`,
                "unlock --raw --passwordenv BW_PASSWORD"
            );
            if (response.trim() !== "Invalid master password.") {
                this.sessionKey = response.trim();
            }
        }
        console.log("Session key: " + this.sessionKey);
        return this.sessionKey !== undefined;
    }

    public async isLoggedIn(): Promise<boolean> {
        const response = await this.executeBitwardenCommand('login --check');
        return response.trim() === 'You are logged in!' && this.sessionKey !== undefined;
    }

    public async logout(): Promise<void> {
        await this.executeBitwardenCommand("logout").catch(() => { });
    }

    public async sync(): Promise<void> {
        await this.executeBitwardenCommand("sync");
    }

    public async search(query: string): Promise<string> {
        const response = await this.executeBitwardenCommand(`list items --search "${query}" --session ${this.sessionKey}`);
        return response.trim();
    }

    private async executeBitwardenCommand(command: string): Promise<string> {
        return this.executeBitwardenCommandWithPre('', command);
    }

    private async executeBitwardenCommandWithPre(preCommand: string, command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(
                `${preCommand} npx --no bw ${command}`.trim(),
                { timeout: 10000 },
                (error: ExecException, stdout: string, stderr: string) => {
                    if (error) { reject(error); }
                    if (stderr) { reject(stderr); }
                    resolve(stdout);
                }
            );
        });
    }
}

export interface BitwardenItem {
    favorite: boolean;
    id: string;
    login: {
        password: string;
        uris: [
            {
                uri: string;
            }
        ];
        username: string;
    };
    name: string;
}
