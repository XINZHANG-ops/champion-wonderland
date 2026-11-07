(function(root){
'use strict';
const duration=20000,transition=4000;
const seasons=[
 {id:'spring',name:'Spring',sky:'#edf6ef',ground:'#c6d9b3',path:'#eee3c9',foliage:'#8dbb76',flower:'#efa7b8',water:'#9cd5db'},
 {id:'summer',name:'Summer',sky:'#edf5ee',ground:'#97c96f',path:'#eee4ca',foliage:'#3f9b56',flower:'#f3b96b',water:'#82c5ce'},
 {id:'autumn',name:'Autumn',sky:'#faf0e2',ground:'#d8c398',path:'#e9d6b7',foliage:'#c98348',flower:'#d9a25e',water:'#a3c6c2'},
 {id:'winter',name:'Winter',sky:'#edf3f7',ground:'#e2e9e3',path:'#e6ddd0',foliage:'#a5bdb0',flower:'#d8dfdf',water:'#c0dce6'}
];
function blend(a,b,t){return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('')}
function at(time=Date.now()){
 const cycle=((time%(duration*4))+duration*4)%(duration*4),index=Math.floor(cycle/duration),phase=cycle%duration,t=Math.max(0,(phase-duration+transition)/transition),mix=t*t*(3-2*t),current=seasons[index],next=seasons[(index+1)%4],result={...current,index,mix,stamp:index+':'+Math.round(mix*8),label:mix>.05?current.name+' → '+next.name:current.name};
 for(const key of ['sky','ground','path','foliage','flower','water'])result[key]=blend(current[key],next[key],mix);
 result.snow=(current.id==='winter'?1:0)*(1-mix)+(next.id==='winter'?1:0)*mix;
 return result;
}
function garden(time=Date.now()){return at(time);}
const api={garden,seasons,duration,transition,blend,at};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.QuestEnvironment=api;
})(typeof window!=='undefined'?window:globalThis);
