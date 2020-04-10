const Editor = document.getElementById('editor');
const HeroList = document.getElementById('hero-list');
const HeroInfo = document.getElementById('hero-info');

function Init() {
    let list = window.Dota2HeroDataList;
    let text = '';

    for(let d of list) {
        text += `
            <div class="hero-item">
                <img class="hero-img" src="${d.ImagePath}" />
                <span class="hero-name" >${d.HeroName.replace('npc_dota_hero_','')}</span>
            </div>
        `;
    }

    HeroList.innerHTML = text;
}

(function(){
    Init();
})();