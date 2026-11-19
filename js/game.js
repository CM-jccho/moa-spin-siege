/* ============================================================
   MOA SPIN SIEGE — game engine
   Slot machine → army summon → lane defense → relic roguelike.
   Classic scripts only (works from file://), no dependencies.
   ============================================================ */
window.SB = window.SB || {};
(function () {
  'use strict';
  const A = SB.Art, I = SB.I18n, S = SB.Audio;
  const $ = function (id) { return document.getElementById(id); };
  const clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  const lerp = function (a, b, t) { return a + (b - a) * t; };
  const rnd = function (a, b) { return a + Math.random() * (b - a); };
  const pick = function (arr) { return arr[(Math.random() * arr.length) | 0]; };
  const FONT = '"Inter","Segoe UI","Apple SD Gothic Neo","Noto Sans KR","Noto Sans CJK KR",sans-serif';

  /* ================= DATA ================= */
  const UNIT = {
    spear: { hp: 78, dmg: 14, aspd: 1.30, range: 0.60, weight: 24, rar: 'common', col: '#4fc3ff' },
    archer: { hp: 52, dmg: 12, aspd: 1.10, range: 1.95, weight: 21, rar: 'common', col: '#5cf2a8', proj: 'arrow' },
    mage: { hp: 58, dmg: 21, aspd: 1.55, range: 1.72, weight: 14, rar: 'rare', col: '#b07dff', proj: 'orb', aoe: 0.52 },
    artillery: { hp: 94, dmg: 40, aspd: 2.35, range: 2.85, weight: 8, rar: 'epic', col: '#ffa04d', proj: 'shell', aoe: 0.80 },
    knight: { hp: 175, dmg: 27, aspd: 1.65, range: 0.70, weight: 12, rar: 'rare', col: '#ffd98a' },
    coin: { weight: 19, rar: 'common', col: '#ffcf5c' },
    relic: { weight: 5, rar: 'legendary', col: '#ff3ea5' }
  };
  const SYM_KEYS = Object.keys(UNIT);
  const TIER_HP = 2.05, TIER_DMG = 2.18, TIER_ASPD = 1.055;

  const ENEMY = {
    goblin: { hp: 56, spd: 1.00, dmg: 8, atk: 1.15, gold: 4, size: 0.70, score: 12, from: 1 },
    orc: { hp: 158, spd: 0.76, dmg: 16, atk: 1.45, gold: 9, size: 0.84, score: 26, from: 2 },
    skeleton: { hp: 82, spd: 0.64, dmg: 10, atk: 1.5, gold: 8, size: 0.78, score: 24, ranged: 2.1, from: 3 },
    brute: { hp: 340, spd: 0.50, dmg: 25, atk: 1.9, gold: 16, size: 0.95, score: 55, armor: 0.22, from: 5 },
    wraith: { hp: 118, spd: 1.32, dmg: 13, atk: 1.25, gold: 11, size: 0.80, score: 32, from: 7 },
    boss: { hp: 1350, spd: 0.40, dmg: 44, atk: 1.75, gold: 140, size: 1.30, score: 400, armor: 0.12, boss: true }
  };

  const RELICS = [
    { id: 'jackpot', glyph: 'star', rar: 'rare', w: 2, mod: { triple: 0.30 } },
    { id: 'double', glyph: 'reel', rar: 'epic', w: 1.2, mod: { extra: 0.25 } },
    { id: 'pierce', glyph: 'arrow', rar: 'common', w: 3, mod: { spearPierce: 1 } },
    { id: 'rapid', glyph: 'arrow', rar: 'common', w: 3, mod: { archerAspd: 0.30 } },
    { id: 'arcane', glyph: 'rune', rar: 'rare', w: 2, mod: { mageDmg: 0.45 } },
    { id: 'heavy', glyph: 'bolt', rar: 'rare', w: 2, mod: { artDmg: 0.40, artAoe: 0.35 } },
    { id: 'shield', glyph: 'shield', rar: 'common', w: 3, mod: { hp: 0.25 } },
    { id: 'gold', glyph: 'coin', rar: 'common', w: 3, mod: { gold: 0.60 } },
    { id: 'wall', glyph: 'wall', rar: 'common', w: 3, mod: {} },
    { id: 'speed', glyph: 'reel', rar: 'rare', w: 2, mod: { spin: 0.30 } },
    { id: 'fever', glyph: 'bolt', rar: 'rare', w: 2, mod: { fever: 0.50 } },
    { id: 'vamp', glyph: 'heart', rar: 'epic', w: 1.2, mod: { vamp: 0.10 } },
    { id: 'thunder', glyph: 'bolt', rar: 'epic', w: 1.2, mod: { thunder: 6 } },
    { id: 'command', glyph: 'crown', rar: 'rare', w: 2, mod: { atk: 0.20 } },
    { id: 'crit', glyph: 'eye', rar: 'epic', w: 1.2, mod: { crit: 0.15, critMul: 0.5 } },
    { id: 'bounty', glyph: 'coin', rar: 'common', w: 3, mod: { bounty: 2 } },
    { id: 'holy', glyph: 'sword', rar: 'legendary', w: 0, vip: true, mod: { atk: 0.35, hp: 0.35, holy: 1 } }
  ];

  const QUESTS = [
    { id: 'q1', stat: 'spins', target: 10, n: 10, reward: { gold: 60 } },
    { id: 'q2', stat: 'promos', target: 3, n: 3, reward: { reroll: 1 } },
    { id: 'q3', stat: 'waves', target: 3, n: 3, reward: { gold: 80 } },
    { id: 'q4', stat: 'kills', target: 40, n: 40, reward: { gold: 100 } },
    { id: 'q5', stat: 'jackpots', target: 1, n: 1, reward: { reroll: 2 } },
    { id: 'q6', stat: 'heroTier', target: 1, n: 1, reward: { gold: 120 } },
    { id: 'q7', stat: 'bossKills', target: 1, n: 1, reward: { gold: 150 } },
    { id: 'q8', stat: 'goldEarned', target: 500, n: 500, reward: { reroll: 3 } }
  ];

    const MELEE = { spear: 1, knight: 1 };

  /* ================= STATE ================= */
  const G = {
    state: 'menu', t: 0, runT: 0,
    hp: 100, maxHp: 100, gold: 0, score: 0, best: 0, bestWave: 1,
    wave: 0, waveState: 'idle', waveTimer: 0, spawnQueue: [], spawnT: 0,
    units: [], enemies: [], projs: [], parts: [], texts: [], beams: [],
    reels: [{}, {}, {}], held: [false, false, false],
    spinning: false, spinT: 0, spinDur: 0.72, spinKind: 'none', spinIndex: 0,
    charges: 3, maxCharges: 4, chargeT: 0,
    rerolls: 3, fever: 0, feverT: 0, feverOn: false,
    mods: {}, relics: [], draft: [], draftPool: [],
    quests: [], questIdx: 0, questDirty: true,
    stats: { spins: 0, promos: 0, waves: 0, kills: 0, jackpots: 0, heroTier: 0, bossKills: 0, goldEarned: 0 },
    shake: 0, shakeT: 0, hitFlash: 0, auto: false, vip: false, vipRelic: false,
    pending: [], pendingT: 0, lastSpin: null, nextUnitId: 1, nextEnemyId: 1,
    thunderT: 0, boss: null, bossMaxHp: 0,
    scaleW: 1280, scaleH: 600, laneH: 200, castleX: 110, dpr: 1,
    stars: [], dust: [], hintShown: false, killsSinceToast: 0
  };

  let canvas, ctx, W = 1280, H = 600, laneH = 200, castleX = 110, dpr = 1;

  /* ================= AUDIO / STORAGE ================= */
  function loadPrefs() {
    try {
      const l = localStorage.getItem('moa.ss.lang');
      if (l && I.DICT[l]) I.setLang(l);
      G.best = +(localStorage.getItem('moa.ss.best') || 0);
      G.bestWave = +(localStorage.getItem('moa.ss.bestWave') || 1);
      G.vip = localStorage.getItem('moa.ss.vip') === '1';
      if (localStorage.getItem('moa.ss.muted') === '1') S.setMuted(true);
    } catch (e) {}
  }
  function saveBest() {
    try {
      if (G.score > G.best) { G.best = G.score; localStorage.setItem('moa.ss.best', String(G.best)); }
      if (G.wave > G.bestWave) { G.bestWave = G.wave; localStorage.setItem('moa.ss.bestWave', String(G.bestWave)); }
    } catch (e) {}
  }

  /* ================= LAYOUT ================= */
  function layout() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(320, r.width);
    H = Math.max(240, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    laneH = H / 3;
    castleX = clamp(W * 0.095, 44, 160);
    G.slots = W < 620 ? [0.44, 0.33, 0.22] : [0.465, 0.385, 0.305, 0.225, 0.145];
    G.compact = W < 620;
    G.units.forEach(function (u) { u.x = G.slots[Math.min(u.slot, G.slots.length - 1)]; });
    G.scaleW = W; G.scaleH = H; G.laneH = laneH; G.castleX = castleX;
    buildAmbient();
  }

  function buildAmbient() {
    G.stars.length = 0;
    const n = Math.round(W * H / 9000);
    for (let i = 0; i < n; i++) {
      G.stars.push({ x: Math.random() * W, y: Math.random() * H * 0.72, r: Math.random() * 1.5 + 0.3, p: Math.random() * 6.28, s: 0.4 + Math.random() * 1.4 });
    }
    G.dust.length = 0;
    for (let i = 0; i < 26; i++) {
      G.dust.push({ x: Math.random() * W, y: Math.random() * H, vx: rnd(-6, 6), vy: rnd(-14, -4), r: rnd(0.6, 1.8), a: rnd(0.06, 0.22) });
    }
  }

  /* ================= OVERLAYS / UI ================= */
  function show(id) { $(id).classList.add('show'); }
  function hide(id) { $(id).classList.remove('show'); }
  function anyOverlay() {
    return ['menuOverlay', 'draftOverlay', 'pauseOverlay', 'gameoverOverlay', 'howtoOverlay', 'vipOverlay']
      .some(function (k) { return $(k).classList.contains('show'); });
  }

  let toastN = 0;
  function toast(msg, cls) {
    const layer = $('toastLayer');
    const el = document.createElement('div');
    el.className = 'toast ' + (cls || '');
    el.textContent = msg;
    layer.appendChild(el);
    toastN++;
    while (layer.children.length > 3) layer.removeChild(layer.firstChild);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, 2100);
  }

  let bannerTO = null;
  function banner(kicker, title, sub, boss) {
    const b = $('waveBanner');
    $('wbKicker').textContent = kicker || '';
    $('wbTitle').textContent = title || '';
    $('wbSub').textContent = sub || '';
    b.classList.toggle('boss', !!boss);
    b.classList.remove('show');
    void b.offsetWidth;
    b.classList.add('show');
    clearTimeout(bannerTO);
    bannerTO = setTimeout(function () { b.classList.remove('show'); }, 2100);
  }

  function hud() {
    $('hpVal').textContent = Math.max(0, Math.ceil(G.hp));
    const pct = clamp(G.hp / G.maxHp, 0, 1) * 100;
    const bar = $('hpBar');
    bar.style.width = pct + '%';
    bar.classList.toggle('low', pct < 35);
    $('goldVal').textContent = Math.floor(G.gold);
    $('waveVal').textContent = Math.max(1, G.wave);
    $('scoreVal').textContent = Math.floor(G.score);
    const fv = G.feverOn ? (G.feverT / 9) * 100 : G.fever;
    $('feverFill').style.width = clamp(fv, 0, 100) + '%';
    $('feverFill').parentNode.classList.toggle('full', fv >= 99.5);
    $('feverVal').textContent = Math.round(clamp(fv, 0, 100)) + '%';
    const sb = $('spinBtn');
    sb.classList.toggle('cool', G.charges < 1 && !G.spinning);
    sb.classList.toggle('busy', G.spinning);
    sb.classList.toggle('ready', !G.spinning && G.charges >= 1);
    for (let i = 0; i < 4; i++) {
      const pip = $('pip' + i);
      if (pip) pip.classList.toggle('on', i < Math.floor(G.charges) || (i === Math.floor(G.charges) && G.chargeT > 0.5));
    }
    $('rerollCount').textContent = G.rerolls;
    $('rerollBtn').disabled = G.rerolls < 1 || G.spinning;
    $('autoBtn').classList.toggle('on', G.auto);
    if (G.boss) {
      const w = clamp(G.boss.hp / G.boss.maxHp, 0, 1) * 100;
      $('bossBar').style.width = w + '%';
    }
  }

  function renderQuests() {
    const ul = $('questList');
    let html = '';
    G.quests.forEach(function (q) {
      const cur = Math.min(G.stats[q.stat] || 0, q.target);
      const pct = cur / q.target * 100;
      const rew = q.reward.gold ? (q.reward.gold + 'G') : I.t('quest.reward.reroll', { n: q.reward.reroll });
      html += '<li class="q-item' + (cur >= q.target ? ' done' : '') + '">' +
        '<div class="q-top"><span>' + I.t('quest.' + q.id, { n: q.n }) + '</span><span class="q-rew">' + rew + '</span></div>' +
        '<div class="q-bar"><i style="width:' + pct + '%"></i></div></li>';
    });
    ul.innerHTML = html;
    G.questDirty = false;
  }

  /* ================= GAME FLOW ================= */
  function resetRun() {
    G.hp = 100; G.maxHp = 100; G.gold = 0; G.score = 0;
    G.wave = 0; G.waveState = 'idle'; G.waveTimer = 0; G.spawnQueue = []; G.spawnT = 0;
    G.units = []; G.enemies = []; G.projs = []; G.parts = []; G.texts = []; G.beams = [];
    G.held = [false, false, false];
    G.charges = 3; G.chargeT = 0;
    G.rerolls = 3; G.fever = 0; G.feverT = 0; G.feverOn = false;
    G.relics = []; G.draft = []; G.quests = [];
    G.stats = { spins: 0, promos: 0, waves: 0, kills: 0, jackpots: 0, heroTier: 0, bossKills: 0, goldEarned: 0 };
    G.spinning = false; G.pending = []; G.pendingT = 0; G.lastSpin = null;
    G.boss = null; G.thunderT = 0; G.auto = false; G.runT = 0;
    G.vipRelic = false; G.draftPend = 0; G.questDone = [];
    document.body.classList.remove('fever');
    recomputeMods();
    buildQuestLog();
    G.questDirty = true;
    G.reels.forEach(function (r, i) { r.sym = SYM_KEYS[(Math.random() * 4) | 0]; r.offset = 0; r.spinning = false; });
    G.reels.forEach(function (r, i) { refreshStrip(i, r.sym); });
    if (G.vip) {
      // VIP starter relic: unlocked from the first wave
      addRelic('holy', true);
    }
  }

  function startGame() {
    S.init(); S.resume();
    hide('menuOverlay'); hide('gameoverOverlay'); hide('pauseOverlay');
    G.state = 'playing';
    resetRun();
    document.getElementById('app').setAttribute('data-state', 'playing');
    setTimeout(function () { startWave(1); }, 700);
    hud();
  }

  function toMenu() {
    G.state = 'menu';
    document.getElementById('app').setAttribute('data-state', 'menu');
    hide('gameoverOverlay'); hide('pauseOverlay'); hide('draftOverlay');
    show('menuOverlay');
    $('bestScore').textContent = G.best;
    $('bestWave').textContent = G.bestWave;
    G.units = []; G.enemies = []; G.projs = []; G.pending = [];
    G.waveState = 'idle'; G.boss = null;
    $('bossHud').hidden = true;
    document.body.classList.remove('fever');
  }

  function gameOver() {
    if (G.state === 'gameover') return;
    G.state = 'gameover';
    S.gameover();
    G.shake = 22; G.shakeT = 0.8;
    const prevBest = G.best;
    saveBest();
    $('finalScore').textContent = Math.floor(G.score);
    $('overStats').innerHTML =
      '<div><span>' + I.t('stat.wave') + '</span><b>' + G.wave + '</b></div>' +
      '<div><span>' + I.t('stat.kills') + '</span><b>' + G.stats.kills + '</b></div>' +
      '<div><span>' + I.t('stat.promos') + '</span><b>' + G.stats.promos + '</b></div>' +
      '<div><span>' + I.t('stat.relics') + '</span><b>' + G.relics.length + '</b></div>' +
      '<div><span>' + I.t('stat.gold') + '</span><b>' + Math.floor(G.gold) + '</b></div>' +
      '<div><span>' + I.t('gameover.best') + '</span><b>' + G.best + '</b></div>';
    $('bossHud').hidden = true;
    show('gameoverOverlay');
    if (G.score >= prevBest && G.score > 0) toast(I.t('toast.newBest'), 'gold');
  }

  function togglePause() {
    if (G.state === 'playing') {
      G.state = 'paused';
      $('pauseStats').innerHTML =
        '<div><span>' + I.t('stat.wave') + '</span><b>' + G.wave + '</b></div>' +
        '<div><span>' + I.t('stat.score') + '</span><b>' + Math.floor(G.score) + '</b></div>' +
        '<div><span>' + I.t('stat.kills') + '</span><b>' + G.stats.kills + '</b></div>' +
        '<div><span>' + I.t('stat.relics') + '</span><b>' + G.relics.length + '</b></div>';
      show('pauseOverlay');
    } else if (G.state === 'paused') {
      G.state = 'playing';
      hide('pauseOverlay');
    }
  }

  /* ================= WAVES ================= */
  let bossCounter = 0;
  const BOSS_NAMES = ['GORTHAK', 'MORDRAX', 'VEXARION', 'KRAAGOR', 'NYXUL'];

  function startWave(n) {
    if (G.state !== 'playing') return;
    G.wave = n;
    G.stats.waves = n - 1;
    G.waveState = 'active';
    G.spawnQueue = buildWave(n);
    G.spawnT = 0;
    G.boss = null;
    $('bossHud').hidden = true;
    const isBoss = n % 5 === 0;
    S.levelUp();
    banner(isBoss ? I.t('wave.boss') : I.t('hud.wave'), I.t('wave.incoming', { n: n }), isBoss ? 'BOSS' : '', isBoss);
    if (n === 1) setTimeout(function () {
      if (G.state === 'playing' && !G.hintShown) { G.hintShown = true; toast(I.t('slot.hintSpin')); }
    }, 1500);
  }

  function buildWave(n) {
    const isBoss = n % 5 === 0;
    const q = [];
    const hpMul = Math.pow(1.155, n - 1);
    const dmgMul = 1 + (n - 1) * 0.10;
    const types = Object.keys(ENEMY).filter(function (t) { return !ENEMY[t].boss && ENEMY[t].from <= n; });
    let budget = 5 + n * 2.9;
    let t = 0.4;
    const lanes = [0, 1, 2];
    if (isBoss) {
      bossCounter++;
      const bossName = BOSS_NAMES[(bossCounter - 1) % BOSS_NAMES.length] + ' ' + ['I', 'II', 'III', 'IV', 'V'][Math.min(4, Math.floor((n - 5) / 25))];
      q.push({ type: 'boss', lane: 1, t: 1.0, hpMul: hpMul * 1.0, dmgMul: dmgMul, name: bossName });
      budget *= 0.55;
    }
    let guard = 0;
    while (budget > 0 && guard < 60) {
      guard++;
      const type = pick(types);
      const def = ENEMY[type];
      const cost = { goblin: 1, orc: 2.2, skeleton: 1.9, brute: 4.2, wraith: 2.6 }[type] || 1;
      budget -= cost;
      t += rnd(0.35, 0.95);
      q.push({ type: type, lane: pick(lanes), t: t, hpMul: hpMul, dmgMul: dmgMul });
    }
    return q;
  }

  function spawnEnemy(spec) {
    const def = ENEMY[spec.type];
    const hp = def.hp * spec.hpMul * (1 + G.wave * 0.03);
    const e = {
      id: G.nextEnemyId++, type: spec.type, lane: spec.lane,
      x: spec.at || (1.03 + rnd(0, 0.05)), hp: hp, maxHp: hp,
      dmg: def.dmg * spec.dmgMul, atk: def.atk, cd: rnd(0.2, 0.8),
      spd: def.spd * W * 0.070, size: def.size, gold: def.gold, score: def.score,
      ranged: def.ranged || 0, armor: def.armor || 0, boss: !!def.boss,
      hurt: 0, atkAnim: 0, bob: Math.random() * 6.28, born: G.t,
      name: spec.name || null, roarT: 3
    };
    G.enemies.push(e);
    if (e.boss) {
      G.boss = e; G.bossMaxHp = hp;
      $('bossHud').hidden = false;
      $('bossName').textContent = spec.name || 'BOSS';
      S.boss();
    }
    for (let i = 0; i < 8; i++) spark(e.x * W, laneY(e.lane), '#ff6b8a', 1.4);
  }

  function laneY(lane) { return laneH * (lane + 0.9); }

  /* ================= SPIN ================= */
  function weightedSym() {
    let total = 0;
    SYM_KEYS.forEach(function (k) { total += UNIT[k].weight; });
    let r = Math.random() * total;
    for (let i = 0; i < SYM_KEYS.length; i++) {
      r -= UNIT[SYM_KEYS[i]].weight;
      if (r <= 0) return SYM_KEYS[i];
    }
    return 'spear';
  }

  function pickSpin() {
    const heldIdx = [];
    for (let i = 0; i < 3; i++) if (G.held[i]) heldIdx.push(i);
    const open = [0, 1, 2].filter(function (i) { return heldIdx.indexOf(i) < 0; });
    const syms = [null, null, null];
    heldIdx.forEach(function (i) { syms[i] = G.reels[i].sym; });
    if (!open.length) return { syms: syms, kind: 'none' };

    const feverBoost = G.feverOn ? 1 : 0;
    const pTriple = clamp(G.mods.triple + feverBoost * 0.20, 0, 0.85);
    const pPair = clamp(G.mods.pair + feverBoost * 0.30, 0, 0.95);
    const r = Math.random();
    let kind = 'none';

    if (r < pTriple) {
      const base = heldIdx.length ? G.reels[heldIdx[0]].sym : weightedSym();
      open.forEach(function (i) { syms[i] = base; });
      kind = 'triple';
    } else if (r < pTriple + pPair) {
      const base = heldIdx.length ? G.reels[heldIdx[0]].sym : weightedSym();
      if (open.length >= 2) {
        syms[open[0]] = base;
        syms[open[1]] = weightedSym();
      } else {
        syms[open[0]] = base;
      }
      kind = 'pair';
    } else {
      open.forEach(function (i) { syms[i] = weightedSym(); });
    }
    // natural matches also count
    const count = {};
    syms.forEach(function (s) { count[s] = (count[s] || 0) + 1; });
    Object.keys(count).forEach(function (k) {
      if (count[k] === 3) kind = 'triple';
      else if (count[k] === 2 && kind !== 'triple') kind = 'pair';
    });
    return { syms: syms, kind: kind };
  }

  function doSpin(free) {
    if (G.state !== 'playing' || G.spinning) return false;
    if (G.pendingT > 0 && G.pending.length) { commitPending(); }
    if (!free) {
      if (G.charges < 1) { return false; }
      if (G.held[0] && G.held[1] && G.held[2]) { toast(I.t('slot.holdLimit')); return false; }
      G.charges -= 1;
      G.chargeT = 0;
    }
    const res = pickSpin();
    G.lastSpin = res;
    G.spinning = true;
    G.spinT = 0;
    G.stats.spins++;
    G.questDirty = true;
    S.spinUp();
    for (let i = 0; i < 3; i++) {
      const r = G.reels[i];
      if (G.held[i]) { r.spinning = false; continue; }
      r.sym = res.syms[i];
      r.spinning = true;
      r.offset = 0; r.started = G.t;
      r.dur = 0.60 + i * 0.16;
      refreshStrip(i, r.sym);
      r.el.classList.remove('held');
    }
    $('reels').classList.add('spinning');
    hud();
    return true;
  }

  function updateSpin(dt) {
    if (!G.spinning) return;
    let allDone = true;
    for (let i = 0; i < 3; i++) {
      const r = G.reels[i];
      if (!r.spinning) continue;
      const p = clamp((G.t - r.started) / r.dur, 0, 1);
      const e = 1 - Math.pow(1 - p, 3.1);
      const prev = r.offset;
      r.offset = e * 12;
      if (p < 1) allDone = false;
      else if (!r.stopped) {
        r.stopped = true;
        r.bounceT = 0.24;
        r.el.classList.remove('spin');
        r.el.classList.add('flash');
        setTimeout(function () { r.el.classList.remove('flash'); r.el.classList.remove('match'); }, 520);
        S.stop(i);
      }
      if (Math.floor(prev) !== Math.floor(r.offset)) S.tick();
      if (r.bounceT > 0) {
        r.bounceT -= dt;
        r.bounce = Math.sin((1 - r.bounceT / 0.24) * Math.PI) * 0.10;
      } else r.bounce = 0;
      applyReelTransform(i);
    }
    if (allDone) {
      G.reels.forEach(function (r) { r.spinning = false; r.stopped = false; });
      G.spinning = false;
      $('reels').classList.remove('spinning');
      resolveSpin();
    }
  }

  function applyReelTransform(i) {
    const r = G.reels[i];
    const cellH = r.cellH || 90;
    const y = -(r.offset + (r.bounce || 0)) * cellH;
    r.strip.style.transform = 'translate3d(0,' + y.toFixed(2) + 'px,0)';
  }

  /* ---- reel DOM ---- */
  function buildReels() {
    const wrap = $('reels');
    G.reels.forEach(function (r) { if (r.el) wrap.removeChild(r.el); });
    for (let i = 0; i < 3; i++) {
      const el = document.createElement('button');
      el.className = 'reel';
      el.setAttribute('aria-label', 'reel ' + (i + 1));
      el.innerHTML = '<div class="strip"></div><div class="reel-glow"></div><div class="lock">' + I.t('slot.held') + '</div>';
      wrap.appendChild(el);
      const r = G.reels[i];
      r.el = el; r.strip = el.querySelector('.strip'); r.cells = [];
      for (let c = 0; c < 16; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.innerHTML = '<div class="rar"></div><img alt=""><span class="nm"></span>';
        r.strip.appendChild(cell);
        r.cells.push(cell);
      }
      el.addEventListener('click', function () { toggleHold(i); });
    }
    measureReels();
  }

  function measureReels() {
    G.reels.forEach(function (r) {
      const h = r.cells[0] ? r.cells[0].offsetHeight : 0;
      r.cellH = h || 90;
      applyReelTransform(G.reels.indexOf(r));
    });
  }

  function refreshStrip(i, sym) {
    const r = G.reels[i];
    if (!r || !r.cells) return;
    r.cells.forEach(function (cell, c) {
      const s = c === 12 ? sym : (c === 0 && r.offset === 0 ? sym : weightedSym());
      setCell(cell, s);
    });
    r.offset = 0; r.bounce = 0;
    applyReelTransform(i);
  }

  function setCell(cell, sym) {
    const u = UNIT[sym];
    const img = cell.querySelector('img');
    const nm = cell.querySelector('.nm');
    const rar = cell.querySelector('.rar');
    const url = A.icon(sym, 1);
    cell.setAttribute('data-sym', sym);
    if (img.getAttribute('src') !== url) img.setAttribute('src', url);
    img.alt = sym;
    nm.textContent = u ? I.t('unit.' + sym) : '';
    const target = unitRar(sym);
    if (rar.parentNode.getAttribute('data-rar') !== target) rar.parentNode.setAttribute('data-rar', target);
  }

  function relabelReels() {
    G.reels.forEach(function (r, i) {
      if (!r.el) return;
      r.el.querySelector('.lock').textContent = I.t('slot.held');
      r.cells.forEach(function (cell) {
        const sym = cell.getAttribute('data-sym');
        if (!sym) return;
        cell.querySelector('.nm').textContent = I.t('unit.' + sym);
        cell.querySelector('img').alt = sym;
      });
      applyReelTransform(i);
    });
  }
  function unitRar(sym) { return UNIT[sym] ? UNIT[sym].rar : 'common'; }

  function toggleHold(i) {
    if (G.state !== 'playing' || G.spinning) return;
    if (!G.held[i]) {
      const n = G.held.filter(Boolean).length;
      if (n >= 2) { toast(I.t('slot.holdLimit')); return; }
    }
    G.held[i] = !G.held[i];
    G.reels[i].el.classList.toggle('held', G.held[i]);
    S.click();
  }

  /* ---- resolve ---- */
  function resolveSpin() {
    const res = G.lastSpin;
    if (!res) return;
    const syms = res.syms;
    G.pending = [];
    G.pendingT = 0.9;
    let tripleSym = null, pairSym = null;
    const count = {};
    syms.forEach(function (s) { count[s] = (count[s] || 0) + 1; });
    Object.keys(count).forEach(function (k) {
      if (count[k] === 3) tripleSym = k;
      else if (count[k] === 2) pairSym = k;
    });

    if (tripleSym) {
      G.stats.jackpots++;
      G.questDirty = true;
      S.jackpot();
      G.shake = 14; G.shakeT = 0.5;
      addFever(40);
      banner(I.t('slot.triple'), I.t('slot.jackpot'), tripleSym ? I.t('unit.' + tripleSym) : '', false);
      sparkBurst(W * 0.5, H * 0.32, 40, '#ffcf5c');
      G.score += 150;
    } else if (pairSym) {
      S.match2();
      addFever(10);
      G.gold += Math.round(14 * G.mods.gold);
      G.stats.goldEarned += Math.round(14 * G.mods.gold);
      G.score += 40;
    }
    addFever(9);

    const matchSym = tripleSym || pairSym;
    for (let i = 0; i < 3; i++) {
      if (matchSym && syms[i] === matchSym) G.reels[i].el.classList.add('match');
      summonSymbol(syms[i], i, tripleSym ? 1 : 0, i);
    }
    if (G.mods.extra > 0 && Math.random() < G.mods.extra) {
      summonSymbol(weightedSym(), (Math.random() * 3) | 0, 0, 4, true);
    }
    G.reels.forEach(function (r, i) { if (r.el) r.el.classList.toggle('held', G.held[i]); });
    hud();
  }

  function summonSymbol(sym, lane, tierBonus, reelIdx, bonus) {
    const def = UNIT[sym];
    if (!def) return;
    if (sym === 'coin') {
      const g = Math.round((tierBonus ? 55 : 14) * G.mods.gold);
      gainGold(g);
      floatText(W * (0.5 + (Math.random() - 0.5) * 0.2), H * 0.3, '+' + g + 'G', '#ffd76a', 20, g);
      S.coin();
      sparkBurst(reelX(reelIdx), H - 6, 10, '#ffcf5c');
      return;
    }
    if (sym === 'relic') {
      grantRandomRelic();
      return;
    }
    const tier = clamp(1 + (tierBonus || 0), 1, 4);
    const laneList = G.units.filter(function (u) { return u.lane === lane; });
    const occupied = laneList.filter(function (u) { return !u.pending && !u.dying; });
    let slot = -1;
    if (occupied.length >= G.slots.length) {
      // full lane: absorb the newcomer into the weakest unit (promotion)
      let low = null;
      occupied.forEach(function (u) {
        if (u.tier >= 4) return;
        if (!low || u.tier < low.tier || (u.tier === low.tier && u.hp < low.hp)) low = u;
      });
      if (low) {
        if (low.type !== sym || low.tier !== tier) {
          floatText(low.x * W, laneY(low.lane) - laneH * 0.5, I.t('slot.absorb'), '#9fe8ff', 16);
        }
        promote(low, 1);
        return;
      }
      gainGold(Math.round(12 * G.mods.gold));
      if (G.killsSinceToast++ % 6 === 0) toast(I.t('slot.laneFull'));
      return;
    }
    const order = MELEE[sym] ? G.slots.map(function (_, i) { return i; }) : G.slots.map(function (_, i) { return G.slots.length - 1 - i; });
    for (let k = 0; k < order.length; k++) {
      const s = order[k];
      if (!occupied.some(function (u) { return u.slot === s; })) { slot = s; break; }
    }
    if (slot < 0) slot = 0;
    const u = makeUnit(sym, tier, lane, slot);
    u.pending = 0.62;
    u.arriveT = 0.62;
    G.units.push(u);
    G.pending.push(u);
    // beam from slot panel up into the lane
    G.beams.push({ x0: reelX(reelIdx), y0: H, x1: u.x * W, y1: laneY(lane) - 30, life: 0.34, max: 0.34, col: def.col });
    S.click();
    sparkBurst(u.x * W, laneY(lane) - 20, 6, def.col);
  }

  function reelX(i) {
    const r = G.reels[i] || G.reels[0];
    if (r && r.el) {
      const b = r.el.getBoundingClientRect(), c = canvas.getBoundingClientRect();
      return clamp(b.left - c.left + b.width / 2, 0, W);
    }
    return W * (0.3 + i * 0.13);
  }

  function makeUnit(type, tier, lane, slot) {
    const d = UNIT[type];
    const hpM = Math.pow(TIER_HP, tier - 1) * (G.mods.hp || 1);
    const dmM = Math.pow(TIER_DMG, tier - 1) * (G.mods.atk || 1);
    let aspd = d.aspd * Math.pow(TIER_ASPD, tier - 1);
    if (type === 'archer') aspd *= 1 + (G.mods.archerAspd || 0);
    const unit = {
      id: G.nextUnitId++, type: type, tier: tier, lane: lane, slot: slot,
      x: G.slots[Math.min(slot, G.slots.length - 1)], hp: d.hp * hpM, maxHp: d.hp * hpM,
      dmg: d.dmg * dmM, aspd: aspd, cd: rnd(0, 0.4),
      aspect: d.aspect, pending: 0, hurt: 0, atkAnim: 0, bob: Math.random() * 6.28,
      gold: 0, dying: false, kills: 0
    };
    return unit;
  }

  function commitPending() {
    G.pending.forEach(function (u) { u.pending = 0; });
    G.pending = [];
    G.pendingT = 0;
  }

  function promote(u, times) {
    if (u.tier >= 4) {
      u.hp = u.maxHp;
      return;
    }
    const before = u.tier;
    u.tier = clamp(u.tier + (times || 1), 1, 4);
    for (let t = before; t < u.tier; t++) {
      u.maxHp *= TIER_HP; u.dmg *= TIER_DMG; u.aspd *= TIER_ASPD;
    }
    u.hp = u.maxHp;
    G.stats.promos++;
    if (u.tier >= 3) G.stats.heroTier = 1;
    G.questDirty = true;
    G.score += 60 * u.tier;
    S.promote(); S.merge(u.tier);
    const x = u.x * W, y = laneY(u.lane) - laneH * 0.35;
    floatText(x, y, I.t('toast.promo', { tier: I.t('tier.' + u.tier), unit: I.t('unit.' + u.type) }), '#ffe9a8', Math.min(26, 14 + u.tier * 3));
    ring(x, y, UNIT[u.type].col, 1.4);
    sparkBurst(x, y, 14, '#fff2c8');
    G.shake = Math.min(10, 3 + u.tier * 1.5); G.shakeT = 0.22;
  }

  function tryMerge(u) {
    if (u.tier >= 4) return false;
    const twin = G.units.find(function (o) {
      return o !== u && !o.dying && !o.pending && o.lane === u.lane && o.type === u.type && o.tier === u.tier && o.tier < 4;
    });
    if (!twin) return false;
    // merge into the twin (keeps its slot), consume the newcomer
    promote(twin, 1);
    u.dying = true;
    u.hp = 0;
    return true;
  }

  /* ================= RELICS ================= */
  function baseMods() {
    return {
      triple: 0.045, pair: 0.13, extra: 0, atk: 1, hp: 1, aspd: 1, gold: 1,
      spin: 1, fever: 1, vamp: 0, crit: 0.08, critMul: 2, bounty: 0,
      thunder: 0, spearPierce: 0, archerAspd: 0, mageDmg: 0, artDmg: 0, artAoe: 0, holy: 0,
      vipSkin: 0
    };
  }
  function recomputeMods() {
    const m = baseMods();
    G.relics.forEach(function (id) {
      const r = RELICS.find(function (x) { return x.id === id; });
      if (!r) return;
      const d = r.mod;
      if (d.triple) m.triple += d.triple;
      if (d.pair) m.pair += d.pair;
      if (d.extra) m.extra += d.extra;
      if (d.atk) m.atk *= 1 + d.atk;
      if (d.hp) m.hp *= 1 + d.hp;
      if (d.gold) m.gold *= 1 + d.gold;
      if (d.spin) m.spin *= 1 + d.spin;
      if (d.fever) m.fever *= 1 + d.fever;
      if (d.vamp) m.vamp += d.vamp;
      if (d.crit) m.crit += d.crit;
      if (d.critMul) m.critMul += d.critMul;
      if (d.bounty) m.bounty += d.bounty;
      if (d.thunder) m.thunder = d.thunder;
      if (d.spearPierce) m.spearPierce = 1;
      if (d.archerAspd) m.archerAspd += d.archerAspd;
      if (d.mageDmg) m.mageDmg += d.mageDmg;
      if (d.artDmg) m.artDmg += d.artDmg;
      if (d.artAoe) m.artAoe += d.artAoe;
      if (d.holy) { m.holy = 1; m.vipSkin = 1; }
    });
    G.mods = m;
  }

  function addRelic(id, quiet) {
    if (G.relics.indexOf(id) >= 0) return;
    const prevAtk = G.mods.atk || 1, prevHp = G.mods.hp || 1;
    G.relics.push(id);
    const r = RELICS.find(function (x) { return x.id === id; });
    if (id === 'wall') {
      G.maxHp += 30; G.hp += 30;
    }
    if (id === 'holy') {
      G.maxHp += 10; G.hp += 10;
    }
    recomputeMods();
    const dAtk = (G.mods.atk || 1) / prevAtk, dHp = (G.mods.hp || 1) / prevHp;
    if (dAtk !== 1 || dHp !== 1) {
      G.units.forEach(function (u) {
        u.dmg *= dAtk;
        u.maxHp *= dHp;
        u.hp = Math.min(u.maxHp, u.hp * dHp + 1);
      });
    }
    if (!quiet) {
      S.victory();
      toast(I.t('toast.relic', { name: I.t('relic.' + id) }), 'mag');
      const rc = $('stage').getBoundingClientRect();
      for (let i = 0; i < 3; i++) sparkBurst(rnd(rc.width * 0.25, rc.width * 0.75), rnd(rc.height * 0.25, rc.height * 0.5), 12, r ? RELIC_COLOR(r.rar) : '#ffcf5c');
    }
  }

  function RELIC_COLOR(rar) {
    return rar === 'legendary' ? '#ffcf5c' : rar === 'epic' ? '#b58cff' : rar === 'rare' ? '#63e3ff' : '#9fb0dd';
  }

  function grantRandomRelic() {
    const avail = RELICS.filter(function (r) { return !r.vip && G.relics.indexOf(r.id) < 0; });
    if (!avail.length) { gainGold(40); return; }
    const r = pick(avail);
    addRelic(r.id);
  }

  function relicWeight(r) {
    return r.w;
  }

  function rollDraft() {
    const avail = RELICS.filter(function (r) { return !r.vip && G.relics.indexOf(r.id) < 0; });
    const out = [];
    const pool = avail.slice();
    while (out.length < 3 && pool.length) {
      let total = 0;
      pool.forEach(function (r) { total += relicWeight(r); });
      if (total <= 0) break;
      let x = Math.random() * total;
      let idx = 0;
      for (let i = 0; i < pool.length; i++) {
        x -= relicWeight(pool[i]);
        if (x <= 0) { idx = i; break; }
      }
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  }

  function showDraft() {
    G.state = 'draft';
    G.draft = rollDraft();
    if (!G.draft.length) { nextWave(); return; }
    const wrap = $('draftCards');
    wrap.innerHTML = '';
    G.draft.forEach(function (r, i) {
      const card = document.createElement('button');
      card.className = 'relic-card';
      card.setAttribute('data-rar', r.rar);
      card.innerHTML = '<div class="rc-glow"></div>' +
        '<div class="rc-top"><div class="rc-art"><img src="' + A.relic(r.glyph, RELIC_COLOR(r.rar)) + '" alt=""></div>' +
        '<span class="rarity">' + I.t('rarity.' + r.rar) + '</span></div>' +
        '<h3>' + I.t('relic.' + r.id) + '</h3>' +
        '<p>' + I.t('relic.' + r.id + '.d') + '</p>' +
        '<span class="rc-pick">' + I.t('draft.pick') + ' ' + (i + 1) + '</span>';
      card.addEventListener('click', function () { pickDraft(i); });
      wrap.appendChild(card);
    });
    $('draftRerollCost').textContent = 40;
    show('draftOverlay');
    S.levelUp();
    hud();
  }

  function pickDraft(i) {
    const r = G.draft[i];
    if (!r) return;
    addRelic(r.id);
    hide('draftOverlay');
    nextWave();
    S.click();
  }

  function rerollDraft() {
    if (G.gold < 40) { toast(I.t('draft.noGold')); return; }
    G.gold -= 40;
    S.click();
    showDraft();
  }

  function nextWave() {
    G.state = 'playing';
    G.waveState = 'prep';
    G.waveTimer = 1.7;
    hud();
  }

  /* ================= COMBAT ================= */
  function gainGold(n) {
    if (n <= 0) return;
    const v = Math.round(n * (G.mods.gold || 1));
    G.gold += v;
    G.stats.goldEarned += v;
    G.score += 2;
    hud();
  }

  function addFever(n) {
    if (G.feverOn) return;
    G.fever = clamp(G.fever + n * (G.mods.fever || 1), 0, 100);
    if (G.fever >= 100) startFever();
  }

  function startFever() {
    G.feverOn = true;
    G.feverT = 9;
    G.fever = 100;
    document.body.classList.add('fever');
    S.fever();
    toast(I.t('toast.fever'), 'gold');
    G.shake = 8; G.shakeT = 0.4;
    for (let i = 0; i < 26; i++) sparkBurst(rnd(W * 0.2, W * 0.8), rnd(H * 0.2, H * 0.6), 4, i % 2 ? '#ffcf5c' : '#ff3ea5');
  }

  function endFever() {
    G.feverOn = false;
    G.feverT = 0;
    G.fever = 0;
    document.body.classList.remove('fever');
  }

  function enemyDamageMult() { return 1; }

  function hitEnemy(e, dmg, crit, from) {
    if (e.dead) return;
    const armor = e.armor || 0;
    let d = dmg * (1 - armor);
    e.hp -= d;
    e.hurt = 0.14;
    const esz = Math.min(laneH * 0.78 * e.size, W * 0.245 * e.size);
    const x = e.x * W, y = laneY(e.lane) - esz * 0.74;
    floatText(x + rnd(-3, 3), y, (crit ? '✦' : '') + Math.round(d), crit ? '#ffe27a' : '#ffffff', crit ? 24 : 17, crit ? undefined : -Math.round(d));
    if (crit) { S.hit(true); G.shake = Math.max(G.shake, 5); G.shakeT = 0.16; }
    else S.hit(false);
    spark(x, y + laneH * 0.2, crit ? '#ffd166' : '#cfe3ff', 1);
    if (G.mods.vamp && from) from.hp = Math.min(from.maxHp, from.hp + d * G.mods.vamp);
    if (e.hp <= 0) killEnemy(e);
  }

  function killEnemy(e) {
    if (e.dead) return;
    e.dead = true;
    G.stats.kills++;
    G.questDirty = true;
    G.score += e.score;
    gainGold(e.gold + (G.mods.bounty || 0));
    const x = e.x * W, y = laneY(e.lane) - laneH * 0.4;
    sparkBurst(x, y, e.boss ? 46 : 9, e.boss ? '#ff6b8a' : '#ff9a6b');
    if (e.boss) {
      G.stats.bossKills++;
      G.questDirty = true;
      G.boss = null;
      $('bossHud').hidden = true;
      G.shake = 20; G.shakeT = 0.7;
      toast(I.t('toast.bossDown', { n: e.gold }), 'gold');
      banner('', I.t('wave.bossDown'), '', true);
      S.victory();
      G.score += 400;
    }
  }

  function damageUnit(u, dmg) {
    if (u.hp <= 0 || u.dying) return;
    u.hp -= dmg;
    u.hurt = 0.16;
    const usz = Math.min(laneH * (0.80 + (u.tier - 1) * 0.05), W * (G.compact ? 0.175 : 0.30));
    const x = u.x * W, y = laneY(u.lane) - usz * 0.74;
    floatText(x + rnd(-3, 3), y, '-' + Math.round(dmg), '#ff8b9c', 16, -Math.round(dmg));
    if (u.hp <= 0) {
      u.dying = true;
      sparkBurst(x, laneY(u.lane) - laneH * 0.3, 12, '#8fa8d8');
      G.shake = Math.max(G.shake, 4); G.shakeT = 0.15;
    }
  }

  function castleHit(n) {
    G.hp = Math.max(0, G.hp - n * enemyDamageMult());
    G.hitFlash = 0.35;
    G.shake = Math.max(G.shake, 9); G.shakeT = 0.25;
    S.hurt();
    floatText(castleX + 10, H * 0.5, '-' + Math.round(n), '#ff5a6e', 24);
    hud();
    if (G.hp <= 0) gameOver();
  }

  /* ================= UPDATE ================= */
  function update(dt) {
    G.runT += dt;
    // charge
    if (G.charges < G.maxCharges) {
      G.chargeT += dt * (G.feverOn ? 1.9 : 1) * (G.mods.spin || 1);
      if (G.chargeT >= 1.15) {
        G.chargeT = 0;
        G.charges = Math.min(G.maxCharges, G.charges + 1);
        if (G.charges === G.maxCharges) $('spinBtn').classList.add('ready');
      }
    } else G.chargeT = 0;

    updateSpin(dt);
    if (G.pendingT > 0) {
      G.pendingT -= dt;
      if (G.pendingT <= 0) commitPending();
    }
    // auto spin
    if (G.auto && !G.spinning && !G.pendingT && G.charges >= 1 && G.waveState !== 'prep') {
      doSpin(false);
    }

    // fever
    if (G.feverOn) {
      G.feverT -= dt;
      if (G.feverT <= 0) endFever();
      else if (Math.random() < dt * 8) {
        spark(rnd(0, W), rnd(H * 0.1, H), Math.random() < 0.5 ? '#ffcf5c' : '#ff3ea5', 0.8);
      }
    }

    // waves
    if (G.waveState === 'prep') {
      G.waveTimer -= dt;
      if (G.waveTimer <= 0) startWave(G.wave + 1);
    } else if (G.waveState === 'active') {
      G.spawnT += dt;
      while (G.spawnQueue.length && G.spawnQueue[0].t <= G.spawnT) {
        const spec = G.spawnQueue.shift();
        if (G.enemies.filter(function (e) { return !e.dead; }).length < 22) spawnEnemy(spec);
      }
      if (!G.spawnQueue.length && G.enemies.length === 0) {
        waveCleared();
      }
    }

    if (G.draftPend > 0) {
      G.draftPend -= dt;
      if (G.draftPend <= 0) { G.draftPend = 0; if (G.state === 'playing') showDraft(); }
    }

    updateUnits(dt);
    updateEnemies(dt);
    updateProjectiles(dt);
    updateThunder(dt);
    // cleanup
    if (G.units.length) G.units = G.units.filter(function (u) { return !u.dying; });
    if (G.enemies.length) G.enemies = G.enemies.filter(function (e) { return !e.dead && e.x > -0.2; });
    if (G.texts.length > 60) G.texts.splice(0, G.texts.length - 60);
    if (G.parts.length > 420) G.parts.splice(0, G.parts.length - 420);
  }

  function waveCleared() {
    G.waveState = 'cleared';
    G.stats.waves++;
    G.questDirty = true;
    const bonus = Math.round((20 + G.wave * 7) * (G.mods.gold || 1));
    G.gold += bonus;
    G.stats.goldEarned += bonus;
    G.score += 100 + G.wave * 40;
    G.rerolls = Math.min(9, G.rerolls + 1);
    G.hp = Math.min(G.maxHp, G.hp + 1);
    S.waveClear();
    hud();
    banner(I.t('draft.kicker'), I.t('wave.clear'), I.t('wave.gold', { n: bonus }), false);
    G.draftPend = 1.15;
  }

  function updateUnits(dt) {
    for (let i = 0; i < G.units.length; i++) {
      const u = G.units[i];
      if (u.dying) continue;
      u.hurt = Math.max(0, u.hurt - dt);
      u.atkAnim = Math.max(0, u.atkAnim - dt);
      u.bob += dt * 2.4;
      if (u.pending > 0) {
        u.pending -= dt;
        if (u.pending <= 0) {
          u.pending = 0;
          if (tryMerge(u)) { continue; }
          // materialize
          sparkBurst(u.x * W, laneY(u.lane) - laneH * 0.25, 8, UNIT[u.type].col);
          ring(u.x * W, laneY(u.lane) - laneH * 0.3, UNIT[u.type].col, 0.7);
        }
        continue;
      }
      const def = UNIT[u.type];
      const rangePx = Math.min(def.range * laneH, W * 0.42);
      // find target
      let target = null, bestX = Infinity;
      for (let k = 0; k < G.enemies.length; k++) {
        const e = G.enemies[k];
        if (e.dead || e.lane !== u.lane) continue;
        const dx = (e.x - u.x) * W;
        if (dx < -laneH * 0.12) continue;
        if (dx <= rangePx && dx < bestX) { bestX = dx; target = e; }
      }
      u.cd -= dt * (G.feverOn ? 1.25 : 1);
      if (target && u.cd <= 0) {
        u.cd = 1 / Math.max(0.2, u.aspd);
        u.atkAnim = 0.18;
        fireUnit(u, target, def);
      }
    }
  }

  function fireUnit(u, target, def) {
    const crit = Math.random() < (G.mods.crit || 0.08);
    const dmg = u.dmg * (crit ? (G.mods.critMul || 2) : 1);
    const sx = u.x * W + laneH * 0.12, sy = laneY(u.lane) - laneH * 0.4;
    if (def.proj === 'arrow') {
      G.projs.push({ type: 'arrow', team: 'ally', x: sx, y: sy, x0: sx, y0: sy, tx: target.x * W, ty: sy, t: 0, dur: Math.max(0.08, Math.abs(target.x * W - sx) / (W * 1.6)), dmg: dmg, crit: crit, target: target.id, col: '#b6ffdd', unit: u });
      S.arrow();
    } else if (def.proj === 'orb') {
      G.projs.push({ type: 'orb', team: 'ally', x: sx, y: sy, x0: sx, y0: sy, tx: target.x * W, ty: laneY(target.lane) - laneH * 0.4, t: 0, dur: Math.max(0.1, Math.abs(target.x * W - sx) / (W * 0.95)), dmg: dmg, crit: crit, target: target.id, col: '#c9a2ff', aoe: (def.aoe || 0.5) * laneH, unit: u, lane: u.lane });
      S.magic();
    } else if (def.proj === 'shell') {
      G.projs.push({ type: 'shell', team: 'ally', x: sx, y: sy, x0: sx, y0: sy, tx: target.x * W, ty: laneY(target.lane) - laneH * 0.35, t: 0, dur: Math.max(0.22, Math.abs(target.x * W - sx) / (W * 0.8)), dmg: dmg * (1 + (G.mods.artDmg || 0)), crit: crit, target: target.id, col: '#ffc271', aoe: (def.aoe || 0.8) * laneH * (1 + (G.mods.artAoe || 0)), unit: u, lane: u.lane, arc: laneH * 0.5 });
      S.boom();
    } else {
      // melee
      const extra = (u.type === 'spear' && (u.tier >= 3 || G.mods.spearPierce)) ? 1 : 0;
      const cleave = (u.type === 'knight' && u.tier >= 3) ? 1 : 0;
      hitEnemy(target, dmg, crit, u);
      const reach = 0.28;
      if (extra || cleave) {
        let n = 0;
        for (let k = 0; k < G.enemies.length; k++) {
          const e = G.enemies[k];
          if (e === target || e.dead) continue;
          if (e.lane !== u.lane) continue;
          if (Math.abs(e.x - target.x) < reach) {
            hitEnemy(e, dmg * 0.7, false, u);
            n++;
            if (n >= extra + cleave) break;
          }
        }
      }
      slash(sx, sy + laneH * 0.06, def.col || '#cfe3ff');
      S.hit(crit);
    }
  }

  function updateEnemies(dt) {
    for (let i = 0; i < G.enemies.length; i++) {
      const e = G.enemies[i];
      if (e.dead) continue;
      e.hurt = Math.max(0, e.hurt - dt);
      e.atkAnim = Math.max(0, e.atkAnim - dt);
      e.bob += dt * 3;
      e.cd -= dt;
      const ex = e.x * W;
      // nearest unit ahead
      let target = null, best = Infinity;
      for (let k = 0; k < G.units.length; k++) {
        const u = G.units[k];
        if (u.dying || u.pending > 0 || u.lane !== e.lane) continue;
        const ux = u.x * W;
        if (ux > ex - laneH * 0.05) continue;
        const d = ex - ux;
        if (d < best) { best = d; target = u; }
      }
      const rangePx = e.ranged ? Math.min(e.ranged * laneH, W * 0.40) : Math.min(laneH * (e.size * 0.62), W * 0.10);
      let attacking = false;
      if (target && best <= rangePx) {
        attacking = true;
        if (e.cd <= 0) {
          e.cd = e.atk;
          e.atkAnim = 0.2;
          if (e.ranged) {
            G.projs.push({ type: 'earrow', team: 'enemy', x: ex - laneH * 0.1, y: laneY(e.lane) - laneH * 0.45, x0: ex, y0: laneY(e.lane), tx: target.x * W, ty: laneY(target.lane) - laneH * 0.4, t: 0, dur: 0.42, dmg: e.dmg, target: target.id, col: '#ffb0b0' });
            S.arrow();
          } else {
            damageUnit(target, e.dmg);
            S.hit(false);
            slash(target.x * W + laneH * 0.1, laneY(e.lane) - laneH * 0.35, '#ff8b9c');
          }
        }
      } else if (!target && ex - castleX < Math.min(laneH * 0.22, W * 0.06)) {
        attacking = true;
        if (e.cd <= 0) {
          e.cd = e.atk;
          e.atkAnim = 0.25;
          castleHit(e.dmg);
        }
      }
      if (!attacking) {
        e.x -= (e.spd * dt) / W;
        if (e.boss && e.x < 0.62 && e.roarT > 0) {
          e.roarT -= dt;
          if (e.roarT <= 0) {
            e.roarT = 999;
            bossRoar(e);
          }
        }
      }
    }
  }

  function bossRoar(e) {
    S.boss();
    G.shake = 12; G.shakeT = 0.5;
    ring(e.x * W, laneY(e.lane) - laneH * 0.3, '#ff5a6e', 2.6);
    toast(I.t('toast.boss'), 'mag');
    for (let i = 0; i < 2; i++) {
      spawnEnemy({ type: 'goblin', lane: (Math.random() * 3) | 0, t: 0, hpMul: Math.pow(1.155, G.wave - 1), dmgMul: 1 + (G.wave - 1) * 0.1 });
    }
  }

  function updateProjectiles(dt) {
    for (let i = G.projs.length - 1; i >= 0; i--) {
      const p = G.projs[i];
      p.t += dt;
      const k = clamp(p.t / p.dur, 0, 1);
      p.x = lerp(p.x0, p.tx, k);
      const arc = p.arc ? -Math.sin(Math.PI * k) * p.arc : 0;
      p.y = lerp(p.y0, p.ty, k) + arc;
      if (k >= 1) {
        impact(p);
        G.projs.splice(i, 1);
      }
    }
  }

  function impact(p) {
    if (p.team === 'ally') {
      if (p.aoe) {
        let hitAny = false;
        for (let k = 0; k < G.enemies.length; k++) {
          const e = G.enemies[k];
          if (e.dead) continue;
          const dx = e.x * W - p.tx;
          const dy = laneY(e.lane) - laneY(p.lane || 0);
          if (Math.sqrt(dx * dx + dy * dy * 0.35) <= p.aoe || Math.abs(e.lane - (p.lane || 0)) <= 1 && Math.abs(dx) < p.aoe) {
            hitEnemy(e, p.dmg, p.crit, p.unit);
            hitAny = true;
          }
        }
        if (!hitAny) {
          const tgt = G.enemies.find(function (e) { return e.id === p.target && !e.dead; });
          if (tgt) hitEnemy(tgt, p.dmg, p.crit, p.unit);
        }
        ring(p.tx, p.ty, p.col, 0.55 + p.aoe / laneH * 0.4);
        sparkBurst(p.tx, p.ty, 10, p.col);
        S.boom();
      } else {
        const tgt = G.enemies.find(function (e) { return e.id === p.target && !e.dead; });
        if (tgt) hitEnemy(tgt, p.dmg, p.crit, p.unit);
        spark(p.tx, p.ty, p.col, 1);
      }
    } else {
      const u = G.units.find(function (x) { return x.id === p.target && !x.dying; });
      if (u) damageUnit(u, p.dmg);
    }
  }

  function updateThunder(dt) {
    if (!G.mods.thunder) return;
    G.thunderT -= dt;
    if (G.thunderT > 0) return;
    G.thunderT = G.mods.thunder;
    const alive = G.enemies.filter(function (e) { return !e.dead; });
    if (!alive.length) return;
    alive.sort(function (a, b) { return a.x - b.x; });
    for (let i = 0; i < Math.min(3, alive.length); i++) {
      const e = alive[i];
      const x = e.x * W, y = laneY(e.lane) - laneH * 0.4;
      G.beams.push({ x0: x + rnd(-10, 10), y0: 0, x1: x, y1: y, life: 0.3, max: 0.3, col: '#9fe8ff', bolt: true });
      hitEnemy(e, 60 * Math.pow(1.2, G.wave * 0.1), false, null);
      sparkBurst(x, y, 8, '#cfeaff');
    }
    S.magic();
  }

  /* ================= FX ================= */
  function spark(x, y, col, scale) {
    if (G.parts.length > 400) return;
    G.parts.push({
      x: x, y: y, vx: rnd(-70, 70) * (scale || 1), vy: rnd(-120, 10) * (scale || 1),
      life: rnd(0.25, 0.6), max: 0.6, r: rnd(1.2, 3.2) * (scale || 1), col: col, g: 320, kind: 'dot'
    });
  }
  function sparkBurst(x, y, n, col) {
    for (let i = 0; i < n; i++) {
      if (G.parts.length > 400) break;
      const a = Math.random() * Math.PI * 2, sp = rnd(40, 230);
      G.parts.push({
        x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
        life: rnd(0.3, 0.85), max: 0.85, r: rnd(1.2, 3.4), col: col, g: 420, kind: 'dot'
      });
    }
  }
  function ring(x, y, col, scale) {
    G.parts.push({ x: x, y: y, life: 0.34, max: 0.34, r: 6 * (scale || 1), vr: 160 * (scale || 1), col: col, kind: 'ring' });
  }
  function slash(x, y, col) {
    G.parts.push({ x: x, y: y, life: 0.16, max: 0.16, col: col || '#fff', kind: 'slash', a: rnd(-0.6, 0.2) });
  }
  function floatText(x, y, txt, col, size, num) {
    const k = clamp(W / 1200, 0.72, 1.08);
    const prefix = txt.indexOf('-') === 0 ? '-' : (txt.indexOf('+') === 0 ? '+' : '');
    if (num !== undefined) {
      for (let i = G.texts.length - 1; i >= 0; i--) {
        const t = G.texts[i];
        if (t.num === undefined || t.prefix !== prefix || t.life < t.max - (G.compact ? 0.34 : 0.18)) continue;
        const rad = G.compact ? 44 : 30;
        if (Math.abs(t.x - x) > rad || Math.abs(t.y - y) > rad) continue;
        t.num += num;
        t.txt = prefix + Math.round(Math.abs(t.num));
        t.life = t.max;
        t.size = Math.max(t.size, (size || 16) * k);
        return;
      }
    }
    const o = { x: x, y: y, vy: -46, life: 1.0, max: 1.0, txt: txt, col: col, size: (size || 16) * k };
    if (num !== undefined) { o.num = num; o.prefix = prefix; }
    G.texts.push(o);
    if (G.texts.length > (G.compact ? 14 : 26)) G.texts.shift();
  }

  function updateFX(dt) {
    for (let i = G.parts.length - 1; i >= 0; i--) {
      const p = G.parts[i];
      p.life -= dt;
      if (p.life <= 0) { G.parts.splice(i, 1); continue; }
      if (p.kind === 'dot') {
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt;
      } else if (p.kind === 'ring') {
        p.r += p.vr * dt;
      }
    }
    for (let i = G.texts.length - 1; i >= 0; i--) {
      const t = G.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      t.vy *= 0.92;
      if (t.life <= 0) G.texts.splice(i, 1);
    }
    for (let i = G.beams.length - 1; i >= 0; i--) {
      const b = G.beams[i];
      b.life -= dt;
      if (b.life <= 0) G.beams.splice(i, 1);
    }
    if (G.shakeT > 0) { G.shakeT -= dt; if (G.shakeT <= 0) G.shake = 0; }
    if (G.hitFlash > 0) G.hitFlash -= dt;
    G.dust.forEach(function (d) {
      d.x += d.vx * dt; d.y += d.vy * dt;
      if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
      if (d.x < -10) d.x = W + 10;
      if (d.x > W + 10) d.x = -10;
    });
  }

  /* ================= RENDER ================= */
  function render() {
    const t = G.t;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a1024');
    sky.addColorStop(0.45, '#080c1b');
    sky.addColorStop(1, '#05060e');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    // nebula
    ctx.globalCompositeOperation = 'screen';
    const n1x = W * (0.28 + Math.sin(t * 0.06) * 0.02), n1y = H * 0.24;
    let g = ctx.createRadialGradient(n1x, n1y, 0, n1x, n1y, Math.max(W, H) * 0.55);
    g.addColorStop(0, 'rgba(40,90,190,0.20)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const n2x = W * (0.82 + Math.cos(t * 0.05) * 0.02), n2y = H * 0.12;
    g = ctx.createRadialGradient(n2x, n2y, 0, n2x, n2y, Math.max(W, H) * 0.42);
    g.addColorStop(0, 'rgba(180,40,120,0.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    // stars
    G.stars.forEach(function (s) {
      const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.s + s.p));
      ctx.globalAlpha = a;
      ctx.fillStyle = '#cfe6ff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // far ridges
    drawRidge(H * 0.30, 'rgba(18,26,50,0.9)', 0, 0.9);
    drawRidge(H * 0.26, 'rgba(12,18,38,0.95)', 120, 1.3);

    // shake
    const sh = G.shake > 0 ? G.shake : 0;
    const sx = sh ? rnd(-sh, sh) * 0.35 : 0, sy = sh ? rnd(-sh, sh) * 0.35 : 0;
    ctx.save();
    ctx.translate(sx, sy);

    drawLanes(t);
    drawPortalLight(t);
    drawPortal(t);
    drawCastle();
    if (G.state === 'menu') drawAttract(t);

    // entities sorted by lane, then x
    const list = [];
    for (let i = 0; i < G.units.length; i++) {
      const u = G.units[i];
      if (u.dying) continue;
      list.push({ x: u.x, lane: u.lane, u: u });
    }
    for (let i = 0; i < G.enemies.length; i++) {
      const e = G.enemies[i];
      if (e.dead) continue;
      list.push({ x: e.x, lane: e.lane, e: e });
    }
    list.sort(function (a, b) { return a.lane - b.lane || a.x - b.x; });
    list.forEach(function (it) {
      if (it.u) drawUnit(it.u);
      else drawEnemy(it.e);
    });

    drawProjectiles();
    drawBeams();
    drawParticles();
    drawTexts();

    ctx.restore();

    // ambience
    G.dust.forEach(function (d) {
      ctx.globalAlpha = d.a;
      ctx.fillStyle = '#9fd8ff';
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (G.feverOn) {
      ctx.globalCompositeOperation = 'screen';
      const fg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.95);
      fg.addColorStop(0, 'rgba(255,180,60,0)');
      fg.addColorStop(1, 'rgba(255,80,170,' + (0.10 + 0.05 * Math.sin(t * 8)) + ')');
      ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (G.hitFlash > 0) {
      ctx.globalAlpha = Math.min(0.35, G.hitFlash);
      ctx.fillStyle = '#ff2d4d';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    // edge fade
    const vg = ctx.createLinearGradient(0, 0, 0, H * 0.1);
    vg.addColorStop(0, 'rgba(4,6,12,0.85)'); vg.addColorStop(1, 'rgba(4,6,12,0)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H * 0.1);
  }

  function drawRidge(baseY, col, seed, amp) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(-10, baseY + 40);
    const step = W / 12;
    for (let i = 0; i <= 12; i++) {
      const x = i * step;
      const y = baseY - Math.abs(Math.sin(i * 1.7 + seed)) * 34 * amp - Math.sin(i * 0.7 + seed) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W + 10, baseY + 60);
    ctx.lineTo(-10, baseY + 60);
    ctx.closePath(); ctx.fill();
  }

  function drawLanes(t) {
    for (let i = 0; i < 3; i++) {
      const y0 = laneH * i, y1 = laneH * (i + 1);
      const g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, 'rgba(16,22,44,0.35)');
      g.addColorStop(0.62, 'rgba(10,15,32,0.55)');
      g.addColorStop(1, 'rgba(6,9,20,0.7)');
      ctx.fillStyle = g;
      ctx.fillRect(0, y0, W, y1 - y0);
      // ground glow line
      ctx.fillStyle = 'rgba(140,190,255,0.05)';
      ctx.fillRect(0, y1 - laneH * 0.02, W, laneH * 0.02);
      // separator
      if (i > 0) {
        const sg = ctx.createLinearGradient(0, 0, W, 0);
        sg.addColorStop(0, 'rgba(60,230,255,0)');
        sg.addColorStop(0.25, 'rgba(60,230,255,0.22)');
        sg.addColorStop(0.7, 'rgba(255,62,165,0.18)');
        sg.addColorStop(1, 'rgba(255,62,165,0)');
        ctx.fillStyle = sg;
        ctx.fillRect(0, y0 - 1, W, 1.4);
      }
      // faint runes on ground
      ctx.save();
      ctx.globalAlpha = 0.09;
      ctx.strokeStyle = '#7fc9ff'; ctx.lineWidth = 1;
      for (let k = 0; k < 6; k++) {
        const x = W * (0.16 + k * 0.145);
        ctx.beginPath();
        ctx.ellipse(x, y1 - laneH * 0.1, laneH * 0.08, laneH * 0.025, 0, 0, 6.283);
        ctx.stroke();
      }
      ctx.restore();
    }
    // center bright band
    const cg = ctx.createLinearGradient(0, laneH * 1.5 - 1, 0, laneH * 1.5 + 1);
    cg.addColorStop(0, 'rgba(255,62,165,0)');
    cg.addColorStop(0.5, 'rgba(255,62,165,0.10)');
    cg.addColorStop(1, 'rgba(255,62,165,0)');
    ctx.fillStyle = cg; ctx.fillRect(0, laneH * 1.5 - 2, W, 4);
  }

  function drawPortalLight(t) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, 'rgba(255,60,150,0)');
    g.addColorStop(0.45, 'rgba(190,50,140,0)');
    g.addColorStop(0.7, 'rgba(190,50,140,0.05)');
    g.addColorStop(1, 'rgba(255,90,170,0.16)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const r = ctx.createRadialGradient(W, H * 0.5, 10, W, H * 0.5, H * 0.85);
    r.addColorStop(0, 'rgba(255,80,160,0.20)');
    r.addColorStop(1, 'rgba(255,80,160,0)');
    ctx.fillStyle = r;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function drawPortal(t) {
    const cx = W - 2, cy = H * 0.5, r = laneH * 0.9;
    const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
    g.addColorStop(0, 'rgba(255,120,170,0.55)');
    g.addColorStop(0.4, 'rgba(180,40,120,0.30)');
    g.addColorStop(1, 'rgba(60,0,40,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.55, r, 0, 0, 6.283); ctx.fill();
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < 3; i++) {
      const a = t * (0.4 + i * 0.22) + i;
      ctx.strokeStyle = i % 2 ? 'rgba(255,62,165,' + (0.3 - i * 0.06) + ')' : 'rgba(160,80,255,' + (0.28 - i * 0.06) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * (0.34 + i * 0.1), r * (0.75 + i * 0.1), Math.sin(a) * 0.2, 0, 6.283);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawCastle() {
    const w = castleX;
    const ratio = clamp(G.hp / G.maxHp, 0, 1);
    // wall body
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#0d1424');
    g.addColorStop(0.45, '#1b2438');
    g.addColorStop(1, '#31415f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, H);
    // stone blocks with bevel
    const bh = Math.max(18, laneH * 0.135);
    let row = 0;
    for (let y = 0; y < H; y += bh, row++) {
      const off = row % 2 ? w * 0.3 : 0;
      for (let x = off - w * 0.6; x < w; x += w * 0.36) {
        const bx = Math.max(0, x), bw2 = Math.min(w, x + w * 0.36) - bx;
        if (bw2 <= 0) continue;
        ctx.fillStyle = 'rgba(255,255,255,' + (0.012 + (row % 3) * 0.006) + ')';
        ctx.fillRect(bx, y + 1, bw2 - 2, bh - 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, y + 0.5, bw2 - 1, bh - 1);
        ctx.fillStyle = 'rgba(160,200,255,0.05)';
        ctx.fillRect(bx, y, bw2, 1);
      }
    }
    // shaded left side
    const lg2 = ctx.createLinearGradient(0, 0, w * 0.5, 0);
    lg2.addColorStop(0, 'rgba(0,0,0,0.55)');
    lg2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lg2; ctx.fillRect(0, 0, w * 0.5, H);
    // battlement crest on the right edge
    const bw = Math.max(12, w * 0.16);
    for (let y = 0, i = 0; y < H; y += bh * 1.15, i++) {
      ctx.fillStyle = i % 2 ? '#2c3b5c' : '#243251';
      ctx.fillRect(w - bw, y, bw, bh * 0.64);
      ctx.fillStyle = 'rgba(140,200,255,0.16)';
      ctx.fillRect(w - bw, y, bw, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(w - bw, y + bh * 0.64 - 2, bw, 2);
    }
    // rim light
    ctx.fillStyle = 'rgba(150,235,255,' + (0.35 + ratio * 0.4) + ')';
    ctx.fillRect(w - 2, 0, 2.5, H);
    const eg = ctx.createLinearGradient(w - 26, 0, w, 0);
    eg.addColorStop(0, 'rgba(60,230,255,0)');
    eg.addColorStop(1, 'rgba(60,230,255,' + (0.10 + ratio * 0.18) + ')');
    ctx.fillStyle = eg; ctx.fillRect(w - 26, 0, 26, H);

    const gy = laneH * 1.5;
    const gh = laneH * 0.78, gw = w * 0.52;
    // gate
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(w - gw, gy + gh / 2);
    ctx.lineTo(w - gw, gy - gh / 2 + gh * 0.34);
    ctx.quadraticCurveTo(w - gw / 2, gy - gh / 2 - gh * 0.2, w, gy - gh / 2 + gh * 0.34);
    ctx.lineTo(w, gy + gh / 2);
    ctx.closePath();
    ctx.fillStyle = '#04060d';
    ctx.fill();
    ctx.clip();
    const gg = ctx.createRadialGradient(w - gw * 0.35, gy + gh * 0.15, 2, w - gw * 0.35, gy, gw);
    gg.addColorStop(0, 'rgba(110,235,255,' + (0.38 * ratio + 0.08) + ')');
    gg.addColorStop(0.5, 'rgba(70,150,255,' + (0.14 * ratio + 0.03) + ')');
    gg.addColorStop(1, 'rgba(10,20,40,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(w - gw, gy - gh, gw, gh * 2);
    // portcullis
    ctx.strokeStyle = 'rgba(170,205,255,0.30)';
    ctx.lineWidth = 1.6;
    for (let i = 1; i < 4; i++) {
      const x = w - gw + (gw / 4) * i;
      ctx.beginPath(); ctx.moveTo(x, gy - gh / 2); ctx.lineTo(x, gy + gh / 2); ctx.stroke();
    }
    for (let i = 1; i < 3; i++) {
      const y = gy - gh / 2 + (gh / 3) * i;
      ctx.beginPath(); ctx.moveTo(w - gw, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();
    // gate frame
    ctx.strokeStyle = 'rgba(140,215,255,0.45)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(w - gw, gy + gh / 2);
    ctx.lineTo(w - gw, gy - gh / 2 + gh * 0.34);
    ctx.quadraticCurveTo(w - gw / 2, gy - gh / 2 - gh * 0.2, w, gy - gh / 2 + gh * 0.34);
    ctx.stroke();

    // torches beside the gate
    [gy - gh * 0.78, gy + gh * 0.72].forEach(function (ty, i) {
      const tx = w * 0.30;
      ctx.fillStyle = '#1d1810';
      ctx.fillRect(tx - 2.5, ty, 5, 13);
      const flick = 0.6 + 0.4 * Math.abs(Math.sin(G.t * 6.5 + i * 2.1));
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const tg = ctx.createRadialGradient(tx, ty - 3, 1, tx, ty - 3, 26 * flick);
      tg.addColorStop(0, 'rgba(255,205,110,0.95)');
      tg.addColorStop(0.35, 'rgba(255,130,50,0.5)');
      tg.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.fillStyle = tg;
      ctx.beginPath(); ctx.arc(tx, ty - 3, 26 * flick, 0, 6.283); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#ffd98a';
      ctx.beginPath(); ctx.ellipse(tx, ty - 4, 2.6, 5 * flick, 0, 0, 6.283); ctx.fill();
    });

    // banners on the wall
    [[laneH * 0.30], [laneH * 2.52]].forEach(function (p, i) {
      const by = p[0];
      ctx.fillStyle = 'rgba(20,16,40,0.9)';
      ctx.fillRect(w * 0.16, by - 4, 2, 34);
      ctx.fillStyle = i ? 'rgba(255,62,165,0.92)' : 'rgba(90,220,255,0.92)';
      ctx.beginPath();
      ctx.moveTo(w * 0.17, by);
      ctx.lineTo(w * 0.52, by);
      ctx.lineTo(w * 0.52, by + 22);
      ctx.lineTo(w * 0.345, by + 15);
      ctx.lineTo(w * 0.17, by + 22);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(6,10,20,0.45)';
      polyArrow(ctx, w * 0.345, by + 4, 4.5);
    });

    // sigil over the gate
    ctx.save();
    ctx.globalAlpha = 0.35 + ratio * 0.5;
    ctx.translate(w * 0.30, gy - gh * 0.95);
    ctx.strokeStyle = '#8fe8ff'; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-8, -10); ctx.lineTo(8, -10); ctx.lineTo(8, 3); ctx.lineTo(0, 10); ctx.lineTo(-8, 3);
    ctx.closePath(); ctx.stroke();
    ctx.restore();

    // damage cracks + smoke
    if (ratio < 0.82) {
      const dmg = 1 - ratio;
      ctx.strokeStyle = 'rgba(255,80,100,' + (0.35 + dmg * 0.5) + ')';
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 6; i++) {
        const y = (i + 0.5) * H / 6 + Math.sin(i * 2.1) * 16;
        ctx.beginPath();
        ctx.moveTo(w * (0.62 + 0.06 * Math.sin(i)), y);
        ctx.lineTo(w * (0.80 + 0.05 * Math.cos(i)), y + 13);
        ctx.lineTo(w * 0.66, y + 30);
        ctx.stroke();
      }
    }
    if (ratio < 0.35) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const rg2 = ctx.createLinearGradient(w * 0.4, 0, w * 0.4, H);
      rg2.addColorStop(0, 'rgba(255,40,60,0)');
      rg2.addColorStop(0.5, 'rgba(255,40,60,' + (0.10 + 0.06 * Math.sin(G.t * 5)) + ')');
      rg2.addColorStop(1, 'rgba(255,40,60,0)');
      ctx.fillStyle = rg2;
      ctx.fillRect(w * 0.4, 0, w * 0.6, H);
      ctx.restore();
    }
  }

  function polyArrow(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x - s, y); ctx.lineTo(x, y + s * 0.9); ctx.lineTo(x + s, y);
    ctx.lineTo(x, y + s * 1.8);
    ctx.closePath(); ctx.fill();
  }

  function drawAttract(t) {
    const u = [
      { type: 'spear', tier: 2, lane: 0, x: 0.30 },
      { type: 'archer', tier: 1, lane: 1, x: 0.25 },
      { type: 'knight', tier: 2, lane: 2, x: 0.33 }
    ];
    u.forEach(function (a, i) {
      drawUnit({ type: a.type, tier: a.tier, lane: a.lane, x: a.x, hp: 1, maxHp: 1, pending: 0, atkAnim: 0, bob: t * 2 + i, hurt: 0 });
    });
    const en = [
      { type: 'goblin', lane: 1, x: 0.86 }, { type: 'orc', lane: 0, x: 0.90 }, { type: 'skeleton', lane: 2, x: 0.93 }
    ];
    en.forEach(function (a, i) {
      drawEnemy({ type: a.type, lane: a.lane, x: a.x, hp: 1, maxHp: 1, size: 1, boss: false, atkAnim: 0, bob: t * 3 + i * 2, hurt: 0, name: '' });
    });
  }

  function drawUnit(u) {
    const laneYPos = laneY(u.lane);
    const size = Math.min(laneH * (0.80 + (u.tier - 1) * 0.05), W * (G.compact ? 0.225 : 0.30));
    const x = u.x * W + (u.atkAnim > 0 ? Math.sin((1 - u.atkAnim / 0.18) * Math.PI) * laneH * 0.06 : 0);
    const y = laneYPos + (u.pending > 0 ? Math.sin((1 - u.pending / (u.arriveT || 0.62)) * Math.PI) * 8 - 12 * (u.pending / (u.arriveT || 0.62)) : 0);
    const bob = u.pending > 0 ? 0 : Math.sin(u.bob) * 1.4;
    ctx.save();
    if (u.pending > 0) ctx.globalAlpha = clamp(1 - u.pending / (u.arriveT || 0.62) * 0.85, 0.15, 1);
    // ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.beginPath(); ctx.ellipse(x, y + 2, size * 0.24, size * 0.055, 0, 0, 6.283); ctx.fill();
    // holy golden skin
    if (G.mods.vipSkin) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const gg = ctx.createRadialGradient(x, y - size * 0.4, 2, x, y - size * 0.4, size * 0.55);
      gg.addColorStop(0, 'rgba(255,200,80,0.13)');
      gg.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.fillStyle = gg;
      ctx.fillRect(x - size * 0.6, y - size, size * 1.2, size * 1.1);
      ctx.restore();
    }
    const spr = A.unit(u.type, u.tier);
    ctx.drawImage(spr, x - size / 2, y - size * 0.925 + bob, size, size);
    if (u.hurt > 0) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = u.hurt * 3;
      ctx.fillStyle = 'rgba(255,90,110,0.55)';
      ctx.beginPath(); ctx.ellipse(x, y - size * 0.45, size * 0.22, size * 0.3, 0, 0, 6.283); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // hp bar
    if (u.hp < u.maxHp - 0.01) {
      const w = size * 0.5, h = Math.max(3, laneH * 0.018);
      const bx = x - w / 2, byy = y - size * 0.80;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(bx, byy, w, h);
      const r = clamp(u.hp / u.maxHp, 0, 1);
      ctx.fillStyle = r > 0.5 ? '#5cf2a8' : r > 0.25 ? '#ffcf5c' : '#ff5a6e';
      ctx.fillRect(bx, byy, w * r, h);
    }
  }

  function drawEnemy(e) {
    const size = Math.min(laneH * 0.78 * e.size, W * (G.compact ? 0.265 : 0.26) * e.size);
    const y = laneY(e.lane);
    const x = e.x * W - (e.atkAnim > 0 ? Math.sin((1 - e.atkAnim / 0.2) * Math.PI) * laneH * 0.07 : 0);
    const bob = e.type === 'wraith' ? Math.sin(e.bob * 0.8) * 6 : Math.sin(e.bob) * 1.2;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.beginPath(); ctx.ellipse(x, y + 2, size * 0.24, size * 0.055, 0, 0, 6.283); ctx.fill();
    // enemy glow
    if (e.boss) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const gg = ctx.createRadialGradient(x, y - size * 0.45, 2, x, y - size * 0.45, size * 0.7);
      gg.addColorStop(0, 'rgba(255,60,90,0.22)');
      gg.addColorStop(1, 'rgba(255,60,90,0)');
      ctx.fillStyle = gg;
      ctx.fillRect(x - size * 0.8, y - size * 1.2, size * 1.6, size * 1.4);
      ctx.restore();
    }
    const spr = A.enemy(e.type);
    ctx.translate(x, y + bob - size * 0.06);
    ctx.scale(-1, 1);
    ctx.drawImage(spr, -size / 2, -size * 0.925, size, size);
    ctx.restore();
    if (e.hurt > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = e.hurt * 3;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath(); ctx.ellipse(x, y - size * 0.45, size * 0.22, size * 0.3, 0, 0, 6.283); ctx.fill();
      ctx.restore();
    }
    // hp bar
    if (e.hp < e.maxHp - 0.01 && !e.boss) {
      const w = size * 0.5, h = Math.max(3, laneH * 0.016);
      const bx = x - w / 2, byy = y - size * 0.80;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(bx, byy, w, h);
      const r = clamp(e.hp / e.maxHp, 0, 1);
      ctx.fillStyle = '#ff6b8a';
      ctx.fillRect(bx, byy, w * r, h);
    } else if (e.boss) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '800 ' + Math.round(laneH * 0.055) + 'px ' + FONT;
      ctx.textAlign = 'center';
      ctx.fillText(e.name || '', x, y - size * 0.86);
    }
  }

  function drawProjectiles() {
    G.projs.forEach(function (p) {
      ctx.save();
      if (p.type === 'arrow' || p.type === 'earrow') {
        const ang = Math.atan2(p.ty - p.y0, p.tx - p.x0) + (p.type === 'earrow' ? Math.PI : 0);
        ctx.translate(p.x, p.y); ctx.rotate(ang);
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.moveTo(9, 0); ctx.lineTo(-5, 2.6); ctx.lineTo(-2, 0); ctx.lineTo(-5, -2.6);
        ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 0.5;
        ctx.fillRect(-16, -0.7, 12, 1.4);
      } else if (p.type === 'orb') {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
        g.addColorStop(0, '#fff');
        g.addColorStop(0.35, p.col);
        g.addColorStop(1, 'rgba(140,80,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, 6.283); ctx.fill();
      } else {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
        g.addColorStop(0, '#fff3c8');
        g.addColorStop(0.4, p.col);
        g.addColorStop(1, 'rgba(255,140,60,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, 6.283); ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawBeams() {
    G.beams.forEach(function (b) {
      const k = b.life / b.max;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = k;
      const g = ctx.createLinearGradient(b.x0, b.y0, b.x1, b.y1);
      g.addColorStop(0, A.hexA(b.col, 0));
      g.addColorStop(0.5, A.hexA(b.col, 0.55));
      g.addColorStop(1, A.hexA(b.col, 0));
      ctx.strokeStyle = g;
      ctx.lineWidth = b.bolt ? 3 : 5 * k + 1;
      ctx.beginPath();
      if (b.bolt) {
        let x = b.x0, y = b.y0;
        ctx.moveTo(x, y);
        const steps = 6;
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          x = lerp(b.x0, b.x1, t) + (i < steps ? rnd(-10, 10) : 0);
          y = lerp(b.y0, b.y1, t);
          ctx.lineTo(x, y);
        }
      } else {
        ctx.moveTo(b.x0, b.y0); ctx.lineTo(b.x1, b.y1);
      }
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawParticles() {
    G.parts.forEach(function (p) {
      const k = p.life / p.max;
      ctx.save();
      if (p.kind === 'dot') {
        ctx.globalAlpha = clamp(k * 1.2, 0, 1);
        ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.4 + k * 0.8), 0, 6.283); ctx.fill();
      } else if (p.kind === 'ring') {
        ctx.globalAlpha = clamp(k, 0, 1) * 0.9;
        const rg2 = ctx.createRadialGradient(p.x, p.y, p.r * 0.2, p.x, p.y, Math.max(1, p.r));
        rg2.addColorStop(0, 'rgba(255,255,255,0)');
        rg2.addColorStop(0.72, A.hexA(p.col, 0.10));
        rg2.addColorStop(1, A.hexA(p.col, 0));
        ctx.fillStyle = rg2;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1, p.r), 0, 6.283); ctx.fill();
        ctx.strokeStyle = p.col;
        ctx.lineWidth = 2 + 2 * k;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1, p.r), 0, 6.283); ctx.stroke();
      } else if (p.kind === 'slash') {
        ctx.globalAlpha = clamp(k * 1.6, 0, 1);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, laneH * 0.16, p.a - 0.9, p.a + 0.5);
        ctx.stroke();
        ctx.globalAlpha *= 0.5;
        ctx.strokeStyle = p.col;
        ctx.lineWidth = 6;
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawTexts() {
    G.texts.forEach(function (t) {
      const k = t.life / t.max;
      ctx.save();
      ctx.globalAlpha = clamp(k * 1.5, 0, 1);
      ctx.font = '900 ' + t.size + 'px ' + FONT;
      ctx.textAlign = 'center';
      ctx.lineWidth = Math.max(2, t.size * 0.18);
      ctx.strokeStyle = 'rgba(4,6,14,0.85)';
      ctx.strokeText(t.txt, t.x, t.y);
      ctx.fillStyle = t.col;
      ctx.fillText(t.txt, t.x, t.y);
      ctx.restore();
    });
  }

  /* ================= LOOP ================= */
  let last = 0;
  function frame(now) {
    if (!last) last = now;
    let dt = (now - last) / 1000;
    last = now;
    dt = clamp(dt, 0, 0.05);
    G.t += dt;
    if (G.state === 'playing') update(dt);
    updateFX(dt);
    render();
    if (G.state === 'playing') hud();
    requestAnimationFrame(frame);
  }

  /* ================= EVENTS ================= */
  function bind() {
    $('btnPlay').addEventListener('click', function () { S.init(); S.resume(); S.click(); startGame(); });
    $('btnRetry').addEventListener('click', function () { S.click(); startGame(); });
    $('btnToMenu').addEventListener('click', function () { S.click(); toMenu(); });
    $('btnHowto').addEventListener('click', function () { S.click(); show('howtoOverlay'); });
    $('btnHowtoClose').addEventListener('click', function () { S.click(); hide('howtoOverlay'); });
    $('btnVip').addEventListener('click', function () { S.click(); openVip(); });
    $('vipClose').addEventListener('click', function () { S.click(); hide('vipOverlay'); });
    $('btnPause').addEventListener('click', function () { S.click(); if (G.state === 'playing' || G.state === 'paused') togglePause(); });
    $('btnResume').addEventListener('click', function () { S.click(); togglePause(); });
    $('btnQuit').addEventListener('click', function () { S.click(); hide('pauseOverlay'); toMenu(); });
    $('btnLang').addEventListener('click', function () {
      const order = I.LANGS;
      const next = order[(order.indexOf(I.getLang()) + 1) % order.length];
      I.setLang(next); S.click();
    });
    document.querySelectorAll('#langSeg button').forEach(function (b) {
      b.addEventListener('click', function () { I.setLang(b.getAttribute('data-lang')); S.click(); });
    });
    $('btnMute').addEventListener('click', function () {
      const m = !S.isMuted();
      S.setMuted(m);
      I.apply();
      if (!m) { S.resume(); S.click(); }
    });
    $('spinBtn').addEventListener('click', function () {
      S.init(); S.resume();
      if (G.state === 'menu') { startGame(); return; }
      const ok = doSpin(false);
      if (!ok && G.charges < 1 && G.state === 'playing') toast(I.t('slot.noCharge'));
    });
    $('rerollBtn').addEventListener('click', function () {
      if (G.state !== 'playing') return;
      if (G.rerolls < 1) return;
      G.rerolls--;
      S.click();
      const wasSpinning = G.spinning;
      if (!wasSpinning) {
        // replace pending summons then spin again
        if (G.pendingT > 0) {
          G.pending.forEach(function (u) { u.dying = true; });
          G.pending = []; G.pendingT = 0;
        }
        doSpin(true);
      }
      hud();
    });
    $('autoBtn').addEventListener('click', function () {
      G.auto = !G.auto; S.click();
      $('autoDot').classList.toggle('on', G.auto);
      if (G.auto) toast(I.t('slot.autoOn'));
      hud();
    });
    $('draftReroll').addEventListener('click', rerollDraft);
    $('vipSubmit').addEventListener('click', redeemCode);
    $('vipCode').addEventListener('keydown', function (e) { if (e.key === 'Enter') redeemCode(); });
    window.addEventListener('resize', function () { layout(); measureReels(); });
    window.addEventListener('orientationchange', function () { setTimeout(function () { layout(); measureReels(); }, 260); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && G.state === 'playing') togglePause();
    });
    document.addEventListener('keydown', function (e) {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === ' ' || k === 'enter') {
        e.preventDefault();
        if (G.state === 'menu') startGame();
        else if (G.state === 'playing') { const ok = doSpin(false); if (!ok) toast(I.t('slot.noCharge')); }
      } else if (k === '1' || k === '2' || k === '3') {
        toggleHold(+k - 1);
      } else if (k === 'm') {
        S.setMuted(!S.isMuted()); I.apply();
      } else if (k === 'escape' || k === 'p') {
        if (G.state === 'playing' || G.state === 'paused') togglePause();
      } else if (k === 'r' && G.state === 'playing') {
        $('rerollBtn').click();
      }
    });
    document.addEventListener('pointerdown', function () { S.init(); S.resume(); }, { once: true });
  }

  function openVip() {
    show('vipOverlay');
    $('vipRelicArt').innerHTML = '<img src="' + A.relic('sword', '#ffcf5c') + '" alt="">';
    const msg = $('vipMsg');
    if (G.vip) {
      msg.className = 'code-msg ok';
      msg.textContent = I.t('vip.already');
    }
  }

  function redeemCode() {
    const v = ($('vipCode').value || '').trim().toUpperCase();
    const msg = $('vipMsg');
    if (v === 'MOA-SLOT-2026') {
      if (G.vip) {
        msg.className = 'code-msg ok';
        msg.textContent = I.t('vip.already');
        return;
      }
      G.vip = true;
      try { localStorage.setItem('moa.ss.vip', '1'); } catch (e) {}
      msg.className = 'code-msg ok';
      msg.textContent = I.t('vip.success');
      $('vipBadge').hidden = false;
      S.victory();
      toast(I.t('toast.vip'), 'gold');
      if (G.state === 'playing' && G.relics.indexOf('holy') < 0) addRelic('holy');
    } else {
      msg.className = 'code-msg err';
      msg.textContent = I.t('vip.invalid');
      S.hurt();
    }
    S.click();
  }

  /* ================= DEBUG ================= */
  const debug = {
    state: function () {
      return {
        state: G.state, wave: G.wave, waveState: G.waveState, hp: G.hp, maxHp: G.maxHp,
        gold: Math.floor(G.gold), score: Math.floor(G.score), fever: Math.round(G.fever),
        feverOn: G.feverOn, charges: G.charges, rerolls: G.rerolls, spinning: G.spinning,
        units: G.units.filter ? G.units.map(function (u) { return { t: u.type, tier: u.tier, lane: u.lane, hp: Math.round(u.hp), pending: +u.pending.toFixed(2) }; }) : [],
        enemies: G.enemies.map(function (e) { return { t: e.type, lane: e.lane, x: +e.x.toFixed(2), hp: Math.round(e.hp) }; }),
        relics: G.relics.slice(), mods: JSON.parse(JSON.stringify(G.mods)), lastSpin: G.lastSpin ? G.lastSpin.syms : null,
        lang: I.getLang(), vip: G.vip, auto: G.auto, stats: JSON.parse(JSON.stringify(G.stats))
      };
    },
    spin: function () { return doSpin(true); },
    spinCost: function () { return doSpin(false); },
    jackpot: function () {
      G.lastSpin = { syms: ['knight', 'knight', 'knight'], kind: 'triple' };
      G.reels.forEach(function (r, i) { r.sym = 'knight'; refreshStrip(i, 'knight'); });
      G.spinning = false;
      resolveSpin();
      commitPending();
      return G.units.length;
    },
    summon: function (type, tier, lane, slot) {
      const u = makeUnit(type, tier || 1, lane === undefined ? 0 : lane, slot || 0);
      G.units.push(u);
      return u.id;
    },
    promoteTest: function () {
      // place two identical tier-1 spears in lane 1, then merge
      const a = makeUnit('spear', 1, 1, 0);
      const b = makeUnit('spear', 1, 1, 1);
      G.units.push(a);
      G.units.push(b);
      const merged = tryMerge(b);
      if (!merged) { promote(a, 1); b.dying = true; }
      return G.units.map(function (u) { return u.type + u.tier; });
    },
    spawnWave: function (n) { startWave(n || G.wave + 1); },
    clearWave: function () {
      G.spawnQueue = [];
      G.enemies.forEach(function (e) { e.dead = true; });
      G.enemies = [];
      if (G.waveState !== 'cleared') waveCleared();
      return G.waveState;
    },
    draftOpen: function () { showDraft(); return G.draft.map(function (r) { return r.id; }); },
    pickDraft: function (i) { pickDraft(i); },
    addRelic: function (id) { addRelic(id); return G.relics.slice(); },
    gold: function (n) { gainGold(n); },
    fever: function () { startFever(); },
    god: function () { G.maxHp = 9999; G.hp = 9999; },
    die: function () { castleHit(9999); },
    killAll: function () { G.enemies.forEach(function (e) { killEnemy(e); }); G.enemies = []; },
    shotScene: function () {
      G.units.length = 0; G.enemies.length = 0; G.projs.length = 0;
      G.parts.length = 0; G.texts.length = 0; G.spawnQueue = []; G.draftPend = 0;
      G.maxHp = 100; G.hp = 78; G.boss = null;
      document.getElementById('bossHud').hidden = true;
      const compact = !!G.compact;
      const plan = compact ? [
        ['spear', 2, 0, 0], ['archer', 1, 0, 1], ['mage', 2, 1, 0], ['knight', 1, 1, 1],
        ['artillery', 1, 2, 0], ['spear', 2, 2, 1]
      ] : [
        ['spear', 2, 0, 0], ['archer', 2, 0, 1], ['mage', 2, 1, 2], ['knight', 1, 1, 0],
        ['artillery', 1, 2, 1], ['spear', 3, 2, 3], ['archer', 1, 2, 4], ['mage', 1, 0, 4]
      ];
      plan.forEach(function (p) {
        const u = makeUnit(p[0], p[1], p[2], p[3]);
        G.units.push(u);
      });
      (compact ? [['orc', 0, 0.58], ['goblin', 0, 0.70],
                  ['boss', 1, 0.62], ['goblin', 1, 0.74],
                  ['brute', 2, 0.58], ['goblin', 2, 0.72]]
                : [['orc', 0, 0.55], ['goblin', 0, 0.63], ['goblin', 0, 0.72], ['skeleton', 0, 0.84],
                   ['boss', 1, 0.60], ['goblin', 1, 0.70], ['goblin', 1, 0.80],
                   ['brute', 2, 0.54], ['goblin', 2, 0.62], ['goblin', 2, 0.72], ['goblin', 2, 0.84]]).forEach(function (e) {
        const hpMul = Math.pow(1.155, Math.max(0, G.wave - 1)) * 4.2;
        spawnEnemy({ type: e[0], lane: e[1], t: 0, hpMul: hpMul, dmgMul: 1, at: e[2] });
      });
      addRelic('jackpot', true);
      addRelic('pierce', true);
      G.fever = 88;
      G.wave = Math.max(G.wave, 4);
      G.waveState = 'active';
      G.score = Math.max(G.score, 1840);
      G.gold = Math.max(G.gold, 260);
      hud();
      G.questDirty = true;
      return G.units.length;
    },
    forceEnemies: function (n, type) {
      for (let i = 0; i < n; i++) {
        spawnEnemy({ type: type || 'goblin', lane: i % 3, t: 0, hpMul: 1, dmgMul: 1 });
      }
      return G.enemies.length;
    },
    setAuto: function (v) { G.auto = !!v; return G.auto; },
    lang: function (l) { I.setLang(l); return I.getLang(); },
    i18nCheck: function () { return I.check(); },
    storage: function () { try { return Object.keys(localStorage); } catch (e) { return []; } }
  };

  /* ================= INIT ================= */
  function init() {
    canvas = $('game');
    ctx = canvas.getContext('2d');
    loadPrefs();
    layout();
    buildReels();
    G.reels.forEach(function (r, i) {
      r.sym = ['spear', 'archer', 'mage'][i];
      refreshStrip(i, r.sym);
    });
    bind();
    I.apply();
    show('menuOverlay');
    $('bestScore').textContent = G.best;
    $('bestWave').textContent = G.bestWave;
    $('vipBadge').hidden = !G.vip;
    $('menuCrest').innerHTML =
      '<img src="' + A.icon('spear', 2) + '" alt="">' +
      '<span>×</span>' +
      '<img src="' + A.icon('archer', 1) + '" alt="">' +
      '<span>×</span>' +
      '<img src="' + A.icon('mage', 2) + '" alt="">';
    G.quests = [];
    buildQuestLog();
    G.hintShown = false;
    if (window.ResizeObserver) {
      try { new ResizeObserver(function () { layout(); measureReels(); }).observe($('stage')); } catch (e) {}
    }
    SB.Game = {
      onLangChange: function () {
        relabelReels();
        G.questDirty = true;
        if (G.quests.length) renderQuests();
        $('rerollCount').textContent = G.rerolls;
        $('bestScore').textContent = G.best;
        $('bestWave').textContent = G.bestWave;
        hud();
        if (G.state === 'menu') { $('bestScore').textContent = G.best; $('bestWave').textContent = G.bestWave; }
      }
    };
    SB.debug = debug;
    requestAnimationFrame(frame);
    setTimeout(function () { measureReels(); }, 120);
  }

  function buildQuestLog() {
    G.quests = QUESTS.slice(0, 2).map(function (q) { const o = Object.assign({}, q); o.claimed = false; return o; });
    G.questDone = [];
    G.questDirty = true;
  }

  function checkQuests() {
    if (!G.quests || !G.quests.length) return;
    let changed = false;
    for (let i = 0; i < G.quests.length; i++) {
      const q = G.quests[i];
      if (q.claimed) continue;
      if ((G.stats[q.stat] || 0) < q.target) continue;
      q.claimed = true;
      changed = true;
      if (q.reward.gold) gainGold(q.reward.gold);
      if (q.reward.reroll) G.rerolls = Math.min(9, G.rerolls + q.reward.reroll);
      const rew = q.reward.gold ? (q.reward.gold + 'G') : I.t('quest.reward.reroll', { n: q.reward.reroll });
      toast(I.t('toast.quest', { reward: rew }), 'gold');
      S.victory();
      G.questDone.push(q.id);
      const active = G.quests.map(function (x) { return x.id; });
      const next = QUESTS.find(function (x) {
        return active.indexOf(x.id) < 0 && G.questDone.indexOf(x.id) < 0;
      });
      if (next) {
        const copy = Object.assign({}, next); copy.claimed = false;
        G.quests[i] = copy;
      }
    }
    if (changed) { G.questDirty = true; hud(); }
  }

  // quest check runs on a light timer
  setInterval(function () {
    if (G.state !== 'playing') return;
    checkQuests();
    if (G.questDirty) renderQuests();
  }, 400);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else init();
})();
