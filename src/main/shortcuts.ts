import { globalShortcut } from "electron";
import { openLoginOrSearch } from "./window";

export function initShortcuts() {
    globalShortcut.register("CommandOrControl+Shift+Space", () => {
        openLoginOrSearch();
    });
}