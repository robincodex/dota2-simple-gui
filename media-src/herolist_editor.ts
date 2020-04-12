import { HeroList } from './herolist';
import { vscode } from './utils';

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
                if (!evData.data) {
                    return;
                }
                vscode.setState({data: JSON.parse(evData.data)});
                UpdateHeroItemState();
                return;
            case 'change-state':
                UpdateHeroItemFromString(evData.result);
                return;
        }
    });

    vscode.postMessage({label: 'request-update'});
}

// Update hero-item state from data
function UpdateHeroItemState() {
    const state = vscode.getState();
    if (!state && !state.data) {
        return;
    }
    const data: {[key: string]: boolean} = state.data;
    const children = Editor.getElementsByClassName('hero-item');
    for (let i = 0; i < children.length; i++) {
        const element = children.item(i);
        const selected = data[element.getAttribute('name')] === true;
        SetHeroItemState(element, selected);
    }
}

function UpdateHeroItemFromString(json: string) {
    const data: {[key: string]: boolean} = vscode.getState().data;
    const newData: {[key: string]: boolean} = JSON.parse(json);
    
    for(let name in newData) {
        const selected = newData[name];
        data[name] = selected;
        let element = Editor.querySelector(`[name="${name}"]`);
        SetHeroItemState(element, selected);
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
    vscode.postMessage({
        label: 'request-change-state',
        name: item.getAttribute('name'),
    });
}

(function() {
    Init();
})();