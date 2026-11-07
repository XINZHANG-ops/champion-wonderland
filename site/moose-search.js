(function(){
'use strict';
const normalize=value=>String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim();
function findMatches(players,query){
 const needle=normalize(query);
 if(!needle)return [];
 return players.filter(p=>normalize(p.name).includes(needle)).sort((a,b)=>(normalize(b.name)===needle)-(normalize(a.name)===needle)||a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
}
function mount(host,renderer){
 const box=document.createElement('details');box.className='moose-search';
 box.innerHTML='<summary>Find a moose</summary><form role="search"><label>Search by nickname<input type="search" placeholder="Your moose’s name" maxlength="28" autocomplete="off"></label><p class="moose-search-status" role="status">Type a name to find your moose.</p><ul class="moose-search-results" aria-label="Matching moose"></ul><button type="button" class="moose-search-reset">Show whole map</button></form>';
 const hud=document.createElement('div');hud.className='map-hud';
 const row=document.createElement('div');row.className='map-hud-row';
 const season=document.createElement('span');season.className='map-season';
 const garden=renderer.season||window.QuestEnvironment?.garden();
 season.textContent=garden?garden.label+' · Daylight':'';season.hidden=!garden;
 const controls=host.querySelector('.world-view-controls');
 if(controls)hud.appendChild(controls);
 row.append(season,box);hud.appendChild(row);host.appendChild(hud);renderer.hasMapHud=true;renderer.mapSeasonLabel=season;
 const input=box.querySelector('input'),list=box.querySelector('ul'),status=box.querySelector('[role="status"]'),summary=box.querySelector('summary');let players=[],matches=[],selected=null;
 function select(player){
  if(!renderer.focusPlayer(player.id)){render();return}
  selected=player.id;summary.textContent='Found: '+player.name;box.open=false;summary.focus();
 }
 function render(){
  matches=findMatches(players,input.value);list.replaceChildren();
  status.textContent=!input.value.trim()?'Type a name to find your moose.':matches.length?matches.length+' matching '+(matches.length===1?'moose.':'moose.'): 'No moose found. Try another name.';
  for(const player of matches.slice(0,8)){
   const item=document.createElement('li'),button=document.createElement('button'),name=document.createElement('b'),detail=document.createElement('small');
   button.type='button';name.textContent=player.name;detail.textContent=(window.QuestWorldData.zones[player.world]?.name||'Wonderland')+' · '+(player.online===false?'Saved moose':'Visiting now');
   button.append(name,detail);button.onclick=()=>select(player);item.appendChild(button);list.appendChild(item);
  }
  if(matches.length>8)status.textContent+=' Showing the first 8; type more to narrow the search.';
 }
 input.oninput=render;
 input.onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();list.querySelector('button')?.focus()}};
 box.querySelector('form').onsubmit=e=>{e.preventDefault();if(matches[0])select(matches[0])};
 box.querySelector('.moose-search-reset').onclick=()=>{selected=null;input.value='';summary.textContent='Find a moose';renderer.fitGrounds();render();box.open=false;summary.focus()};
 box.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();box.open=false;summary.focus()}};
 box.addEventListener('toggle',()=>{if(box.open){render();input.focus()}});
 return {update(value){players=value;if(selected){const player=players.find(p=>p.id===selected);summary.textContent=player?'Found: '+player.name:'Find a moose';if(!player)selected=null}if(box.open)render()},destroy(){if(controls)host.appendChild(controls);hud.remove();renderer.hasMapHud=false;renderer.mapSeasonLabel=null}};
}
window.QuestMooseSearch={mount,findMatches};
})();
