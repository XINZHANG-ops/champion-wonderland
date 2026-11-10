'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../site/live-transport.js'),'utf8');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve()};
async function harness({transport='sse',noSSE=false,configFails=false}={}){
 let now=0,id=0,hold=null;const timers=new Map(),streams=[],polls=[],events=[];
 class Stream{constructor(url){this.url=url;this.listeners={};this.closed=false;streams.push(this)}addEventListener(type,fn){this.listeners[type]=fn}close(){this.closed=true}emit(type,data){this.listeners[type]({data:JSON.stringify(data)})}}
 const context={location:{hostname:'lucy-kang1022.github.io'},AbortController,setTimeout:(fn,delay)=>{const key=++id;timers.set(key,{fn,at:now+delay});return key},clearTimeout:key=>timers.delete(key),QuestAPI:{url:p=>'https://game.test'+p,request:async(p,options)=>{
  if(p==='/api/config'){if(configFails)throw Error('temporary config failure');return{json:async()=>({transport})}}
  polls.push({p,options});if(hold){const result=hold;hold=null;return result}
  return{ok:true,json:async()=>({players:[],rosterRevision:3,revision:polls.length,at:now})};
 }}};
 if(!noSSE)context.EventSource=Stream;context.window=context;vm.createContext(context);vm.runInContext(source,context);
 const client=context.QuestLive.open();client.onerror=()=>events.push('error');client.addEventListener('world',e=>events.push(JSON.parse(e.data)));client.addEventListener('movement',e=>events.push(JSON.parse(e.data)));await flush();
 return{client,streams,polls,events,timers,hold(promise){hold=promise},async advance(ms){now+=ms;for(const [key,t]of [...timers])if(t.at<=now){timers.delete(key);t.fn()}await flush()}};
}
(async()=>{
 const h=await harness(),s=h.streams[0];assert(s);s.emit('world',{players:[],revision:1});await flush();assert.equal(h.polls.length,0);
 s.onerror();await flush();assert.equal(h.polls.length,1);assert(!s.closed,'A transient SSE error keeps native reconnection alive');
 s.emit('world',{players:[],revision:20});await h.advance(6000);assert.equal(h.polls.length,1,'Streaming recovery stops fallback polling');
 let resolve;h.hold(new Promise(r=>resolve=r));s.onerror();await flush();assert.equal(h.polls.length,2);const pending=h.polls[1];s.emit('world',{players:[],revision:30});assert(pending.options.signal.aborted);
 resolve({ok:true,json:async()=>({players:[],revision:2})});await flush();assert(!h.events.some(e=>e.revision===2),'A late poll cannot overwrite the recovered stream');await h.advance(6000);assert.equal(h.polls.length,2);
 h.client.close();s.emit('world',{players:[],revision:99});s.onerror();await h.advance(20000);assert(s.closed);assert(!h.events.some(e=>e.revision===99));assert.equal(h.timers.size,0,'Closing cleans up all timers and callbacks');
 const timeout=await harness();await timeout.advance(4000);assert.equal(timeout.polls.length,1,'A slow initial stream falls back');assert(!timeout.streams[0].closed);timeout.streams[0].emit('world',{players:[],revision:10});await timeout.advance(5000);assert.equal(timeout.polls.length,1);timeout.client.close();
 for(const options of [{transport:'poll'},{noSSE:true}]){const p=await harness(options);assert.equal(p.polls.length,1);assert.equal(p.streams.length,0);await p.advance(1200);assert.equal(p.polls.length,2);p.client.close()}
 const config=await harness({configFails:true});assert.equal(config.streams.length,1,'A transient config error must not permanently force polling');config.client.close();
 console.log('PASS: SSE fallback and native recovery, slow startup, stale-poll rejection, close cleanup, forced polling, missing EventSource and transient config failure.');
})().catch(error=>{console.error(error);process.exitCode=1});
