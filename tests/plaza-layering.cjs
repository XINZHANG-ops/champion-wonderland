'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const D=require('../site/world-data.js'),events=[],paving=[];
const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(object,key)=>key in object?object[key]:()=>{}});
const sandbox={QuestWorldData:D,QuestEnvironment:{garden:()=>({stamp:'test',sky:'#fff',flower:'#f90'})}};sandbox.window=sandbox;vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../site/world-renderer.js'),'utf8'),sandbox);
const r=Object.create(sandbox.QuestWorldRenderer.prototype);
Object.assign(r,{w:900,h:700,ctx,scale:1,players:[{id:'rear',x:46,y:31.5},{id:'middle',x:46,y:36},{id:'front',x:49,y:41}],positions:new Map(),applyResize(){},clock:()=>0,drawGround(){events.push('terrain')},districtEntities(){},sceneryEntities(){},positionFor:p=>p,character:p=>events.push(p.id),bench:(x,y)=>events.push('bench:'+x+','+y),flowers(){},label(){},drawSeasonOverlay(){},shape(points){paving.push(points);events.push('paving')}});
r.draw(100);
assert(paving.length>2,'The plaza has paving and an inlaid center, rather than one blank slab');
assert(paving.every(shape=>shape.every(point=>point[2]===0)),'Walkable paving sits on the same ground plane as moose feet');
assert(events.lastIndexOf('paving')<events.indexOf('rear'),'The whole plaza floor paints before even its rearmost visitor');
assert(events.indexOf('bench:44,32')<events.indexOf('rear'),'The rear bench sorts independently of the plaza floor');
assert(events.indexOf('middle')<events.indexOf('moose-guide')&&events.indexOf('moose-guide')<events.indexOf('front'),'Lucy and visitors keep their actual front-to-back ordering');
assert(events.indexOf('middle')<events.indexOf('bench:49,40')&&events.indexOf('bench:49,40')<events.indexOf('front'),'The near bench does not share the rear bench sorting key');
for(const [x,y]of[[46,32],[46,36],[46,40],[48,36]])assert(D.walkable(x,y),'The welcome area remains open to walkers');
console.log('PASS: decorated flush paving always paints below visitors; both benches and Lucy sort independently; central walking space stays open.');

vm.runInContext(fs.readFileSync(path.join(__dirname,'../site/world-effects.js'),'utf8'),sandbox);
Object.assign(r,{world:'he',context:{step:6,products:['creator','access'],challengeText:'Content',channels:['workshop','video','conference','email','paper','roundtable','sandbox','selfpaced'],storyTypes:['story']},
 players:[{id:'behind',x:15,y:15},{id:'ahead',x:17,y:17}],
 cube(){},line(){},polygon(){},text(){},drawSeasonOverlay(){events.push('weather')},drawLabels(){events.push('names')},label:name=>events.push(name)});
for(const [role,label] of Object.entries({educator:'TEACHING CORNER',explorer:'MISSION PAVILION',admin:'CONTROL CENTER',designer:'CREATIVE STUDIO',leader:'STRATEGY CENTER',training:'SKILLS STATION'})){
 events.length=0;r.context.role=role;r.draw(200);
 assert(events.indexOf('behind')<events.indexOf(label)&&events.indexOf(label)<events.indexOf('ahead'),role+' must sort between the two visitors');
 assert.deepEqual(events.slice(-2),['weather','names']);
 assert.equal(events.filter(e=>e==='names').length,1);
}
console.log('PASS: all six role stations sort by position with visitors; names paint once, after every prop and the weather.');
