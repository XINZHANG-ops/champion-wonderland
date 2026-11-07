'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../site/world-environment.js'),D=require('../site/world-data.js');
assert.equal(E.duration,20000);assert.equal(E.transition,4000);
for(const [i,name]of ['spring','summer','autumn','winter'].entries()){
 assert.equal(E.garden(i*E.duration).id,name,'Garden rendering follows the shared clock');
 const middle=E.garden(i*E.duration+E.duration-E.transition/2);assert(middle.mix>0&&middle.mix<1);for(const key of ['sky','ground','foliage','water'])assert(/^#[0-9a-f]{6}$/.test(middle[key]));
 const end=E.garden((i+1)*E.duration-.001),start=E.garden((i+1)*E.duration);assert.equal(end.ground,start.ground,'Season boundaries have no abrupt ground-color jump');
}
assert.equal(E.garden(4*E.duration).id,'spring');
const sandbox={QuestEnvironment:E,QuestWorldData:D,QuestWorldRenderer:function(){}};sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../site/world-scenery.js'),'utf8'),sandbox);
let writes=0,value='Spring · Daylight';const label={get textContent(){return value},set textContent(next){value=next;writes++}};
const r=Object.create(sandbox.QuestWorldRenderer.prototype);Object.assign(r,{ctx:{save(){},restore(){}},season:E.garden(0),hasMapHud:true,mapSeasonLabel:label,motion:false});r.drawSeasonOverlay(0);assert.equal(writes,0);r.season=E.garden(E.duration);r.drawSeasonOverlay(0);assert.equal(label.textContent,'Summer · Daylight');r.drawSeasonOverlay(0);assert.equal(writes,1,'HUD text changes only when the season label changes');
console.log('PASS: synchronized 20-second seasons, 4-second continuous transitions, complete 80-second cycle and updating HUD without per-frame DOM writes.');
