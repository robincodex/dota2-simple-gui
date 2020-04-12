import { onRequestResponse, request, vscode } from './utils';

const Editor = document.getElementById('editor');
const HeroList = document.getElementById('hero-list');
const HeroInfo = document.getElementById('hero-info');

// @ts-ignore
const baseUri = window.baseUri;

type HeroData = {
    Name: string,
    HeroName: string
};

async function Init() {
    window.addEventListener('message', (ev) => {
        if (ev.data) {
            onRequestResponse(ev.data);
        }
    });

    let result = await request<HeroData[]>('get-hero-list');
    readerHeroList(result);
    renderHeroInfo();
}

function readerHeroList(list: HeroData[]) {
    let html = '';

    for(let v of list) {
        html += `
        <div class="hero-item" name="${v.Name}" >
            <img src="${baseUri}/heroes/${v.HeroName}.png" />
            <span>${v.Name}</span>
        </div>
        `;
    }

    HeroList.innerHTML = html;
}

const HeroInfoGroupList = [
    {
        Name: "Base",
        Keys: [
            'StatusHealth',
            'StatusHealthRegen',
            'StatusMana',
            'StatusManaRegen',
            'ArmorPhysical',
            'MagicalResistance',
            'VisionDaytimeRange',
            'VisionNighttimeRange',
            'ModelScale',
            'RingRadius',
            'HealthBarOffset',
        ]
    },
    {
        Name: "Attributes",
        Keys: [
            'AttributePrimary',
            'AttributeBaseStrength',
            'AttributeStrengthGain',
            'AttributeBaseIntelligence',
            'AttributeIntelligenceGain',
            'AttributeBaseAgility',
            'AttributeAgilityGain',
            'MovementCapabilities',
            'MovementSpeed',
            'MovementTurnRate',
        ]
    },
    {
        Name: "Attack",
        Keys: [
            'AttackCapabilities',
            'AttackDamageMin',
            'AttackDamageMax',
            'AttackRange',
            'AttackRangeBuffer',
            'BaseAttackSpeed',
            'AttackRate',
            'AttackAnimationPoint',
            'ProjectileSpeed',
        ]
    },
    {
        Name: "Character",
        Keys: [
            'ProjectileModel',
            'Model',
            'GameSoundsFile',
            'VoiceFile',
            'SoundSet',
            'IdleSoundLoop',
            'HeroSelectSoundEffect',
        ],
    },
];

function renderHeroInfo() {
    let html = '';

    for(const v of HeroInfoGroupList) {
        let keysItem = '';
        for (let i = 0; i < v.Keys.length; i++) {
            const key = v.Keys[i];
            keysItem += `
                <div class="kv-item">
                    <div class="kv-key">${key}</div>
                    <input class="kv-input" type="text" value="" />
                </div>`;
        }
        html += `
        <div class="info-group" group="${v.Name}">
            <div class="group-name">${v.Name}</div>
            ${keysItem}
        </div>
        `;
    }

    HeroInfo.innerHTML = html;
}

;(function() {
    Init();
})();