(function () {
  'use strict';
  function endpoint() { return window.QUEST_CONFIG?.formsEndpoint || ''; }
  function ready() {
    try {
      const url = new URL(endpoint());
      return url.origin === 'https://script.google.com' && /^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname) && !url.search && !url.hash;
    } catch { return false; }
  }
  async function submit(record, submissionId) {
    if (!ready()) throw Error('Saving is not connected yet. Your answers remain in this tab.');
    return window.QuestGoogleForms.submit(endpoint(), record, submissionId);
  }
  async function sendCard(record,submissionId,card){if(!ready())throw Error('Card delivery is not connected.');return window.QuestGoogleForms.submit(endpoint(),record,submissionId,card);}
  window.QuestPrivateFormsClient = { ready, submit, sendCard };
})();
