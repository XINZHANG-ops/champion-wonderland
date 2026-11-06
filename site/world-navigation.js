(function(root){
'use strict';
const D=typeof module!=='undefined'&&module.exports?require('./world-data.js'):root.QuestWorldData;
const padding=.18;
const solids=D.blocked.map(([x1,x2,y1,y2])=>({x1:x1-.35,x2:x2+.35,y1:y1-.35,y2:y2+.35}));
const pond=D.scenery.pond;solids.push({x1:pond.x-.25,x2:pond.x+pond.w+.25,y1:pond.y-.25,y2:pond.y+pond.d+.25});
const trunks=D.scenery.trees.map(([x,y])=>({x,y,r:.65+padding}));
const hq=D.zones.hq,publicSolids=[...solids,{x1:hq.x,x2:hq.x+hq.w,y1:hq.y,y2:hq.y+hq.h}];
function boxes(options){return options.staff?solids:publicSolids;}
function valid(p,options={}){return !!p&&[p.x,p.y].every(Number.isFinite)&&p.x>=D.arena.min&&p.x<=D.arena.max&&p.y>=D.arena.min&&p.y<=D.arena.max&&(!options.zone||D.inZone(p.x,p.y,options.zone))&&!boxes(options).some(b=>p.x>b.x1-padding&&p.x<b.x2+padding&&p.y>b.y1-padding&&p.y<b.y2+padding)&&!trunks.some(t=>Math.hypot(p.x-t.x,p.y-t.y)<t.r)}
function clear(a,b,options={}){
 if(!valid(a,options)||!valid(b,options))return false;
 for(const box of boxes(options)){
  let low=0,high=1;
  for(const [axis,min,max]of [['x',box.x1-padding,box.x2+padding],['y',box.y1-padding,box.y2+padding]]){
   const delta=b[axis]-a[axis];if(Math.abs(delta)<1e-12){if(a[axis]<=min||a[axis]>=max){low=1;high=0;break;}continue;}
   const t1=(min-a[axis])/delta,t2=(max-a[axis])/delta;low=Math.max(low,Math.min(t1,t2));high=Math.min(high,Math.max(t1,t2));
  }
  if(low<high-1e-10)return false;
 }
 const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
 return !trunks.some(t=>{const u=length?Math.max(0,Math.min(1,((t.x-a.x)*dx+(t.y-a.y)*dy)/length)):0;return Math.hypot(a.x+u*dx-t.x,a.y+u*dy-t.y)<t.r;});
}
function findRoute(start,end,{valid,clear,step=.5}){
 if(!start||!end||![start.x,start.y,end.x,end.y].every(Number.isFinite)||!valid(start)||!valid(end))return [];
 if(clear(start,end))return [{x:end.x,y:end.y}];
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),key=(x,y)=>`${x},${y}`,heap=[],nodes=new Map();
 function push(node){let i=heap.length;heap.push(node);while(i){const p=(i-1)>>1;if(heap[p].f<=node.f)break;heap[i]=heap[p];i=p;}heap[i]=node;}
 function pop(){const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1].f<heap[child].f)child++;if(heap[child].f>=last.f)break;heap[i]=heap[child];i=child;}heap[i]=last;}return first;}
 function offer(x,y,g,parent){const id=key(x,y),old=nodes.get(id);if(old&&old.g<=g+1e-9)return;const p={x:x*step,y:y*step},node={x,y,p,g,f:g+distance(p,end),parent};nodes.set(id,node);push(node);}
 for(const x of new Set([Math.floor(start.x/step),Math.ceil(start.x/step)]))for(const y of new Set([Math.floor(start.y/step),Math.ceil(start.y/step)])){
  const p={x:x*step,y:y*step};if(valid(p)&&clear(start,p))offer(x,y,distance(start,p),null);
 }
 let finish=null,best=Infinity;
 while(heap.length){
  const node=pop();if(node!==nodes.get(key(node.x,node.y)))continue;if(node.f>=best-1e-9)break;
  if(clear(node.p,end)){best=node.g+distance(node.p,end);finish=node;continue;}
  for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]){
   const x=node.x+dx,y=node.y+dy,p={x:x*step,y:y*step},g=node.g+Math.hypot(dx,dy)*step;
   if(g+distance(p,end)>=best||nodes.get(key(x,y))?.g<=g+1e-9||!valid(p)||!clear(node.p,p))continue;
   offer(x,y,g,node);
  }
 }
 if(!finish)return [];
 const path=[{x:end.x,y:end.y}];for(let node=finish;node;node=node.parent)path.push(node.p);path.reverse();
 const result=[];let anchor=start;
 for(let i=0;i<path.length;){let j=path.length-1;while(j>i&&!clear(anchor,path[j]))j--;if(distance(anchor,path[j])>1e-8)result.push(path[j]);anchor=path[j];i=j+1;}
 return result;
}
function route(start,end,options={}){const validity=new Map();return findRoute(start,end,{step:.5,valid:p=>{const key=p.x+','+p.y;if(!validity.has(key))validity.set(key,valid(p,options));return validity.get(key);},clear:(a,b)=>clear(a,b,options)});}
const api={valid,clear,route};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.QuestNavigation=api;
})(typeof window!=='undefined'?window:globalThis);
