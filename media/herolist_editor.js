'use strict';

const HeroList = [
    "npc_dota_hero_ancient_apparition",
    "npc_dota_hero_antimage",
    "npc_dota_hero_axe",
    "npc_dota_hero_bane",
    "npc_dota_hero_beastmaster",
    "npc_dota_hero_bloodseeker",
    "npc_dota_hero_chen",
    "npc_dota_hero_crystal_maiden",
    "npc_dota_hero_dark_seer",
    "npc_dota_hero_dazzle",
    "npc_dota_hero_dragon_knight",
    "npc_dota_hero_doom_bringer",
    "npc_dota_hero_drow_ranger",
    "npc_dota_hero_earthshaker",
    "npc_dota_hero_enchantress",
    "npc_dota_hero_enigma",
    "npc_dota_hero_faceless_void",
    "npc_dota_hero_furion",
    "npc_dota_hero_juggernaut",
    "npc_dota_hero_kunkka",
    "npc_dota_hero_leshrac",
    "npc_dota_hero_lich",
    "npc_dota_hero_life_stealer",
    "npc_dota_hero_lina",
    "npc_dota_hero_lion",
    "npc_dota_hero_mirana",
    "npc_dota_hero_morphling",
    "npc_dota_hero_necrolyte",
    "npc_dota_hero_nevermore",
    "npc_dota_hero_night_stalker",
    "npc_dota_hero_omniknight",
    "npc_dota_hero_puck",
    "npc_dota_hero_pudge",
    "npc_dota_hero_pugna",
    "npc_dota_hero_rattletrap",
    "npc_dota_hero_razor",
    "npc_dota_hero_riki",
    "npc_dota_hero_sand_king",
    "npc_dota_hero_shadow_shaman",
    "npc_dota_hero_slardar",
    "npc_dota_hero_sniper",
    "npc_dota_hero_spectre",
    "npc_dota_hero_storm_spirit",
    "npc_dota_hero_sven",
    "npc_dota_hero_tidehunter",
    "npc_dota_hero_tinker",
    "npc_dota_hero_tiny",
    "npc_dota_hero_vengefulspirit",
    "npc_dota_hero_venomancer",
    "npc_dota_hero_viper",
    "npc_dota_hero_weaver",
    "npc_dota_hero_windrunner",
    "npc_dota_hero_witch_doctor",
    "npc_dota_hero_zuus",
    "npc_dota_hero_broodmother",
    "npc_dota_hero_skeleton_king",
    "npc_dota_hero_queenofpain",
    "npc_dota_hero_huskar",
    "npc_dota_hero_jakiro",
    "npc_dota_hero_batrider",
    "npc_dota_hero_warlock",
    "npc_dota_hero_alchemist",
    "npc_dota_hero_death_prophet",
    "npc_dota_hero_ursa",
    "npc_dota_hero_bounty_hunter",
    "npc_dota_hero_silencer",
    "npc_dota_hero_spirit_breaker",
    "npc_dota_hero_invoker",
    "npc_dota_hero_clinkz",
    "npc_dota_hero_obsidian_destroyer",
    "npc_dota_hero_shadow_demon",
    "npc_dota_hero_lycan",
    "npc_dota_hero_lone_druid",
    "npc_dota_hero_brewmaster",
    "npc_dota_hero_phantom_lancer",
    "npc_dota_hero_treant",
    "npc_dota_hero_ogre_magi",
    "npc_dota_hero_chaos_knight",
    "npc_dota_hero_phantom_assassin",
    "npc_dota_hero_gyrocopter",
    "npc_dota_hero_rubick",
    "npc_dota_hero_luna",
    "npc_dota_hero_wisp",
    "npc_dota_hero_disruptor",
    "npc_dota_hero_undying",
    "npc_dota_hero_templar_assassin",
    "npc_dota_hero_naga_siren",
    "npc_dota_hero_nyx_assassin",
    "npc_dota_hero_keeper_of_the_light",
    "npc_dota_hero_visage",
    "npc_dota_hero_meepo",
    "npc_dota_hero_magnataur",
    "npc_dota_hero_centaur",
    "npc_dota_hero_slark",
    "npc_dota_hero_shredder",
    "npc_dota_hero_medusa",
    "npc_dota_hero_troll_warlord",
    "npc_dota_hero_tusk",
    "npc_dota_hero_bristleback",
    "npc_dota_hero_skywrath_mage",
    "npc_dota_hero_elder_titan",
    "npc_dota_hero_abaddon",
    "npc_dota_hero_earth_spirit",
    "npc_dota_hero_ember_spirit",
    "npc_dota_hero_legion_commander",
    "npc_dota_hero_phoenix",
    "npc_dota_hero_terrorblade",
    "npc_dota_hero_techies",
    "npc_dota_hero_oracle",
    "npc_dota_hero_winter_wyvern",
    "npc_dota_hero_arc_warden",
    "npc_dota_hero_abyssal_underlord",
    "npc_dota_hero_monkey_king",
    "npc_dota_hero_dark_willow",
    "npc_dota_hero_pangolier",
    "npc_dota_hero_grimstroke",
    "npc_dota_hero_mars",
    "npc_dota_hero_snapfire",
    "npc_dota_hero_void_spirit",
];

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
const baseUri = window.baseUri;
function Init() {
    HeroList.sort();
    let text = '';
    for (let hero of HeroList) {
        text += `
        <div class="hero-item" name="${hero}" >
            <span>❌</span>
            <img src="${baseUri}/heroes/${hero}.png" />
            <span>${hero.replace('npc_dota_hero_', '')}</span>
        </div>
        `;
    }
    Editor.innerHTML = text;
    Editor.addEventListener('click', (ev) => {
        let element = ev.target;
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
function UpdateHeroesState(text) {
    let elementList = Editor.querySelectorAll(".hero-item");
    let data = {};
    let list = text.match(/\"[\w_]+\"\s+\"\d+\"/g);
    if (list) {
        for (let v of list) {
            let kv = v.split(/\s+/);
            let name = kv[0].replace(/\"/g, '');
            let selected = kv[1] === '"1"';
            data[name] = selected;
        }
    }
    for (let i = 0; i < elementList.length; i++) {
        let element = elementList.item(i);
        SetHeroItemState(element, data[element.getAttribute("name")] === true);
    }
}
function SetHeroItemState(item, selected) {
    const firstChild = item.children.item(0);
    firstChild.innerHTML = selected ? '✔️' : '❌';
    if (selected) {
        item.classList.add("selected");
    }
    else {
        item.classList.remove("selected");
    }
}
function onClickHeroItem(item) {
    request("request-change-state", item.getAttribute('name'));
}
(function () {
    Init();
})();
//# sourceMappingURL=herolist_editor.js.map
