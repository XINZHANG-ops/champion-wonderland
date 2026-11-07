(function(){
 const P=QuestWorldRenderer.prototype;
 const wood='#ac8056',paper='#fff4db',chalk='#e8efcf';

 // A supported board with a shallow frame and a ledge. Markings lie in the board's plane.
 function board(r,x,y,face,icon){
  for(const dx of [.14,1.28]){
   r.cube(x+dx-.08,y-.16,.28,.46,3,wood);
   r.cube(x+dx,y,.12,.12,39,wood);
  }
  r.cube(x,y,1.55,.13,26,wood,16);
  const front=y+.14;
  r.shape([[x+.07,front,18],[x+1.48,front,18],[x+1.48,front,40],[x+.07,front,40]],face);
  const mark=(a,h,b,k)=>r.line(r.p(x+a,front,h),r.p(x+b,front,k),chalk,1.7);
  if(icon==='book'){
   for(const direction of [-1,1]){
    const outside=.78+direction*.47;
    mark(.78,32,outside,35);mark(outside,35,outside,25);mark(outside,25,.78,22);
   }
   mark(.78,32,.78,22);
  }else if(icon==='chart'){
   for(let i=0;i<3;i++)mark(.4+i*.35,22,.4+i*.35,26+i*4);
  }else if(icon==='art'){
   mark(.28,23,.68,34);mark(.68,34,.94,28);mark(.94,28,1.12,31);mark(1.12,31,1.32,23);
  }else{
   mark(.62,24,.62,35);mark(.62,35,1.07,29);mark(1.07,29,.62,24);
  }
  r.cube(x-.03,y+.12,1.61,.13,2,wood,15);
 }
 function table(r,x,y,w=1.25,d=.68){
  for(const dx of [.08,w-.18])for(const dy of [.06,d-.14])r.cube(x+dx,y+dy,.1,.1,15,wood);
  r.cube(x,y,w,d,3,'#dfbe91',15);
 }
 const roles={
  educator:['Teaching corner','book'],explorer:['Mission pavilion','book'],
  designer:['Creative studio','art'],admin:['Control center','chart'],
  leader:['Strategy center','chart'],training:['Skills station','chart']
 };
 const products=['creator','access','lumi','services','performance','achievement','link','optimization'];
 P.missionEntities=function(add){
  const ctx=this.context,z=QuestWorldData.zones[this.world];
  if(!ctx||!z||z.id==='hq')return;
  const prop=(x,y,paint)=>add(z.origin[0]+z.origin[1]+(x+y)*z.scale,()=>this.district(z.id,paint));
  const sign=(x,y,title,icon)=>prop(x+.78,y+.12,()=>{
   board(this,x,y,'#406858',icon);
   this.label(title.toUpperCase(),x+.78,y,54);
  });
  const seat=(x,y)=>prop(x+.53,y+.2,()=>this.bench(x,y));
  const [roleTitle,roleIcon]=roles[ctx.role]||roles.educator;
  sign(10.4,10.7,roleTitle,roleIcon);
  const challenge=ctx.challengeText||'';
  if(challenge){
   if(ctx.missionId==='analytics')sign(4.7,7.2,'Learning analytics lab','chart');
   else if(ctx.missionId==='interactive')sign(4.7,7.2,'Interactive course studio','play');
   else if(/accessib/i.test(challenge))prop(5.05,7.65,()=>{
    this.shape([[4.6,6.8,18],[5.5,6.8,18],[5.5,8.5,1],[4.6,8.5,1]],'#dbb17e');
    for(let i=0;i<4;i++)this.line(this.p(4.6,7+i*.4,16-i*4),this.p(5.5,7+i*.4,16-i*4),'#f0d6aa',1);
    this.label('ACCESS FOR EVERYONE',5.1,8.6,25);
   });
   else if(/AI|time|content|development/i.test(challenge))sign(4.7,7.2,'Idea lab','art');
   else{seat(4.5,7.1);seat(6.2,7.4);this.district(z.id,()=>this.label('CONNECT & DISCOVER',5.5,7.4,48))}
  }
  const step=ctx.step||3;
  if(step>=4&&ctx.products?.length){
   for(const id of ctx.products){
    const i=products.indexOf(id);if(i<0)continue;
    const x=3.3+i*.6;
    prop(x+.28,13.28,()=>{
     this.cube(x,13,.55,.55,6,['#ed984f','#8fa594','#a8a1bb','#a0b9be','#e9bb78','#99ad83','#84a2b7','#bd9d75'][i]);
     const p=this.p(x+.28,13.28,7);
     this.text(['C+','A+','AI','LS','P+','A+','LINK','OS'][i],p[0],p[1],7,'#493b2b');
    });
   }
   this.district(z.id,()=>this.label('YOUR POWER-UPS',5,13.6,24));
  }
  if(step>=5){
   const ch=ctx.channels||[];
   if(ch.includes('workshop')){seat(3.5,10.1);seat(5.1,10.1);prop(4.45,11,()=>table(this,4.1,10.7,.7,.7))}
   if(ch.includes('webinar')||ch.includes('video'))sign(6,10.4,'Screening room','play');
   if(ch.includes('conference'))prop(4.4,7.75,()=>{this.cube(3.4,7.3,2,.9,5,'#cbb18e');this.cube(4.25,7.4,.3,.3,20,wood,5);this.cube(4.16,7.34,.5,.43,3,wood,25)});
   if(ch.includes('email'))prop(6.4,12.8,()=>{this.cube(6.3,12.7,.12,.12,18,wood);this.cube(6.1,12.5,.6,.5,12,'#eea45f',18);this.cube(6.2,13,.37,.02,2,'#705745',25)});
   if(ch.includes('paper'))prop(3.8,12.6,()=>{table(this,3.4,12.2,.8,.8);this.cube(3.5,12.3,.6,.5,2,paper,18)});
   if(ch.includes('roundtable')||ch.includes('officehours')){
    seat(10.5,7.2);seat(12.1,7.2);prop(11.6,7.9,()=>{table(this,11.1,7.6);this.label('MEET & EXCHANGE',11.5,7.8,55)});
   }
   if(ch.includes('selfpaced'))prop(7.05,12.2,()=>{table(this,6.8,11.9,.7,.6);for(let i=0;i<3;i++)this.cube(6.85,12,.5,.35,3,['#eeb67b','#b7a3cd','#8eafac'][i],18+i*3)});
   if(ch.includes('sandbox'))sign(10.6,13,'Try it yourself','play');
  }
  if(ctx.storyTypes?.length)sign(2.5,9,'Customer stories','book');
  if(step>=6)prop(6.75,7.55,()=>{
   this.cube(6.3,7.1,.9,.9,5,'#d5b986');this.cube(6.65,7.45,.18,.18,24,'#e6ba63',5);
   const p=this.p(6.75,7.55,41);
   this.polygon([[p[0]-10,p[1]-12],[p[0]+10,p[1]-12],[p[0]+8,p[1]+3],[p[0],p[1]+11],[p[0]-8,p[1]+3]],'#e5b45a');
   this.text('✦',p[0],p[1]+1,12,paper);this.label('MISSION COMPLETE',6.8,7.6,65);
  });
 };
})();
