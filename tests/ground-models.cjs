'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const D=require('../site/world-data'),sandbox={QuestWorldData:D,QuestEnvironment:{}};
sandbox.window=sandbox;vm.createContext(sandbox);
for(const name of ['world-renderer','world-scenery','world-wonderland']){
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../site',name+'.js'),'utf8'),sandbox);
}
const proto=sandbox.QuestWorldRenderer.prototype;
const r=Object.create(proto),parts=[],lines=[];
Object.assign(r,{motion:true,cube:(...part)=>parts.push(part),segment:(...line)=>lines.push(line)});
for(const time of [0,700,1300,2300]){
 parts.length=lines.length=0;r.swingSet(64,19,time);
 const beam=parts.at(-1),chains=lines.filter(line=>line[2]==='#536b60');
 assert.equal(chains.length,4);
 chains.forEach(([a,b],i)=>{
  const [x,y,w,d,h,,z]=parts[Math.floor(i/2)];
  assert(a[0]>=beam[0]&&a[0]<=beam[0]+beam[2]&&a[1]>=beam[1]&&a[1]<=beam[1]+beam[3]);
  assert(a[2]>=beam[6]&&a[2]<=beam[6]+beam[4]);
  assert(b[0]>=x&&b[0]<=x+w&&b[1]>=y&&b[1]<=y+d);
  assert.equal(b[2],z+h);
  assert(Math.abs(Math.hypot((a[1]-b[1])*32,a[2]-b[2])-46)<1e-8);
 });
}
for(const face of ['north','south','east','west']){
 parts.length=0;r.bench(10,10,face,7);
 const back=parts.at(-1),seat=parts[4];
 assert.equal(Math.min(...parts.map(p=>p[6])),7);
 const axis=['north','south'].includes(face)?1:0,sign=['north','west'].includes(face)?1:-1;
 const center=p=>p[axis]+p[axis+2]/2;
 const seatCenter=(center(seat)+center(parts[5]))/2;
 assert((center(back)-seatCenter)*sign>0);
}
for(const [x,y] of D.scenery.benches)
 assert(D.scenery.trees.every(([tx,ty])=>Math.hypot(x+.525-tx,y+.18-ty)>1.2),'bench intersects tree');
console.log('PASS: swing chains meet the beam and seat throughout the arc; bench feet, facing and tree clearance verified.');
