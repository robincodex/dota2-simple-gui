import { vscode, request, onRequestResponse } from './utils';

const Editor = document.getElementById('editor');

function Init() {
    window.addEventListener('message', (ev) => {
        const evData = ev.data;
        switch (evData.label) {
            case 'update':
                UpdateView(evData.text);
                return;
            default:
                onRequestResponse(evData);
                return;
        }
    });

    const state = vscode.getState();
    if (state && state.text) {
        UpdateView(state.text);
    }
}

type updateInfo = {
    Maps: {
        Map: string,
        MaxPlayers: number,
    }[],
    MapsList: string[],
    Options: {[key: string]: boolean},
    Keyboard: {
        Index: string,
        Key: string,
        Command: string,
        Name: string,
    }[],
};

function UpdateView(text: string) {
    vscode.setState({text});

    let html = '';
    let info: updateInfo = JSON.parse(text);
    html += renderMaps(info);
    html += renderOptions(info);
    html += renderKeyboard(info);
    Editor.innerHTML = html;

    const MapsGroup = Editor.querySelector("#maps-group");
    MapsGroup.addEventListener('change', (ev) => {
        ev.stopPropagation();
        const target = ev.target;
        if (target instanceof HTMLSelectElement) {
            // Change MaxPlayers
            if (target.classList.contains('max-players-select')) {
                const name = target.getAttribute("name");
                if (name) {
                    request('change-map-max-players', name, parseInt(target.value));
                }
            }
        }
    });
    MapsGroup.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const target = ev.target;
        if (target instanceof HTMLDivElement) {
            // Add a map to value of maps
            if (target.classList.contains("add-map")) {
                if (target.previousElementSibling instanceof HTMLSelectElement) {
                    const value = target.previousElementSibling.value;
                    request('add-map', value);
                }
            }
            // Remove a map
            if (target.classList.contains("remove-map")) {
                const name = target.getAttribute("name");
                if (name) {
                    request('remove-map', name);
                }
            }
        }
    });

    // Toggle options
    const OptionsGroup = Editor.querySelector("#options-group");
    OptionsGroup.addEventListener('change', (ev) => {
        ev.stopPropagation();
        const target = ev.target;
        if (target instanceof HTMLInputElement) {
            request('toggle-option', target.id);
        }
    });

    // Keyboard
    const KeyboardGroup = Editor.querySelector<HTMLElement>("#keyboard-group");
    KeyboardGroup.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const target = ev.target;
        if (target instanceof HTMLDivElement) {
            // Remove a key
            if (target.classList.contains("remove")) {
                const index = target.getAttribute("index");
                if (index) {
                    request('keyboard-remove', index);
                }
            }
            // Edit
            if (target.classList.contains("edit")) {
                target.parentElement.parentElement.classList.add("editing");
            }
            // Complete edit
            if (target.classList.contains("submit")) {
                const index = target.getAttribute("index");
                if (!index) {
                    return;
                }
                let root = target.parentElement.parentElement as HTMLElement;
                let keyInput = root.querySelector<HTMLInputElement>('input.key');
                let commandInput = root.querySelector<HTMLInputElement>('input.command');
                if (!keyInput.value || !commandInput.value) {
                    return;
                }
                let nameInput = root.querySelector<HTMLInputElement>('input.name');
                request('keyboard-modify', index, keyInput.value, commandInput.value, nameInput.value);
            }
            // Add a new key
            if (target.classList.contains("add-key")) {
                let root = target.parentElement.parentElement as HTMLElement;
                let keyInput = root.querySelector<HTMLInputElement>('input.key');
                for(const data of info.Keyboard) {
                    if (data.Key === keyInput.value) {
                        return;
                    }
                }
                let commandInput = root.querySelector<HTMLInputElement>('input.command');
                if (!keyInput.value || !commandInput.value) {
                    return;
                }
                let nameInput = root.querySelector<HTMLInputElement>('input.name');
                request('keyboard-add-key', keyInput.value, commandInput.value, nameInput.value);
            }
        }
    });
    KeyboardGroup.addEventListener('keydown', (ev: KeyboardEvent) => {
        ev.stopPropagation();
        const target = ev.target;
        if (target instanceof HTMLInputElement) {
            if (target.classList.contains('key')) {
                ev.preventDefault();
                switch (ev.key.toUpperCase()) {
                    case "ARROWUP":
                    case "ARROWDOWN":
                    case "ARROWLEFT":
                    case "ARROWRIGHT":
                        target.value = ev.key.toUpperCase().replace("ARROW",'');
                        break;
                    case ' ':
                        target.value = 'SPACE';
                        break;
                    default:
                        target.value = ev.key.toUpperCase();
                        break;
                }
            }
        }
    });
}

// Render maps from infp["Maps"]
function renderMaps(info: updateInfo): string {

    // create table body for map info
    let mapTableBody = '';
    for(const mapInfo of info.Maps) {
        let maxPlayersOptions = '';
        for (let i = 0; i <= 24; i++) {
            maxPlayersOptions += `<option value="${i}" ${mapInfo.MaxPlayers===i?'selected':''}>
                ${i}</option>`;
        }

        mapTableBody += `
        <tr>
            <td>${mapInfo.Map}</td>
            <td>
                <select class="max-players-select" name="${mapInfo.Map}">
                    ${maxPlayersOptions}
                </select>
            </td>
            <td>
                <div class="btn remove-map" name="${mapInfo.Map}">❌</div>
            </td>
        </tr>
        `;
    }

    // create maps list
    let mapsListOptions = '';
    for(const map of info.MapsList) {
        if (info.Maps.findIndex((v) => v.Map === map) < 0) {
            mapsListOptions += `<option value="${map}" >${map}</option>`;
        }
    }

    return `
    <div id="maps-group">
        <div class="group-title">Maps</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Map</th>
                    <th>MaxPlayers</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${mapTableBody}
            </tbody>
        </table>
        <div>
            <select class="maps-select" >
                ${mapsListOptions}
            </select>
            <div class="btn add-map">➕</div>
        </div>
    </div>
    `;
}

// Render options from infp["Options"]
function renderOptions(info: updateInfo): string {
    const list = [
        'IsPlayable',
        'CheckAFKPlayers',
        'PenaltiesEnabled',
        'HeroGuidesSupported',
        'ForceDefaultGuide',
        'EnablePickRules',
        'EventGame',
    ];

    // create options from list
    let html = '';
    for(const id of list) {
        html += `
        <div class="options-item">
            <input type="checkbox" id="${id}" ${info.Options[id]?'checked':''} />
            <label for="${id}">${id}</label>
        </div>
        `;
    }

    return `
    <div id="options-group">
        <div class="group-title">Options</div>
        <div>
            ${html}
        </div>
    </div>
    `;
}


function renderKeyboard(info: updateInfo): string {
    let html = '';

    for(const data of info.Keyboard) {
        html += `
        <tr class="keyboard-row">
            <td>
                <span class="text">${data.Key}</span>
                <input type="text" class="key" value="${data.Key}" />
            </td>
            <td>
                <span class="text">${data.Command}</span>
                <input type="text" class="command" value="${data.Command}" />
            </td>
            <td>
                <span class="text">${data.Name}</span>
                <input type="text" class="name" value="${data.Name}" />
            </td>
            <td>
                <div class="btn edit">✏️</div>
                <div class="btn remove" index="${data.Index}">❌</div>
                <div class="btn submit" index="${data.Index}">✔️</div>
            </td>
        </tr>
        `;
    }

    return `
    <div id="keyboard-group">
        <div class="group-title">Keyboard</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Key</th>
                    <th>Command</th>
                    <th>Name</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${html}
                <tr>
                    <td>
                        <input type="text" class="key" />
                    </td>
                    <td>
                        <input type="text" class="command" />
                    </td>
                    <td>
                        <input type="text" class="name" />
                    </td>
                    <td>
                        <div class="btn add-key">➕</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `;
}

window.onload = Init;