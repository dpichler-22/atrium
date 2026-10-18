(function () {
  'use strict';

  var root = document.documentElement;
  var isExt = location.protocol === 'chrome-extension:' && !!(window.chrome && chrome.runtime);
  var hasTabs = isExt && !!chrome.tabs;
  var hasHistory = isExt && !!chrome.history;

  try {
    localStorage.removeItem('atrium.recent');
  } catch (e) {} // searches are never stored
  function load(k, d) {
    try {
      var v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  }
  function save(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }

  // Theme before first paint: saved choice, else the host's data-theme, else dark.
  var dark = (function () {
    var s = load('atrium.theme', null);
    if (s) return s === 'dark';
    var a = root.getAttribute('data-theme');
    if (a) return a === 'dark';
    return true;
  })();
  root.classList.toggle('dark', dark);

  // ---------- helpers ----------
  function $(id) {
    return document.getElementById(id);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function host(u) {
    try {
      return new URL(u).hostname.replace(/^www\./, '');
    } catch (e) {
      return u;
    }
  }
  function hasScheme(v) {
    return /^[a-z][\w+.-]*:\/\//i.test(v);
  }
  function toUrl(v) {
    v = v.trim();
    return hasScheme(v) ? v : 'https://' + v;
  }
  function looksLikeUrl(v) {
    return !/\s/.test(v) && (hasScheme(v) || /^(localhost|[\w-]+(\.[\w-]+)+)(:\d+)?(\/.*)?$/i.test(v));
  }
  function uid() {
    return Math.random().toString(36).slice(2, 9);
  }

  var S = function (p, s) {
    s = s || 16;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24">' + p + '</svg>';
  };
  var I = {
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    folder:
      '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    user: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
    tabs: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    server:
      '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01M6 18h.01"/>'
  };

  // Logos bundled in icons/ only for commands and Google apps; Google's favicon service for the rest; a letter if both fail.
  var LOCAL = {};
  'calendar.google.com chatgpt.com claude.ai docs drive.google.com gemini.google.com images.google.com linkedin.com mail.google.com maps.google.com meet.google.com photos.google.com sheets slides x.com youtube.com'
    .split(' ')
    .forEach(function (h) {
      LOCAL[h] = 1;
    });
  function favUrl(url) {
    var u = new URL(url);
    return 'https://www.google.com/s2/favicons?domain_url=' + encodeURIComponent(u.origin + u.pathname) + '&sz=64';
  }
  function mono(name) {
    return (
      '<i class="mono">' +
      esc(
        String(name || '?')
          .charAt(0)
          .toUpperCase()
      ) +
      '</i>'
    );
  }
  function fav(url, name, src) {
    var h = host(url);
    if (!src && LOCAL[h]) src = 'icons/' + h + '.png';
    if (!src && !isExt) return mono(name || h);
    return (
      '<img src="' +
      esc(src || favUrl(url)) +
      '" alt="" draggable="false" loading="lazy" data-name="' +
      esc(name || h) +
      '">'
    );
  }
  document.addEventListener(
    'error',
    function (e) {
      var t = e.target;
      if (t.tagName === 'IMG' && t.hasAttribute('data-name')) t.outerHTML = mono(t.getAttribute('data-name'));
    },
    true
  );

  function go(url, newTab) {
    url = acctUrl(url);
    if (isExt) {
      if (newTab && hasTabs) chrome.tabs.create({ url: url, active: false });
      else location.assign(url);
      return;
    }
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  var toastTimer;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.hidden = true;
    }, 2600);
  }

  // ---------- theme ----------
  function applyTheme() {
    root.classList.toggle('dark', dark);
    $('themeBtn').innerHTML = S(dark ? I.sun : I.moon);
  }

  // ---------- clock ----------
  var fmts = {};
  function t(tz, d) {
    return (
      fmts[tz] ||
      (fmts[tz] = new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: tz
      }))
    ).format(d);
  }
  // Big clock and date follow the Mac's own time zone; the city row uses fixed zones.
  var dateFmt = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  function tick() {
    var d = new Date();
    $('date').textContent = dateFmt.format(d);
    $('clock').textContent = t(undefined, d);
    document.querySelectorAll('[data-tz]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-tz'), d);
    });
  }
  // Wake once per minute, on the minute. Nothing runs while the tab is hidden.
  var timer;
  function schedule() {
    clearTimeout(timer);
    if (document.hidden) return;
    tick();
    timer = setTimeout(schedule, 60000 - (Date.now() % 60000) + 30);
  }

  // ---------- rates (one request per 6 hours) ----------
  function showRates(r) {
    $('usd').textContent = r.usd.toFixed(3);
    $('aed').textContent = r.aed.toFixed(2);
  }
  function initRates() {
    var c = load('atrium.fx', null);
    if (c) showRates(c);
    if (!isExt) {
      if (!c) {
        showRates({ usd: 1.119, aed: 4.11 });
        $('rates').title = 'Sample rates. Live rates load in the extension.';
      }
      return;
    }
    if (c && Date.now() - c.t < 6 * 36e5) return;
    fetch('https://open.er-api.com/v6/latest/EUR')
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        if (!d || !d.rates) return;
        var f = { t: Date.now(), usd: d.rates.USD, aed: d.rates.AED };
        save('atrium.fx', f);
        showRates(f);
      })
      .catch(function () {});
  }

  // ---------- slash commands ----------
  var CMDS = [
    { k: 'claude', n: 'Claude', d: 'Ask Claude', u: 'https://claude.ai/new?q=', home: 'https://claude.ai/new' },
    { k: 'gpt', n: 'ChatGPT', d: 'Ask ChatGPT', u: 'https://chatgpt.com/?q=', home: 'https://chatgpt.com' },
    {
      k: 'gemini',
      n: 'Gemini',
      d: 'Ask Gemini · prompt is copied, paste with ⌘V',
      home: 'https://gemini.google.com/app',
      copy: true
    },
    {
      k: 'yt',
      n: 'YouTube',
      d: 'Search YouTube',
      u: 'https://www.youtube.com/results?search_query=',
      home: 'https://www.youtube.com'
    },
    { k: 'x', n: 'X', d: 'Search X', u: 'https://x.com/search?q=', home: 'https://x.com' },
    {
      k: 'in',
      n: 'LinkedIn',
      d: 'Search LinkedIn',
      u: 'https://www.linkedin.com/search/results/all/?keywords=',
      home: 'https://www.linkedin.com'
    },
    {
      k: 'drive',
      n: 'Drive',
      d: 'Search Google Drive',
      u: 'https://drive.google.com/drive/search?q=',
      home: 'https://drive.google.com'
    },
    {
      k: 'img',
      n: 'Images',
      d: 'Google Images',
      u: 'https://www.google.com/search?udm=2&q=',
      home: 'https://images.google.com'
    },
    {
      k: 'meetnow',
      n: 'Meet now',
      d: 'Start a meeting and copy the link',
      home: 'https://meet.google.com',
      now: true,
      ext: true
    },
    { k: 'tab', n: 'Tabs', d: 'Find an open tab', ext: true },
    { k: 'history', n: 'History', d: 'Search your browsing history', ext: true },
    { k: 'ports', n: 'Ports', d: 'Local servers on localhost', ext: true }
  ];
  function findCmd(k) {
    k = k.toLowerCase();
    for (var i = 0; i < CMDS.length; i++) if (CMDS[i].k === k) return CMDS[i];
  }
  function cmdIcon(c) {
    return c.home ? fav(c.home, c.n) : S(c.k === 'ports' ? I.server : c.k === 'history' ? I.history : I.tabs);
  }

  // ---------- /ports ----------
  // Browsers can't list open ports, so we try the usual dev ports plus every localhost
  // port seen in your history, open tabs or typed before. Only runs while /ports is open.
  var COMMON = [
    3000, 3001, 3002, 3003, 4000, 4200, 4321, 5000, 5001, 5173, 5174, 5500, 6006, 8000, 8001, 8080, 8081, 8501, 8787,
    8888, 9000
  ];
  var ports = null,
    portsAt = 0,
    scanning = false;
  function portOf(u) {
    var m = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(?::(\d+))?/.exec(u || '');
    return m ? +(m[2] || 80) : 0;
  }
  function rememberPort(p) {
    var saved = load('atrium.ports', []);
    if (saved.indexOf(p) < 0) {
      saved.unshift(p);
      save('atrium.ports', saved.slice(0, 30));
    }
  }
  function portUrl(p) {
    return 'http://localhost:' + p + '/';
  }
  function probe(p) {
    var ctl = new AbortController(),
      to = setTimeout(function () {
        ctl.abort();
      }, 700);
    return fetch(portUrl(p), { signal: ctl.signal, cache: 'no-store' })
      .then(function (r) {
        return r.text();
      })
      .then(function (html) {
        clearTimeout(to);
        var m = /<title[^>]*>([^<]*)<\/title>/i.exec(html.slice(0, 20000));
        return { p: p, title: m ? m[1].trim() : '' };
      })
      .catch(function () {
        clearTimeout(to);
        return null;
      });
  }
  function scanPorts() {
    if (scanning) return;
    scanning = true;
    var set = {};
    COMMON.concat(load('atrium.ports', [])).forEach(function (p) {
      set[p] = 1;
    });
    tabsList.forEach(function (tb) {
      var p = portOf(tb.url);
      if (p) set[p] = 1;
    });
    var done = function () {
      Promise.all(
        Object.keys(set).map(function (p) {
          return probe(+p);
        })
      ).then(function (res) {
        ports = res.filter(Boolean).sort(function (a, b) {
          return a.p - b.p;
        });
        portsAt = Date.now();
        scanning = false;
        if (cmd && cmd.k === 'ports') update();
      });
    };
    if (!hasHistory) return done();
    chrome.history.search({ text: 'localhost', maxResults: 300, startTime: 0 }, function (res) {
      (res || []).forEach(function (h) {
        var p = portOf(h.url);
        if (p) set[p] = 1;
      });
      done();
    });
  }
  function openPort(p, nt) {
    rememberPort(p);
    for (var i = 0; i < tabsList.length; i++) if (portOf(tabsList[i].url) === p) return switchTab(tabsList[i]);
    go(portUrl(p), nt);
  }
  function portOpts(vt) {
    if (!ports || Date.now() - portsAt > 15000) scanPorts();
    if (!ports) return [{ ic: S(I.server), name: 'Checking local ports…' }];
    var out = ports
      .filter(function (x) {
        return !vt || String(x.p).indexOf(vt) === 0 || x.title.toLowerCase().indexOf(vt.toLowerCase()) > -1;
      })
      .map(function (x) {
        var open = tabsList.some(function (tb) {
          return portOf(tb.url) === x.p;
        });
        return {
          sec: 'Running',
          ic: S(I.server),
          name: '<b>:' + x.p + '</b>',
          desc: esc(x.title || 'localhost'),
          meta: open ? 'Switch' : 'Open',
          run: function (nt) {
            openPort(x.p, nt);
          }
        };
      });
    if (
      /^\d{1,5}$/.test(vt) &&
      !ports.some(function (x) {
        return String(x.p) === vt;
      })
    ) {
      out.unshift({
        ic: S(I.globe),
        name: '<b>:' + vt + '</b>',
        desc: 'Open localhost:' + vt,
        meta: '↵',
        run: function (nt) {
          openPort(+vt, nt);
        }
      });
    }
    if (!out.length) out = [{ ic: S(I.server), name: 'Nothing running', desc: 'Type a port number to open it' }];
    return out;
  }

  // ---------- /history ----------
  // Searches all of Chrome's history (about 90 days), only while /history is open.
  // Empty shows the latest visits; results are grouped by day.
  var histFull = {},
    histTimer;
  var timeFmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  var dayFmt = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  function dayLabel(ms) {
    var today = new Date().setHours(0, 0, 0, 0);
    var days = Math.round((today - new Date(ms).setHours(0, 0, 0, 0)) / 864e5);
    return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : dayFmt.format(ms);
  }
  // chrome:// pages can't be opened with a normal link, so go through the tabs API.
  function openChromeHistory(q, nt) {
    var url = 'chrome://history/' + (q ? '?q=' + encodeURIComponent(q) : '');
    if (nt) return chrome.tabs.create({ url: url, active: false });
    chrome.tabs.getCurrent(function (t) {
      chrome.tabs.update(t.id, { url: url });
    });
  }
  function chromeHistoryOpt(vt) {
    return {
      sec: 'Chrome',
      ic: S(I.history),
      name: vt ? 'Search “' + esc(vt) + '” in Chrome history' : 'Open Chrome history',
      desc: 'chrome://history',
      meta: '↵',
      run: function (nt) {
        openChromeHistory(vt, nt);
      }
    };
  }
  function historyOpts(vt) {
    var res = histFull[vt];
    if (!res) {
      clearTimeout(histTimer);
      histTimer = setTimeout(
        function () {
          chrome.history.search({ text: vt, maxResults: 80, startTime: 0 }, function (r) {
            histFull[vt] = (r || []).sort(function (a, b) {
              return b.lastVisitTime - a.lastVisitTime;
            });
            if (cmd && cmd.k === 'history' && $('q').value.trim() === vt) update();
          });
        },
        vt ? 90 : 0
      );
      return [chromeHistoryOpt(vt)];
    }
    var rows = res.map(function (h) {
      return {
        sec: dayLabel(h.lastVisitTime),
        ic: fav(h.url, h.title),
        name: esc(h.title || host(h.url)),
        desc: esc(host(h.url)),
        meta: timeFmt.format(h.lastVisitTime),
        run: function (nt) {
          go(h.url, nt);
        }
      };
    });
    // Empty: "Open Chrome history" comes first, so /history + Enter opens it.
    // With text: the first match comes first and the full Chrome search sits at the end.
    return vt ? rows.concat(chromeHistoryOpt(vt)) : [chromeHistoryOpt('')].concat(rows);
  }

  // ---------- /meetnow ----------
  // Opens meet.google.com/new in the background, waits for Google to give it a code, copies the link,
  // then switches to it. The tab listener only exists for those few seconds.
  function meetCode(v) {
    var m = v.match(/\b[a-z]{3}-[a-z]{4}-[a-z]{3}\b/i);
    return m && m[0].toLowerCase();
  }
  var meeting = false; // one meeting at a time, so a double Enter doesn't make two
  function newMeet(nt) {
    if (meeting) return;
    meeting = true;
    $('q').value = '';
    setCmd(null);
    update();
    toast('Starting a meeting…');
    chrome.tabs.create({ url: acctUrl('https://meet.google.com/new'), active: false }, function (tab) {
      var timer = setTimeout(function () {
        done(null);
      }, 10000);
      function done(code) {
        chrome.tabs.onUpdated.removeListener(watch);
        clearTimeout(timer);
        meeting = false;
        var open = function () {
          // Only switch if the meeting tab still exists, or switchTab would close Atrium for nothing.
          if (!nt)
            chrome.tabs.get(tab.id, function (t) {
              if (!chrome.runtime.lastError && t) switchTab(t);
            });
        };
        if (!code) return open();
        navigator.clipboard.writeText('https://meet.google.com/' + code).then(function () {
          toast('Meet link copied');
          setTimeout(open, 500);
        }, open);
      }
      function watch(id, info) {
        if (id !== tab.id || !info.url) return;
        var u = new URL(info.url);
        if (u.hostname !== 'meet.google.com') return done(null); // sign-in page or similar
        var code = meetCode(u.pathname);
        if (code) done(code);
      }
      chrome.tabs.onUpdated.addListener(watch);
    });
  }
  function joinMeet(v, nt) {
    var code = meetCode(v);
    if (code) go('https://meet.google.com/' + code, nt);
  }
  function meetOpt(vt) {
    var ic = cmdIcon(findCmd('meetnow'));
    var code = meetCode(vt);
    if (vt && !code) return { ic: ic, name: 'Paste a meeting code or link' };
    return {
      ic: ic,
      name: vt ? 'Join ' + esc(code) : 'New meeting',
      desc: vt ? '' : 'Copies the link',
      meta: '↵',
      run: function (nt) {
        runCmd(cmd, vt, nt);
      }
    };
  }

  // ---------- search ----------
  var PH = 'Search Google or type a URL';
  var cmd = null,
    opts = [],
    sel = -1;
  var sugCache = {},
    histCache = {},
    tabsList = [];
  var sugTimer, sugAbort;

  function googleSearch(v, nt) {
    go('https://www.google.com/search?q=' + encodeURIComponent(v), nt);
  }
  function runCmd(c, text, nt) {
    if (c.k === 'history') return openChromeHistory(text, nt);
    if (c.k === 'tab') {
      var m = matchTabs(text, 1)[0];
      if (m) switchTab(m);
      return;
    }
    if (c.now) return text ? joinMeet(text, nt) : newMeet(nt);
    if (c.k === 'ports') {
      if (/^\d{1,5}$/.test(text)) openPort(+text, nt);
      return;
    }
    if (!text) return go(c.home, nt);
    if (c.copy) {
      var done = function () {
        go(c.home, nt);
      };
      if (navigator.clipboard)
        navigator.clipboard.writeText(text).then(function () {
          toast('Prompt copied. Paste it with ⌘V');
          setTimeout(done, 500);
        }, done);
      else done();
      return;
    }
    go(c.u + encodeURIComponent(text), nt);
  }
  function setCmd(c) {
    cmd = c;
    root.classList.toggle('commanding', !!c);
    histFull = {}; // fresh history each time a command starts
    $('lead').innerHTML = c
      ? cmdIcon(c) + '<b>' + esc(c.n) + '</b>'
      : S(I.search).replace('<svg', '<svg class="muted"');
    $('q').placeholder = c ? c.d : PH;
  }

  function words(v) {
    return v.toLowerCase().split(/\s+/).filter(Boolean);
  }
  function matchAll(ws, text) {
    text = text.toLowerCase();
    for (var i = 0; i < ws.length; i++) if (text.indexOf(ws[i]) < 0) return false;
    return true;
  }
  function matchTabs(v, max) {
    var ws = words(v),
      out = [];
    for (var i = 0; i < tabsList.length && out.length < max; i++) {
      var tb = tabsList[i];
      if (!tb.url || tb.url.indexOf('newtab') > -1 || tb.url === location.href) continue;
      if (matchAll(ws, (tb.title || '') + ' ' + tb.url)) out.push(tb);
    }
    return out;
  }
  function switchTab(tb) {
    chrome.tabs.update(tb.id, { active: true });
    chrome.windows.update(tb.windowId, { focused: true });
    // Close this new tab so jumping around doesn't pile up empty tabs.
    chrome.tabs.getCurrent(function (cur) {
      if (cur && cur.id !== tb.id) chrome.tabs.remove(cur.id);
    });
  }
  function refreshTabs() {
    if (hasTabs)
      chrome.tabs.query({}, function (ts) {
        tabsList = ts || [];
      });
  }

  function allLinks() {
    var out = [];
    (function walk(items) {
      items.forEach(function (it) {
        if (it.items) walk(it.items);
        else out.push(it);
      });
    })(
      data.groups.reduce(function (a, g) {
        return a.concat(g.items);
      }, [])
    );
    return out;
  }
  function tabOpt(tb) {
    return {
      sec: 'Open tabs',
      ic: fav(tb.url, tb.title),
      name: esc(tb.title || host(tb.url)),
      meta: 'Switch',
      run: function () {
        switchTab(tb);
      }
    };
  }

  function update() {
    var v = $('q').value,
      vt = v.trim();
    opts = [];
    sel = -1;

    if (cmd) {
      if (cmd.ext && !hasTabs)
        opts = [{ ic: cmdIcon(cmd), name: esc(cmd.d), desc: 'Works in the installed extension' }];
      else if (cmd.k === 'tab') opts = (vt ? matchTabs(vt, 8) : tabsList.slice(-8).reverse()).map(tabOpt);
      else if (cmd.k === 'ports') opts = portOpts(vt);
      else if (cmd.k === 'history') opts = historyOpts(vt);
      else if (cmd.now) opts = [meetOpt(vt)];
      else if (vt)
        opts = [
          {
            ic: cmdIcon(cmd),
            name: esc(vt),
            meta: cmd.n + ' ↵',
            run: function (nt) {
              runCmd(cmd, vt, nt);
            }
          }
        ];
      sel = opts.length && opts[0].run ? 0 : -1;
      return render();
    }

    if (v.charAt(0) === '/') {
      var k = v.slice(1).toLowerCase();
      opts = CMDS.filter(function (c) {
        return c.k.indexOf(k) === 0 || c.n.toLowerCase().indexOf(k) === 0;
      }).map(function (c) {
        var pick = function () {
          $('q').value = '';
          setCmd(c);
          update();
        };
        return {
          sec: 'Commands',
          ic: cmdIcon(c),
          name: '<b>/' + c.k + '</b>',
          desc: esc(c.d),
          meta: 'Tab',
          // Meet now needs no text, so it runs straight from the list.
          run: c.now ? newMeet : pick,
          complete: pick
        };
      });
      sel = opts.length ? 0 : -1;
      return render();
    }

    if (!vt) return render();

    var seen = {};
    if (looksLikeUrl(vt))
      opts.push({
        ic: S(I.globe),
        name: esc(vt),
        meta: 'Open',
        run: function (nt) {
          go(toUrl(vt), nt);
        }
      });
    else
      opts.push({
        ic: S(I.search),
        name: esc(vt),
        meta: 'Google ↵',
        run: function (nt) {
          googleSearch(vt, nt);
        }
      });

    (sugCache[vt] || []).forEach(function (s) {
      if (s.toLowerCase() === vt.toLowerCase()) return;
      var n =
        s.toLowerCase().indexOf(vt.toLowerCase()) === 0
          ? esc(s.slice(0, vt.length)) + '<b>' + esc(s.slice(vt.length)) + '</b>'
          : esc(s);
      opts.push({
        sec: 'Suggestions',
        ic: S(I.search),
        name: n,
        run: function (nt) {
          googleSearch(s, nt);
        },
        complete: function () {
          $('q').value = s + ' ';
          update();
        }
      });
    });

    matchTabs(vt, 3).forEach(function (tb) {
      seen[tb.url] = 1;
      opts.push(tabOpt(tb));
    });

    var ws = words(vt);
    allLinks()
      .filter(function (l) {
        return !seen[l.u] && matchAll(ws, l.n + ' ' + l.u);
      })
      .slice(0, 3)
      .forEach(function (l) {
        seen[l.u] = 1;
        opts.push({
          sec: 'Bookmarks',
          ic: fav(l.u, l.n),
          name: esc(l.n),
          meta: esc(host(l.u)),
          run: function (nt) {
            go(l.u, nt);
          }
        });
      });

    (histCache[vt] || [])
      .filter(function (h) {
        return !seen[h.url];
      })
      .slice(0, 4)
      .forEach(function (h) {
        seen[h.url] = 1;
        opts.push({
          sec: 'History',
          ic: fav(h.url, h.title),
          name: esc(h.title || host(h.url)),
          meta: esc(host(h.url)),
          run: function (nt) {
            go(h.url, nt);
          }
        });
      });

    sel = 0;
    render();
    fetchMore(vt);
  }

  // Suggestions and history load after a short pause in typing.
  function fetchMore(vt) {
    clearTimeout(sugTimer);
    if (!isExt || (sugCache[vt] && (histCache[vt] || !hasHistory))) return;
    sugTimer = setTimeout(function () {
      if (!sugCache[vt]) {
        if (sugAbort) sugAbort.abort();
        sugAbort = new AbortController();
        fetch(
          'https://suggestqueries.google.com/complete/search?client=firefox&ie=utf-8&oe=utf-8&hl=' +
            encodeURIComponent(navigator.language) +
            '&q=' +
            encodeURIComponent(vt),
          { signal: sugAbort.signal }
        )
          .then(function (r) {
            return r.json();
          })
          .then(function (j) {
            sugCache[vt] = (j[1] || []).slice(0, 5);
            if (!cmd && $('q').value.trim() === vt) update();
          })
          .catch(function () {});
      }
      if (hasHistory && !histCache[vt]) {
        chrome.history.search({ text: vt, maxResults: 10, startTime: Date.now() - 90 * 864e5 }, function (res) {
          histCache[vt] = res || [];
          if (!cmd && $('q').value.trim() === vt) update();
        });
      }
    }, 90);
  }

  function render() {
    var html = '',
      last;
    opts.forEach(function (o, i) {
      if (o.sec && o.sec !== last) html += '<div class="s-lbl">' + o.sec + '</div>';
      last = o.sec;
      html +=
        '<div class="opt" role="option" id="opt' +
        i +
        '" data-i="' +
        i +
        '" aria-selected="' +
        (i === sel) +
        '">' +
        '<span class="ic">' +
        o.ic +
        '</span><span class="name">' +
        o.name +
        '</span>' +
        (o.desc ? '<span class="desc">' + o.desc + '</span>' : '') +
        (o.meta ? '<span class="meta">' + o.meta + '</span>' : '') +
        '</div>';
    });
    $('suggest').innerHTML = html;
    setOpen(opts.length > 0 && document.activeElement === $('q'));
  }
  // The dropdown ends 24px above the bottom of the window and scrolls inside.
  function fitSuggest() {
    var box = $('suggest');
    if (box.hidden) return;
    box.style.maxHeight = Math.max(160, Math.min(480, innerHeight - box.getBoundingClientRect().top - 24)) + 'px';
  }
  function setOpen(open) {
    $('suggest').hidden = !open;
    root.classList.toggle('searching', open); // fades the links panel behind the dropdown
    $('q').setAttribute('aria-expanded', String(open));
    fitSuggest();
  }
  function isOpen() {
    return !$('suggest').hidden;
  }
  function select(i) {
    if (!opts.length) return;
    sel = (i + opts.length) % opts.length;
    var els = $('suggest').querySelectorAll('.opt');
    for (var j = 0; j < els.length; j++) els[j].setAttribute('aria-selected', String(j === sel));
    els[sel].scrollIntoView({ block: 'nearest' });
    $('q').setAttribute('aria-activedescendant', 'opt' + sel);
  }

  function onInput() {
    var m = !cmd && $('q').value.match(/^\/(\w+)\s+([\s\S]*)$/);
    var c = m && findCmd(m[1]);
    if (c) {
      $('q').value = m[2];
      setCmd(c);
    }
    update();
  }
  function onKey(e) {
    var q = $('q');
    // Ctrl+C clears everything, like cancelling a line in Terminal. With text selected it still copies.
    if (e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'c' && q.selectionStart === q.selectionEnd) {
      e.preventDefault();
      q.value = '';
      setCmd(null);
      update();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen()) return update();
      select(sel + (e.key === 'ArrowDown' ? 1 : -1));
    } else if (e.key === 'Tab' && !e.shiftKey && isOpen() && opts[sel] && opts[sel].complete) {
      e.preventDefault();
      opts[sel].complete();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      var nt = e.metaKey || e.ctrlKey;
      if (isOpen() && opts[sel] && opts[sel].run) return opts[sel].run(nt);
      var v = q.value.trim();
      if (cmd) return runCmd(cmd, v, nt);
      if (!v) return;
      if (looksLikeUrl(v)) go(toUrl(v), nt);
      else googleSearch(v, nt);
    } else if (e.key === 'Backspace' && cmd && q.selectionStart === 0 && q.selectionEnd === 0) {
      e.preventDefault();
      var k = cmd.k;
      setCmd(null);
      q.value = '/' + k + q.value;
      update();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      if (isOpen()) setOpen(false);
      else if (cmd) {
        setCmd(null);
        update();
      } else q.blur();
    }
  }

  // ---------- links panel ----------
  function L(n, u) {
    return { n: n, u: u };
  }
  function F(n, items) {
    return { n: n, items: items };
  }
  var DEFAULTS = {
    tab: 'daily',
    groups: [
      {
        id: 'daily',
        name: 'Daily',
        items: [
          L('Gmail', 'https://mail.google.com'),
          L('Calendar', 'https://calendar.google.com'),
          L('Drive', 'https://drive.google.com'),
          L('WhatsApp', 'https://web.whatsapp.com'),
          L('YouTube', 'https://www.youtube.com')
        ]
      },
      {
        id: 'dev',
        name: 'Dev',
        items: [
          L('GitHub', 'https://github.com'),
          L('MDN', 'https://developer.mozilla.org'),
          L('Vercel', 'https://vercel.com/dashboard'),
          F('Tools', [
            L('Figma', 'https://www.figma.com'),
            L('Linear', 'https://linear.app'),
            L('Excalidraw', 'https://excalidraw.com')
          ])
        ]
      },
      {
        id: 'ai',
        name: 'AI',
        items: [
          L('Claude', 'https://claude.ai'),
          L('ChatGPT', 'https://chatgpt.com'),
          L('Gemini', 'https://gemini.google.com'),
          L('Perplexity', 'https://www.perplexity.ai')
        ]
      },
      {
        id: 'create',
        name: 'Create',
        items: [
          L('Notion', 'https://www.notion.so'),
          L('Canva', 'https://www.canva.com'),
          L('CapCut', 'https://www.capcut.com'),
          L('YouTube Studio', 'https://studio.youtube.com'),
          L('Stripe', 'https://dashboard.stripe.com')
        ]
      },
      {
        id: 'read',
        name: 'Read',
        items: [
          L('Hacker News', 'https://news.ycombinator.com'),
          L('Product Hunt', 'https://www.producthunt.com'),
          L('The Verge', 'https://www.theverge.com'),
          L('Google Scholar', 'https://scholar.google.com')
        ]
      }
    ]
  };
  var DATA_KEY = 'atrium.board.v2';
  var data = load(DATA_KEY, null);
  if (!data || !Array.isArray(data.groups) || !data.groups.length) data = JSON.parse(JSON.stringify(DEFAULTS));
  var path = [],
    edit = false,
    adding = null,
    delArmed = null;
  // Several new tabs can be open at once, each with its own copy in memory. Saving always records what was
  // written, and other tabs pick up changes (storage event, or when they become visible) so an old tab can
  // never overwrite newer links.
  var dataRaw = JSON.stringify(data);
  function persist() {
    dataRaw = JSON.stringify(data);
    try {
      localStorage.setItem(DATA_KEY, dataRaw);
    } catch (e) {}
  }
  function syncFromStorage(raw) {
    if (raw == null || raw === dataRaw) return;
    try {
      var d = JSON.parse(raw);
    } catch (e) {
      return;
    }
    if (!d || !Array.isArray(d.groups) || !d.groups.length) return;
    dataRaw = raw;
    data = d;
    path = [];
    adding = null;
    renderPanel();
  }

  function group() {
    for (var i = 0; i < data.groups.length; i++) if (data.groups[i].id === data.tab) return data.groups[i];
    data.tab = data.groups[0].id;
    return data.groups[0];
  }
  function node() {
    var n = group();
    path.forEach(function (i) {
      n = n.items[i];
    });
    return n;
  }

  function renderPanel() {
    var g = group();
    // tabs
    var th = data.groups
      .map(function (x) {
        var on = x.id === g.id;
        return (
          '<button type="button" role="tab" draggable="' +
          !adding +
          '" data-tab="' +
          esc(x.id) +
          '" class="' +
          (on ? 'on' : '') +
          '" aria-selected="' +
          on +
          '">' +
          esc(x.name) +
          (edit && on ? '<span class="tab-x" data-deltab title="Delete tab">' + S(I.x, 11) + '</span>' : '') +
          '</button>'
        );
      })
      .join('');
    if (edit)
      th +=
        adding === 'tab'
          ? '<input class="tab-input" id="tabInput" placeholder="Name" aria-label="New tab name">'
          : '<button type="button" class="tab-add" data-add="tab" title="Add tab">' + S(I.plus, 14) + '</button>';
    $('tabs').innerHTML = th;

    // breadcrumbs
    var c = $('crumbs');
    c.hidden = !path.length;
    if (path.length) {
      var h =
        '<button type="button" class="back" data-crumb="' +
        (path.length - 1) +
        '" aria-label="Back">' +
        S(I.left, 14) +
        '</button>' +
        '<button type="button" data-crumb="0">' +
        esc(g.name) +
        '</button>';
      var cur = g;
      path.forEach(function (idx, i) {
        cur = cur.items[idx];
        h +=
          '<span class="sep">' +
          S(I.right, 12) +
          '</span>' +
          (i === path.length - 1
            ? '<span class="cur">' + esc(cur.n) + '</span>'
            : '<button type="button" data-crumb="' + (i + 1) + '">' + esc(cur.n) + '</button>');
      });
      c.innerHTML = h;
    }

    // links
    var del = function (i) {
      return edit ? '<span class="del" data-del="' + i + '" title="Remove">' + S(I.x, 13) + '</span>' : '';
    };
    var items = node().items;
    var lh = items
      .map(function (l, i) {
        return l.items
          ? '<button type="button" class="row" draggable="true" data-idx="' +
              i +
              '" data-folder="' +
              i +
              '"><span class="muted">' +
              S(I.folder, 17) +
              '</span><span class="name">' +
              esc(l.n) +
              '</span>' +
              '<span class="meta">' +
              l.items.length +
              '<span class="chev">' +
              S(I.right, 13) +
              '</span></span>' +
              del(i) +
              '</button>'
          : '<a class="row" draggable="true" data-idx="' +
              i +
              '" href="' +
              esc(acctUrl(l.u)) +
              '">' +
              fav(l.u, l.n) +
              '<span class="name">' +
              esc(l.n) +
              '</span>' +
              '<span class="meta host">' +
              esc(host(l.u)) +
              '</span>' +
              del(i) +
              '</a>';
      })
      .join('');
    if (!items.length && !edit) lh = '<p class="empty">Empty. Use the pencil to add links.</p>';
    if (edit) {
      if (adding === 'link') {
        lh +=
          '<form class="add-form" id="addForm" data-kind="link"><input id="addName" placeholder="Name" aria-label="Name">' +
          '<input id="addUrl" placeholder="example.com" aria-label="Address"><button class="pill" type="submit">Add</button>' +
          '<button class="pill quiet" type="button" data-cancel>Cancel</button></form>';
      } else if (adding === 'folder') {
        lh +=
          '<form class="add-form" id="addForm" data-kind="folder"><input id="addName" placeholder="Folder name" aria-label="Folder name">' +
          '<button class="pill" type="submit">Create</button><button class="pill quiet" type="button" data-cancel>Cancel</button></form>';
      } else {
        lh +=
          '<button type="button" class="row ghost" data-add="link">' +
          S(I.plus) +
          ' Add link</button>' +
          '<button type="button" class="row ghost" data-add="folder">' +
          S(I.folder) +
          ' New folder</button>';
      }
    }
    $('links').innerHTML = lh;

    var on = $('tabs').querySelector('.on');
    if (on) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    c.scrollLeft = c.scrollWidth;
    var f = $('addName') || $('tabInput');
    if (f) f.focus();
  }

  function onPanelClick(e) {
    var t = e.target;
    var d = t.closest('[data-del]');
    if (d) {
      e.preventDefault();
      e.stopPropagation();
      node().items.splice(+d.getAttribute('data-del'), 1);
      persist();
      renderPanel();
      return;
    }
    if (t.closest('[data-deltab]')) {
      e.stopPropagation();
      if (data.groups.length < 2) return toast('Keep at least one tab');
      if (!delArmed) {
        delArmed = setTimeout(function () {
          delArmed = null;
        }, 3000);
        return toast('Click × again to delete "' + group().name + '"');
      }
      clearTimeout(delArmed);
      delArmed = null;
      data.groups.splice(data.groups.indexOf(group()), 1);
      data.tab = data.groups[0].id;
      path = [];
      persist();
      renderPanel();
      return;
    }
    var b;
    if ((b = t.closest('[data-tab]'))) {
      data.tab = b.getAttribute('data-tab');
      path = [];
      adding = null;
      persist();
      renderPanel();
    } else if ((b = t.closest('[data-folder]'))) {
      path.push(+b.getAttribute('data-folder'));
      adding = null;
      renderPanel();
    } else if ((b = t.closest('[data-crumb]'))) {
      path = path.slice(0, +b.getAttribute('data-crumb'));
      renderPanel();
    } else if ((b = t.closest('[data-add]'))) {
      adding = b.getAttribute('data-add');
      renderPanel();
    } else if (t.closest('[data-cancel]')) {
      adding = null;
      renderPanel();
    }
  }

  function onPanelSubmit(e) {
    e.preventDefault();
    var name = $('addName').value.trim();
    if (e.target.getAttribute('data-kind') === 'folder') {
      if (!name) return $('addName').focus();
      node().items.push(F(name, []));
    } else {
      var url = $('addUrl').value.trim();
      if (!url) return $('addUrl').focus();
      url = toUrl(url);
      node().items.push(L(name || host(url), url));
    }
    adding = null;
    persist();
    renderPanel();
  }

  function onPanelKey(e) {
    if (e.target.id === 'tabInput') {
      if (e.key === 'Enter') {
        var name = e.target.value.trim();
        if (name) {
          var g = { id: uid(), name: name, items: [] };
          data.groups.push(g);
          data.tab = g.id;
          path = [];
          persist();
        }
        adding = null;
        renderPanel();
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        adding = null;
        renderPanel();
      }
    } else if (e.key === 'Escape' && adding) {
      e.stopPropagation();
      adding = null;
      renderPanel();
    }
  }

  // ---------- drag and drop ----------
  // Rows and tabs reorder live: the others slide aside while you drag. A row dropped on the middle of a folder,
  // on a breadcrumb or on a tab moves there instead.
  var drag = null; // { kind: 'row' | 'tab', el, from, lock }
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function listAt(gid, p) {
    var n = data.groups.filter(function (g) {
      return g.id === gid;
    })[0];
    p.forEach(function (i) {
      n = n.items[i];
    });
    return n.items;
  }
  function rowEls() {
    return [].slice.call($('links').querySelectorAll('[data-idx]'));
  }
  function tabEls() {
    return [].slice.call($('tabs').querySelectorAll('[data-tab]'));
  }
  function clearDrop() {
    document.querySelectorAll('.drop-into').forEach(function (el) {
      el.classList.remove('drop-into');
    });
  }
  // Move the dragged element next to the hovered one and slide everything that shifted (FLIP).
  function shove(els, over) {
    if (Date.now() < drag.lock) return;
    var a = els.indexOf(drag.el),
      b = els.indexOf(over);
    if (a < 0 || b < 0 || a === b) return;
    var first = els.map(function (el) {
      return el.getBoundingClientRect();
    });
    over.parentNode.insertBefore(drag.el, a < b ? over.nextSibling : over);
    drag.lock = Date.now() + 160;
    if (reduced) return;
    els.forEach(function (el, i) {
      var r = el.getBoundingClientRect(),
        dx = first[i].left - r.left,
        dy = first[i].top - r.top;
      if (!dx && !dy) return;
      el.style.transition = 'none';
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      requestAnimationFrame(function () {
        el.style.transition = 'transform .2s cubic-bezier(.2,.8,.2,1)';
        el.style.transform = '';
        setTimeout(function () {
          el.style.transition = '';
        }, 220);
      });
    });
  }
  function overFolderMiddle(r, e) {
    if (!r.hasAttribute('data-folder')) return false;
    var b = r.getBoundingClientRect(),
      y = (e.clientY - b.top) / b.height;
    return y > 0.25 && y < 0.75;
  }
  function onDragStart(e) {
    var el = e.target.closest && e.target.closest('.links [data-idx], .tabs [data-tab]');
    if (!el) return;
    if (el.hasAttribute('data-tab')) {
      drag = { kind: 'tab', el: el, lock: 0 };
      e.dataTransfer.setData('text/plain', el.textContent);
    } else {
      drag = { kind: 'row', el: el, from: +el.getAttribute('data-idx'), lock: 0 };
      var it = node().items[drag.from];
      if (it.u) e.dataTransfer.setData('text/uri-list', it.u);
      e.dataTransfer.setData('text/plain', it.u || it.n);
    }
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(function () {
      el.classList.add('dragging');
    }, 0); // after the drag image is captured
  }
  function onDragOver(e) {
    if (!drag) return;
    clearDrop();
    if (drag.kind === 'tab') {
      var tb = e.target.closest('.tabs [data-tab]');
      if (!tb && !e.target.closest('.tabs')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (tb && tb !== drag.el) shove(tabEls(), tb);
      return;
    }
    var r = e.target.closest('.links [data-idx]');
    if (r || e.target.closest('.links')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!r || r === drag.el) return;
      if (overFolderMiddle(r, e)) r.classList.add('drop-into');
      else shove(rowEls(), r);
      return;
    }
    var c = e.target.closest('.crumbs [data-crumb]') || e.target.closest('.tabs [data-tab]');
    if (c) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      c.classList.add('drop-into');
    }
  }
  function onDrop(e) {
    if (!drag) return;
    e.preventDefault();
    var d = drag;
    drag = null;
    clearDrop();
    if (d.kind === 'tab') {
      var order = tabEls().map(function (el) {
        return el.getAttribute('data-tab');
      });
      data.groups.sort(function (a, b) {
        return order.indexOf(a.id) - order.indexOf(b.id);
      });
    } else {
      var src = node().items,
        item = src[d.from],
        dest = null;
      var r = e.target.closest('.links [data-idx]');
      var c = e.target.closest('.crumbs [data-crumb]'),
        tb = e.target.closest('.tabs [data-tab]');
      if (r && r !== d.el && overFolderMiddle(r, e)) dest = listAt(data.tab, path.concat(+r.getAttribute('data-idx')));
      else if (c) dest = listAt(data.tab, path.slice(0, +c.getAttribute('data-crumb')));
      else if (tb) dest = listAt(tb.getAttribute('data-tab'), []);
      src.splice(d.from, 1);
      if (dest && dest !== src) dest.push(item);
      else src.splice(rowEls().indexOf(d.el), 0, item);
    }
    persist();
    renderPanel();
  }
  function onDragEnd() {
    if (!drag) return;
    drag = null;
    clearDrop();
    renderPanel(); // cancelled: put everything back
  }

  function setEdit(on) {
    edit = on;
    adding = null;
    root.classList.toggle('editing', on);
    $('editBtn').classList.toggle('active', on);
    $('editBtn').setAttribute('aria-pressed', String(on));
    renderPanel();
  }

  // ---------- Google apps + account ----------
  var G = 'icons/';
  var APPS = [
    { n: 'Gmail', u: 'https://mail.google.com' },
    { n: 'Drive', u: 'https://drive.google.com' },
    { n: 'Docs', u: 'https://docs.google.com/document', i: G + 'docs.png' },
    { n: 'Sheets', u: 'https://docs.google.com/spreadsheets', i: G + 'sheets.png' },
    { n: 'Slides', u: 'https://docs.google.com/presentation', i: G + 'slides.png' },
    { n: 'Calendar', u: 'https://calendar.google.com' },
    { n: 'Meet', u: 'https://meet.google.com' },
    { n: 'Photos', u: 'https://photos.google.com' },
    { n: 'Maps', u: 'https://maps.google.com' }
  ];
  function setApps(open) {
    var m = $('appsMenu');
    if (open && !m.firstChild)
      m.innerHTML = APPS.map(function (a) {
        return '<a href="' + esc(acctUrl(a.u)) + '">' + fav(a.u, a.n, a.i) + '<span>' + esc(a.n) + '</span></a>';
      }).join('');
    m.hidden = !open;
    if (open) setAcct(false);
    $('appsBtn').classList.toggle('active', open);
    $('appsBtn').setAttribute('aria-expanded', String(open));
  }
  function initApps() {
    $('appsBtn').addEventListener('click', function () {
      setApps($('appsMenu').hidden);
    });
    addEventListener('mousedown', function (e) {
      if (!$('appsWrap').contains(e.target)) setApps(false);
    });
  }

  // ---------- Google account ----------
  // Picks which signed-in Google account Google links open in (via ?authuser=). The page never fetches the
  // account list on load: it shows the cached avatar, and asks Google only when you open the menu.
  var accts = load('atrium.accounts', []).filter(function (a) {
    return a.n || a.p; // forget accounts typed in by hand in v1.1.0
  }); // [{ n: name, e: email, p: photo url, out: signed out }]
  var acctErr = '';
  var acct = load('atrium.account', null); // chosen email
  if (
    acct &&
    !accts.some(function (a) {
      return a.e === acct;
    })
  )
    acct = null;
  var GOOGLE_HOST = /(^|\.)(google\.com|youtube\.com)$/;
  function chosenEmail() {
    return acct || (accts[0] && accts[0].e) || null;
  }
  function acctUrl(url) {
    // The first signed-in account is Google's default, so it needs no marker.
    if (!acct || (accts[0] && accts[0].e === acct)) return url;
    try {
      var u = new URL(url);
    } catch (e) {
      return url;
    }
    if (!GOOGLE_HOST.test(u.hostname) || u.searchParams.has('authuser')) return url;
    u.searchParams.set('authuser', acct);
    return u.toString();
  }
  function face(a) {
    return a && a.p
      ? '<img class="face" src="' + esc(a.p) + '" alt="" draggable="false">'
      : '<i class="mono face">' + esc(((a && (a.n || a.e)) || '?').charAt(0).toUpperCase()) + '</i>';
  }
  function renderAvatar() {
    var e = chosenEmail();
    var a = accts.filter(function (x) {
      return x.e === e;
    })[0];
    $('acctBtn').innerHTML = a || e ? face(a || { e: e }) : S(I.user, 17);
    $('acctBtn').title = e ? 'Google account · ' + e : 'Google account';
  }
  function renderAcctMenu(state) {
    var cur = chosenEmail();
    var html = accts
      .map(function (a) {
        return (
          '<button type="button" class="acct' +
          (a.out ? ' out' : '') +
          '" data-acct="' +
          esc(a.e) +
          '">' +
          face(a) +
          '<span class="who"><b>' +
          esc(a.n || a.e) +
          '</b>' +
          (a.n ? '<small>' + esc(a.e) + '</small>' : '') +
          '</span>' +
          (a.out
            ? '<span class="tag">Signed out</span>'
            : a.e === cur
              ? '<span class="tick">' + S(I.check, 14) + '</span>'
              : '') +
          '</button>'
        );
      })
      .join('');
    if (!accts.length) {
      html =
        '<p class="acct-note">' +
        (state === 'loading'
          ? 'Loading your accounts…'
          : isExt
            ? 'Couldn’t load your Google accounts.' + (acctErr ? ' <span class="code">' + esc(acctErr) + '</span>' : '')
            : 'Your Google accounts show up in the installed extension.') +
        '</p>';
    }
    html +=
      '<div class="acct-foot"><a href="https://accounts.google.com/AddSession">' +
      S(I.plus, 13) +
      'Add account</a>' +
      '<a href="' +
      esc(acctUrl('https://myaccount.google.com/')) +
      '">Manage</a></div>';
    $('acctMenu').innerHTML = html;
  }
  function fetchAccts() {
    if (!isExt) return Promise.resolve(null);
    return fetch('https://accounts.google.com/ListAccounts?gpsia=1&source=ChromiumBrowser&json=standard', {
      method: 'POST', // Google answers GET with 400
      credentials: 'include'
    })
      .then(function (r) {
        acctErr = r.ok ? '' : 'HTTP ' + r.status;
        return r.text();
      })
      .then(function (t) {
        if (acctErr) return null;
        var j = JSON.parse(t.slice(t.indexOf('[')));
        var list = (j[1] || [])
          .map(function (a) {
            return { n: a[2] || '', e: a[3], p: a[4] || '', out: a[14] === 1 || a[9] === 0 };
          })
          .filter(function (a) {
            return a.e;
          });
        if (!list.length) {
          acctErr = 'no accounts';
          return null;
        }
        accts = list;
        save('atrium.accounts', list);
        return list;
      })
      .catch(function (e) {
        acctErr = acctErr || (e && e.name) || 'error';
        return null;
      });
  }
  function setAcct(open) {
    var m = $('acctMenu');
    m.hidden = !open;
    $('acctBtn').classList.toggle('active', open);
    $('acctBtn').setAttribute('aria-expanded', String(open));
    if (!open) return;
    setApps(false);
    renderAcctMenu(accts.length ? '' : 'loading');
    fetchAccts().then(function () {
      if (m.hidden) return;
      renderAcctMenu('');
      renderAvatar();
    });
  }
  function useAccount(email) {
    acct = email;
    save('atrium.account', email);
    $('appsMenu').innerHTML = ''; // rebuilt with the new account on next open
    renderAvatar();
    renderPanel();
    setAcct(false);
    toast('Google links open as ' + email);
  }
  function initAccount() {
    renderAvatar();
    $('acctBtn').addEventListener('click', function () {
      setAcct($('acctMenu').hidden);
    });
    $('acctMenu').addEventListener('click', function (e) {
      var b = e.target.closest('[data-acct]');
      if (!b) return;
      var email = b.getAttribute('data-acct');
      if (b.classList.contains('out'))
        return go('https://accounts.google.com/AccountChooser?Email=' + encodeURIComponent(email));
      useAccount(email);
    });
    addEventListener('mousedown', function (e) {
      if (!$('acctWrap').contains(e.target)) setAcct(false);
    });
  }

  // ---------- boot ----------
  function init() {
    applyTheme();
    $('themeBtn').addEventListener('click', function () {
      dark = !dark;
      save('atrium.theme', dark ? 'dark' : 'light');
      applyTheme();
    });
    $('editBtn').addEventListener('click', function () {
      setEdit(!edit);
    });

    var q = $('q');
    $('searchForm').addEventListener('submit', function (e) {
      e.preventDefault();
    });
    q.addEventListener('input', onInput);
    q.addEventListener('keydown', onKey);
    q.addEventListener('focus', function () {
      refreshTabs();
      update();
    });
    q.addEventListener('blur', function () {
      setOpen(false);
    });
    $('suggest').addEventListener('mousedown', function (e) {
      e.preventDefault();
      var o = e.target.closest('.opt');
      var op = o && opts[+o.getAttribute('data-i')];
      if (op && op.run) op.run(e.metaKey || e.ctrlKey);
    });
    $('suggest').addEventListener('mousemove', function (e) {
      var o = e.target.closest('.opt');
      if (o && +o.getAttribute('data-i') !== sel) select(+o.getAttribute('data-i'));
    });

    var panel = document.querySelector('.panel');
    panel.addEventListener('click', onPanelClick);
    panel.addEventListener('submit', onPanelSubmit);
    panel.addEventListener('keydown', onPanelKey);
    $('tabs').addEventListener(
      'wheel',
      function (e) {
        var t = this;
        if (t.scrollWidth <= t.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();
        t.scrollLeft += e.deltaY;
      },
      { passive: false }
    );
    panel.addEventListener('dragstart', onDragStart);
    panel.addEventListener('dragover', onDragOver);
    panel.addEventListener('drop', onDrop);
    panel.addEventListener('dragend', onDragEnd);

    addEventListener('resize', fitSuggest);
    addEventListener('keydown', function (e) {
      var typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        q.focus();
      } else if (e.key === 'Escape') {
        setApps(false);
        setAcct(false);
        if (edit && !typing) setEdit(false);
      }
    });
    document.addEventListener('visibilitychange', schedule);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) syncFromStorage(localStorage.getItem(DATA_KEY));
    });
    // Keep every open Atrium tab in step with changes made in another one.
    addEventListener('storage', function (e) {
      if (e.key === DATA_KEY) return syncFromStorage(e.newValue);
      if (e.key === 'atrium.theme' && e.newValue) {
        dark = e.newValue === '"dark"';
        return applyTheme();
      }
      if (e.key === 'atrium.account' || e.key === 'atrium.accounts') {
        acct = load('atrium.account', null);
        accts = load('atrium.accounts', []);
        $('appsMenu').innerHTML = '';
        renderAvatar();
        renderPanel();
      }
    });

    initApps();
    initAccount();
    renderPanel();
    initRates();
    schedule();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
