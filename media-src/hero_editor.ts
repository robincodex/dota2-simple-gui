import { onRequestResponse, request, vscode } from './utils';

const Editor = document.getElementById('editor');
const HeroList = document.getElementById('hero-list');
const HeroInfo = document.getElementById('hero-info');

const NumberRegExp = new RegExp(/-?[\d.]+/);

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
        Fields: [
            {
                Key: 'StatusHealth',
                Type: "Number",
            },
            {
                Key: 'StatusHealthRegen',
                Type: "Number",
            },
            {
                Key: 'StatusMana',
                Type: "Number",
            },
            {
                Key: 'StatusManaRegen',
                Type: "Number",
            },
            {
                Key: 'ArmorPhysical',
                Type: "Number",
            },
            {
                Key: 'MagicalResistance',
                Type: "Number",
            },
            {
                Key: 'VisionDaytimeRange',
                Type: "Number",
            },
            {
                Key: 'VisionNighttimeRange',
                Type: "Number",
            },
            {
                Key: 'ModelScale',
                Type: "Number",
            },
            {
                Key: 'RingRadius',
                Type: "Number",
            },
            {
                Key: 'HealthBarOffset',
                Type: "Number",
            },
        ]
    },
    {
        Name: "Attributes",
        Fields: [
            {
                Key: 'AttributePrimary',
                Type: "Number",
            },
            {
                Key: 'AttributeBaseStrength',
                Type: "Number",
            },
            {
                Key: 'AttributeStrengthGain',
                Type: "Number",
            },
            {
                Key: 'AttributeBaseIntelligence',
                Type: "Number",
            },
            {
                Key: 'AttributeIntelligenceGain',
                Type: "Number",
            },
            {
                Key: 'AttributeBaseAgility',
                Type: "Number",
            },
            {
                Key: 'AttributeAgilityGain',
                Type: "Number",
            },
            {
                Key: 'MovementCapabilities',
                Type: "Number",
            },
            {
                Key: 'MovementSpeed',
                Type: "Number",
            },
            {
                Key: 'MovementTurnRate',
                Type: "Number",
            },
        ]
    },
    {
        Name: "Attack",
        Fields: [
            {
                Key: 'AttackCapabilities',
                Type: "Number",
            },
            {
                Key: 'AttackDamageMin',
                Type: "Number",
            },
            {
                Key: 'AttackDamageMax',
                Type: "Number",
            },
            {
                Key: 'AttackRange',
                Type: "Number",
            },
            {
                Key: 'AttackRangeBuffer',
                Type: "Number",
            },
            {
                Key: 'BaseAttackSpeed',
                Type: "Number",
            },
            {
                Key: 'AttackRate',
                Type: "Number",
            },
            {
                Key: 'AttackAnimationPoint',
                Type: "Number",
            },
            {
                Key: 'ProjectileSpeed',
                Type: "Number",
            },
        ]
    },
    {
        Name: "Character",
        Fields: [
            {
                Key: 'ProjectileModel',
                Type: "String",
            },
            {
                Key: 'Model',
                Type: "String",
            },
            {
                Key: 'GameSoundsFile',
                Type: "String",
            },
            {
                Key: 'VoiceFile',
                Type: "String",
            },
            {
                Key: 'SoundSet',
                Type: "String",
            },
            {
                Key: 'IdleSoundLoop',
                Type: "String",
            },
            {
                Key: 'HeroSelectSoundEffect',
                Type: "String",
            },
        ],
    },
];

function renderHeroInfo() {
    let html = '';

    for(const v of HeroInfoGroupList) {
        let keysItem = '';
        for (let i = 0; i < v.Fields.length; i++) {
            const field = v.Fields[i];
            keysItem += `
                <div class="kv-item">
                    <div class="kv-key">${field.Key}</div>
                    <input class="kv-input" type="text" value="" 
                        placeholder="${field.Type}" value-type="${field.Type}" />
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

    // Send a new value to vscode.
    HeroInfo.addEventListener('change', (ev) => {
        const input = ev.target as HTMLInputElement;
    });

    // Check input value
    HeroInfo.addEventListener('input', (ev) => {
        const input = ev.target as HTMLInputElement;
        let valueType = input.getAttribute("value-type");
        if (valueType === 'Number') {
            let matchValue = input.value.match(NumberRegExp);
            if (matchValue && input.value === matchValue[0]) {
                input.classList.remove("error");
            } else {
                input.classList.add("error");
            }
        }
    });
}

;(function() {
    Init();
})();