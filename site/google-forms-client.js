(function () {
  'use strict';
  const VERSION = 'champion-forms-v1';
  function googleReply(origin) {
    try {
      const url = new URL(origin);
      return url.protocol === 'https:' && (url.hostname === 'script.google.com' || /^[a-z0-9-]+-script\.googleusercontent\.com$/.test(url.hostname));
    } catch { return false; }
  }
  function submit(endpoint, record, submissionId = crypto.randomUUID()) {
    const url = new URL(endpoint);
    if (url.origin !== 'https://script.google.com' || !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname) || url.search || url.hash) throw Error('Use the deployed Apps Script /exec URL.');
    if (!/^[A-Za-z0-9-]{1,100}$/.test(submissionId)) throw Error('Invalid submission ID.');
    const payload = JSON.stringify({submissionId, returnOrigin: location.origin, record});
    if (payload.length > 24000) throw Error('Submission is too large.');
    return new Promise((resolve, reject) => {
      const frame = document.createElement('iframe'), form = document.createElement('form'), input = document.createElement('input');
      const callbackName = 'cwReceipt_' + crypto.randomUUID().replaceAll('-', '');
      let active = true, pollTimer = null, receiptScript = null, pollDelay = 2000;
      frame.name = 'cw-' + crypto.randomUUID(); frame.hidden = true; frame.title = 'Saving your answers to Google';
      form.hidden = true; form.method = 'POST'; form.action = url.href; form.target = frame.name; form.acceptCharset = 'UTF-8';
      input.type = 'hidden'; input.name = 'payload'; input.value = payload; form.append(input);
      const cleanup = () => { active = false; clearTimeout(timer); clearTimeout(pollTimer); receiptScript?.remove(); delete window[callbackName]; window.removeEventListener('message', onMessage); form.remove(); frame.remove(); };
      const matches = result => result && result.type === 'champion-forms-result' && result.version === VERSION && result.submissionId === submissionId;
      const saved = () => { cleanup(); resolve({saved: true, submissionId}); };
      function queuePoll() {
        if (!active) return;
        pollTimer = setTimeout(poll, pollDelay); pollDelay = Math.min(pollDelay * 1.6, 10000);
      }
      function poll() {
        if (!active) return;
        const script = document.createElement('script'), statusUrl = new URL(url.href);
        statusUrl.searchParams.set('receipt', submissionId); statusUrl.searchParams.set('origin', location.origin); statusUrl.searchParams.set('callback', callbackName);
        let handled = false;
        const again = () => { if (handled || !active) return; handled = true; script.remove(); receiptScript = null; queuePoll(); };
        window[callbackName] = result => { if (matches(result) && result.ok === true && result.saved === true) saved(); else again(); };
        script.src = statusUrl.href; script.async = true; script.onload = script.onerror = again;
        receiptScript = script; document.body.append(script);
      }
      const onMessage = event => {
        const result = event.data;
        if (!googleReply(event.origin) || !matches(result)) return;
        cleanup();
        if (result.ok === true) resolve({saved: true, submissionId});
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
