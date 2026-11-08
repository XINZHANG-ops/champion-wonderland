(function () {
  'use strict';
  const configured = window.QUEST_CONFIG?.apiBase || location.origin;
  const base = new URL(configured);
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
  if ((base.protocol !== 'https:' && !(base.protocol === 'http:' && loopback)) ||
      base.hostname.includes('*') || base.username || base.password || base.pathname !== '/' || base.search || base.hash) {
    throw Error('Configure a valid HTTPS backend origin in runtime-config.js.');
  }
  function url(route) {
    if (!route.startsWith('/api/')) throw Error('Invalid backend route.');
    const pathname = route.split('?')[0];
    if (!['/api/version', '/api/config', '/api/world', '/api/events', '/api/join', '/api/profile', '/api/walk', '/api/heartbeat', '/api/leave', '/api/forget','/api/visit-event'].includes(pathname)) {
      throw Error('Only public game requests can use the game backend.');
    }
    return base.origin + route;
  }
  function request(route, options = {}) {
    return fetch(url(route), { ...options, mode: 'cors', credentials: 'omit' });
  }
  function forget(token) {
    if (!token) return;
    void request('/api/forget', {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json', 'X-Quest-Version': window.QUEST_RELEASE },
      body: JSON.stringify({ token })
    }).catch(() => {});
  }
  window.QuestAPI = { url, request, forget };
})();
