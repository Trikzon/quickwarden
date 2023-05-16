export interface BitwardenItem {
    name: string;
    id: string;
    organizationId?: string;
    folderId?: string;
    login?: {
        username?: string;
        password?: string;
        totp?: string;
        uris?: [{ uri?: string; }];
    };
    favorite: boolean;
};
