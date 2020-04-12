import { HeroList } from './herolist';
import { vscode, request, onRequestResponse } from './utils';

const Editor = document.getElementById('editor');

// @ts-ignore
const baseUri = window.baseUri;

function Init() {
    HeroList.sort();

    // Create hero-item list
    let text = '';
    for(let hero of HeroList) {
        text += `
        <div class="hero-item" name="${hero}" >
            <span>❌</span>
            <img src="${baseUri}/heroes/${hero}.png" />
            <span>${hero.replace('npc_dota_hero_', '')}</span>
        </div>
        `;
    }
    Editor.innerHTML = text;

    // Listen the click event of hero-item 
    Editor.addEventListener('click', (ev) => {
        let element = ev.target as HTMLElement;
        if (element.classList.contains("hero-item")) {
            onClickHeroItem(element);
        }
    });

    window.addEventListener('message', (ev) => {
        const evData = ev.data;
        switch (evData.label) {
            case 'update':
                UpdateHeroesState(evData.text);
                return;
            default:
                onRequestResponse(evData);
                return;
        }
    });

    request("request-update");
}

// Update hero-item state from text
function UpdateHeroesState(text: string) {
    let elementList = Editor.querySelectorAll(".hero-item");
    let data: {[key: string]: boolean} = {};

    let list = text.match(/\"[\w_]+\"\s+\"\d+\"/g);
    if (list) {
        for(let v of list) {
            let kv = v.split(/\s+/);
            let name = kv[0].replace(/\"/g, '');
            let selected = kv[1] === '"1"';
            data[name] = selected;
        }
    }

    for(let i=0; i<elementList.length; i++) {
        let element = elementList.item(i);
        SetHeroItemState(element, data[element.getAttribute("name")] === true);
    }
}

function SetHeroItemState(item: Element, selected: boolean) {
    const firstChild = item.children.item(0);
    firstChild.innerHTML = selected? '✔️':'❌';
    if (selected) {
        item.classList.add("selected");
    } else {
        item.classList.remove("selected");
    }
}

/**
 * Change hero-item state
 * @param item The class of element is hero-item
 */
function onClickHeroItem(item: HTMLElement) {
    request("request-change-state", item.getAttribute('name'));
}

(function() {
    Init();
})();