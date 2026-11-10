(function(){
'use strict';
function open(){
 const listeners=new Map();let closed=false,stream=null,timer=null,roster=-1,controller=null,polling=false,watchdog=null,pollEpoch=0;
 const client={onerror:null,addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn)},close(){closed=true;polling=false;pollEpoch++;stream?.close();clearTimeout(timer);clearTimeout(watchdog);controller?.abort()}};
 function emit(type,data){for(const fn of listeners.get(type)||[])fn({data:JSON.stringify(data)})}
 async function poll(){
  if(closed||!polling)return;
  const epoch=pollEpoch,request=new AbortController();controller=request;const timeout=setTimeout(()=>request.abort(),10000);let delay=800+Math.random()*400;
  try{const r=await QuestAPI.request('/api/world?roster='+roster,{cache:'no-store',signal:request.signal});if(!r.ok)throw Error('World connection unavailable');const data=await r.json();if(closed||!polling||epoch!==pollEpoch)return;if(data.players){roster=data.rosterRevision;emit('world',data)}else emit('movement',data)}
  catch(error){if(!closed&&polling&&epoch===pollEpoch){client.onerror?.(error);delay=2500+Math.random()*1500}}
  finally{clearTimeout(timeout);if(controller===request)controller=null;if(!closed&&polling&&epoch===pollEpoch)timer=setTimeout(poll,delay)}
 }
 function startPolling(){if(closed||polling)return;polling=true;pollEpoch++;clearTimeout(watchdog);void poll()}
 function receive(type,e){
  if(closed)return;
  // Keep EventSource alive during fallback so its native reconnect can recover streaming.
  polling=false;pollEpoch++;clearTimeout(timer);clearTimeout(watchdog);controller?.abort();
  for(const fn of listeners.get(type)||[])fn(e);
 }
 Promise.resolve().then(async()=>{
  let usePolling=location.hostname.endsWith('.trycloudflare.com');
  if(!usePolling){try{usePolling=(await(await QuestAPI.request('/api/config')).json()).transport==='poll'}catch{}}
  if(closed)return;if(usePolling||typeof EventSource!=='function')return startPolling();
  try{stream=new EventSource(QuestAPI.url('/api/events'));watchdog=setTimeout(startPolling,4000);stream.addEventListener('world',e=>receive('world',e));stream.addEventListener('movement',e=>receive('movement',e));stream.onerror=()=>{if(!closed){client.onerror?.();startPolling()}}}
  catch{startPolling()}
 });
 return client;
}
window.QuestLive={open};
})();
