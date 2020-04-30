import { vscode, request, onRequestResponse } from './utils';

const Editor = document.getElementById('editor');

const numberRegexp = /\-?\d+\.?\d*/;

let lastSuggestion: HTMLElement = null;
let soundKeys: string[] = [];

type soundType = {[key: string]: string | string[]};

const keysSuggestion: {[key: string]: string[]} = {
    "type": [
        'dota_update_default',
        'dota_limit_speakers_ui',
        'dota_src1_2d',
        'dota_src1_3d',
        'dota_src1_3d_footsteps',
        'dota_gamestart_horn',
        'dota_null_start',
        'dota_music_respawn',
        'dota_update_hero_select',
        'dota_update_killed',
        'dota_music_mainloop',
        'dota_statebattlemusic',
        'dota_battle',
        'dota_battleend',
        'dota_battlepicker',
        'dota_music_death_request',
        'dota_update_vo_switch',
    ],
    "mixgroup": [
        "Weapons",
    ],
};

async function Init() {
    window.addEventListener('message', (ev) => {
        const evData = ev.data;
        switch (evData.label) {
            case 'update':
                RenderView(JSON.parse(evData.text));
                return;
            default:
                onRequestResponse(evData);
                return;
        }
    });

    soundKeys = await request("get-sound-keys");

    Editor.addEventListener('focusin', (ev) => {
        const target = ev.target;
        if (target instanceof HTMLInputElement) {

            // Add a new key input
            if (target.classList.contains('add-sound-key')) {
                let event = target.getAttribute('event');
                if (event) {
                    event = `"${event}"`;
                    const data = vscode.getState().soundList.find((v: any) => v.event===event);
                    if (data) {
                        const list = soundKeys.filter((v) => typeof data[v] !== 'string');
                        showSuggestion(target, list, (v: string) => {
                            target.value = v;
                        });
                    }
                }
                return;
            }

            // Sound key's value input
            if (target.classList.contains('change-key-value')) {
                const key = target.getAttribute('key');
                if (key && keysSuggestion[key]) {
                    showSuggestion(target, keysSuggestion[key], (v: string) => {
                        target.value = v;
                        const changeEvent = new Event('change', ev);
                        target.dispatchEvent(changeEvent);
                    });
                }
            }

        }
    });

    Editor.addEventListener('focusout', () => {
        closeSuggestion();
    });

    const state = vscode.getState();
    if (state && state.soundList) {
        RenderView(state.soundList);
    }
}

function RenderView(soundList: soundType[]) {
    vscode.setState({soundList});

    let html = `
    <div id="top">
        <span>New Event:</span>
        <input type="text" class="add-event" />
        <div class="btn add-event">➕</div>
    </div>
    <div>
        ${RenderSoundEventsTable(soundList)}
    </div>
    `;

    Editor.innerHTML = html;

    const topElement = Editor.children.item(0) as HTMLElement;
    topElement.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const target = ev.target;
        if (target instanceof HTMLElement) {

            // Add a new event
            if (target.classList.contains('add-event')) {
                const input = target.previousElementSibling;
                if (input instanceof HTMLInputElement) {
                    const event = `"${input.value}"`;
                    const index = soundList.findIndex((data) => data.event === event);
                    if (index < 0) {
                        request("add-event", input.value);
                    }
                }
            }

        }
    });
    topElement.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
            const target = ev.target;
            if (target instanceof HTMLInputElement) {
                ev.stopPropagation();
                ev.preventDefault();
                if (target.classList.contains('add-event')) {
                    const event = `"${target.value}"`;
                    const index = soundList.findIndex((data) => data.event === event);
                    if (index < 0) {
                        request("add-event", target.value);
                    }
                }
            }
        }
    });

    const tableContainer = Editor.children.item(1) as HTMLElement;
    tableContainer.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const target = ev.target;
        if (target instanceof HTMLElement) {

            // Remove a event
            if (target.classList.contains('remove-event')) {
                const event = target.parentElement.getAttribute('event');
                if (event) {
                    request("remove-event", event);
                }
                return;
            }

            // Move a sound event
            if (target.classList.contains('move-sound-event')) {
                const event = target.parentElement.getAttribute('event');
                if (event) {
                    const up = target.classList.contains('moveup');
                    request("move-sound-event", event, up);
                }
                return;
            }

            // Dulpicate a sound event
            if (target.classList.contains('duplicate-sound-event')) {
                const event = target.parentElement.getAttribute('event');
                if (event) {
                    request("duplicate-sound-event", event);
                }
                return;
            }

            // All of the following is btn
            if (!target.classList.contains('btn')) {
                return;
            }

            // Start edit
            if (target.classList.contains('edit')) {
                target.parentElement.classList.add('editing');
                return;
            }

            // Change event name
            if (target.classList.contains('submit')) {
                let input = target.previousElementSibling.previousElementSibling;
                if (input instanceof HTMLInputElement) {
                    const event = input.getAttribute('event');
                    if (event) {
                        const event2 = `"${input.value}"`;
                        const index = soundList.findIndex((data) => data.event === event2);
                        if (index < 0) {
                            request("change-event-name", event, input.value);
                        }
                    }
                }
                return;
            }

            // Remove a sound file
            if (target.classList.contains('remove-sound-file')) {
                const index = parseInt(target.getAttribute('index'));
                const event = target.getAttribute('event');
                if (event && !isNaN(index) && index >= 0) {
                    request("remove-sound-file", event, index);
                }
                return;
            }

            // Add a sound file
            if (target.classList.contains('add-sound-file')) {
                let input = target.previousElementSibling;
                if (input instanceof HTMLInputElement) {
                    const event = input.getAttribute('event');
                    if (event) {
                        request("add-sound-file", event, input.value);
                    }
                }
                return;
            }

            // Add or change a sound key
            if (target.classList.contains('change-key-value')) {
                let input = target.previousElementSibling;
                if (input instanceof HTMLInputElement) {
                    const event = input.getAttribute('event');
                    const key = input.getAttribute('key');
                    if (event && key) {
                        request("change-sound-key", event, key, input.value);
                    }
                }
                return;
            }

            // Add a sound key
            if (target.classList.contains('add-sound-key')) {
                let input = target.previousElementSibling;
                if (input instanceof HTMLInputElement) {
                    const event = input.getAttribute('event');
                    if (event) {
                        request("change-sound-key", event, input.value, "");
                    }
                }
                return;
            }

            // Remove a sound key
            if (target.classList.contains('remove-sound-key')) {
                let input = target.previousElementSibling.previousElementSibling;
                if (input instanceof HTMLInputElement) {
                    const event = input.getAttribute('event');
                    const key = input.getAttribute('key');
                    if (event && key) {
                        request("remove-sound-key", event, key);
                    }
                }
                return;
            }

        }
    });

    tableContainer.addEventListener('change', (ev) => {
        ev.stopPropagation();
        const target = ev.target;
        if (target instanceof HTMLInputElement) {
            // Change event name
            if (target.classList.contains('change-event-name')) {
                const event = target.getAttribute('event');
                if (event) {
                    const event2 = `"${target.value}"`;
                    const index = soundList.findIndex((data) => data.event === event2);
                    if (index < 0) {
                        request("change-event-name", event, target.value);
                    }
                }
                return;
            }

            // Add or change a sound key
            if (target.classList.contains('change-key-value')) {
                const event = target.getAttribute('event');
                const key = target.getAttribute('key');
                if (event && key) {
                    request("change-sound-key", event, key, target.value);
                }
                return;
            }
        }
    });

    tableContainer.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
            const target = ev.target;
            if (target instanceof HTMLInputElement) {
                // Add a sound file
                if (target.classList.contains('add-sound-file')) {
                    ev.stopPropagation();
                    ev.preventDefault();
                    const event = target.getAttribute('event');
                    if (event) {
                        request("add-sound-file", event, target.value);
                    }
                    return;
                }
            }
        }
    });

    tableContainer.addEventListener('input', (ev) => {
        ev.stopPropagation();
        const target = ev.target;
        if (target instanceof HTMLInputElement) {
            const key = target.getAttribute('key');
            if (!key || keysSuggestion[key]) {
                return;
            }
            const result = target.value.match(numberRegexp);
            if (result && result[0] === target.value) {
                target.classList.remove('error');
            } else {
                target.classList.add('error');
            }
        }
    });
}

function RenderSoundEventsTable(soundList: soundType[]) {
    let html = '';

    for(const [index,data] of soundList.entries()) {
        const event = (data.event as string).replace(/\"/g,'');
        const vsnd_files = data.vsnd_files as string[];

        // Sound file list
        let sounds = '';
        for(const [i,file] of vsnd_files.entries()) {
            sounds += `<li> ${file}
                <div class="btn remove-sound-file" event="${event}" index="${i}">❌</div>
            </li>`;
        }
        // Add sound file input
        sounds = `
        <ul>
            ${sounds}
        </ul>
        <div>
            <input type="text" class="add-sound-file" event="${event}" />
            <div class="btn add-sound-file">➕</div>
        </div>`;

        // Find unused keys
        let keyRows = '';
        for(const k of soundKeys) {
            const v = data[k];
            if (typeof v === 'string') {
                keyRows += `
                <tr>
                    <td>${k}</td>
                    <td>
                        <input type="text" class="change-key-value" 
                            key="${k}" value="${v}" 
                            event="${event}" />
                        <div class="btn change-key-value">✔️</div>
                        <div class="btn remove-sound-key">❌</div>
                    </td>
                </tr>
                `;
            }
        }
        for(const k in data) {
            if (soundKeys.includes(k) || k === 'event' || k === 'vsnd_files') {
                continue;
            }
            const v = data[k];
            if (typeof v === 'string') {
                keyRows += `
                <tr>
                    <td>${k}</td>
                    <td>
                        <input type="text" class="change-key-value" 
                            key="${k}" value="${v}" 
                            event="${event}" />
                        <div class="btn change-key-value">✔️</div>
                        <div class="btn remove-sound-key">❌</div>
                    </td>
                </tr>
                `;
            }
        }

        let moveup = `<button class="move-sound-event moveup">Move UP</button>`;
        let movedown = `<button class="move-sound-event movedown">Move Down</button>`;

        html += `<table class="table">
            <tbody>
                <tr>
                    <td>Event</td>
                    <td>
                        <div class="event-name">${event}</div>
                        <input type="text" class="change-event-name" value="${event}" event="${event}" />
                        <div class="btn edit">✏️</div>
                        <div class="btn submit">✔️</div>
                    </td>
                </tr>
                <tr>
                    <td>Sounds</td>
                    <td>${sounds}</td>
                </tr>
                ${keyRows}
                <tr>
                    <td colspan="2">
                        Add key:
                        <input type="text" class="add-sound-key" event="${event}" />
                        <div class="btn add-sound-key">➕</div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" event="${event}">
                        <button class="danger remove-event" >Remove</button>
                        <button class="duplicate-sound-event">Duplicate</button>
                        ${index===0? '': moveup}
                        ${index===soundList.length-1? '': movedown}
                    </td>
                </tr>
            </tbody>
        </table>`;
    }

    return html;
}

function showSuggestion(target: HTMLElement, list: string[], cb: (v: string) => void) {
    closeSuggestion();

    // Get or create page
    let page = document.querySelector('#suggestion-page');
    if (!page) {
        page = document.createElement('div');
        page.id = 'suggestion-page';
        document.body.appendChild(page);
    }

    // Create new menu
    const menu = document.createElement('div');
    menu.classList.add('menu');
    lastSuggestion = menu;

    for (let i = 0; i < list.length; i++) {
        const str = list[i];
        const menuItem = document.createElement('div');
        menuItem.classList.add('menu-item');
        menuItem.innerText = str;
        menu.appendChild(menuItem);
    }

    const rect = target.getBoundingClientRect();
    menu.style.left = `${rect.left}px`;
    menu.style.top = `${window.pageYOffset + rect.top + rect.height}px`;
    menu.style.width = `${rect.width}px`;
    page.appendChild(menu);

    menu.addEventListener('mousedown', (ev) => {
        if (ev.target instanceof HTMLElement) {
            cb(ev.target.innerText);
        }
    });
}

function closeSuggestion() {
    if (lastSuggestion) {
        lastSuggestion.remove();
        lastSuggestion = null;
    }
}

(function() {
    Init();
})();