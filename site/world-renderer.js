(function(){
'use strict';const D=window.QuestWorldData;
function shade(hex,amount){const n=parseInt(hex.slice(1),16);return '#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,v+amount)).toString(16).padStart(2,'0')).join('')}
class WorldRenderer{
 constructor(canvas,{world='he',preview=false,onWalk=()=>{}}={}){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.world=world;this.preview=preview;this.players=[];this.positions=new Map();this.self=null;this.onWalk=onWalk;this.running=true;this.zoom=1;this.camera={x:D.arena.size/2,y:D.arena.size/2};this.clock=()=>Date.now();this.motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.handleClick=e=>{if(this.preview)return;const point=this.groundPoint(e.clientX,e.clientY);if(point.x>=D.arena.min&&point.x<=D.arena.max&&point.y>=D.arena.min&&point.y<=D.arena.max){this.marker={...point,at:performance.now()};this.onWalk(point)}};this.installMapControls();this.handleWheel=e=>{if(e.ctrlKey)return;e.preventDefault();const r=canvas.getBoundingClientRect();this.zoomBy(e.deltaY<0?1.15:1/1.15,{x:e.clientX-r.left,y:e.clientY-r.top})};canvas.addEventListener('wheel',this.handleWheel,{passive:false});this.resize();this.frame=t=>{if(!this.running)return;if(!this.lastFrame||t-this.lastFrame>=16){this.draw(t);this.lastFrame=t}this.raf=requestAnimationFrame(this.frame)};this.raf=requestAnimationFrame(this.frame)}
 resize(){const r=this.canvas.getBoundingClientRect();if(!r.width||!r.height)return;const d=Math.min(devicePixelRatio||1,2);this.pendingSize={w:r.width,h:r.height,d,width:Math.round(r.width*d),height:Math.round(r.height*d)};if(!this.w)this.applyResize()}
 applyResize(){const size=this.pendingSize;if(!size)return;this.pendingSize=null;if(this.w===size.w&&this.h===size.h&&this.pixelRatio===size.d)return;this.w=size.w;this.h=size.h;this.pixelRatio=size.d;
  // Resizing clears the bitmap. Apply it only at the start of the frame that repaints it.
  if(this.canvas.width!==size.width)this.canvas.width=size.width;if(this.canvas.height!==size.height)this.canvas.height=size.height;
  this.ctx.setTransform(size.d,0,0,size.d,0,0);this.baseScale=Math.min(this.w/(52*D.arena.size+130),this.h/(26*D.arena.size+230));this.updateCamera()
 }
 destroy(){this.running=false;cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();this.cancelMapGesture();for(const [event,handler]of Object.entries(this.mapControls))this.canvas.removeEventListener(event,handler);window.removeEventListener?.('blur',this.cancelMapGesture);this.canvas.removeEventListener('wheel',this.handleWheel)}
 installMapControls(){
  const canvas=this.canvas,pointers=new Map();let gesture=null,pinch=null;
  const point=event=>({x:event.clientX,y:event.clientY,mouse:!event.pointerType||event.pointerType==='mouse'});
  const pair=()=>{const [a,b]=[...pointers.values()];return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))}};
  const finish=(event,cancelled=false)=>{
   if(!pointers.has(event.pointerId))return;pointers.delete(event.pointerId);
   const current=gesture,wasPinching=!!pinch;pinch=null;
   if(canvas.hasPointerCapture?.(event.pointerId))canvas.releasePointerCapture(event.pointerId);
   if(pointers.size){const [id,p]=pointers.entries().next().value;gesture={id,x:p.x,y:p.y,lastX:p.x,lastY:p.y,pan:!p.mouse,dragged:true,tap:false};return}
   gesture=null;canvas.classList?.remove('is-panning');
   if(cancelled||wasPinching||!current?.tap||current.dragged||current.mouseButton===2||this.preview)return;
   const rect=canvas.getBoundingClientRect();if(event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom)this.handleClick(event);
  };
  this.mapControls={
   pointerdown:event=>{
    const p=point(event);if(p.mouse&&event.button!==0&&event.button!==2)return;if(p.mouse&&event.button===0&&this.preview)return;
    pointers.set(event.pointerId,p);canvas.setPointerCapture?.(event.pointerId);
    if(pointers.size>1){if(gesture){gesture.tap=false;gesture.dragged=true}if(pointers.size===2&&[...pointers.values()].every(p=>!p.mouse))pinch=pair();event.preventDefault();return}
    gesture={id:event.pointerId,x:p.x,y:p.y,lastX:p.x,lastY:p.y,pan:!p.mouse||event.button===2,mouseButton:p.mouse?event.button:null,dragged:false,tap:true};if(gesture.pan)event.preventDefault();
   },
   pointermove:event=>{
    if(!pointers.has(event.pointerId))return;pointers.set(event.pointerId,point(event));
    if(pinch&&pointers.size===2){event.preventDefault();const next=pair(),rect=canvas.getBoundingClientRect();this.zoomBy(next.distance/pinch.distance,{x:pinch.x-rect.left,y:pinch.y-rect.top});this.panBy(next.x-pinch.x,next.y-pinch.y);pinch=next;return}
    if(!gesture||gesture.id!==event.pointerId||pointers.size>1)return;
    if(!gesture.dragged&&Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>7)gesture.dragged=true;
    if(gesture.dragged&&gesture.pan){event.preventDefault();if(this.zoom>1){this.panBy(event.clientX-gesture.lastX,event.clientY-gesture.lastY);canvas.classList?.add('is-panning')}gesture.lastX=event.clientX;gesture.lastY=event.clientY}
   },
   pointerup:event=>finish(event),pointercancel:event=>finish(event,true),lostpointercapture:event=>finish(event,true),contextmenu:event=>event.preventDefault()
  };
  this.cancelMapGesture=()=>{gesture=null;pinch=null;for(const id of [...pointers.keys()]){pointers.delete(id);if(canvas.hasPointerCapture?.(id))canvas.releasePointerCapture(id)}canvas.classList?.remove('is-panning')};
  for(const [event,handler]of Object.entries(this.mapControls))canvas.addEventListener(event,handler);
  window.addEventListener('blur',this.cancelMapGesture);
 }
 panBy(dx,dy){
  this.focusId=null;
  this.camera={x:Math.max(0,Math.min(D.arena.size,this.camera.x-(dy/13+dx/26)/(2*this.scale))),y:Math.max(0,Math.min(D.arena.size,this.camera.y-(dy/13-dx/26)/(2*this.scale)))};
  this.updateCamera();
 }
 updateCamera(){this.scale=this.baseScale*this.zoom;const q=this.p(this.camera.x,this.camera.y);this.ox=this.w/2-q[0]*this.scale;this.oy=this.h/2+40*this.baseScale-q[1]*this.scale}
 zoomBy(factor,anchor){this.focusId=null;const before=this.scale,point=anchor||{x:this.w/2,y:this.h/2},lx=(point.x-this.ox)/before,ly=(point.y-this.oy)/before;this.zoom=Math.max(1,Math.min(10,this.zoom*factor));this.scale=this.baseScale*this.zoom;this.ox=point.x-lx*this.scale;this.oy=point.y-ly*this.scale;const cx=(this.w/2-this.ox)/this.scale,cy=(this.h/2+40*this.baseScale-this.oy)/this.scale;this.camera={x:(cy/13+cx/26)/2,y:(cy/13-cx/26)/2}}
 fitGrounds(){this.focusId=null;this.zoom=1;this.camera={x:D.arena.size/2,y:D.arena.size/2};this.updateCamera()}
 focusPlayer(id){const player=this.players.find(p=>p.id===id);if(!player)return false;this.focusId=id;this.camera={x:player.x,y:player.y};this.zoom=3;this.updateCamera();return true}
 findMe(){if(this.focusPlayer(this.self)){this.zoom=2;this.updateCamera();return}const z=D.zones[this.world];this.camera={x:z.x+z.w/2,y:z.y+z.h/2};this.zoom=2;this.updateCamera()}
 setWorld(world){if(D.worlds[world])this.world=world;this.groundLayer=null;this.marker=null}
 setPlayers(players,self){
  const now=typeof performance!=='undefined'?performance.now():Date.now();this.players=players;this.self=self;
  const ids=new Set(players.map(p=>p.id));if(this.focusId&&!ids.has(this.focusId))this.focusId=null;
  for(const id of this.positions.keys())if(!ids.has(id))this.positions.delete(id);
  for(const p of players){let track=this.positions.get(p.id);if(!track){track={x:p.x,y:p.y,phase:String(p.id).split('').reduce((n,ch)=>n+ch.charCodeAt(0)*37,0),samples:[]};this.positions.set(p.id,track);}track.samples=track.samples||[];track.samples.push({x:p.x,y:p.y,at:now});if(track.samples.length>18)track.samples.shift();}
 }
 groundPoint(clientX,clientY){const rect=this.canvas.getBoundingClientRect(),x=(clientX-rect.left-this.ox)/this.scale,y=(clientY-rect.top-this.oy)/this.scale;return {x:(y/13+x/26)/2,y:(y/13-x/26)/2};}
 positionFor(p,time){
  let track=this.positions.get(p.id);if(!track){track={x:p.x,y:p.y,phase:0};this.positions.set(p.id,track);}
  const samples=track.samples||[],at=time-130;let point=samples[0]||p;
  for(let i=1;i<samples.length;i++){const b=samples[i],a=samples[i-1];if(at>=b.at){point=b;continue;}const t=Math.max(0,Math.min(1,(at-a.at)/Math.max(1,b.at-a.at)));point={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};break;}
  track.x=point.x;track.y=point.y;track.moving=!!p.moving||Math.hypot(p.x-track.x,p.y-track.y)>.015;return track;
 }
 p(x,y,z=0){return [(x-y)*26,(x+y)*13-z]}
 district(id,draw){const z=D.zones[id],project=this.p;this.p=(x,y,h=0)=>project.call(this,z.origin[0]+x*z.scale,z.origin[1]+y*z.scale,h);try{draw()}finally{this.p=project}}
 districtEntities(time,add){for(const z of Object.values(D.zones)){if(z.id==='hq'){add(44,()=>this.headquarters());continue}const depth=(x,y)=>z.origin[0]+z.origin[1]+(x+y)*z.scale;add(depth(5,5),()=>this.district(z.id,()=>this.building(z.id==='he'?'university':z.id==='corp'?'corporate':z.id==='k12'?'kindergarten':'civic')));add(depth(11,5),()=>this.district(z.id,()=>z.id==='k12'?this.playground(time):this.library(z.id==='corp',z.id==='public'?'PUBLIC LIBRARY':undefined)));add(depth(5,12),()=>this.district(z.id,()=>z.id==='k12'?this.sandbox():this.fountain(4.2,11.1,time)));add(depth(11,12),()=>this.district(z.id,()=>{if(z.id==='k12')this.storyGarden();else{this.bench(10.3,11.4);this.bench(12.1,12.5);this.flowers(11.5,11.4,z.id==='corp'?'#a29cbe':'#e4af79')}}));add(z.x+z.y+z.h-1,()=>this.label(z.label,z.x+z.w/2,z.y+z.h-.8,-8))}}

 polygon(points,fill,stroke){const c=this.ctx;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=.7;c.stroke()}}
 shape(points,color){this.polygon(points.map(p=>this.p(...p)),color)}
 cube(x,y,w,d,h,fill,z=0){this.shape([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],shade(fill,20));this.shape([[x,y,z+h],[x,y+d,z+h],[x,y+d,z],[x,y,z]],shade(fill,-18));this.shape([[x,y+d,z+h],[x+w,y+d,z+h],[x+w,y+d,z],[x,y+d,z]],fill);this.shape([[x+w,y,z+h],[x+w,y+d,z+h],[x+w,y+d,z],[x+w,y,z]],shade(fill,-32))}
 roof(x,y,w,d,z,color){this.shape([[x-.18,y-.18,z],[x+w/2,y-.18,z+32],[x+w/2,y+d+.18,z+32],[x-.18,y+d+.18,z]],shade(color,17));this.shape([[x+w/2,y-.18,z+32],[x+w+.18,y-.18,z],[x+w+.18,y+d+.18,z],[x+w/2,y+d+.18,z+32]],shade(color,-13));this.shape([[x-.18,y+d+.18,z],[x+w/2,y+d+.18,z+32],[x+w+.18,y+d+.18,z]],shade(color,-24))}
 window(x,y,z,w=.65,h=20,color='#9fbeb6'){this.shape([[x,y,z],[x+w,y,z],[x+w,y,z+h],[x,y,z+h]],color);const a=this.p(x+w/2,y,z),b=this.p(x+w/2,y,z+h);this.line(a,b,'#f4ecd6',1.5)}
 line(a,b,color,width=2){const c=this.ctx;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
 text(text,x,y,size=10,color='#4d6254',align='center'){const c=this.ctx;c.font=`600 ${size}px 'DM Sans',Arial,sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(text,x,y)}
 tree(x,y,s=1,color='#6f9164'){this.cube(x-.07,y-.07,.14,.14,30*s,'#a98b66');const pt=this.p(x,y);this.polygon([[pt[0]-23*s,pt[1]-24*s],[pt[0],pt[1]-84*s],[pt[0]+23*s,pt[1]-24*s],[pt[0],pt[1]-8*s]],color);this.polygon([[pt[0],pt[1]-84*s],[pt[0]+23*s,pt[1]-24*s],[pt[0],pt[1]-8*s]],shade(color,-19));this.polygon([[pt[0]-17*s,pt[1]-47*s],[pt[0],pt[1]-96*s],[pt[0]+18*s,pt[1]-47*s],[pt[0],pt[1]-33*s]],shade(color,15))}
 flowers(x,y,color='#e4af79'){for(let i=0;i<5;i++){const p=this.p(x+(i%3)*.22,y+Math.floor(i/3)*.23);this.line([p[0],p[1]],[p[0],p[1]-8],'#779568',1.5);this.polygon([[p[0]-3,p[1]-8],[p[0],p[1]-12],[p[0]+4,p[1]-8],[p[0],p[1]-5]],color)}}
 bench(x,y){this.cube(x,y,1.05,.36,12,'#c8a77c');this.cube(x,y+.28,1.05,.09,18,'#ba9972',9);this.cube(x+.08,y+.02,.12,.15,7,'#7d8e79');this.cube(x+.86,y+.02,.12,.15,7,'#7d8e79')}
 label(name,x,y,z=0){const p=this.p(x,y,z),c=this.ctx;c.font='600 10px DM Sans, Arial';const width=c.measureText(name).width+22;c.fillStyle='#fffdf0ed';c.beginPath();c.roundRect(p[0]-width/2,p[1]-12,width,23,6);c.fill();c.strokeStyle='#d4dcc9';c.lineWidth=.7;c.stroke();this.text(name,p[0],p[1]+3,9)}
 building(type){if(type==='kindergarten'){this.cube(3.2,3.3,4,3.3,55,'#efd3a6');this.roof(3.2,3.3,4,3.3,55,'#cf9787');this.window(3.55,6.61,15,.65,21,'#a4c7b0');this.window(6.15,6.61,15,.65,21,'#9dbecb');this.window(4.85,6.62,0,.65,33,'#91ad88');for(let i=0;i<6;i++)this.cube(3.2+i*.66,6.63,.65,.16,6,['#d98f7e','#e1b370','#d4c37d','#9ab68b','#91b7ba','#af9dba'][i],41);this.label('RAINBOW CLASSROOM',5.2,4.9,110)}
 if(type==='university'){this.cube(3.2,3.3,4.2,3.2,68,'#ded4b6');this.roof(3.2,3.3,4.2,3.2,68,'#788c78');this.cube(3.05,6.45,4.5,.7,6,'#c7c5ab');for(let i=0;i<5;i++){this.cube(3.35+i*.8,6.55,.16,.18,43,'#eee8cf',6);this.window(3.4+i*.8,6.52,31,.45,20)}this.cube(4.7,3.9,1,1,112,'#e5dec2');this.roof(4.7,3.9,1,1,112,'#6c8270');const p=this.p(5.2,4.91,94);this.ctx.fillStyle='#fff7df';this.ctx.beginPath();this.ctx.ellipse(p[0],p[1],8,10,0,0,Math.PI*2);this.ctx.fill();this.line(p,[p[0]+3,p[1]-4],'#697968',1.4);this.line(p,[p[0]-3,p[1]-2],'#697968',1.4);this.label('CURIOSITY UNIVERSITY',5.2,4,163)}
 if(type==='corporate'){this.cube(3.3,3.2,3.7,3.4,95,'#a4beb9');for(let row=0;row<3;row++)for(let col=0;col<4;col++)this.window(3.6+col*.8,6.61,12+row*25,.57,17,'#647f85');this.cube(3.1,3.05,4.1,3.75,5,'#c1cfc1',95);for(let i=0;i<3;i++)this.cube(3.6+i*.8,3.5,.65,1.5,2,'#526d77',102);this.cube(4.8,6.65,.7,.25,31,'#7b9e96');this.label('TRAINING HUB',5.2,4.8,145)}
 if(type==='civic'){this.cube(3.2,3.3,4.1,3.3,65,'#ded9bd');this.roof(3.2,3.3,4.1,3.3,65,'#91a482');for(let i=0;i<5;i++)this.cube(3.4+i*.78,6.64,.2,.2,44,'#f4edd5',4);this.window(4.85,6.65,0,.7,34,'#8ba79a');this.label('COMMUNITY LEARNING',5.3,4.7,117)}
 }
 library(corporate=false,title){this.cube(10,3.4,3.2,3.2,corporate?48:57,corporate?'#b3acc6':'#ded7ba');if(corporate){this.cube(9.9,3.3,3.4,3.4,4,'#d9d4df',48)}else this.roof(10,3.4,3.2,3.2,57,'#8c9d82');for(let i=0;i<3;i++)this.window(10.3+i*.92,6.61,12,.65,27,corporate?'#768ca1':'#9ebcaf');this.label(title||(corporate?'SKILLS LAB':'CAMPUS LIBRARY'),11.6,4.8,corporate?93:112)}
 playground(t){this.cube(10.2,3.6,2.5,2.5,3,'#d5b77f');this.cube(10.5,4,.15,.15,52,'#8fa7a4');this.cube(12.2,4,.15,.15,52,'#8fa7a4');this.cube(10.5,5.9,.15,.15,52,'#8fa7a4');this.cube(12.2,5.9,.15,.15,52,'#8fa7a4');this.roof(10.45,3.95,1.95,2.15,52,'#86a7a1');this.shape([[11.9,5.8,37],[12.5,5.8,37],[13.3,7,3],[12.7,7,3]],'#dc9c72');for(let i=0;i<4;i++)this.cube(10.55,4.35+i*.32,1.65,.08,2,'#c8ab7b',8+i*9);const a=this.p(10.2,3,63);this.line(a,[a[0],a[1]-20],'#9ba38a',2);this.polygon([[a[0],a[1]-20],[a[0]+15,a[1]-17],[a[0],a[1]-10]],'#e7b85f');this.label('THE PLAYGROUND',11.5,4.3,108)}
 fountain(x,y,t){this.cube(x,y,1.8,1.8,7,'#c3c9b5');this.cube(x+.15,y+.15,1.5,1.5,1,'#a0c8bf',7);this.cube(x+.73,y+.73,.32,.32,24,'#d6d9c2',7);const p=this.p(x+.9,y+.9,31);const wave=this.motion?Math.sin(t/700)*3:0;this.line(p,[p[0],p[1]-15-wave],'#bce5d9',3);this.ctx.strokeStyle='#d9f2e5';this.ctx.lineWidth=1.5;this.ctx.beginPath();this.ctx.ellipse(p[0],p[1]+25,20+wave,8,0,0,Math.PI*2);this.ctx.stroke()}
 sandbox(){this.cube(3.8,11,2,1.8,5,'#c5a16f');this.cube(3.96,11.16,1.68,1.48,1,'#f1dbaa',5);this.cube(4.3,11.5,.4,.4,10,'#d99e83',6);this.cube(5,11.6,.35,.35,7,'#93b6b0',6);this.cube(4.8,12,.3,.3,6,'#b0a1c2',6);this.label('SANDBOX',4.8,12.9,-18)}
 storyGarden(){for(let i=0;i<5;i++){const a=i/5*Math.PI*2;this.cube(11.1+Math.cos(a)*.9,11.8+Math.sin(a)*.9,.35,.35,10,['#dca28b','#c5b47e','#aabf8c','#8eb3ad','#b5a3bc'][i])}this.cube(10.85,11.55,.8,.65,8,'#d5c39a');this.label('STORY CIRCLE',11.5,13.4,-8)}

 drawGround(){const main=this.ctx,width=52*D.arena.size+160,height=26*D.arena.size+230;let cached=this.groundLayer;
  if(!cached){const density=Math.min(1,2048/width,2048/height);try{cached=typeof OffscreenCanvas==='function'?new OffscreenCanvas(Math.ceil(width*density),Math.ceil(height*density)):typeof document!=='undefined'?document.createElement('canvas'):null;if(cached){cached.width=Math.ceil(width*density);cached.height=Math.ceil(height*density);const c=cached.getContext('2d');if(!c)cached=null;else{c.scale(density,density);c.translate(width/2,130);this.ctx=c;this.paintGround();this.groundLayer=cached}}}catch{cached=null}finally{this.ctx=main}}
  if(cached)main.drawImage(cached,-width/2,-130,width,height);else this.paintGround()
 }
 paintGround(){const c=this.ctx,w=this.season||D.commonGround,n=D.arena.size;c.fillStyle='#49604410';c.beginPath();c.ellipse(0,n*26+34,n*18,40,0,0,Math.PI*2);c.fill();this.shape([[0,n,0],[n,n,0],[n,n,-24],[n*.75,n,-66],[n*.5,n,-82],[0,n,-30]],'#b4a58c');this.shape([[n,0,0],[n,n,0],[n,n,-24],[n,n*.75,-60],[n,n*.375,-80],[n,0,-30]],'#a69984');for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=(x*7+y*13)%5;this.shape([[x,y,0],[x+1,y,0],[x+1,y+1,0],[x,y+1,0]],D.isPath(x,y)?shade(w.path,(v-2)*2):shade(QuestEnvironment.blend(D.zones[D.districtAt(x,y)]?.color||w.ground,w.ground,.8),Math.round(Math.sin(x*.31)*Math.cos(y*.24)*9)+(v-2)*2));if(D.isPath(x,y)){if((x+y)%3===0)this.line(this.p(x+.12,y+.9,.2),this.p(x+.88,y+.9,.2),'#c4bca447',.8)}else if(D.walkable(x,y)&&(x*11+y*7)%3!==0){const p=this.p(x+.45,y+.5,.3);c.strokeStyle=QuestEnvironment.blend(w.foliage||'#3c9f5a',w.ground,((x+y)%4)*.12);c.lineWidth=1;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(p[0]+i*3,p[1]);c.lineTo(p[0]+i*4,p[1]-4-((x*7+y*3+i+4)%4));c.stroke()}}}}
 welcomePlazaFloor(){
  // Walkable paving belongs below every object, never in the depth-sorted queue.
  const x=43,y=31,w=7.5,d=11;
  this.shape([[x,y,0],[x+w,y,0],[x+w,y+d,0],[x,y+d,0]],'#c9b99a');
  for(let row=0;row<11;row++)for(let col=0;col<6;col++){
   const left=x+.16+col*(w-.32)/6,top=y+.16+row*(d-.32)/11;
   this.shape([[left,top,0],[left+(w-.32)/6-.035,top,0],[left+(w-.32)/6-.035,top+(d-.32)/11-.035,0],[left,top+(d-.32)/11-.035,0]],(row+col)%2?'#f2e7cf':'#eadcc1');
  }
  const cx=46.75,cy=36.5;
  const ring=radius=>Array.from({length:32},(_,i)=>[cx+Math.cos(i*Math.PI/16)*radius,cy+Math.sin(i*Math.PI/16)*radius,0]);
  this.shape(ring(2.05),'#cda66c');this.shape(ring(1.9),'#f7edda');
  this.shape([[cx,cy-1.55,0],[cx+.45,cy-.45,0],[cx+1.55,cy,0],[cx+.45,cy+.45,0],[cx,cy+1.55,0],[cx-.45,cy+.45,0],[cx-1.55,cy,0],[cx-.45,cy-.45,0]],'#edab64');
  this.shape([[cx,cy-.55,0],[cx+.55,cy,0],[cx,cy+.55,0],[cx-.55,cy,0]],'#fff3dc');
 }
 draw(time){this.renderTime=time;this.applyResize();if(!this.w||!this.h)return;const followed=this.players.find(p=>p.id===this.focusId);if(followed){const pos=this.positionFor(followed,time);this.camera={x:pos.x,y:pos.y};this.updateCamera()}this.now=this.clock();this.season=QuestEnvironment.garden();this.labels=[];this.playerLabels=[];this.labelBoxes=[];if(this.groundStamp!==this.season.stamp){this.groundLayer=null;this.groundStamp=this.season.stamp}const c=this.ctx,w=this.season;c.fillStyle=w.sky;c.fillRect(0,0,this.w,this.h);const glow=c.createRadialGradient(this.w*.5,this.h*.35,10,this.w*.5,this.h*.35,this.w*.6);glow.addColorStop(0,'#fffdf299');glow.addColorStop(1,w.sky);c.fillStyle=glow;c.fillRect(0,0,this.w,this.h);this.drawBackdrop?.();c.save();c.translate(this.ox,this.oy);c.scale(this.scale,this.scale);this.drawGround();this.welcomePlazaFloor();
 const entities=[];const add=(depth,fn)=>entities.push({depth,fn});this.districtEntities(time,add);
 this.sceneryEntities(time,add);
 for(const[x,y]of[[44,32],[49,40]])add(x+y,()=>this.bench(x,y));
 for(const[x,y]of[[43.3,31.4],[49.4,31.4],[43.3,41],[49.4,41]])add(x+y,()=>this.flowers(x,y,this.season.flower));
 this.label('WELCOME · MEET LUCY',46.75,31,28);
 this.crowdSize=this.players.length;for(const p of this.players){const pos=this.positionFor(p,time);add(pos.x+pos.y+.2,()=>this.character(p,time));}
 add(87,()=>this.character({id:'moose-guide',name:'Lucy · guide',world:this.world,x:46.5,y:40.5,moving:false,avatar:{skin:'#b87850',shirt:'#f58220',hair:'#c99d59',style:'bob',hat:'cap',hatColor:'#242424',glasses:'round'}},time));
 entities.sort((a,b)=>a.depth-b.depth);for(const entity of entities)entity.fn();if(this.marker&&time-this.marker.at<2200){const p=this.p(this.marker.x,this.marker.y,2);c.strokeStyle='#f9f5df';c.lineWidth=2;c.beginPath();c.ellipse(p[0],p[1],13,6,0,0,Math.PI*2);c.stroke()}c.restore();this.drawLabels?.();this.drawSeasonOverlay(time);
 }
}
window.QuestWorldRenderer=WorldRenderer;
window.drawQuestAvatar=function(canvas,avatar){const c=canvas.getContext('2d'),r=Object.create(WorldRenderer.prototype);r.ctx=c;r.self='preview';r.positions=new Map();c.clearRect(0,0,canvas.width,canvas.height);c.fillStyle='#e9eedf';c.fillRect(0,0,canvas.width,canvas.height);c.save();c.translate(canvas.width/2,canvas.height*.84);r.character({id:'preview',x:0,y:0,avatar,moving:false},0,{large:true});c.restore()};
})();
