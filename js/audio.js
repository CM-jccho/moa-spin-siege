/* ============================================================
   MOA SPIN SIEGE — Web Audio synthesizer (no samples, no CDN)
   Every sound is generated at runtime.
   ============================================================ */
window.SB = window.SB || {};
(function () {
  let ctx = null, master = null, comp = null, noiseBuf = null;
  let muted = false;
  const last = {};

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 22; comp.ratio.value = 8;
    comp.attack.value = 0.003; comp.release.value = 0.22;
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(comp); comp.connect(ctx.destination);
    // shared noise buffer
    const len = Math.floor(ctx.sampleRate * 0.6);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  function resume() {
    if (!ctx) init();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function now() { return ctx ? ctx.currentTime : 0; }

  function throttle(key, ms) {
    const t = performance.now();
    if (last[key] && t - last[key] < ms) return false;
    last[key] = t; return true;
  }

  function env(g, t0, a, d, peak) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }

  function tone(o) {
    if (!ctx || muted) return;
    const t0 = now() + (o.delay || 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(o.f2, 1), t0 + (o.slide || o.dur || 0.2));
    if (o.detune) osc.detune.value = o.detune;
    let node = g;
    if (o.filter) {
      const f = ctx.createBiquadFilter();
      f.type = o.filter; f.frequency.value = o.fc || 1200; f.Q.value = o.q || 1;
      g.connect(f); node = f;
    }
    env(g, t0, o.a || 0.005, o.dur || 0.15, o.v || 0.2);
    osc.connect(g); node.connect(master);
    osc.start(t0); osc.stop(t0 + (o.dur || 0.15) + (o.a || 0.005) + 0.06);
  }

  function noise(o) {
    if (!ctx || muted || !noiseBuf) return;
    const t0 = now() + (o.delay || 0);
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    src.playbackRate.value = o.rate || 1;
    const f = ctx.createBiquadFilter();
    f.type = o.filter || 'bandpass'; f.frequency.setValueAtTime(o.fc || 1800, t0);
    if (o.fc2) f.frequency.exponentialRampToValueAtTime(Math.max(o.fc2, 40), t0 + (o.dur || 0.15));
    f.Q.value = o.q || 1;
    const g = ctx.createGain();
    env(g, t0, o.a || 0.002, o.dur || 0.15, o.v || 0.2);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + (o.dur || 0.15) + 0.05);
  }

  const A = {
    init: init, resume: resume,
    isMuted: function () { return muted; },
    setMuted: function (m) {
      muted = !!m;
      document.body.classList.toggle('muted', muted);
      try { localStorage.setItem('moa.ss.muted', muted ? '1' : '0'); } catch (e) {}
    },
    setLang: function () {},

    click: function () { if (!ctx) return; tone({ f: 720, f2: 980, type: 'triangle', dur: 0.06, v: 0.10 }); },

    tick: function () {
      if (!ctx || muted || !throttle('tick', 22)) return;
      tone({ f: 1500 + Math.random() * 300, type: 'square', dur: 0.022, v: 0.035, filter: 'highpass', fc: 900 });
    },

    stop: function (n) {
      if (!ctx) return;
      const base = 150 + (n || 0) * 18;
      tone({ f: base, f2: base * 0.45, type: 'sine', dur: 0.16, v: 0.28 });
      noise({ fc: 2400, fc2: 600, dur: 0.08, v: 0.10 });
    },

    spinUp: function () {
      noise({ fc: 400, fc2: 2200, filter: 'bandpass', dur: 0.30, v: 0.07, rate: 1.4 });
    },

    match2: function () {
      if (!ctx) return;
      [523, 784].forEach(function (f, i) { tone({ f: f, type: 'triangle', dur: 0.18, v: 0.16, delay: i * 0.07 }); });
    },

    merge: function (tier) {
      if (!ctx) return;
      const base = 420 + (tier || 1) * 40;
      [1, 1.26, 1.5, 2].forEach(function (m, i) {
        tone({ f: base * m, type: 'triangle', dur: 0.20, v: 0.14, delay: i * 0.05 });
      });
      noise({ fc: 5200, fc2: 900, dur: 0.35, v: 0.10 });
    },

    jackpot: function () {
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
      notes.forEach(function (f, i) {
        tone({ f: f, type: 'triangle', dur: 0.42, v: 0.17, delay: i * 0.075 });
        tone({ f: f * 2, type: 'sine', dur: 0.25, v: 0.05, delay: i * 0.075 });
      });
      noise({ fc: 7000, fc2: 1800, dur: 0.7, v: 0.14, delay: 0.05 });
      for (let i = 0; i < 6; i++) {
        tone({ f: 1200 + Math.random() * 1600, type: 'sine', dur: 0.08, v: 0.06, delay: 0.5 + i * 0.09 });
      }
    },

    coin: function () {
      if (!ctx || !throttle('coin', 60)) return;
      tone({ f: 1180, type: 'square', dur: 0.05, v: 0.07 });
      tone({ f: 1560, type: 'square', dur: 0.08, v: 0.06, delay: 0.045 });
    },

    hit: function (crit) {
      if (!ctx || !throttle('hit', 32)) return;
      noise({ fc: crit ? 3200 : 2100, fc2: 500, dur: crit ? 0.14 : 0.08, v: crit ? 0.20 : 0.11, q: 0.8 });
      tone({ f: crit ? 220 : 160, f2: 60, type: 'sine', dur: 0.09, v: 0.13 });
      if (crit) tone({ f: 900, f2: 300, type: 'sawtooth', dur: 0.10, v: 0.06 });
    },

    arrow: function () {
      if (!ctx || !throttle('arrow', 45)) return;
      noise({ fc: 4200, fc2: 1400, dur: 0.07, v: 0.055, q: 2 });
    },

    magic: function () {
      if (!ctx || !throttle('magic', 60)) return;
      tone({ f: 420, f2: 1200, type: 'sine', dur: 0.16, v: 0.10 });
      tone({ f: 640, f2: 1800, type: 'triangle', dur: 0.12, v: 0.05, delay: 0.03 });
    },

    boom: function () {
      if (!ctx || !throttle('boom', 55)) return;
      noise({ fc: 900, fc2: 70, filter: 'lowpass', dur: 0.36, v: 0.22 });
      tone({ f: 110, f2: 36, type: 'sine', dur: 0.30, v: 0.22 });
    },

    hurt: function () {
      if (!ctx || !throttle('hurt', 130)) return;
      tone({ f: 150, f2: 48, type: 'square', dur: 0.24, v: 0.18, filter: 'lowpass', fc: 800 });
      noise({ fc: 600, fc2: 120, filter: 'lowpass', dur: 0.22, v: 0.14 });
    },

    promote: function () {
      if (!ctx) return;
      [523, 659, 880].forEach(function (f, i) { tone({ f: f, type: 'sine', dur: 0.35, v: 0.15, delay: i * 0.06 }); });
    },

    waveClear: function () {
      if (!ctx) return;
      [392, 523.25, 659.25, 783.99].forEach(function (f, i) {
        tone({ f: f, type: 'triangle', dur: 0.55, v: 0.13, delay: i * 0.09 });
      });
      noise({ fc: 6000, fc2: 1500, dur: 0.5, v: 0.08, delay: 0.1 });
    },

    boss: function () {
      if (!ctx) return;
      tone({ f: 180, f2: 48, type: 'sawtooth', dur: 0.9, v: 0.16, filter: 'lowpass', fc: 700 });
      noise({ fc: 300, fc2: 80, filter: 'lowpass', dur: 0.9, v: 0.16 });
      tone({ f: 90, f2: 40, type: 'square', dur: 1.1, v: 0.10, delay: 0.15 });
    },

    fever: function () {
      if (!ctx) return;
      const seq = [659, 784, 988, 1318, 988, 1318, 1568, 1976];
      seq.forEach(function (f, i) {
        tone({ f: f, type: 'square', dur: 0.12, v: 0.08, delay: i * 0.055 });
      });
      noise({ fc: 8000, fc2: 2000, dur: 0.5, v: 0.07 });
    },

    levelUp: function () {
      if (!ctx) return;
      tone({ f: 880, f2: 1760, type: 'triangle', dur: 0.25, v: 0.12 });
    },

    gameover: function () {
      if (!ctx) return;
      [392, 330, 262, 175].forEach(function (f, i) {
        tone({ f: f, type: 'sawtooth', dur: 0.6, v: 0.12, delay: i * 0.18, filter: 'lowpass', fc: 1100 });
      });
      noise({ fc: 500, fc2: 60, filter: 'lowpass', dur: 1.4, v: 0.12 });
    },

    victory: function () {
      if (!ctx) return;
      [523, 659, 784, 1046, 1318].forEach(function (f, i) {
        tone({ f: f, type: 'triangle', dur: 0.6, v: 0.14, delay: i * 0.1 });
      });
    }
  };

  SB.Audio = A;
})();
