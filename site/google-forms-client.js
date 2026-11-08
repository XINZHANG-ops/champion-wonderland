(function () {
  'use strict';
  const VERSION = 'champion-forms-v1';
  function googleReply(origin) {
    try {
      const url = new URL(origin);
      return url.protocol === 'https:' && (url.hostname === 'script.google.com' || /^[a-z0-9-]+-script\.googleusercontent\.com$/.test(url.hostname));
    } catch { return false; }
  }
  function submit(endpoint, record, submissionId = crypto.randomUUID(), card = null) {
    const url = new URL(endpoint);
    if (url.origin !== 'https://script.google.com' || !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname) || url.search || url.hash) throw Error('Use the deployed Apps Script /exec URL.');
    if (!/^[A-Za-z0-9-]{1,100}$/.test(submissionId)) throw Error('Invalid submission ID.');
    const payload = JSON.stringify({submissionId, returnOrigin: location.origin, record,...(card?{action:'card',card}: {})});
    if (payload.length > (card?310000:24000)) throw Error('Submission is too large.');
    return new Promise((resolve, reject) => {
      const frame = document.createElement('iframe'), form = document.createElement('form'), input = document.createElement('input');
      const callbackName = 'cwReceipt_' + crypto.randomUUID().replaceAll('-', '');
      let active = true, pollTimer = null, receiptScript = null, pollDelay = 2000;
      frame.name = 'cw-' + crypto.randomUUID(); frame.hidden = true; frame.title = 'Saving your answers to Google';
      form.hidden = true; form.method = 'POST'; form.action = url.href; form.target = frame.name; form.acceptCharset = 'UTF-8';
      input.type = 'hidden'; input.name = 'payload'; input.value = payload; form.append(input);
      const cleanup = () => { active = false; clearTimeout(timer); clearTimeout(pollTimer); receiptScript?.remove(); delete window[callbackName]; window.removeEventListener('message', onMessage); form.remove(); frame.remove(); };
      const matches = result => result && result.type === (card?'champion-card-result':'champion-forms-result') && result.version === VERSION && result.submissionId === submissionId;
      const accepted=result=>card?['queued','sent','uncertain'].includes(result.status):result.saved===true;
      const value=result=>card?{queued:result.status==='queued',status:result.status,submissionId}:{saved:true,submissionId,cardEnabled:result.cardEnabled===true};
      const saved = result => { cleanup(); resolve(value(result)); };
      function queuePoll() {
        if (!active) return;
        pollTimer = setTimeout(poll, pollDelay); pollDelay = Math.min(pollDelay * 1.6, 10000);
      }
      function poll() {
        if (!active) return;
        const script = document.createElement('script'), statusUrl = new URL(url.href);
        statusUrl.searchParams.set(card?'cardReceipt':'receipt', submissionId); statusUrl.searchParams.set('origin', location.origin); statusUrl.searchParams.set('callback', callbackName);
        let handled = false;
        const again = () => { if (handled || !active) return; handled = true; script.remove(); receiptScript = null; queuePoll(); };
        window[callbackName] = result => { if (matches(result) && result.ok === true && accepted(result)) saved(result); else again(); };
        script.src = statusUrl.href; script.async = true; script.onload = script.onerror = again;
        receiptScript = script; document.body.append(script);
      }
      const onMessage = event => {
        const result = event.data;
        if (!googleReply(event.origin) || !matches(result)) return;
        cleanup();
        if (result.ok === true && (!card||accepted(result))) resolve(value(result));
        else { const error = Error('Could not save your answers. Please retry.'); error.submissionId = submissionId; reject(error); }
      };
      const timer = setTimeout(() => {
        cleanup(); const error = Error('Saving took too long. Please retry; any saved copy will not be duplicated.');
        error.submissionId = submissionId; reject(error);
      }, 45000);
      window.addEventListener('message', onMessage);
      document.body.append(frame, form);
      try { form.submit(); queuePoll(); } catch (cause) { cleanup(); const error = Error('Could not connect. Please retry.'); error.submissionId = submissionId; reject(error); }
    });
  }
  window.QuestGoogleForms = {submit};
})();

// A single close-tolerant upload hands the final answers and portrait to Lucy's Google outbox.
(function(root){
 const storageKey='cw-pending-google-submit-v1',budget=62*1024;
 let available=false,probe,portraitKey,portrait,pngPortrait,making=false,job;
 function receipt(id,capability=false){
  return new Promise(resolve=>{
   const cb='cwReceipt_'+crypto.randomUUID().replaceAll('-',''),script=document.createElement('script');
   const url=new URL(root.QUEST_CONFIG.formsEndpoint);
   url.searchParams.set(capability?'receipt':'queueReceipt',id);url.searchParams.set('origin',location.origin);url.searchParams.set('callback',cb);
   function finish(result){clearTimeout(timer);script.remove();delete root[cb];resolve(result);}
   const timer=setTimeout(()=>finish(null),6500);
   root[cb]=r=>finish(capability ? (r?.submissionId===id&&r.type==='champion-forms-result'?r:null) : (r?.type==='champion-submit-v1'&&r.id===id?r:null));
   script.onerror=()=>finish(null);script.src=url.href;document.body.append(script);
  });
 }
 function warm(){
  if(!probe&&root.QuestPrivateFormsClient?.ready()&&typeof Request!=='undefined'&&'keepalive' in Request.prototype){
   probe=receipt(crypto.randomUUID(),true).then(r=>{available=r?.queueEnabled===true;if(!r)probe=null;});
  }
 }
 function prepare(world,avatar,sample){
  const key=JSON.stringify([world,avatar,sample]);
  if(key===portraitKey)return;
  portraitKey=key;portrait=null;pngPortrait=null;making=!sample;
  if(sample){portrait='';return;}
  const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=640;
  root.QuestCardArt.draw(canvas,avatar,world).then(png=>{
   if(key!==portraitKey)return;
   pngPortrait=png;
   for(const quality of [.82,.66,.5,.36,.24]){
    const jpeg=canvas.toDataURL('image/jpeg',quality);
    if(jpeg.startsWith('data:image/jpeg;base64,')&&jpeg.length<=47000){portrait=jpeg;break;}
   }
  }).catch(()=>{}).finally(()=>{if(key===portraitKey){making=false;root.dispatchEvent(new Event('cw-portrait-ready'));}});
 }
 function backup(){try{if(job)sessionStorage.setItem(storageKey,JSON.stringify(job));else sessionStorage.removeItem(storageKey);}catch{}}
 function restore(){try{const j=JSON.parse(sessionStorage.getItem(storageKey));if(j?.body&&j.endpoint===root.QUEST_CONFIG?.formsEndpoint&&Date.now()-j.at<15*60*1000){const {record}=JSON.parse(j.body);job=j;return {demo:!!(record.demo||record.isSample||record.staffTestMode)};}sessionStorage.removeItem(storageKey);}catch{}return false;}
 function build(record,avatar){
  if(!available)return false;
  prepare(record.industryId,avatar,!!(record.demo||record.isSample||record.staffTestMode));
  if(portrait===null)return false;
  const id=crypto.randomUUID(),body=JSON.stringify({action:'enqueue',returnOrigin:location.origin,submissionId:id,record,portrait});
  if(new Blob([body]).size>budget)return false;
  job={id,body,endpoint:root.QUEST_CONFIG.formsEndpoint,at:Date.now()};backup();return true;
 }
 async function deliver(){
  const pending=job,endpoint=root.QUEST_CONFIG?.formsEndpoint;
  if(!pending||!root.QuestPrivateFormsClient.ready())throw Error('Saving is unavailable.');
  // Start synchronously during the click. An opaque HTTP response cannot prove acceptance.
  const upload=fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:pending.body,
   credentials:'omit',mode:'no-cors',referrerPolicy:'no-referrer',keepalive:true}).then(()=>true,()=>false);
  await Promise.race([upload,new Promise(r=>setTimeout(r,900))]);
  for(const delay of [0,900,1600,3000,5000,7000]){
   if(delay)await new Promise(r=>setTimeout(r,delay));
   const reply=await receipt(pending.id);
   if(['accepted','queued','sent','sending','uncertain'].includes(reply?.status)){
    const {record}=JSON.parse(pending.body);
    if(!record.demo&&!record.isSample&&!record.staffTestMode)root.QuestVisit?.mark('accepted');
    if(job===pending){job=null;backup();}return {demo:!!(record.demo||record.isSample||record.staffTestMode)};
   }
  }
  throw Error('We couldn’t confirm your submission. Retry to check or send the same submission again.');
 }
 root.QuestSubmitQueue={warm,prepare,build,deliver,restore,getPortrait:(world,avatar)=>portraitKey===JSON.stringify([world,avatar,false])?pngPortrait:null,preparing:()=>available&&making,clear(){job=null;backup();}};
})(window);
