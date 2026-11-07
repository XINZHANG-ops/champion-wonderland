(function(root){
 'use strict';
 const cards=new Map();
 const list=value=>Array.isArray(value)?value.filter(x=>typeof x==='string'):[];
 function model(record){
  const theme=root.QuestCardArt.themes[record.industryId];if(!theme)throw Error('Choose a learning community first.');
  const missions=list(record.missionIds).map(id=>root.QuestMissions.missions.find(m=>m.id===id)?.title).filter(Boolean);
  return{name:record.name,world:theme.label,missions:missions.length?missions:list(record.primaryChallenge?[record.primaryChallenge]:[]),interests:list(record.contentTopics).length?list(record.contentTopics):list(record.useCases),formats:list(record.preferredFormats)};
 }
 async function assetData(path){const image=new Image();image.src=new URL(path,document.baseURI).href;await image.decode();const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;c.getContext('2d').drawImage(image,0,0);return c.toDataURL('image/png');}
 async function create(record,avatar){
  const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=640;
  const [portrait,logo,qr]=await Promise.all([root.QuestCardArt.draw(canvas,avatar,record.industryId),assetData('./assets/cards/d2l-logo.png'),assetData('./assets/cards/champions-qr.png')]);
  const html=root.QuestCardTemplate.adventureCard(model(record)).replace('cid:moosePortrait',portrait).replace('cid:d2lLogo',logo).replace('cid:championsQr',qr);
  return{portrait,html};
 }
 function markup(id,{problemsOnly=false}={}){const card=cards.get(id);if(problemsOnly&&!['error','artError','unavailable','uncertain'].includes(card?.status))return '';if(!card)return '<p class="card-status">Preparing your Moose card…</p>';const messages={preparing:'Preparing your Moose card…',ready:'Your Moose adventure card is ready.',sending:'Your answers are saved. Scheduling your Moose card email…',queued:'Your Moose adventure card is queued for email.',sent:'Your Moose adventure card has been sent.',unavailable:'Your card is ready. Email delivery is not available yet.',uncertain:'Your answers are saved. Email status needs checking; we will not send a duplicate.',sample:'Your sample Moose card is ready. No email will be sent.',error:'Your answers are saved. We could not confirm your card email. You can retry safely.',artError:'Your answers are saved, but your Moose card could not be prepared.'};return '<section class="adventure-card-result" aria-label="Your Moose adventure card"><p class="card-status" role="status">'+messages[card.status]+'</p>'+(card.package&&!problemsOnly?'<button type="button" class="text-btn" id="view-adventure-card">View my Moose card ↗</button>':'')+(['error','artError'].includes(card.status)?'<button type="button" class="text-btn" id="retry-adventure-card">Retry card</button>':'')+'</section>';}
 function preview(card){const dialog=document.createElement('dialog');dialog.className='adventure-card-dialog';dialog.setAttribute('aria-label','Your Moose adventure card');const close=document.createElement('button');close.className='text-btn';close.textContent='Close card ×';close.onclick=()=>dialog.close();const frame=document.createElement('iframe');frame.title='Your Ignite Canada Moose adventure card';frame.setAttribute('sandbox','allow-popups allow-popups-to-escape-sandbox');frame.srcdoc=card.package.html;dialog.append(close,frame);dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);dialog.showModal();close.focus();}
 function bind(id){const card=cards.get(id);const view=document.getElementById('view-adventure-card'),retry=document.getElementById('retry-adventure-card');if(view&&card)view.onclick=()=>preview(card);if(retry&&card)retry.onclick=()=>void run(card);}
 async function run(card){
  if(card.pending)return card.pending;
  card.pending=(async()=>{try{if(!card.package){card.status='preparing';card.changed();try{card.package=await create(card.record,card.avatar)}catch{card.status='artError';return}}
   if(card.record.isSample||card.record.staffTestMode||card.record.demo){card.status='sample';return}
   if(!card.receipt.cardEnabled){card.status='unavailable';return}
   card.status='sending';card.changed();
   const result=await root.QuestPrivateFormsClient.sendCard(card.record,card.receipt.submissionId,{requested:true,portrait:card.package.portrait});
   card.status=result.status==='sent'?'sent':result.status==='uncertain'?'uncertain':'queued';
  }catch{card.status='error'}finally{card.pending=null;card.changed()}})();return card.pending;
 }
 function start(record,avatar,receipt,changed){if(cards.has(record.recordId))return cards.get(record.recordId).pending;const card={record:JSON.parse(JSON.stringify(record)),avatar:root.QuestWorldData.sanitizeAvatar(avatar),receipt:receipt||{},changed,status:'preparing'};cards.set(record.recordId,card);return run(card);}
 root.QuestCards={model,create,markup,bind,start,forget:id=>cards.delete(id)};
})(window);
