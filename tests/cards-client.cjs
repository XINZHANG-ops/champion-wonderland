'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../site');
(async()=>{
 const listeners=new Map(),elements=[],timers=new Map();let serial=0;
 const sandbox={URL,crypto,location:{origin:'https://lucy-kang1022.github.io'},setTimeout:fn=>{timers.set(++serial,fn);return serial},clearTimeout:id=>timers.delete(id),window:{addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:type=>listeners.delete(type)},document:{body:{append(...nodes){elements.push(...nodes)}},createElement(tag){return{tag,children:[],append(child){this.children.push(child)},remove(){this.removed=true},submit(){}}}}};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(root,'google-forms-client.js'),'utf8'),sandbox);
 const endpoint='https://script.google.com/macros/s/CardTest/exec',id='card-client-test',record={workEmail:'private@example.test'},card={requested:true,portrait:'data:image/png;base64,'+'A'.repeat(100000)};
 const waiting=sandbox.window.QuestGoogleForms.submit(endpoint,record,id,card);
 const payload=JSON.parse(elements.find(e=>e.tag==='form').children[0].value);assert.equal(payload.action,'card');assert.equal(payload.card.portrait,card.portrait);assert.equal(payload.record.workEmail,record.workEmail);
 const message={type:'champion-card-result',version:'champion-forms-v1',submissionId:id,ok:true,status:'queued'};
 listeners.get('message')({origin:'https://evil.example',data:message});assert(listeners.has('message'));
 listeners.get('message')({origin:'https://abc-script.googleusercontent.com',data:{...message,type:'champion-forms-result'}});assert(listeners.has('message'),'a Form save is not a queued email');
 listeners.get('message')({origin:'https://abc-script.googleusercontent.com',data:message});assert.equal((await waiting).status,'queued');assert.equal(timers.size,0);
 const another=sandbox.window.QuestGoogleForms.submit(endpoint,record,'poll-card',card);const [timer,fire]=[...timers.entries()].at(-1);timers.delete(timer);fire();const script=elements.filter(e=>e.tag==='script').at(-1),url=new URL(script.src);assert.equal(url.searchParams.get('cardReceipt'),'poll-card');assert(!url.searchParams.has('receipt'));assert(!script.src.includes('private@example'));sandbox.window[url.searchParams.get('callback')]({...message,submissionId:'poll-card',status:'sent'});assert.equal((await another).status,'sent');
 const art=require('../site/card-art.js'),template=require('../site/card-template.js');assert.equal(Object.keys(art.themes).length,5);for(const type of Object.keys(art.themes)){const bg=art.background(type);assert(bg.indexOf('id="card-road"')<bg.indexOf('id="card-building"'));}
 const html=template.adventureCard({name:'<script>',world:'HE',missions:['A & B']});assert(html.includes('&lt;script&gt;'));assert(html.includes('Scan to join D2L Champions'));assert(!html.includes('YOUR MOOSE. YOUR ADVENTURE.'));
 console.log('PASS: card payload goes only to Google, private fields absent from status URLs, separate save/mail receipts, retry identity, fixed scenery and escaped approved template. No live request sent.');
})().catch(error=>{console.error(error);process.exitCode=1});
