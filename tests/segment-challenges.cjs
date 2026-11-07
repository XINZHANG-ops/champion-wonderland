'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=path.resolve(__dirname,'../site'),C=require(path.join(root,'quest-catalog.js')),M=require(path.join(root,'mission-catalog.js'));
const expected=['Email newsletters','Webinars','In-person workshops','Conferences & events','Peer roundtables','Short videos','Customer success stories','White papers & research','Self-paced courses','Interactive product demos','Expert office hours','Online community & networking','Product news & updates','Hands-on product trials'];
assert.deepEqual(C.channels.map(c=>c.name),expected);assert.equal(new Set(C.channels.map(c=>c.id)).size,14);
const box={QuestCatalog:C,QuestMissions:M};box.window=box;vm.createContext(box);vm.runInContext(fs.readFileSync(path.join(root,'discovery-ui.js'),'utf8'),box);const U=box.QuestDiscoveryUI;
const copy=new Set();for(const segment of ['he','k12','corp','public','hq']){
 const choices=C.challenges(segment);assert.equal(choices.length,14);assert.equal(new Set(choices.map(c=>c.id)).size,14);assert.deepEqual(choices.map(c=>c.id),C.challenges('he').map(c=>c.id));copy.add(choices.map(c=>c.name).join('|'));
 for(const mission of M.missions){const s={industry:segment,missionIds:[mission.id],painPoints:[],useCases:[]};let html=U.quick(s);assert.equal((html.match(/<fieldset>/g)||[]).length,1);assert(html.includes('Explore your challenges'));assert(!html.includes('data-answer="timing"'));assert(!html.includes('<small>Optional</small>'));for(const choice of choices)U.update(s,'painPoints',choice.id);assert.equal(s.painPoints.length,5);html=U.quick(s);assert(html.includes('5/5'));assert.equal((html.match(/data-answer="painPoints"/g)||[]).length,14);assert(!html.includes('discovery-choice selected"><small>'));}
}
assert.equal(copy.size,5,'Every segment needs its own challenge wording');assert(C.challenges('k12').some(c=>c.name.includes('Teachers')));assert(C.challenges('corp').some(c=>c.name.includes('Employees')));assert(C.challenges('public').some(c=>c.name.includes('public-service')));
console.log('PASS: one question across all fifty segment/track routes, distinct segment-specific wording, stable matching IDs, five-choice limit and the fourteen exact unlimited learning formats.');
