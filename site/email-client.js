(function(){
 'use strict';
 async function submit(record,submissionId){
  const response=await QuestAPI.request('/api/submissions',{method:'POST',headers:{'Content-Type':'application/json','X-Quest-Version':window.QUEST_RELEASE},body:JSON.stringify({record,submission_id:submissionId}),cache:'no-store'});
  const result=await response.json();
  if(!response.ok)throw Error(result.error||'Your responses could not be sent. They remain in this tab.');
  if(result.ok!==true||result.status!=='saved'||result.submissionId!==submissionId||result.recordId!==record.recordId)throw Error('Sending could not be confirmed. Your responses remain in this tab.');
  return{saved:true};
 }
 window.QuestEmailRecordsClient={ready:()=>true,submit};
})();
