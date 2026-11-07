(function(){
'use strict';const D=QuestWorldData,E=QuestEnvironment,P=QuestWorldRenderer.prototype;
const treeSprites=new Map();
for(const method of D.scenery.treeKinds){const paint=P[method];P[method]=function(x,y,size=1,color){const s=Math.round(size*20)/20,density=Math.min(2,Math.max(1,Math.ceil((this.scale||1)*(typeof devicePixelRatio==='number'?devicePixelRatio:1)))),key=[method,s,color,this.season?.stamp,density].join(':');let sprite=treeSprites.get(key);if(!sprite){try{sprite=typeof OffscreenCanvas==='function'?new OffscreenCanvas(84*density,125*density):typeof document!=='undefined'?document.createElement('canvas'):null;if(!sprite?.getContext)return paint.call(this,x,y,size,color);sprite.width=84*density;sprite.height=125*density;const c=sprite.getContext('2d');c.scale(density,density);c.translate(42,115);const r=Object.create(P);r.ctx=c;r.season=this.season;paint.call(r,0,0,s,color);treeSprites.set(key,sprite);if(treeSprites.size>256)treeSprites.delete(treeSprites.keys().next().value)}catch{return paint.call(this,x,y,size,color)}}const p=this.p(x,y);this.ctx.drawImage(sprite,p[0]-42,p[1]-115,84,125)}}
// A distant, decorative skyline. It has no world cells or walking destinations.
P.drawBackdrop=function(){const c=this.ctx,w=this.w,h=this.h,base=Math.max(105,Math.min(h*.26,205)),towerX=w*.61,towerH=Math.min(165,h*.24),far=E.blend(this.season.sky,'#728b96',.35),near=E.blend(this.season.sky,'#687e89',.48);c.save();c.globalAlpha=.75;
 const blocks=[[.02,38,42],[.08,55,34],[.13,82,38],[.19,57,28],[.24,102,32],[.30,66,43],[.36,118,34],[.42,88,27],[.48,106,34],[.55,58,22],[.67,92,38],[.74,120,35],[.81,78,45],[.88,108,31],[.94,60,36]];
 for(const [at,height,width]of blocks){const x=w*at,bh=height*Math.min(1,h/700);this.polygon([[x,base],[x,base-bh],[x+width,base-bh-5],[x+width,base]],far);this.polygon([[x+width*.7,base-bh-3],[x+width,base-bh-5],[x+width,base],[x+width*.7,base]],near);for(let row=0;row<3;row++)for(let col=0;col<3;col++){c.fillStyle=E.blend(far,'#fff9e4',.4);c.fillRect(x+6+col*8,base-bh+14+row*16,3,5)}}
 this.polygon([[towerX-8,base],[towerX-4,base-towerH*.7],[towerX-2,base-towerH],[towerX+2,base-towerH],[towerX+5,base-towerH*.7],[towerX+10,base]],near);this.polygon([[towerX-17,base-towerH*.69],[towerX-12,base-towerH*.75],[towerX+13,base-towerH*.75],[towerX+18,base-towerH*.69],[towerX+9,base-towerH*.64],[towerX-10,base-towerH*.64]],near);this.line([towerX,base-towerH],[towerX,base-towerH-22],near,2);this.line([towerX-12,base-towerH*.7],[towerX+13,base-towerH*.7],E.blend(near,'#f8f6e9',.5),2);this.text('CN TOWER',towerX+48,base-towerH*.66,9,near);
 const domeX=w*.57;c.fillStyle=far;c.beginPath();c.ellipse(domeX,base,35,15,0,Math.PI,Math.PI*2);c.fill();c.fillStyle=E.blend(this.season.water,this.season.sky,.6);c.fillRect(0,base+4,w,9);c.globalAlpha=1;this.text('TORONTO · IGNITE CANADA',w*.5,Math.max(17,base-towerH-28),10,'#6e8587');c.restore()};

P.headquarters=function(){const x=4.5,y=33.3;this.cube(x,y,9,2.8,60,'#eee9dd');this.cube(x-.1,y-.1,9.2,3,5,'#435d51',60);this.cube(x,y+2.81,9,.12,5,'#f58220',47);for(let i=0;i<8;i++)this.window(x+.2+i*1.05,y+2.93,10,.7,32,'#7ba59e');this.window(x+5.5,y+2.94,0,.9,39,'#426c63');for(let i=0;i<4;i++){this.cube(x+.5+i*2,y+.4,1.1,1,5,'#d3c4a8',65);this.cube(x+.6+i*2,y+.5,.9,.8,12,this.season.foliage,70)}this.label('D2L HQ',x+4.5,y+1.8,111)};
P.pond=function(){const p=D.scenery.pond,c=this.ctx;this.cube(p.x-.25,p.y-.25,p.w+.5,p.d+.5,3,'#bec8b3');this.shape([[p.x,p.y,4],[p.x+p.w,p.y,4],[p.x+p.w,p.y+p.d,4],[p.x,p.y+p.d,4]],this.season.water);for(let i=0;i<6;i++){const q=this.p(p.x+1.2+i*1.5,p.y+1.3+(i%3)*2,5);c.strokeStyle=this.season.snow>.6?'#f8fcff':'#e4f2e9';c.lineWidth=1.4;c.beginPath();c.ellipse(q[0],q[1],12+i,4,0,0,Math.PI*2);c.stroke()}const left=p.x-.45,span=p.w+.9,mid=p.y+3.85,steps=14;
 const height=t=>3+13*Math.sin(Math.PI*t);
 const rail=(i,side)=>[left+span*i/steps,mid+side*.55,height(i/steps)+14];
 for(let i=0;i<steps;i++){
  const a=left+span*i/steps,b=left+span*(i+1)/steps,h=height(i/steps),k=height((i+1)/steps);
  for(const side of [-1,1]){
   const y=mid+side*.60;
   this.shape([[a,y,h],[b,y,k],[b,y,k-3],[a,y,h-3]],'#aa8963');
  }
  this.shape([[a,mid-.60,h],[b,mid-.60,k],[b,mid+.60,k],[a,mid+.60,h]],i%2?'#cfb58c':'#d6bd95');
 }
 for(const side of [-1,1])for(let i=0;i<=steps;i+=2){
  const point=rail(i,side);
  this.cube(point[0]-.055,point[1]-.055,.11,.11,14,'#a88a68',height(i/steps));
  if(i<steps)this.segment(point,rail(i+2,side),'#ac8c69',3);
 }
 this.label(this.season.snow>.6?'FROST LAKE':'REFLECTION LAKE',60.5,40,36)};
P.swingSet=function(x,y,time){
 const ridgeY=y+1.15,top=62,drop=46;
 const frame=(u)=>{
  for(const footY of [y+.12,y+2.18])this.segment([u,footY,0],[u,ridgeY,top],'#749285',5);
  this.segment([u,y+.36,14],[u,y+1.94,14],'#91aa9c',3);
 };
 frame(x+.12);
 for(const dx of [.58,2.03]){
  const angle=this.motion ? .25*Math.sin(time/850+dx) : 0;
  const seatY=ridgeY+drop*Math.sin(angle)/32,seatTop=top-drop*Math.cos(angle);
  this.cube(x+dx,seatY-.20,.96,.4,3.5,'#d5a066',seatTop-3.5);
  for(const offset of [.07,.89]){
   this.segment([x+dx+offset,ridgeY,top],[x+dx+offset,seatY,seatTop],'#536b60',2.2);
  }
 }
 frame(x+3.61);
 this.cube(x,ridgeY-.09,3.76,.18,5,'#ae875e',top-1);
};
P.landmark=function(s,time){const{x,y,w,d,kind}=s;if(kind==='research'){this.cube(x,y,w,d,60,'#e2d9bb');this.roof(x,y,w,d,60,'#7c9285');for(let i=0;i<5;i++){this.window(x+.35+i*.85,y+d+.02,15,.55,30,'#87aea5');this.cube(x+.2+i*.9,y+d+.1,.15,.15,44,'#f1ead5',5)}this.cube(x+.3,y+d+.6,w-.6,.5,18,'#b8a17f');for(let i=0;i<9;i++)this.cube(x+.5+i*.4,y+d+.62,.25,.25,12+i%3*3,['#759c94','#b89abb','#d6a373'][i%3],18)}
 else if(kind==='lecture'){
  this.cube(x+1.15,y-.42,2.45,.75,8,'#dfc9aa');
  for(const u of [1.38,3.28])this.cube(x+u,y-.3,.11,.11,38,'#8b795f',8);
  this.cube(x+1.22,y-.32,2.31,.13,25,'#57796b',23);
  for(let row=0;row<3;row++)for(let col=0;col<3;col++)this.bench(x+.24+col*1.48,y+.66+row*.95,'north');
 }
 else if(kind==='innovation'){this.cube(x,y,w,d,66,'#a9c3c0');this.cube(x-.1,y-.1,w+.2,d+.2,5,'#dce4dc',66);for(let row=0;row<2;row++)for(let i=0;i<5;i++)this.window(x+.25+i*.92,y+d+.02,12+row*25,.64,18,'#688e98');for(let i=0;i<3;i++)this.cube(x+.5+i*1.3,y+.6,1,2,3,'#587580',71)}
 else if(kind==='cityhall'){this.cube(x,y,w,d,65,'#ddd9c8');this.roof(x-.1,y-.1,w+.2,d+.2,65,'#85998e');for(let i=0;i<6;i++)this.cube(x+.2+i*.8,y+d,.18,.2,46,'#faf2dc',7);this.cube(x-.2,y+d-.1,w+.4,.9,7,'#c4c6b4');this.window(x+2,y+d+.2,7,.9,33,'#759c91');this.cube(x+w+.8,y+.6,.1,.1,94,'#8c9c91');const p=this.p(x+w+.85,y+.65,94);this.polygon([[p[0],p[1]],[p[0]+27,p[1]+2],[p[0]+26,p[1]+18],[p[0],p[1]+15]],'#d96b58');this.polygon([[p[0]+8,p[1]+1],[p[0]+18,p[1]+1],[p[0]+18,p[1]+17],[p[0]+8,p[1]+16]],'#fff4e4')}
 else if(kind==='slide')this.slide(x+1.1,y+.25,'#e2ac6b');
 else if(kind==='swings')this.swingSet(x,y,time);
 this.label(s.name,x+w/2,y+d/2,kind==='cityhall'?120:kind==='research'?113:kind==='innovation'?105:kind==='swings'?90:kind==='slide'?84:58)};

P.picnicFloor=function(){this.shape([[23,29,0],[26,29,0],[26,31,0],[23,31,0]],'#e9bc8b')};
function facePath(x,y){
 for(let d=1;d<=5;d++)for(const [face,dx,dy] of [['south',0,1],['north',0,-1],['east',1,0],['west',-1,0]]){
  if(D.isPath(x+dx*d,y+dy*d)&&!D.isPath(x+dx*(d-1),y+dy*(d-1)))return face;
 }
 return 'south';
}
P.sceneryEntities=function(time,add){D.scenery.trees.forEach(([x,y,s],i)=>add(x+y,()=>this[D.scenery.treeKinds[i%D.scenery.treeKinds.length]](x,y,s)));for(const[x,y,variant]of D.scenery.meadows)add(x+y,()=>this.wildflowers(x,y,variant));for(const [x,y]of D.scenery.benches)add(x+y+.71,()=>this.bench(x,y,facePath(x,y)));for(const [x,y]of D.scenery.flowerbeds)add(x+y,()=>{this.cube(x,y,1.2,.65,3,'#d1bea0');this.flowers(x+.1,y+.1,this.season.flower,3);this.flowers(x+.6,y+.2,this.season.flower,3)});for(const [x,y,n]of D.scenery.hedges)for(let i=0;i<n;i++)add(x+y+i*.7,()=>this.shrub(x,y+i*.7,.8));for(const s of D.scenery.structures)add(s.x+s.y+(s.w+s.d)/2,()=>this.landmark(s,time));add(99,()=>this.pond());add(72.55,()=>this.pavilion(36,34));
 for(const [x,facing] of [[20.8,'east'],[23.7,'west']])add(x+36.71,()=>this.bench(x,36,facing));
 add(58.9,()=>this.table(22.35,35.85,.85,.7));this.label('TEAM COURTYARD',23,37,42);
 for(const[x,y]of[[44,9],[48,20],[46,48],[48,62],[54,30],[68,44]])add(x+y,()=>{this.cube(x,y,.12,.12,39,'#8e9c89');this.cube(x-.09,y-.09,.30,.30,3,'#708879',37);this.cube(x-.07,y-.07,.26,.26,8,'#f4e8b7',40);this.cube(x-.1,y-.1,.32,.32,2,'#708879',48)});
 for(const[x,y]of[[54.5,34],[54.5,39],[66.5,35],[66.5,39]])add(x+y,()=>{this.cube(x,y,.5,.35,6,'#a4afa3');for(let i=0;i<4;i++)this.line(this.p(x+i*.1,y,4),this.p(x+i*.1,y,22+i*3),'#799d70',2)});
 for(const [x,y] of [[23,28.5],[25,30.5]])add(x+y+.71,()=>this.bench(x,y,y<29?'south':'north'));
 this.label('PICNIC MEADOW',24.5,30,30);
 for(const x of [27,29.5,32]){
  add(x+63.85,()=>this.table(x,63,.85,.85));
  add(x+64.71,()=>this.bench(x,64,'north'));
 }
 this.label('COLLABORATION CAFE',30,64,44);
 for(const [name,x,y,toX,toY] of [['LIBRARY',22,12,27,8],['PLAY GARDEN',49,24,56,21],['D2L HQ',31,37,9,35],['CIVIC GARDEN',49,54,65,62]]){
  add(x+y,()=>{
   this.cube(x-.065,y-.065,.13,.13,27,'#947b58');
   const left=this.p(toX,toY)[0]<this.p(x,y)[0],dir=left?-1:1;
   const tip=this.p(x,y,24),[u,v]=tip;
   this.polygon([[u-12*dir,v-4],[u+5*dir,v-4],[u+5*dir,v-7],[u+14*dir,v],[u+5*dir,v+7],[u+5*dir,v+4],[u-12*dir,v+4]],'#b48d58');
   if(this.zoom>1.45)this.label(left?'← '+name:name+' →',x,y,43);
  });
 }
};

// Collect world anchors, then render readable badges in screen pixels, independent of zoom.
P.label=function(name,x,y,z=0){if(!this.labels)this.labels=[];this.labels.push({name,point:this.p(x,y,z)})};
P.drawLabels=function(){
 const c=this.ctx,items=this.labels?.splice(0)||[],names=this.playerLabels?.splice(0)||[],mobile=this.w<720;
 const overlaps=(a,b,pad=4)=>a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y;
 const screen=point=>({x:this.ox+point[0]*this.scale,y:this.oy+point[1]*this.scale});
 const bodies=this.players.map(p=>{const position=this.positionFor(p,this.renderTime||0),at=screen(this.p(position.x,position.y)),size=this.scale*(p.avatar?.bodyScale||1);return {id:p.id,x:at.x-56*size-8,y:at.y-140*size-8,w:112*size+16,h:155*size+16}});
 const priority=name=>/WONDERLAND/.test(name)?5:/UNIVERSITY|RESEARCH LIBRARY|CITY HALL|D2L HQ|THE PLAYGROUND|TRAINING HUB/.test(name)?4:/LIBRARY|SLIDE|SWING|INNOVATION/.test(name)?3:1;
 const paint=(name,box,self=false)=>{c.fillStyle=self?'#252525':'#fffdf4ed';c.strokeStyle=self?'#252525':'#ccd6c2';c.lineWidth=.8;c.beginPath();c.roundRect(box.x,box.y,box.w,box.h,7);c.fill();c.stroke();this.text(name,box.x+box.w/2,box.y+15,10,self?'#fff8eb':'#4c6251')};
 this.labelBoxes=this.labelBoxes||[];c.save();c.font='600 10px DM Sans, Arial';
 for(const item of names.sort((a,b)=>(b.self?2:b.focused?1:0)-(a.self?2:a.focused?1:0)||String(a.id).localeCompare(String(b.id)))){
  const at=screen(item.point),width=c.measureText(item.name).width+16;
  const box={x:at.x-width/2,y:at.y-20,w:width,h:22};if(at.x<0||at.x>this.w||at.y<0||at.y>this.h)continue;
  if(!item.self&&(this.labelBoxes.some(b=>overlaps(box,b))||bodies.some(b=>b.id!==item.id&&overlaps(box,b,0))))continue;
  paint(item.name,box,item.self);this.labelBoxes.push(box);
 }
 const limit=this.zoom<2?(mobile?3:6):this.zoom<5?(mobile?5:10):(mobile?8:16);let count=0;
 for(const item of items.sort((a,b)=>priority(b.name)-priority(a.name))){
  if(count>=limit)break;if(this.zoom<2&&priority(item.name)<4)continue;
  const at=screen(item.point),width=c.measureText(item.name).width+16,box={x:at.x-width/2,y:at.y-16,w:width,h:22};
  // Keep badges at their landmark; omit a blocked label instead of stacking it over a visitor.
  if(box.x<8||box.x+width>this.w-8||box.y<8||box.y+box.h>this.h-8||this.labelBoxes.some(b=>overlaps(box,b))||bodies.some(b=>overlaps(box,b)))continue;
  paint(item.name,box);this.labelBoxes.push(box);count++;
 }
 c.restore()
};
})();
