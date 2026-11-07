(function(){
 'use strict';
 const visitors=new Map(),listeners=new Set(),copy=value=>JSON.parse(JSON.stringify(value));
 function visitor(record){let current=visitors.get(record.recordId);if(!current){current={status:'idle'};visitors.set(record.recordId,current);}return current;}
 function changed(){for(const listener of listeners)listener();}
 function ready(){return window.QuestPrivateFormsClient.ready();}
 async function saveProgress(record){const current=visitor(record);current.latest=copy(record);if(current.status!=='saved')current.status='draft';changed();return{draft:true,recordId:record.recordId};}
 async function saveQuest(record){
  if(!ready())throw Error('Saving is temporarily unavailable. Your answers remain in this tab.');
  await window.QuestRelease?.ensureCompatible();
  const final=copy({...record,checkpoint:'complete',questCompleted:true}),current=visitor(final),bytes=JSON.stringify(final);
  if(current.pending){if(current.receipt.bytes===bytes)return current.pending;throw Error('Saving is already in progress.');}
  if(current.receipt?.bytes!==bytes)current.receipt={bytes,id:crypto.randomUUID(),saved:false};
  if(current.receipt.saved)return{saved:true,recordId:record.recordId,submissionId:current.receipt.id,cardEnabled:current.receipt.cardEnabled===true};
  current.latest=final;current.status='saving';changed();
  const receipt=current.receipt;
  current.pending=(async()=>{
   try{const result=await window.QuestPrivateFormsClient.submit(final,receipt.id);receipt.saved=true;receipt.cardEnabled=result.cardEnabled===true;current.status='saved';return{saved:true,recordId:record.recordId,submissionId:receipt.id,cardEnabled:receipt.cardEnabled};}
   catch(error){current.status='error';throw error;}
   finally{current.pending=null;changed();}
  })();
  return current.pending;
 }
 async function saveChampionsClick(recordId){const current=visitors.get(recordId);if(current?.status!=='saved')throw Error('Save your quest before opening the sign-up page.');current.latest.championsRegistrationStatus='signup_page_opened';return{recordId,trackedInTab:true};}
 function retry(recordId){const current=visitors.get(recordId);if(!current?.latest)return Promise.reject(Error('There are no responses to retry.'));return saveQuest(current.latest);}
 window.QuestRecords={ready,saveProgress,saveQuest,saveChampionsClick,retry,status:id=>visitors.get(id)?.status||'idle',forget:id=>visitors.delete(id),subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);}};
})();
