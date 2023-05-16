import { BitwardenItem } from "../../../external/bitwarden";

export class BitwardenItemElement {
    private element: HTMLElement;
    private item: BitwardenItem;

    constructor(item: BitwardenItem) {
        this.item = item;

        this.element = document.createElement("div");
        this.element.classList.add("bitwarden-item");

        const flag = document.createElement("div");
        flag.classList.add("flag");
        this.element.appendChild(flag);

        const container = document.createElement("div");
        container.classList.add("container");
        this.element.appendChild(container);

        const uri = new URL(item.login?.uris?.[0]?.uri || "https://example.com");
        const icon = document.createElement("img");
        icon.src = `https://icons.bitwarden.net/${uri.host}/icon.png`;
        container.appendChild(icon);

        const info = document.createElement("div");
        info.classList.add("info");
        container.appendChild(info);

        const name = document.createElement("div");
        name.classList.add("name");
        name.textContent = item.name;
        info.appendChild(name);

        const username = document.createElement("div");
        username.classList.add("username");
        username.textContent = item.login?.username || "";
        info.appendChild(username);
    }

    public select() {
        this.element.classList.add("selected");
        this.element.scrollIntoView({ block: "nearest" })
    }

    public deselect() {
        this.element.classList.remove("selected");
    }

    public hasUsername(): boolean {
        return !!this.item.login?.username;
    }

    public hasPassword(): boolean {
        return !!this.item.login?.password;
    }

    public hasTotp(): boolean {
        return !!this.item.login?.totp;
    }

    public getElement(): HTMLElement {
        return this.element;
    }

    public getItem(): BitwardenItem {
        return this.item;
    }
}
