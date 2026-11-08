(() => {
  const prefix = 'cw.visit-funnel.v1.', stages = ['opened','started','industry_view','industry_pick','moose_view','world_join',
    'tracks_view','track_pick','challenges_view','challenge_pick','matches_view','formats_view','format_pick',
    'submit_clicked','accepted','join_clicked'];
  let visitor, ready;
  const sending = new Set(), pending = new Set(), done = new Set();
  function storage(method, key, value) {
    try { return localStorage[method](prefix + key, value); } catch { return null; }
  }
  function identity() {
    if (!visitor) {
      visitor = storage('getItem','visitor') || crypto.randomUUID();
      storage('setItem','visitor',visitor);
    }
    return visitor;
  }
  async function flush(stage) {
    if (!pending.has(stage) && !storage('getItem','pending.' + stage)) return;
    if (sending.has(stage)) return;
    sending.add(stage);
    try {
      if (!ready) ready = navigator.locks ? navigator.locks.request(prefix + 'id', identity) : Promise.resolve(identity());
      const id = await ready;
      const r = await window.QuestAPI.request('/api/visit-event', {method:'POST', keepalive:true,
        referrerPolicy:'no-referrer', headers:{'Content-Type':'text/plain'}, body:JSON.stringify({id,stage})});
      if (r.ok) {
        done.add(stage); storage('setItem','done.' + stage,'1');
        pending.delete(stage); storage('removeItem','pending.' + stage);
      }
    } catch { /* Retry outstanding events on the next visit or reconnect. */ }
    finally { sending.delete(stage); }
  }
  function mark(stage) {
    if (!stages.includes(stage) || done.has(stage) || storage('getItem','done.' + stage)) return;
    pending.add(stage); storage('setItem','pending.' + stage,'1'); void flush(stage);
  }
  window.QuestVisit = {mark};
  document.addEventListener('input', e => { if (e.target.closest?.('#pass-form')) mark('started'); });
  window.addEventListener('online', () => stages.forEach(flush));
  mark('opened'); stages.forEach(flush);
})();
