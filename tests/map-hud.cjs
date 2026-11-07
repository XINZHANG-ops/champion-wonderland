'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Node{
 constructor(){this.children=[];this.fields=new Map();this.textContent='';}
 appendChild(n){n.remove();this.children.push(n);n.parent=this;return n}
 append(...nodes){nodes.forEach(n=>this.appendChild(n))}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);this.parent=null}
 querySelector(selector){if(!this.fields.has(selector))this.fields.set(selector,new Node());return this.fields.get(selector)}
 addEventListener(){}
}
const context={document:{createElement:()=>new Node()},QuestEnvironment:{garden:()=>({label:'Summer garden'})}};
context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../site/moose-search.js'),'utf8'),context);
const host=new Node(),controls=new Node();host.fields.set('.world-view-controls',controls);host.appendChild(controls);
const renderer={},search=context.QuestMooseSearch.mount(host,renderer),hud=host.children[0],row=hud.children[1];
assert.equal(renderer.hasMapHud,true);assert.equal(host.children.length,1,'Search, season and zoom controls share one layout container');
assert.equal(hud.children[0],controls,'Move existing controls; do not duplicate them or replace their handlers');
assert.equal(row.children[0].textContent,'Summer garden · Daylight','The badge exists before the first canvas frame');
search.destroy();assert.equal(renderer.hasMapHud,false);assert.deepEqual(host.children,[controls],'Unmount restores existing controls and removes the shared HUD');
console.log('PASS: shared HUD keeps original controls, exposes the season before the first frame, and restores controls on unmount.');
