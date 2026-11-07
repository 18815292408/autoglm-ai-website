/* Country-aware advertising consent gate.
 * EEA + UK + unresolved origin: no ad request until explicit consent.
 * Everywhere else: ads load on arrival (browser/ad-blocker opt-out still applies).
 *
 * Config (set before this file):
 *   window.__ADS_GATE_CONFIG = {
 *     key: 'ad-consent',                  // localStorage key for the explicit choice
 *     privacy: { en: '/privacy-policy.html', zh: '/zh/privacy-policy.html' },
 *     topOnMobile: true                   // avoid stacking on another bottom banner
 *   };
 *
 * Ad markup that must stay inert until consent carries data-ad-script
 * (external) or data-ad-inline (inline atOptions block). They are replayed in
 * document order once allowed, so atOptions still precedes its invoke.js.
 */
(function (window, document) {
  'use strict';

  var CFG = window.__ADS_GATE_CONFIG || {};
  var KEY = CFG.key || 'ad-consent';
  var GEO_CACHE_KEY = '__ads_geo_country';
  var EEA_UK = ('AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE ' +
    'IS LI NO GB').split(' ');
  var state = {
    country: null,
    requiresConsent: true,
    allowed: false,
    ready: false,
    explicit: false
  };
  window.__ADS_GEO = state;

  var existingBanner = document.getElementById('ga-banner') || document.querySelector('.ga-banner');
  var ownBanner = null;
  var activationStarted = false;
  var activationQueued = false;
  var bannerQueued = false;

  function readChoice() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function writeChoice(value) {
    try { window.localStorage.setItem(KEY, value); } catch (e) {}
  }
  function cachedCountry() {
    try { return window.sessionStorage.getItem(GEO_CACHE_KEY); } catch (e) { return null; }
  }
  function cacheCountry(code) {
    try { window.sessionStorage.setItem(GEO_CACHE_KEY, code); } catch (e) {}
  }
  function isZh() {
    return (document.documentElement.lang || '').toLowerCase().indexOf('zh') === 0;
  }
  function privacyHref() {
    var p = CFG.privacy;
    if (!p) return '';
    if (typeof p === 'string') return p;
    return isZh() ? (p.zh || p.en || '') : (p.en || p.zh || '');
  }
  function gpcOn() {
    return window.navigator && window.navigator.globalPrivacyControl === true;
  }
  function requiresConsentFor(code) {
    if (!code) return true;
    return EEA_UK.indexOf(String(code).toUpperCase()) !== -1;
  }

  function injectStyle() {
    if (document.getElementById('ads-gate-style')) return;
    var style = document.createElement('style');
    style.id = 'ads-gate-style';
    style.textContent =
      'html.ads-gate-pending .ga-banner,html.ads-gate-pending .ads-consent-banner{display:none!important}' +
      '.ads-consent-banner{position:fixed;z-index:2147483000;left:12px;right:auto;bottom:16px;' +
      'max-width:420px;box-sizing:border-box;background:#fff;color:#16181d;border:1px solid #d9dee5;' +
      'border-radius:14px;padding:14px 16px;box-shadow:0 18px 40px rgba(0,0,0,.18);' +
      'font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;text-align:left}' +
      '.ads-consent-banner p{margin:0 0 10px}' +
      '.ads-consent-banner a{color:#2f6fed;text-decoration:underline}' +
      '.ads-consent-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}' +
      '.ads-consent-banner button{padding:7px 12px;border-radius:8px;font:inherit;font-weight:600;cursor:pointer}' +
      '.ads-consent-banner .ads-allow{border:1px solid #2f6fed;background:#2f6fed;color:#fff}' +
      '.ads-consent-banner .ads-deny{border:1px solid #c9d0d9;background:transparent;color:#333}' +
      '@media(max-width:640px){.ads-consent-banner{left:8px;right:8px;bottom:8px;max-width:none}' +
      (CFG.topOnMobile ? '.ads-consent-banner{bottom:auto;top:8px}' : '') + '}';
    (document.head || document.documentElement).appendChild(style);
  }

  function pending(on) {
    var root = document.documentElement;
    if (!root) return;
    if (on) root.classList.add('ads-gate-pending');
    else root.classList.remove('ads-gate-pending');
  }

  function buildOwnBanner() {
    if (ownBanner) return ownBanner;
    if (!document.body) {
      if (!bannerQueued) {
        bannerQueued = true;
        onReady(function () { bannerQueued = false; buildOwnBanner(); });
      }
      return null;
    }
    var zh = isZh();
    var box = document.createElement('div');
    box.className = 'ads-consent-banner';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', zh ? '广告同意' : 'Advertising consent');

    var text = document.createElement('p');
    text.textContent = zh
      ? '本站使用广告合作伙伴的 Cookie 与设备标识。欧盟及英国地区须经你同意才会加载广告；拒绝后可继续访问，不会加载广告。'
      : 'We use cookies and device identifiers from our advertising partner. In the EEA and UK, ads load only after you accept. You can decline and keep browsing without ads.';
    var href = privacyHref();
    if (href) {
      text.appendChild(document.createTextNode(' '));
      var link = document.createElement('a');
      link.href = href;
      link.textContent = zh ? '隐私政策' : 'Privacy policy';
      text.appendChild(link);
    }
    box.appendChild(text);

    var actions = document.createElement('div');
    actions.className = 'ads-consent-actions';
    var deny = document.createElement('button');
    deny.type = 'button';
    deny.className = 'ads-deny';
    deny.setAttribute('data-ads-consent', 'denied');
    deny.textContent = zh ? '拒绝' : 'Decline';
    var allow = document.createElement('button');
    allow.type = 'button';
    allow.className = 'ads-allow';
    allow.setAttribute('data-ads-consent', 'allowed');
    allow.textContent = zh ? '允许广告' : 'Allow ads';
    actions.appendChild(deny);
    actions.appendChild(allow);
    box.appendChild(actions);

    box.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('button[data-ads-consent]') : null;
      if (!btn) return;
      decide(btn.getAttribute('data-ads-consent'));
    });
    document.body.appendChild(box);
    ownBanner = box;
    return box;
  }

  function showBanner() {
    pending(false);
    if (existingBanner) {
      existingBanner.removeAttribute('hidden');
    } else {
      var box = buildOwnBanner();
      if (box) box.style.display = '';
    }
  }

  function hideBanner() {
    pending(false);
    if (existingBanner) {
      existingBanner.setAttribute('hidden', '');
    }
    if (ownBanner) ownBanner.style.display = 'none';
  }

  function fire(allowed) {
    var detail = { allowed: !!allowed, country: state.country, requiresConsent: state.requiresConsent };
    try { window.dispatchEvent(new CustomEvent('ads-geo-consent', { detail: detail })); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('ad-consent-change', { detail: allowed ? 'allowed' : 'denied' })); } catch (e) {}
  }

  function allow() {
    state.allowed = true;
    state.ready = true;
    hideBanner();
    activateInert();
    fire(true);
  }

  function deny() {
    state.allowed = false;
    state.ready = true;
    hideBanner();
    fire(false);
  }

  function decide(value) {
    var allowed = value === 'allowed';
    writeChoice(allowed ? 'allowed' : 'denied');
    state.explicit = true;
    state.ready = true;
    if (allowed) allow(); else deny();
  }

  function activateInert() {
    if (activationStarted) return;
    if (document.readyState === 'loading') {
      if (!activationQueued) {
        activationQueued = true;
        document.addEventListener('DOMContentLoaded', function () {
          activationQueued = false;
          activateInert();
        }, { once: true });
      }
      return;
    }
    var nodes = document.querySelectorAll('script[data-ad-script],script[data-ad-inline]');
    if (!nodes.length) return;
    activationStarted = true;
    var queue = Array.prototype.slice.call(nodes);
    var index = 0;

    function next() {
      index += 1;
      step();
    }

    function step() {
      if (index >= queue.length) return;
      var old = queue[index];
      if (old.getAttribute('data-ad-activated') === '1') { next(); return; }
      old.setAttribute('data-ad-activated', '1');

      var script = document.createElement('script');
      for (var i = 0; i < old.attributes.length; i += 1) {
        var attr = old.attributes[i];
        if (attr.name === 'type' || attr.name.indexOf('data-ad-') === 0) continue;
        if (attr.name === 'async' || attr.name === 'defer') continue;
        try { script.setAttribute(attr.name, attr.value); } catch (e) {}
      }

      if (old.hasAttribute('data-ad-inline')) {
        script.text = old.textContent || old.innerHTML || '';
        (document.head || document.documentElement).appendChild(script);
        window.setTimeout(next, 0);
        return;
      }

      var finished = false;
      function done() {
        if (finished) return;
        finished = true;
        window.setTimeout(next, 0);
      }
      script.async = false;
      script.onload = done;
      script.onerror = done;
      try {
        script.src = old.getAttribute('src');
        (document.head || document.documentElement).appendChild(script);
      } catch (e) {
        done();
        return;
      }
      window.setTimeout(done, 6000);
    }

    step();
  }

  function resolveCountry(code) {
    state.country = code || null;
    state.requiresConsent = requiresConsentFor(code) || gpcOn();
    state.ready = true;
    if (!state.requiresConsent) {
      allow();
    } else {
      showBanner();
    }
  }

  function fetchCountry() {
    var cached = cachedCountry();
    if (cached !== null) { resolveCountry(cached); return; }
    var url = '/cdn-cgi/trace?ads_geo=' + Date.now();
    var finished = false;
    function finish(code) {
      if (finished) return;
      finished = true;
      if (code) cacheCountry(code);
      resolveCountry(code || '');
    }
    var timer = window.setTimeout(function () { finish(''); }, 1500);
    try {
      window.fetch(url, { cache: 'no-store', credentials: 'same-origin' })
        .then(function (res) { return res.ok ? res.text() : ''; })
        .then(function (text) {
          window.clearTimeout(timer);
          var match = /(?:^|\n)loc=([A-Z0-9]{2})/.exec(text || '');
          finish(match ? match[1] : '');
        })
        .catch(function () { window.clearTimeout(timer); finish(''); });
    } catch (e) {
      window.clearTimeout(timer);
      finish('');
    }
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  injectStyle();
  pending(true);

  // Honour an explicit choice before geo so a declined visitor never gets ads.
  var saved = readChoice();
  if (saved === 'allowed' || saved === 'denied' || saved === 'declined') {
    state.explicit = true;
    state.ready = true;
    if (saved === 'allowed') state.allowed = true;
    onReady(function () {
      if (state.allowed) allow(); else deny();
    });
    return;
  }

  // Existing banner buttons still write the site key themselves; this delegate
  // only mirrors the choice into __ADS_GEO and the loader event.
  if (existingBanner) {
    existingBanner.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('button[data-consent]') : null;
      if (!btn) return;
      var value = btn.getAttribute('data-consent') === 'allowed' ? 'allowed' : 'denied';
      state.explicit = true;
      state.ready = true;
      if (value === 'allowed') allow(); else deny();
    });
  }

  fetchCountry();
  onReady(function () {
    if (state.allowed) activateInert();
  });
})(window, document);
