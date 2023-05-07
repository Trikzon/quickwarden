import { BitwardenItem } from '../daemon/bitwarden';
import './index.css';

const searchInput = document.getElementById('search') as HTMLInputElement;
const resultsDiv = document.getElementById('results') as HTMLDivElement;
searchInput.focus();

function showSearchResults(results: Array<BitwardenItem>) {
    resultsDiv.replaceChildren();
    results.slice(0, 5).forEach((item) => {
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result');

        const uri = new URL(item.login.uris[0].uri);
        const icon = document.createElement('img');
        icon.src = `https://icons.bitwarden.net/${uri.host}/icon.png`;
        resultDiv.appendChild(icon);

        const name = document.createElement('span');
        name.classList.add('name');
        name.textContent = item.name;
        resultDiv.appendChild(name);

        const username = document.createElement('span');
        username.classList.add('username');
        username.textContent = item.login.username;
        resultDiv.appendChild(username);

        resultsDiv.appendChild(resultDiv);
    });
}

searchInput.addEventListener('input', () => {
    window.bitwarden.search(searchInput.value).then((results) => {
        if (searchInput.value !== results[1]) {
            return;
        }
        showSearchResults(results[0]);
    });
});

window.bitwarden.search('').then((results) => {
    showSearchResults(results[0]);
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
        window.close();
    }
});
