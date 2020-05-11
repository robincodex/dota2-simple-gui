
/*
env.json
{
    "npc_heroes": "..."
}
*/
const env = require('./env');
const kvLib = require('easy-keyvalues');
const fs = require('fs');

(async function() {
    if (!env['npc_heroes']) {
        throw new Error("Not found npc_heroes.txt");
    }

    const data = {
		["GOOD"]: {
			['STRENGTH']: [],
			['AGILITY']: [],
			['INTELLECT']: [],
		},
		["BAD"]: {
			['STRENGTH']: [],
			['AGILITY']: [],
			['INTELLECT']: [],
		},
	};
    
    const npc_heroes = await kvLib.loadFromFile(env['npc_heroes']);
    const list = npc_heroes.find((v) => v.Key === 'DOTAHeroes');
    list.Value.forEach((v) => {
        if (v.Key === 'Version' || v.Key === 'npc_dota_hero_base' || v.Key === 'npc_dota_hero_target_dummy') {
            return;
        }
        if (v.Type === kvLib.KeyValuesType.KeyValue) {
            const team = v.Value.find((v) => v.Key === 'Team');
            const primary = v.Value.find((v) => v.Key === 'AttributePrimary');
            let c = team.Value==='Good'? data['GOOD']:data['BAD'];
            switch (primary.Value) {
                case 'DOTA_ATTRIBUTE_STRENGTH':
                    c['STRENGTH'].push(v.Key);
                    break;
                case 'DOTA_ATTRIBUTE_AGILITY':
                    c['AGILITY'].push(v.Key);
                    break;
                case 'DOTA_ATTRIBUTE_INTELLECT':
                    c['INTELLECT'].push(v.Key);
                    break;
                default:
                    throw new Error(`${v.Key} not found AttributePrimary`);
            }
        }
    });

    for(const i in data) {
        for(const k in data[i]) {
            data[i][k].sort();
        }
    }
    
    await fs.promises.writeFile("./media-src/herolist.ts", `
export const HeroTable = ${JSON.stringify(data, null, '  ')};
    `);
})();