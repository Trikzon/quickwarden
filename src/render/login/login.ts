import '../common.scss';
import './login.scss';

const clientIdInput = document.getElementById("client-id") as HTMLInputElement;
const clientSecretInput = document.getElementById("client-secret") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;

const rememberApiKeyCheckbox = document.getElementById("remember-api-key") as HTMLInputElement;

const loginButton = document.getElementById("login") as HTMLButtonElement;

if (window.localStorage.getItem("client_id") !== null && window.localStorage.getItem("client_secret") !== null) {
    clientIdInput.value = window.localStorage.getItem("client_id") as string;
    clientSecretInput.value = window.localStorage.getItem("client_secret") as string;
    rememberApiKeyCheckbox.checked = true;

    passwordInput.focus();
} else {
    clientIdInput.focus();
}

function login() {
    window.ipc.loginWithApi(clientIdInput.value, clientSecretInput.value, passwordInput.value).catch((error: string) => {
        loginButton.disabled = false;
        clientIdInput.disabled = false;
        clientSecretInput.disabled = false;
        passwordInput.disabled = false;
    }).then((sessionKey: string | void) => {
        if (sessionKey) {
            if (rememberApiKeyCheckbox.checked) {
                window.localStorage.setItem("client_id", clientIdInput.value);
                window.localStorage.setItem("client_secret", clientSecretInput.value);
            } else {
                window.localStorage.removeItem("client_id");
                window.localStorage.removeItem("client_secret");
            }
            window.ipc.openSearch(sessionKey);
        }
    });
    loginButton.disabled = true;
    clientIdInput.disabled = true;
    clientSecretInput.disabled = true;
    passwordInput.disabled = true;
}

loginButton.addEventListener("click", () => { login(); });

for (const element of document.getElementsByClassName("credential-input")) {
    element.addEventListener("input", () => {
        loginButton.disabled = clientIdInput.value === "" || clientSecretInput.value === "" || passwordInput.value === "";
    });
    element.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter" && !loginButton.disabled) {
            login();
        }
    });
}
