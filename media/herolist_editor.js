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

const vscode = acquireVsCodeApi();

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
                if (!evData.data) {
                    return;
                }
                vscode.setState({ data: JSON.parse(evData.data) });
                UpdateHeroItemState();
                return;
            case 'change-state':
                UpdateHeroItemFromString(evData.result);
                return;
        }
    });
    vscode.postMessage({ label: 'request-update' });
}
function UpdateHeroItemState() {
    const state = vscode.getState();
    if (!state && !state.data) {
        return;
    }
    const data = state.data;
    const children = Editor.getElementsByClassName('hero-item');
    for (let i = 0; i < children.length; i++) {
        const element = children.item(i);
        const selected = data[element.getAttribute('name')] === true;
        SetHeroItemState(element, selected);
    }
}
function UpdateHeroItemFromString(json) {
    const data = vscode.getState().data;
    const newData = JSON.parse(json);
    for (let name in newData) {
        const selected = newData[name];
        data[name] = selected;
        let element = Editor.querySelector(`[name="${name}"]`);
        SetHeroItemState(element, selected);
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
    vscode.postMessage({
        label: 'request-change-state',
        name: item.getAttribute('name'),
    });
}
(function () {
    Init();
})();
//# sourceMappingURL=herolist_editor.js.map
