(function(root){
const worlds={
 k12:{id:'k12',name:'Wondergarden',kind:'K–12 · Kindergarten',tag:'SMALL STEPS. BIG DISCOVERIES.',description:'A playful kindergarten with rainbow classrooms, a playground, a sandbox and a story circle.',accent:'#df967e',ground:'#bfd197',path:'#e9d2a0',sky:'#f0eee1',landmarks:['Rainbow classroom','Playground','Story garden']},
 he:{id:'he',name:'Curiosity University',kind:'Higher Education · University',tag:'A CAMPUS FULL OF POSSIBILITIES.',description:'Meet on the university quad, stroll past the library, and discover the lecture hall and campus fountain.',accent:'#7c9eae',ground:'#acbf91',path:'#d9d7bc',sky:'#eaf0e9',landmarks:['University hall','Campus library','The learning quad']},
 corp:{id:'corp',name:'Tomorrow Works',kind:'Corporate · Learning Campus',tag:'BUILD THE SKILLS FOR WHAT’S NEXT.',description:'A future-facing workplace with a training hub, collaboration pods and a skills lab.',accent:'#a29cbe',ground:'#b3c5ad',path:'#d8dace',sky:'#eaecef',landmarks:['Training hub','Skills lab','Collaboration garden']},
 public:{id:'public',name:'Civic Garden',kind:'Government & Public Sector · Civic Campus',tag:'LEARNING THAT BRINGS PEOPLE TOGETHER.',description:'A welcoming civic square with a community learning center, a public library and shared gardens.',accent:'#9bad86',ground:'#b8c99c',path:'#e2d8bd',sky:'#f0eee3',landmarks:['Community center','Public library','Community garden']}
};
worlds.public.name='Civic Garden';
worlds.hq={id:'hq',name:'D2L HQ',kind:'D2L Team · Staff Demo',tag:'EXPLORE TOGETHER.',description:'A small team courtyard for D2L colleagues to try the adventure together.',accent:'#f58220',ground:'#c1d2af',path:'#e6dec2',sky:'#eef1e8',landmarks:['D2L HQ','Team courtyard','Rooftop garden']};
const commonGround={name:'D2L Champion Wonderland',tag:'IGNITE CANADA · MEET YOUR LEARNING COMMUNITY',description:'A spacious learning wonderland, with Toronto on the horizon.',ground:'#bdcda8',path:'#e6dec2',sky:'#eef1e8'};
const arena={size:72,min:1,max:70};
const zones={
 he:{id:'he',name:'University Quarter',label:'UNIVERSITY QUARTER',x:1,y:1,w:42,h:31,origin:[3,3],scale:1.15,color:'#b6c9a0'},
 corp:{id:'corp',name:'Corporate Park',label:'CORPORATE PARK',x:1,y:40,w:43,h:31,origin:[3,42],scale:1.15,color:'#b3c8b4'},
 k12:{id:'k12',name:'K–12 Garden',label:'K–12 PLAY GARDEN',x:51,y:1,w:20,h:26,origin:[51,3],scale:1.05,color:'#cbd8a9'},
 public:{id:'public',name:'Civic Garden',label:'GOVERNMENT & COMMUNITY',x:51,y:46,w:20,h:25,origin:[51,48],scale:1.05,color:'#c5ceaf'},
 hq:{id:'hq',name:'D2L HQ Courtyard',label:'D2L HQ · TEAM COURTYARD',x:3,y:33,w:33,h:6,origin:[3,33],scale:1,color:'#b8ceac'}
};
function inZone(x,y,id){const z=zones[id];return !!z&&x>=z.x&&x<z.x+z.w&&y>=z.y&&y<z.y+z.h}
function districtAt(x,y){return Object.values(zones).find(z=>inZone(x,y,z.id))?.id||null}
const blocked=Object.values(zones).filter(z=>z.id!=='hq').flatMap(z=>[[3,7,3,6],[10,13,3,7],[4,6,11,13]].map(([x1,x2,y1,y2])=>[Math.floor(z.origin[0]+x1*z.scale),Math.ceil(z.origin[0]+x2*z.scale),Math.floor(z.origin[1]+y1*z.scale),Math.ceil(z.origin[1]+y2*z.scale)]));
blocked.push([4,14,33,36]);
const structures=[{kind:'research',name:'RESEARCH LIBRARY',x:25,y:6,w:5,d:4},{kind:'lecture',name:'OUTDOOR LECTURE GARDEN',x:27,y:22,w:5,d:3},{kind:'innovation',name:'INNOVATION STUDIO',x:25,y:47,w:5,d:4},{kind:'slide',name:'ADVENTURE SLIDE',x:55,y:20,w:4,d:3},{kind:'swings',name:'SWING GARDEN',x:64,y:19,w:4,d:3},{kind:'cityhall',name:'CITY HALL',x:63,y:62,w:5,d:4}];
for(const s of structures)blocked.push([s.x,s.x+s.w,s.y,s.y+s.d]);
const scenery={pond:{x:55,y:33,w:11,d:8},structures,trees:[],treeKinds:['tree','leafyTree','birchTree','blossomTree','willowTree','cypressTree'],meadows:[],benches:[[20,8],[23,17],[18,28],[34,16],[35,28],[20,48],[23,58],[19,68],[36,55],[35,66],[53,16],[68,25],[53,60],[68,68],[44,29],[49,44],[18,37],[24,37]],flowerbeds:[],hedges:[]};
function walkable(x,y,zone){if(!Number.isInteger(x)||!Number.isInteger(y)||x<arena.min||x>arena.max||y<arena.min||y>arena.max||zone&&!inZone(x,y,zone))return false;const p=scenery.pond;if(x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.d)return false;return !blocked.some(([x1,x2,y1,y2])=>x>=x1&&x<=x2&&y>=y1&&y<=y2)&&!scenery.trees.some(([tx,ty])=>Math.hypot(x-tx,y-ty)<.65)}
function isPath(x,y){return [2,12,22,32,44,48,58,68,70].includes(x)||[2,12,25,31,34,38,40,50,60,70].includes(y)||(x>=43&&x<=50&&y>=28&&y<=44)}
// Seed the planted borders once. Keep the main paths and the busy learning areas open.
let seed=61231;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(let i=0;i<5000&&scenery.trees.length<96;i++){const x=1+Math.floor(random()*70),y=1+Math.floor(random()*70);if(isPath(x,y)||inZone(x,y,'hq')||blocked.some(([a,b,c,d])=>x>=a-1&&x<=b+1&&y>=c-1&&y<=d+1)||!walkable(x,y)||scenery.trees.some(([a,b])=>Math.hypot(x-a,y-b)<2.2))continue;scenery.trees.push([x,y,.55+random()*.35])}
for(let i=0;i<1000&&scenery.flowerbeds.length<65;i++){const x=1+Math.floor(random()*68),y=1+Math.floor(random()*68);if(isPath(x,y)||!walkable(x,y)||scenery.flowerbeds.some(([a,b])=>Math.hypot(x-a,y-b)<2.5))continue;scenery.flowerbeds.push([x,y])}
for(let i=0;i<2500&&scenery.meadows.length<150;i++){const x=1+random()*68,y=1+random()*68;if(isPath(Math.round(x),Math.round(y))||!walkable(Math.round(x),Math.round(y)))continue;scenery.meadows.push([x,y,random()])}
for(let i=0;i<70;i+=5){scenery.hedges.push([.3,i+1,4],[71.2,i+1,4],[i+1,.3,3],[i+1,71.2,3])}
scenery.hedges.push([17,33,4],[25,33,4],[40,15,4],[40,54,4],[52,44,4]);
const cells=[];for(let y=arena.min;y<=arena.max;y++)for(let x=arena.min;x<=arena.max;x++)if(walkable(x,y))cells.push({x,y});
const zoneCells=Object.fromEntries(Object.keys(zones).map(id=>[id,cells.filter(c=>inZone(c.x,c.y,id))]));
function cellsFor(id){return zoneCells[id]||zoneCells.he}
function spawnCell(id){const options=cellsFor(id);return options[Math.floor(Math.random()*options.length)]}
const palette={skin:['#9671d5','#83b8e5','#bc8c62','#e2ae86','#75b8a5','#cc8cac','#efc39b','#dca579','#b87850','#825138','#f2d5b8','#a26c4c'],shirt:['#8260c9','#f58220','#ef8daf','#c25883','#9471cc','#6446a4','#db4a48','#9f303d','#f0c65c','#719f91','#3c8d7a','#6b9cbd','#35679d','#ece5d7','#353b43','#b56437','#7b8053'],hair:['#d5ad70','#473d36','#79553d','#c99d59','#ddd4bc','#292e31','#8e6958']};
const avatarOptions={outfit:['sweatshirt','hoodie','varsity','polo','overalls','jacket'],pattern:['solid','stripes','dots','colorblock'],outerwear:['none','autumn','winter'],expression:['happy','bright','wink','curious'],style:['crop','bob','bun','swept','branch'],hat:['none','cap','crown','beanie','graduate'],glasses:['none','round','square','sun'],earrings:['none','hoops','studs'],necklace:['none','star','beads'],scarf:['none','orange','teal','purple','cream']};
function sanitizeAvatar(input={}){if(!input||typeof input!=='object')input={};const pick=(value,values,fallback)=>values.includes(value)?value:fallback;const scale=(value,min,max)=>Number.isFinite(value)?Math.min(max,Math.max(min,value)):1;const a={skin:pick(input.skin,palette.skin,palette.skin[2]),shirt:pick(input.shirt,palette.shirt,palette.shirt[0]),hair:pick(input.hair,palette.hair,palette.hair[2]),backpack:!!input.backpack,antlerScale:scale(input.antlerScale,.65,1.4),bodyScale:scale(input.bodyScale,.85,1.2)};for(const [key,values]of Object.entries(avatarOptions))a[key]=pick(input[key],values,values[0]);return a}
const api={worlds,commonGround,zones,inZone,districtAt,scenery,arena,blocked,walkable,isPath,cells,cellsFor,spawnCell,palette,avatarOptions,sanitizeAvatar};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.QuestWorldData=api;
})(typeof window!=='undefined'?window:globalThis);
