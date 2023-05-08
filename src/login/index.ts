import './index.css';

const clientIdInput = document.getElementById('client_id') as HTMLInputElement;
const clientSecretInput = document.getElementById('client_secret') as HTMLInputElement;
const rememberApiKeyCheckbox = document.getElementById('remember_api_key') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const showPasswordCheckbox = document.getElementById('show_password') as HTMLInputElement;
const loginButton = document.getElementById('login') as HTMLButtonElement;
const invalidWarning = document.getElementById('invalid_warning') as HTMLDivElement;

showPasswordCheckbox.addEventListener('click', () => {
    passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
});

if (window.localStorage.getItem('client_id') !== null && window.localStorage.getItem('client_secret') !== null) {
    clientIdInput.value = window.localStorage.getItem('client_id') as string;
    clientSecretInput.value = window.localStorage.getItem('client_secret') as string;
    rememberApiKeyCheckbox.checked = true;

    passwordInput.focus();
} else {
    clientIdInput.focus();
}

rememberApiKeyCheckbox.addEventListener('click', () => {
    if (!rememberApiKeyCheckbox.checked) {
        window.localStorage.removeItem('client_id');
        window.localStorage.removeItem('client_secret');
    }
});

loginButton.addEventListener('click', () => {
    window.bitwarden.loginWithApi(clientIdInput.value, clientSecretInput.value, passwordInput.value).then((success) => {
        if (!success) {
            invalidWarning.classList.remove('hidden');
        } else {
            window.localStorage.setItem('client_id', clientIdInput.value);
            window.localStorage.setItem('client_secret', clientSecretInput.value);
            window.close();
        }
    }).catch((_error) => {
        invalidWarning.classList.remove('hidden');
    });
});

for (const element of document.getElementsByClassName('credential_input')) {
    element.addEventListener('input', () => {
        loginButton.disabled = clientIdInput.value === '' || clientSecretInput.value === '' || passwordInput.value === '';
        invalidWarning.classList.add('hidden');
    });
}

window.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
        window.close();
    }
});
