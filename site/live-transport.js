(function(){
'use strict';
// Quick Tunnels do not stream SSE. Poll compact movement packets there instead.
function open(){
 const listeners=new Map();let closed=false,stream=null,timer=null,roster=-1,controller=null,polling=false,watchdog=null;
 const client={onerror:null,addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn)},close(){closed=true;stream?.close();clearTimeout(timer);clearTimeout(watchdog);controller?.abort()}};
 function emit(type,data){for(const fn of listeners.get(type)||[])fn({data:JSON.stringify(data)})}
 async function poll(){if(closed)return;controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);let delay=800+Math.random()*400;try{const r=await QuestAPI.request('/api/world?roster='+roster,{cache:'no-store',signal:controller.signal});if(!r.ok)throw Error('World connection unavailable');const data=await r.json();if(closed)return;if(data.players){roster=data.rosterRevision;emit('world',data)}else emit('movement',data)}catch(error){if(!closed){client.onerror?.(error);delay=2500+Math.random()*1500}}finally{clearTimeout(timeout);if(!closed)timer=setTimeout(poll,delay)}}
 function startPolling(){if(closed||polling)return;polling=true;stream?.close();clearTimeout(watchdog);poll()}
 Promise.resolve().then(async()=>{let usePolling=location.hostname.endsWith('.trycloudflare.com');if(!usePolling){try{usePolling=(await(await QuestAPI.request('/api/config')).json()).transport==='poll'}catch{usePolling=true}}if(closed)return;if(usePolling||typeof EventSource!=='function')return startPolling();stream=new EventSource(QuestAPI.url('/api/events'));watchdog=setTimeout(startPolling,4000);stream.addEventListener('world',e=>{clearTimeout(watchdog);for(const fn of listeners.get('world')||[])fn(e)});stream.addEventListener('movement',e=>{for(const fn of listeners.get('movement')||[])fn(e)});stream.onerror=()=>{client.onerror?.();startPolling()}});
 return client;
}
window.QuestLive={open};
})();
