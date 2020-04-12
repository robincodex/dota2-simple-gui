'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const vscode = acquireVsCodeApi();
const requestMap = new Map();
let requestCounter = 1;
function request(label, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            let requestId = requestCounter++;
            requestMap.set(requestId, resolve);
            vscode.postMessage({
                requestId,
                label,
                args,
            });
        });
    });
}
function onRequestResponse(data) {
    if (typeof data.requestId === 'number') {
        let resolve = requestMap.get(data.requestId);
        if (resolve) {
            resolve(data.result);
            requestMap.delete(data.requestId);
        }
    }
}

const Editor = document.getElementById('editor');
const HeroList = document.getElementById('hero-list');
const HeroInfo = document.getElementById('hero-info');
const baseUri = window.baseUri;
function Init() {
    return __awaiter(this, void 0, void 0, function* () {
        window.addEventListener('message', (ev) => {
            if (ev.data) {
                onRequestResponse(ev.data);
            }
        });
        let result = yield request('get-hero-list');
        readerHeroList(result);
        renderHeroInfo();
    });
}
function readerHeroList(list) {
    let html = '';
    for (let v of list) {
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
    for (const v of HeroInfoGroupList) {
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
(function () {
    Init();
})();
//# sourceMappingURL=hero_editor.js.map
