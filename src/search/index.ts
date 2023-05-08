import { BitwardenItem } from '../daemon/bitwarden';
import '../common.css';
import './index.css';

const clearSearchButton = document.getElementById('clear-search');
const searchInput = document.getElementById('search') as HTMLInputElement;

const resultsDiv = document.getElementById('results') as HTMLDivElement;
searchInput.focus();

function search(query: string) {
    window.bitwarden.search(query).then((results) => {
        if (searchInput.value !== results[1]) {
            return;
        }
        resultsDiv.replaceChildren();
        for (const item of results[0]) {
            if (item.login === undefined) { continue; }
            if (item.name === undefined) { continue; }

            const containerDiv = document.createElement('div');
            containerDiv.classList.add('container');
            resultsDiv.appendChild(containerDiv);

            const spacer = document.createElement('div');
            spacer.classList.add('spacer');
            containerDiv.appendChild(spacer);

            const resultDiv = document.createElement('div');
            resultDiv.classList.add('result');
            containerDiv.appendChild(resultDiv);

            const uri = new URL(item.login.uris?.[0]?.uri || 'https://example.com');
            const icon = document.createElement('img');
            icon.src = `https://icons.bitwarden.net/${uri.host}/icon.png`;
            resultDiv.appendChild(icon);

            const info = document.createElement('span');
            info.classList.add('info');
            resultDiv.appendChild(info);

            const name = document.createElement('span');
            name.classList.add('name');
            name.textContent = item.name;
            info.appendChild(name);

            const username = document.createElement('span');
            username.classList.add('username');
            username.textContent = item.login.username || '';
            info.appendChild(username);
        }
        document.getElementsByClassName('container')[0]?.classList.add('selected');
    });
}

clearSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    search('');
    searchInput.focus();
});

searchInput.addEventListener('input', () => {
    if (searchInput.value === '') {
        clearSearchButton.classList.add('hidden');
    } else {
        clearSearchButton.classList.remove('hidden');
    }
    search(searchInput.value);
});

window.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
        window.close();
    }
    searchInput.focus();
});

if (navigator.userAgent.includes('Macintosh')) {
    for (const element of document.getElementsByClassName('ctrl')) {
        element.textContent = '⌘';
    }
}

search('');
