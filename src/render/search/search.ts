import { BitwardenItemElement } from "./elements/BitwardenItemElement";
import { BitwardenItem } from "../../external/bitwarden";

import "../common.scss";
import "./search.scss";

const searchInput = document.getElementById("search") as HTMLInputElement;
const clearSearchButton = document.getElementById("clear-search");
const contentDiv = document.getElementById("content") as HTMLDivElement;
const noResultsDiv = document.getElementById("no-results") as HTMLDivElement;
const usernameInteractionDiv = document.getElementById("username-interaction") as HTMLDivElement;
const passwordInteractionDiv = document.getElementById("password-interaction") as HTMLDivElement;
const totpInteractionDiv = document.getElementById("totp-interaction") as HTMLDivElement;

const itemElements: Array<BitwardenItemElement> = [];
let selectedIndex = 0;

searchInput.focus();
search("");

searchInput.addEventListener("input", () => {
    if (searchInput.value === "") {
        clearSearchButton.classList.add("hidden");
    } else {
        clearSearchButton.classList.remove("hidden");
    }
    search(searchInput.value);
});
searchInput.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
    }
});
clearSearchButton.addEventListener("click", () => {
    clearSearchButton.classList.add("hidden");
    searchInput.value = "";
    search("");
    searchInput.focus();
});
searchInput.addEventListener("focusout", () => { searchInput.focus(); });

if (navigator.userAgent.includes("Macintosh")) {
    for (const element of document.getElementsByClassName("ctrl")) {
        element.textContent = "⌘";
    }
    for (const element of document.getElementsByClassName("alt")) {
        element.textContent = "⌥";
    }
}

function select(index: number) {
    if (index >= 0 && index < itemElements.length) {
        itemElements[selectedIndex].deselect();
        selectedIndex = index;
        itemElements[selectedIndex].select();

        for (const element of document.getElementsByClassName("interaction")) {
            element.classList.remove("enabled");
        }

        if (itemElements[selectedIndex].hasUsername()) {
            usernameInteractionDiv.classList.add("enabled");
        }
        if (itemElements[selectedIndex].hasPassword()) {
            passwordInteractionDiv.classList.add("enabled");
        }
        if (itemElements[selectedIndex].hasTotp()) {
            totpInteractionDiv.classList.add("enabled");
        }
    }
}

function copyUsername() {
    if (selectedIndex >= 0 && selectedIndex < itemElements.length) {
        const item = itemElements[selectedIndex];
        if (item.hasUsername()) {
            window.ipc.writeToClipboard(item.getItem().login.username);
            window.close();
        }
    }
}

function copyPassword() {
    if (selectedIndex >= 0 && selectedIndex < itemElements.length) {
        const item = itemElements[selectedIndex];
        if (item.hasPassword()) {
            window.ipc.writeToClipboard(item.getItem().login.password);
            window.close();
        }
    }
}

function copyTotp() {
    if (selectedIndex >= 0 && selectedIndex < itemElements.length) {
        const item = itemElements[selectedIndex];
        if (item.hasTotp()) {
            window.ipc.writeToClipboard(item.getItem().login.totp);
            window.close();
        }
    }
}

usernameInteractionDiv.addEventListener("click", copyUsername);
passwordInteractionDiv.addEventListener("click", copyPassword);
totpInteractionDiv.addEventListener("click", copyTotp);

window.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") {
        window.close();
    } else if (event.key === "ArrowDown") {
        if (selectedIndex < itemElements.length - 1) {
            select(selectedIndex + 1);
        }
    } else if (event.key === "ArrowUp") {
        if (selectedIndex > 0) {
            select(selectedIndex - 1);
        }
    } else if (event.key === 'c' && event.shiftKey && ctrlOrMeta(event)) {
        copyPassword();
    } else if (event.key === 'c' && event.altKey && ctrlOrMeta(event)) {
        copyTotp();
    } else if (event.key === 'c' && ctrlOrMeta(event)) {
        copyUsername();
    }
});

function ctrlOrMeta(event: KeyboardEvent): boolean {
    return navigator.userAgent.includes("Macintosh") ? event.metaKey : event.ctrlKey;
}

async function searchItems(query: string): Promise<Array<BitwardenItem>> {
    return window.ipc.listItems().catch((error: string) => {
        console.log(error);
        return [];
    }).then((items: Array<BitwardenItem>) => {
        const results: Array<BitwardenItem> = [];

        query = query.toLowerCase();

        if (items && items.length > 0) {
            for (const item of items) {
                if (!item.login) { continue; }

                if (item.name.toLowerCase().includes(query)) {
                    results.push(item);
                } else if (item.login?.username?.toLowerCase().includes(query)) {
                    results.push(item);
                } else if (item.login?.uris && item.login.uris.length > 0) {
                    for (const uri of item.login.uris) {
                        if (uri.uri.toLowerCase().includes(query)) {
                            results.push(item);
                            break;
                        }
                    }
                }
            }
        }
        return results;
    });
}

function search(query: string) {
    searchItems(query).then((items: Array<BitwardenItem>) => {
        if (searchInput.value !== query) { return; }

        itemElements.length = 0;
        contentDiv.replaceChildren();

        if (items.length === 0) {
            contentDiv.classList.add("hidden");
            noResultsDiv.classList.remove("hidden");
        } else {
            contentDiv.classList.remove("hidden");
            noResultsDiv.classList.add("hidden");

            for (const item of items) {
                const element = new BitwardenItemElement(item);
                itemElements.push(element);
                contentDiv.appendChild(element.getElement());

                element.getElement().addEventListener("click", () => {
                    select(itemElements.indexOf(element));
                });
            }
        }

        select(0);
    });
}
