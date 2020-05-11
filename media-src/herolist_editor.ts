import { HeroTable } from './herolist';
import { vscode, request, onRequestResponse } from './utils';

const Editor = document.getElementById('editor');

// @ts-ignore
const baseUri = window.baseUri;

const localeData = {
    "team_good": {
        "en": "The Radiant",
        "zh-cn": "天辉",
        "ru": "Силы Света",
    },
    "team_bad": {
        "en": "The Dire",
        "zh-cn": "夜魇",
        "ru": "Силы Тьмы",
    },
    "strength": {
        "en": "STRENGTH",
        "zh-cn": "力量",
        "ru": "СИЛ",
    },
    "agility": {
        "en": "AGILITY",
        "zh-cn": "敏捷",
        "ru": "ЛОВ",
    },
    "intellect": {
        "en": "INTELLECT",
        "zh-cn": "智力",
        "ru": "ИНТ",
    }
};

function Init() {
    let lang = document.documentElement.lang;

    const renderHero = (name: string) => {
        return `<div class="hero" name="${name}">
            <img src="${baseUri}/heroes/${name}.png" />
        </div>`;
    };

    const heroReduce = (pv: string, v: string, i: number) => {
        if (i === 1) {
            pv = renderHero(pv);
        }
        return pv + renderHero(v);;
    };

    Editor.innerHTML = `
    <div class="state-box-line">
        <div class="state-none-color state-box">Disable (0)</div>
        <div class="state-enable-color state-box">Enable (1)</div>
        <div class="state-reselect-color state-box">Infinite (-1)</div>
        <div>
            <input type="checkbox" id="EnableLargeImage" />
            <label for="EnableLargeImage">Large image</label>
        </div>
    </div>
    <div id="team-good" >
        <div class="team-title">${localeData.team_good[lang]}</div>
        <div class="hero-container-line">
            <div class="hero-container">
                <div class="hero-primary">${localeData.strength[lang]}</div>
                <div class="hero-list">
                    ${HeroTable['GOOD']['STRENGTH'].reduce(heroReduce)}
                </div>
            </div>
            <div class="hero-container">
                <div class="hero-primary">${localeData.agility[lang]}</div>
                <div class="hero-list">
                    ${HeroTable['GOOD']['AGILITY'].reduce(heroReduce)}
                </div>
            </div>
            <div class="hero-container">
                <div class="hero-primary">${localeData.intellect[lang]}</div>
                <div class="hero-list">
                    ${HeroTable['GOOD']['INTELLECT'].reduce(heroReduce)}
                </div>
            </div>
        </div>
    </div>
    <div id="team-bad" >
        <div class="team-title">${localeData.team_bad[lang]}</div>
        <div class="hero-container-line">
            <div class="hero-container">
                <div class="hero-primary">${localeData.strength[lang]}</div>
                <div class="hero-list">
                    ${HeroTable['BAD']['STRENGTH'].reduce(heroReduce)}
                </div>
            </div>
            <div class="hero-container">
                <div class="hero-primary">${localeData.agility[lang]}</div>
                <div class="hero-list">
                    ${HeroTable['BAD']['AGILITY'].reduce(heroReduce)}
                </div>
            </div>
            <div class="hero-container">
                <div class="hero-primary">${localeData.intellect[lang]}</div>
                <div class="hero-list">
                    ${HeroTable['BAD']['INTELLECT'].reduce(heroReduce)}
                </div>
            </div>
        </div>
    </div>
    `;

    Editor.addEventListener('click', (ev) => {
        if (ev.target instanceof HTMLElement && ev.target.classList.contains('hero')) {
            const name = ev.target.getAttribute('name');
            if (name) {
                request('request-change-state', name);
            }
        }
    });
    Editor.addEventListener('contextmenu', (ev) => {
        if (ev.target instanceof HTMLElement && ev.target.classList.contains('hero')) {
            const name = ev.target.getAttribute('name');
            if (name) {
                request('copy-heroname', name);
                const msg = document.createElement('span');
                msg.classList.add('msg-text');
                msg.innerText = 'Copy '+name;
                msg.style.left = `${ev.clientX + 5}px`;
                msg.style.top = `${window.pageYOffset + ev.clientY}px`;
                document.body.appendChild(msg);
                setTimeout(() => msg.remove(), 1000);
            }
        }
    });
    Editor.addEventListener('change', (ev) => {
        if (ev.target instanceof HTMLInputElement) {
            if (ev.target.checked) {
                Editor.classList.add('large-img');
            } else {
                Editor.classList.remove('large-img');
            }
        }
    });

    window.addEventListener('message', (ev) => {
        const evData = ev.data;
        switch (evData.label) {
            case 'update':
                vscode.setState({data: JSON.parse(evData.text)});
                updateView();
                return;
            default:
                onRequestResponse(evData);
                return;
        }
    });

    const state = vscode.getState();
    if (state && state.data) {
        updateView();
    }
}

function updateView() {
    const state = vscode.getState();
    const data: {[key: string]: string} = state.data;

    const heroList = Editor.querySelectorAll(".hero");
    heroList.forEach((item) => {
        const v = data[item.getAttribute('name')];
        switch (v) {
            case "-1":
                item.classList.add('state-reselect');
                item.classList.remove('state-enable');
                break;
            case "1":
                item.classList.add('state-enable');
                item.classList.remove('state-reselect');
                break;
            default:
                item.classList.remove('state-enable');
                item.classList.remove('state-reselect');
                break;
        }
    });
}

(function() {
    Init();
})();