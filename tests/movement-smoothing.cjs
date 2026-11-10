'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),D=require('../site/world-data.js');
function renderer(){
 let now=0;
 const canvas={getContext:()=>({setTransform(){}}),getBoundingClientRect:()=>({left:0,top:0,width:1024,height:768}),addEventListener(){},removeEventListener(){}};
 const context={devicePixelRatio:1,QuestWorldData:D,performance:{now:()=>now},matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}disconnect(){}},requestAnimationFrame:()=>1,cancelAnimationFrame(){},addEventListener(){},removeEventListener(){}};context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../site/world-renderer.js'),'utf8'),context);
 return{r:new context.QuestWorldRenderer(canvas),clock:t=>now=t};
}
function simulate(schedule,duration){
 const {r,clock}=renderer(),points=[];let index=0,p;
 for(let t=0;t<=duration;t+=10){
  clock(t);
  while(index<schedule.length&&schedule[index].arrive<=t){const s=schedule[index++];p={id:'smooth',x:23+s.sent*.001,y:18,moving:s.moving!==false,pace:0};r.setPlayers([p],null,1e12+s.sent)}
  if(p){const pos=r.positionFor(p,t);points.push({t,x:pos.x,moving:pos.moving})}
 }
 for(let i=1;i<points.length;i++){const step=points[i].x-points[i-1].x;assert(step>=-1e-8,'Never rewind when the jitter buffer grows');assert(step<=.011501,'No per-packet position jump: '+JSON.stringify([points[i-1],points[i]]))}
 r.destroy();return points;
}
const streamed=simulate(Array.from({length:151},(_,i)=>({sent:i*100,arrive:i*100+(i%19===0?170:0)})).sort((a,b)=>a.arrive-b.arrive),15000);
assert(streamed.filter(p=>p.t>2000&&p.moving).length>1100,'Streaming remains continuous across delayed/bunched packets');
const polled=simulate(Array.from({length:21},(_,i)=>({sent:i*1000,arrive:i*1000})),20000);
const steady=polled.filter(p=>p.t>=4000&&p.t<=19000);assert(steady.every(p=>p.moving),'One-second polling animates continuously between packets after buffering');
const stalled=simulate([{sent:0,arrive:0},{sent:100,arrive:100},{sent:200,arrive:200}],3000);
assert.equal(stalled.at(-1).x,23.2);assert.equal(stalled.at(-1).moving,false,'No invented motion or moonwalking after packets stop');
const {r,clock}=renderer();clock(0);r.setPlayers([{id:'still',x:23,y:18,moving:false}],null,1e12);r.positionFor(r.players[0],0);clock(8000);r.setPlayers([{id:'still',x:23.1,y:18,moving:true}],null,1e12+8000);assert.equal(r.playbackDelay,130,'An empty, idle scene does not force a long polling buffer');
clock(8100);r.setPlayers([{id:'still',x:23.2,y:18,moving:true},{id:'8ce46fbb-aae9-455f-949a-4aabb23f1d20',x:24,y:18,moving:true},{id:'1fd71bad-4731-480f-88ed-8be751a71fa4',x:25,y:18,moving:true}],null,1e12+8100);
const phases=[...r.positions.values()].map(p=>p.phase);assert.equal(new Set(phases).size,3,'Full UUIDs have independent limb phases');
clock(8200);r.setPlayers([],null,1e12+8200);assert.equal(r.positions.size,0,'Departed characters do not retain animation tracks');r.destroy();
console.log('PASS: streamed and polled playback, network jitter, bounded catchup, idle and independent UUID animation phases.');
