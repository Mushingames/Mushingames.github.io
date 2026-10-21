var L = JSON.parse(document.getElementById('L').textContent);
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var P = { twitch: ['#9147FF', 'i-twitch'], kick: ['#53FC18', 'i-kick'], youtube: ['#E0293E', 'i-youtube'], tiktok: ['#25F4EE', 'i-tiktok'] };
  function line(p, who, msg, size) {
    var d = document.createElement('div');
    d.className = 'chatline flex items-start gap-1.5 rounded-lg bg-night/80 border border-white/10 px-2 py-1 ' + (size || 'text-[11px]');
    d.innerHTML = '<svg class="w-3.5 h-3.5 mt-[2px] shrink-0" style="color:' + P[p][0] + '"><use href="#' + P[p][1] + '"/></svg><span class="min-w-0"><b style="color:' + P[p][0] + '">' + who + '</b> ' + msg + '</span>';
    return d;
  }
  function onView(el, fn, th) { new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting) { fn(); o.disconnect(); } }); }, { threshold: th || .35 }).observe(el); }

  // language switch remembers the choice (index.html sends Spanish browsers to es.html)
  $$('.lang a').forEach(function (a) { a.addEventListener('click', function () { try { localStorage.setItem('mh-home', a.dataset.lang); } catch (e) {} }); });

  // shared waveform helper
  function makeWave(el, n) { for (var i = 0; i < n; i++) el.appendChild(document.createElement('i')); return $$('i', el); }
  var waves = [];
  (function waveLoop() {
    var t = performance.now() / 140;
    waves.forEach(function (w) { w.bars.forEach(function (b, i) { b.style.setProperty('--v', w.on() ? (.25 + .75 * Math.abs(Math.sin(t + i * .6) * Math.sin(t * .37 + i))).toFixed(2) : .12); }); });
    requestAnimationFrame(waveLoop);
  })();

  // ================= HERO APP TOUR =================
  var ORDER = ['live', 'voice', 'ai', 'clips'], DUR = 7000;
  var SB = { live: 'live', voice: 'voice', ai: 'clips', clips: 'clips' };
  var tour = $('#tour'), pill = $('#vpill'), pillTxt = $('#vpillTxt');
  var cur = -1, elapsed = 0, last = 0, paused = false, inView = true, timers = [];
  function later(ms, fn) { timers.push(setTimeout(fn, reduce ? 0 : ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function say(txt) {
    pill.classList.add('hide');
    setTimeout(function () { pillTxt.textContent = txt; pill.style.borderColor = txt.charAt(0) === '✓' ? 'rgba(53,230,165,.75)' : ''; pill.classList.remove('hide'); }, reduce ? 0 : 220);
  }

  // live scene
  var tChat = $('#tourChat'), fi = 0, chatTimer = null;
  function pushChat() {
    var m = L.feed[fi++ % L.feed.length], el = line(m[0], m[1], m[2]);
    tChat.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('on'); });
    while (tChat.children.length > 8) tChat.removeChild(tChat.firstChild);
  }
  for (var c = 0; c < 7; c++) pushChat();
  $$('#tourChat .chatline').forEach(function (e) { e.classList.add('on'); });
  var clockS = 1 * 3600 + 12 * 60 + 40;
  setInterval(function () { clockS++; var h = Math.floor(clockS / 3600), m = Math.floor(clockS / 60) % 60, s = clockS % 60; $('#liveClock').textContent = h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }, 1000);

  // voice scene
  var tWave = { bars: makeWave($('#tWave'), 30), talking: false, on: function () { return this.talking; } };
  waves.push(tWave);

  var SCENES = {
    live: function () {
      say(L.pill.live[0]);
      if (!reduce) chatTimer = setInterval(pushChat, 1100);
      later(2600, function () { $('#actClip').classList.add('on'); });
      later(3300, function () { say(L.pill.live[1]); });
      later(4200, function () { $('#actClip').classList.remove('on'); });
    },
    voice: function () {
      var opts = $$('#tOpts .opt'), ap = $('#tApplied');
      opts.forEach(function (o) { o.classList.remove('pick', 'on'); }); ap.innerHTML = '';
      tWave.talking = true; $('#tLine').textContent = L.vline1; say(L.pill.voice[0]);
      later(2000, function () { tWave.talking = false; opts.forEach(function (o, i) { setTimeout(function () { o.classList.add('on'); }, reduce ? 0 : i * 160); }); });
      later(3300, function () { tWave.talking = true; $('#tLine').textContent = L.vline2; say(L.pill.voice[1]); });
      later(4500, function () { tWave.talking = false; opts[2].classList.add('pick'); });
      later(5100, function () {
        ap.innerHTML = ['Twitch', 'Kick', 'YouTube'].map(function (n) { return '<span class="pop inline-flex items-center gap-1 rounded-full bg-ok/10 border border-ok/40 text-ok px-2.5 py-0.5"><svg class="w-3 h-3"><use href="#i-check"/></svg>' + n + '</span>'; }).join('');
        $$('.pop', ap).forEach(function (e, i) { setTimeout(function () { e.classList.add('on'); }, i * 120); });
        say(L.pill.voice[2]);
      });
    },
    ai: function () {
      var q = $('#aiQuery'), bar = $('#aiBar'), res = $$('#aiRes .pop');
      q.textContent = ''; $('#aiChip').classList.remove('on'); res.forEach(function (r) { r.classList.remove('on'); });
      bar.style.transition = 'none'; bar.style.transform = 'scaleX(0)'; $('#aiStatus').textContent = ''; $('#aiPct').textContent = '';
      say(L.pill.ai[0]);
      var txt = L.query;
      for (var i = 1; i <= txt.length; i++) (function (n) { later(250 + n * 55, function () { q.textContent = txt.slice(0, n); }); })(i);
      later(1500, function () { $('#aiChip').classList.add('on'); });
      later(2000, function () { $('#aiBtn').classList.add('on'); });
      later(2300, function () {
        $('#aiBtn').classList.remove('on'); $('#aiStatus').textContent = L.analyzing;
        bar.offsetWidth; bar.style.transition = 'transform 1.8s cubic-bezier(.4,0,.2,1)'; bar.style.transform = 'scaleX(1)';
        var t0 = performance.now();
        (function pct() { var p = Math.min(100, Math.round((performance.now() - t0) / 18)); $('#aiPct').textContent = p + '%'; if (p < 100 && cur === 2) requestAnimationFrame(pct); })();
      });
      later(4200, function () { $('#aiStatus').textContent = L.found; say(L.pill.ai[1]); });
      res.forEach(function (r, i) { later(4300 + i * 260, function () { r.classList.add('on'); }); });
    },
    clips: function () {
      var steps = $$('#edSteps .step'), head = $('#edHead');
      steps.forEach(function (s) { s.classList.remove('on'); });
      ['#cropCam', '#cropGame', '#edPhone'].forEach(function (s) { $(s).classList.add('off'); });
      $('#edSub').classList.remove('on'); $('#edDone').classList.remove('on');
      head.style.transition = 'none'; head.style.transform = 'none';
      say(L.pill.clips[0]);
      steps.forEach(function (s, i) { later(300 + i * 900, function () { s.classList.add('on'); }); });
      later(500, function () { head.offsetWidth; head.style.transition = 'transform 4.2s linear'; head.style.transform = 'translateX(' + (head.parentNode.clientWidth * .46) + 'px)'; });
      later(2100, function () { $('#cropCam').classList.remove('off'); });
      later(2500, function () { $('#cropGame').classList.remove('off'); });
      later(3300, function () { $('#edPhone').classList.remove('off'); });
      later(4000, function () { $('#edSub').classList.add('on'); });
      later(5000, function () { $('#edBtn').classList.add('on'); });
      later(5500, function () { $('#edBtn').classList.remove('on'); $('#edDone').classList.add('on'); say(L.pill.clips[1]); });
    }
  };

  var tabs = $$('.tabs [role="tab"]');
  function go(i) {
    clearTimers(); clearInterval(chatTimer);
    cur = i; elapsed = 0;
    var key = ORDER[i];
    $$('.scene').forEach(function (s) {
      var on = s.dataset.scene === key;
      s.classList.toggle('show', on);
      $$('video[data-v]', s).forEach(function (v) { if (on && !reduce) { v.currentTime = 0; v.play().catch(function () {}); } else v.pause(); });
    });
    $$('.sb [data-sb]').forEach(function (s) { s.classList.toggle('act', s.dataset.sb === SB[key]); });
    tabs.forEach(function (t, j) { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; $('.prog', t).style.transform = 'scaleX(' + (j < i ? 1 : 0) + ')'; $('.prog', t).style.opacity = j < i ? '.35' : '1'; });
    SCENES[key]();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { go(i); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); var n = (i + d + ORDER.length) % ORDER.length; go(n); tabs[n].focus(); }
    });
  });
  // auto-advance; pauses while hovered, off-screen or with reduced motion
  tour.addEventListener('mouseenter', function () { paused = true; });
  tour.addEventListener('mouseleave', function () { paused = false; });
  new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: .2 }).observe(tour);
  function tick(now) {
    var dt = last ? now - last : 0; last = now;
    if (!reduce && !paused && inView && !document.hidden) {
      elapsed += dt;
      $('.prog', tabs[cur]).style.transform = 'scaleX(' + Math.min(1, elapsed / DUR).toFixed(3) + ')';
      if (elapsed >= DUR) go((cur + 1) % ORDER.length);
    }
    requestAnimationFrame(tick);
  }
  go(0);
  requestAnimationFrame(tick);

  // ================= VOICE SECTION =================
  var bigWave = { bars: makeWave($('#wave'), 34), talking: false, on: function () { return this.talking; } };
  waves.push(bigWave);
  var opts = $$('#titleOpts .opt'), applied = $('#applied');
  function voiceRun() {
    var vl = $('#voiceLine'); opts.forEach(function (o) { o.classList.remove('pick'); }); applied.innerHTML = '';
    bigWave.talking = true; vl.textContent = L.vline1;
    setTimeout(function () { bigWave.talking = false; }, 2200);
    setTimeout(function () { bigWave.talking = true; vl.textContent = L.vline2; }, 3400);
    setTimeout(function () { bigWave.talking = false; opts[2].classList.add('pick'); }, 4600);
    setTimeout(function () { applied.innerHTML = ['Twitch', 'Kick', 'YouTube'].map(function (n) { return '<span class="inline-flex items-center gap-1.5 rounded-full bg-ok/10 border border-ok/40 text-ok px-3 py-1"><svg class="w-3.5 h-3.5"><use href="#i-check"/></svg>' + n + '</span>'; }).join(''); }, 5200);
  }
  $('#voiceLine').textContent = L.vline1;
  onView($('#voiceDemo'), function () { voiceRun(); if (!reduce) setInterval(voiceRun, 9000); });

  // ================= MULTICHAT =================
  var merged = $('#mergedChat');
  L.merged.forEach(function (m, i) {
    var el = line(m[0], m[1], m[2], 'text-[.9rem]'); merged.appendChild(el);
    onView(merged, function () { setTimeout(function () { el.classList.add('on'); }, 250 * i); });
  });

  // ================= MIXER =================
  var lv = { mic: .55, game: .8, disc: .4, music: .5 }, muted = false;
  var knobs = { mic: 30, game: 18, disc: 60, music: 70 };
  $$('.fader').forEach(function (f) { $('.knob', f).style.setProperty('--k', knobs[f.dataset.ch] + 'px'); });
  (function mixLoop() {
    var t = performance.now() / 300;
    $$('.fader').forEach(function (f, i) {
      var c = f.dataset.ch, base = c === 'mic' && muted ? 0 : lv[c];
      $('.lvl', f).style.setProperty('--l', reduce ? base : Math.max(0, base * (.75 + .25 * Math.sin(t + i * 1.7))).toFixed(2));
    });
    $$('.meter').forEach(function (m, i) { var b = +m.dataset.m; m.style.transform = 'scaleX(' + (reduce ? b : Math.max(.05, b * (.7 + .3 * Math.sin(t * 1.6 + i * 2.1)))).toFixed(3) + ')'; });
    requestAnimationFrame(mixLoop);
  })();
  var acts = [function () { muted = true; }, function () { muted = false; }, function () { $('#mixScene').textContent = 'Lobby'; }, function () { $('#mixScene').textContent = 'Game'; }];
  var ci = 0, muteTag = $('[data-mute="mic"]');
  function mixStep() { var k = ci++ % acts.length; $('#mixCmd').textContent = L.mix[k]; acts[k](); muteTag.className = 'mute rounded-md px-2 py-0.5 text-[.72rem] font-bold ' + (muted ? 'bg-bad text-white' : 'bg-white/5'); }
  $('#mixCmd').textContent = L.mix[0];
  onView($('#mixer'), function () { mixStep(); if (!reduce) setInterval(mixStep, 2800); });

  // ================= CLIPS =================
  var CLIPS = {
    a: { src: 'media/clip-a.mp4', poster: 'media/clip-a.webp', score: '9/10' },
    b: { src: 'media/clip-b.mp4', poster: 'media/clip-b.webp', score: '8/10' }
  };
  var player = $('#clipPlayer'), bar = $('#moments');
  var heights = [18, 26, 22, 34, 30, 92, 40, 24, 20, 38, 30, 28, 46, 36, 26, 22, 30, 84, 44, 26, 20, 32, 28, 24, 36, 30, 22, 26];
  heights.forEach(function (h, i) {
    var peak = h > 80, b = document.createElement(peak ? 'button' : 'span');
    b.className = 'moment flex-1 rounded-t-md origin-bottom ' + (peak ? 'cursor-pointer bg-gradient-to-t from-vio/70 to-mag/70' : 'bg-white/10');
    b.style.height = h + '%';
    if (peak) { var key = i < 10 ? 'a' : 'b'; b.type = 'button'; b.dataset.clip = key; b.setAttribute('aria-label', L.see + L.clips[key][0]); b.setAttribute('aria-pressed', key === 'a' ? 'true' : 'false'); }
    bar.appendChild(b);
  });
  function load(key) {
    var c = CLIPS[key];
    if (player.dataset.key !== key) { player.src = c.src; player.poster = c.poster; player.dataset.key = key; }
    $('#clipTitle').textContent = L.clips[key][0]; $('#clipMeta').textContent = L.clips[key][1]; $('#clipScore').textContent = c.score;
    $$('[data-clip]').forEach(function (el) { el.setAttribute('aria-pressed', String(el.dataset.clip === key)); });
    if (!reduce) player.play().catch(function () {});
  }
  player.dataset.key = 'a';
  $$('[data-clip]').forEach(function (el) { el.addEventListener('click', function () { load(el.dataset.clip); }); });
  onView(player, function () { if (!reduce) player.play().catch(function () {}); });
})();
