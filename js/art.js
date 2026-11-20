/* ============================================================
   MOA SPIN SIEGE — procedural sprite art
   Every unit / enemy / icon is drawn with canvas vector paths
   at load time and cached. No images, no CDN.
   ============================================================ */
window.SB = window.SB || {};
(function () {
  const SS = 2.4;                 // supersample factor
  const BOX = 128;                // logical drawing box
  const cache = {};

  function mk(draw) {
    const c = document.createElement('canvas');
    c.width = c.height = Math.round(BOX * SS);
    const x = c.getContext('2d');
    x.scale(SS, SS);
    x.lineJoin = 'round';
    x.lineCap = 'round';
    draw(x);
    return c;
  }

  function lg(ctx, x0, y0, x1, y1, a, b) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, a); g.addColorStop(1, b); return g;
  }
  function rg(ctx, x, y, r0, r1, a, b) {
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    g.addColorStop(0, a); g.addColorStop(1, b); return g;
  }
  function rrect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }
  function poly(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }
  function ell(ctx, x, y, rx, ry, rot) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); ctx.closePath();
  }
  function stroke(ctx, w, col) { ctx.lineWidth = w || 2.6; ctx.strokeStyle = col || '#070a12'; ctx.stroke(); }

  /* ---------------- shared body parts ---------------- */
  function shadowBase(ctx, w, a) {
    const g = ctx.createRadialGradient(64, 116, 2, 64, 116, w);
    g.addColorStop(0, 'rgba(0,0,0,' + (a || 0.45) + ')');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(64 - w, 116 - 12, w * 2, 24);
  }

  function legs(ctx, pants, boot, stance) {
    const s = stance || 1;
    // back leg
    ctx.fillStyle = pants;
    rrect(ctx, 52 - 4 * s, 82, 12, 26, 4); ctx.fill(); stroke(ctx, 2.4);
    // front leg
    rrect(ctx, 64, 82, 13, 27, 4); ctx.fill(); stroke(ctx, 2.4);
    // boots
    ctx.fillStyle = boot;
    rrect(ctx, 49 - 4 * s, 104, 17, 9, 3); ctx.fill(); stroke(ctx, 2.2);
    rrect(ctx, 63, 104, 19, 9, 3); ctx.fill(); stroke(ctx, 2.2);
    // knee guards
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    rrect(ctx, 65, 92, 9, 4, 2); ctx.fill();
  }

  function tierCrest(ctx, tier, col, crestCol) {
    if (tier >= 2) {
      // pauldron spikes
      ctx.fillStyle = col;
      poly(ctx, [[46, 56], [38, 62], [46, 66]]); ctx.fill(); stroke(ctx, 2);
      poly(ctx, [[82, 56], [90, 62], [82, 66]]); ctx.fill(); stroke(ctx, 2);
    }
    if (tier >= 3) {
      // halo ring
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = crestCol; ctx.lineWidth = 2;
      ctx.shadowColor = crestCol; ctx.shadowBlur = 12;
      ell(ctx, 64, 34, 20, 7); ctx.stroke();
      ctx.restore();
    }
    if (tier >= 4) {
      // flame wings
      ctx.save();
      ctx.globalAlpha = 0.92;
      const wg = lg(ctx, 20, 40, 60, 90, crestCol, 'rgba(255,255,255,0)');
      ctx.fillStyle = wg;
      poly(ctx, [[46, 62], [16, 46], [28, 74], [12, 78], [44, 88]]); ctx.fill();
      poly(ctx, [[82, 62], [112, 46], [100, 74], [116, 78], [84, 88]]); ctx.fill();
      ctx.restore();
    }
  }

  function aura(ctx, tier, col) {
    if (tier < 2) return;
    const r = 44 + tier * 6;
    const a = tier >= 4 ? 0.30 : tier >= 3 ? 0.22 : 0.12;
    ctx.fillStyle = rg(ctx, 64, 66, 6, r, hexA(col, a), hexA(col, 0));
    ctx.beginPath(); ctx.arc(64, 66, r, 0, Math.PI * 2); ctx.fill();
    if (tier >= 4) {
      ctx.strokeStyle = hexA(col, 0.5); ctx.lineWidth = 1.6;
      ctx.shadowColor = col; ctx.shadowBlur = 10;
      ell(ctx, 64, 66, r * 0.8, r * 0.8); ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  function hexA(hex, a) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(function (c) { return c + c; }).join('') : h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  /* ---------------- SPEARMAN ---------------- */

  function spear(ctx, tier) {
    const P = { a: '#4fc3ff', b: '#155e93', c: '#a9efff', m: '#d6e6f2' };
    shadowBase(ctx, 44);
    aura(ctx, tier, P.a);
    if (tier >= 3) {
      ctx.fillStyle = lg(ctx, 46, 50, 40, 100, P.b, '#0a1a2c');
      poly(ctx, [[52, 52], [34, 104], [54, 98], [60, 54]]); ctx.fill(); stroke(ctx, 2.2);
    }
    tierCrest(ctx, tier, P.a, P.c);
    legs(ctx, '#16233c', '#0e1626');
    // pike behind the body
    ctx.save();
    ctx.translate(88, 64); ctx.rotate(-0.05);
    ctx.fillStyle = '#b98a4c';
    rrect(ctx, -2.2, -46, 4.4, 100, 2); ctx.fill(); stroke(ctx, 1.8);
    ctx.fillStyle = lg(ctx, -6, -70, 6, -40, '#ffffff', '#9bd9ff');
    poly(ctx, [[-5, -46], [5, -46], [2.5, -70], [0, -82], [-2.5, -70]]); ctx.fill(); stroke(ctx, 1.8);
    ctx.fillStyle = P.c;
    poly(ctx, [[-6.5, -42], [6.5, -42], [4.5, -33], [-4.5, -33]]); ctx.fill(); stroke(ctx, 1.4);
    ctx.restore();
    // torso
    ctx.fillStyle = lg(ctx, 48, 52, 80, 90, P.a, P.b);
    poly(ctx, [[50, 52], [78, 52], [82, 68], [76, 90], [52, 90], [46, 68]]); ctx.fill(); stroke(ctx);
    ctx.fillStyle = 'rgba(255,255,255,.20)';
    poly(ctx, [[56, 56], [74, 56], [72, 74], [58, 74]]); ctx.fill();
    ctx.strokeStyle = P.c; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(65, 58); ctx.lineTo(65, 86); ctx.stroke();
    // belt
    ctx.fillStyle = '#0f2035'; rrect(ctx, 49, 84, 30, 7, 2); ctx.fill(); stroke(ctx, 2);
    ctx.fillStyle = P.c; rrect(ctx, 62, 85, 6, 5, 1); ctx.fill();
    // pauldrons
    ctx.fillStyle = P.b;
    rrect(ctx, 45, 52, 13, 10, 5); ctx.fill(); stroke(ctx, 2.2);
    rrect(ctx, 70, 52, 13, 10, 5); ctx.fill(); stroke(ctx, 2.2);
    ctx.fillStyle = P.a;
    rrect(ctx, 47, 53.5, 9, 3, 1.5); ctx.fill();
    rrect(ctx, 72, 53.5, 9, 3, 1.5); ctx.fill();
    // head
    ctx.fillStyle = '#203450'; rrect(ctx, 58, 46, 14, 10, 3); ctx.fill(); stroke(ctx, 2);
    ctx.fillStyle = lg(ctx, 54, 26, 78, 48, P.m, P.a);
    ctx.beginPath();
    ctx.moveTo(54, 46);
    ctx.quadraticCurveTo(53, 27, 65, 27);
    ctx.quadraticCurveTo(77, 27, 76, 46);
    ctx.closePath(); ctx.fill(); stroke(ctx, 2.4);
    ctx.fillStyle = '#07131f'; rrect(ctx, 59, 37, 16, 6, 2); ctx.fill();
    ctx.fillStyle = P.c; ctx.fillRect(61.5, 38.5, 4.5, 3); ctx.fillRect(68.5, 38.5, 4, 3);
    ctx.strokeStyle = P.c; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(65, 26); ctx.lineTo(65, 34); ctx.stroke();
    ctx.fillStyle = P.c;
    poly(ctx, [[65, 26], [61, 12], [67, 16], [65, 6], [72, 15], [70, 26]]); ctx.fill(); stroke(ctx, 1.8);
    // shield arm
    ctx.fillStyle = P.b; rrect(ctx, 40, 58, 9, 20, 4); ctx.fill(); stroke(ctx, 2.2);
    ctx.save(); ctx.translate(41, 79); ctx.rotate(-0.06);
    ctx.fillStyle = lg(ctx, -13, -14, 13, 14, P.m, '#3f6787');
    poly(ctx, [[-12, -13], [12, -13], [12, 3], [0, 15], [-12, 3]]); ctx.fill(); stroke(ctx, 2.4);
    ctx.fillStyle = P.a;
    poly(ctx, [[-7, -8], [7, -8], [7, 1], [0, 8], [-7, 1]]); ctx.fill();
    ctx.fillStyle = P.c; ctx.beginPath(); ctx.arc(0, -2, 2.8, 0, 6.283); ctx.fill();
    ctx.restore();
    // pike arm
    ctx.strokeStyle = '#070a12'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(76, 62); ctx.lineTo(86, 74); ctx.stroke();
    ctx.strokeStyle = P.b; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(76, 62); ctx.lineTo(86, 74); ctx.stroke();
    ctx.fillStyle = '#e7c9a4'; ell(ctx, 87, 76, 4.2, 4.6); ctx.fill(); stroke(ctx, 1.6);
  }

  /* ---------------- ARCHER ---------------- */

  function archer(ctx, tier) {
    const P = { a: '#5cf2a8', b: '#126b4c', c: '#d6fff0', m: '#c8a26a' };
    shadowBase(ctx, 42);
    aura(ctx, tier, P.a);
    if (tier >= 3) {
      ctx.fillStyle = lg(ctx, 52, 50, 40, 104, P.b, '#07231a');
      poly(ctx, [[52, 52], [36, 106], [56, 100], [60, 54]]); ctx.fill(); stroke(ctx, 2.2);
    }
    tierCrest(ctx, tier, P.a, P.c);
    legs(ctx, '#123326', '#0b1f18');
    // torso
    ctx.fillStyle = lg(ctx, 52, 52, 78, 86, '#39b985', '#0d4a35');
    poly(ctx, [[54, 52], [76, 52], [79, 84], [51, 84]]); ctx.fill(); stroke(ctx);
    // leather strap
    ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(53, 56); ctx.lineTo(77, 80); ctx.stroke();
    ctx.strokeStyle = '#5b4423'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(53, 56); ctx.lineTo(77, 80); ctx.stroke();
    // belt
    ctx.fillStyle = '#0d2a20'; rrect(ctx, 51, 80, 28, 7, 2); ctx.fill(); stroke(ctx, 2);
    ctx.fillStyle = '#c8a26a'; rrect(ctx, 63, 81, 5, 5, 1); ctx.fill();
    // quiver on the back
    ctx.save();
    ctx.translate(49, 60); ctx.rotate(0.30);
    ctx.fillStyle = '#6b4a24'; rrect(ctx, -5.5, -6, 11, 30, 3); ctx.fill(); stroke(ctx, 2.2);
    ctx.fillStyle = '#3d2a12'; rrect(ctx, -5.5, -6, 11, 5, 2); ctx.fill();
    for (let i = 0; i < 3; i++) {
      const x = -3.6 + i * 3.2;
      ctx.strokeStyle = '#e8ddc0'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(x, -6); ctx.lineTo(x, -16); ctx.stroke();
      ctx.fillStyle = P.a;
      poly(ctx, [[x, -16], [x - 2.4, -12], [x + 2.4, -12]]); ctx.fill();
    }
    ctx.restore();
    // head
    ctx.fillStyle = '#e7c9a4'; ell(ctx, 65, 41, 8.6, 9.4); ctx.fill(); stroke(ctx, 2.2);
    // hood
    ctx.fillStyle = lg(ctx, 52, 24, 80, 46, P.a, P.b);
    ctx.beginPath();
    ctx.moveTo(54, 44); ctx.quadraticCurveTo(49, 22, 65, 21);
    ctx.quadraticCurveTo(81, 22, 78, 44);
    ctx.quadraticCurveTo(76, 34, 65, 32); ctx.quadraticCurveTo(56, 34, 54, 44);
    ctx.closePath(); ctx.fill(); stroke(ctx, 2.4);
    // face shadow + eyes
    ctx.fillStyle = 'rgba(10,30,22,0.22)';
    rrect(ctx, 57, 35, 17, 10, 4); ctx.fill();
    ctx.fillStyle = '#08130f';
    ctx.beginPath(); ctx.arc(61.5, 41.5, 1.7, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(69.5, 41.5, 1.7, 0, 6.283); ctx.fill();
    // bow
    ctx.save();
    ctx.translate(73, 68);
    ctx.strokeStyle = '#8a5c2a'; ctx.lineWidth = 4.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, 24, -1.32, 1.32); ctx.stroke();
    ctx.strokeStyle = '#c8a26a'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(0, 0, 24, -1.32, 1.32); ctx.stroke();
    ctx.strokeStyle = 'rgba(220,255,240,.75)'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(6.2, -23.2); ctx.lineTo(6.2, 23.2); ctx.stroke();
    // arrow nocked
    ctx.strokeStyle = '#eaf7ff'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(32, 0); ctx.stroke();
    ctx.fillStyle = P.c; poly(ctx, [[32, -3], [39, 0], [32, 3]]); ctx.fill(); stroke(ctx, 1);
    ctx.fillStyle = P.a; poly(ctx, [[6, 0], [10, -3.4], [10, 3.4]]); ctx.fill();
    ctx.restore();
    // bow arm
    ctx.strokeStyle = '#070a12'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(74, 60); ctx.lineTo(80, 66); ctx.stroke();
    ctx.strokeStyle = P.b; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(74, 60); ctx.lineTo(80, 66); ctx.stroke();
    ctx.fillStyle = '#e7c9a4'; ell(ctx, 81, 67, 4, 4.4); ctx.fill(); stroke(ctx, 1.6);
  }

  /* ---------------- MAGE ---------------- */
  function mage(ctx, tier) {
    const P = { a: '#b07dff', b: '#3d1f7a', c: '#eed8ff', m: '#ffd166' };
    shadowBase(ctx, 44);
    aura(ctx, tier, P.a);
    tierCrest(ctx, tier, P.a, P.c);
    // robe
    ctx.fillStyle = lg(ctx, 64, 40, 64, 112, P.a, P.b);
    poly(ctx, [[64, 38], [86, 104], [92, 112], [36, 112], [42, 104]]); ctx.fill(); stroke(ctx, 2.6);
    // robe trim
    ctx.strokeStyle = P.m; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(64, 40); ctx.lineTo(64, 108); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(46, 100); ctx.quadraticCurveTo(64, 106, 82, 100); ctx.stroke();
    // inner glow
    ctx.fillStyle = hexA(P.c, 0.14);
    poly(ctx, [[64, 46], [78, 100], [50, 100]]); ctx.fill();
    // shoulders
    ctx.fillStyle = P.b;
    rrect(ctx, 44, 48, 14, 12, 5); ctx.fill(); stroke(ctx, 2.2);
    rrect(ctx, 72, 48, 14, 12, 5); ctx.fill(); stroke(ctx, 2.2);
    // head / hood
    ctx.fillStyle = '#ecd3b6'; ell(ctx, 65, 40, 8, 8.8); ctx.fill(); stroke(ctx, 2.2);
    ctx.fillStyle = lg(ctx, 52, 22, 80, 44, P.a, P.b);
    ctx.beginPath();
    ctx.moveTo(53, 46); ctx.quadraticCurveTo(48, 20, 65, 20);
    ctx.quadraticCurveTo(82, 20, 79, 46);
    ctx.quadraticCurveTo(74, 34, 65, 32); ctx.quadraticCurveTo(56, 34, 53, 46);
    ctx.closePath(); ctx.fill(); stroke(ctx, 2.4);
    ctx.fillStyle = P.c;
    ctx.beginPath(); ctx.arc(68, 41, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(61, 41, 1.5, 0, Math.PI * 2); ctx.fill();
    // staff
    ctx.save();
    ctx.translate(88, 84); ctx.rotate(0.16);
    ctx.fillStyle = '#5b4224'; rrect(ctx, -2.6, -46, 5, 76, 2.4); ctx.fill(); stroke(ctx, 2);
    // orb
    ctx.fillStyle = rg(ctx, 0, -50, 1, 14, '#ffffff', P.a);
    ctx.beginPath(); ctx.arc(0, -50, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = P.c; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = P.c; ctx.lineWidth = 1.2;
    ell(ctx, 0, -50, 16, 6, 0.5); ctx.stroke();
    ell(ctx, 0, -50, 16, 6, -0.5); ctx.stroke();
    ctx.restore();
    // front arm
    ctx.fillStyle = P.a; rrect(ctx, 78, 62, 9, 18, 4); ctx.fill(); stroke(ctx, 2);
  }

  /* ---------------- ARTILLERY ---------------- */
  function artillery(ctx, tier) {
    const P = { a: '#ffa04d', b: '#8a3c14', c: '#ffe0b0', m: '#cfd6e6' };
    shadowBase(ctx, 48);
    aura(ctx, tier, P.a);
    tierCrest(ctx, tier, P.a, P.c);
    // carriage
    ctx.fillStyle = '#3a2a1c';
    rrect(ctx, 34, 84, 62, 18, 5); ctx.fill(); stroke(ctx, 2.6);
    ctx.fillStyle = '#6b4a24';
    rrect(ctx, 40, 86, 50, 7, 3); ctx.fill();
    // wheel
    ctx.fillStyle = '#241a12'; ctx.beginPath(); ctx.arc(52, 102, 13, 0, Math.PI * 2); ctx.fill(); stroke(ctx, 2.4);
    ctx.strokeStyle = P.a; ctx.lineWidth = 2.2;
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      ctx.beginPath(); ctx.moveTo(52, 102); ctx.lineTo(52 + Math.cos(a) * 10, 102 + Math.sin(a) * 10); ctx.stroke();
    }
    ctx.fillStyle = P.c; ctx.beginPath(); ctx.arc(52, 102, 3.2, 0, Math.PI * 2); ctx.fill();
    // barrel
    ctx.save();
    ctx.translate(66, 86); ctx.rotate(-0.46);
    ctx.fillStyle = lg(ctx, 0, -12, 0, 12, P.a, P.b);
    rrect(ctx, -6, -13, 56, 26, 11); ctx.fill(); stroke(ctx, 2.6);
    // bands
    ctx.fillStyle = P.m; rrect(ctx, 6, -14, 5, 28, 2); ctx.fill();
    rrect(ctx, 30, -14, 5, 28, 2); ctx.fill();
    // muzzle
    ctx.fillStyle = '#2a1608'; ell(ctx, 50, 0, 5, 11); ctx.fill(); stroke(ctx, 2);
    ctx.fillStyle = rg(ctx, 52, 0, 1, 10, '#fff2c8', 'rgba(255,160,60,0)');
    ctx.beginPath(); ctx.arc(53, 0, 10, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // shells
    ctx.fillStyle = P.c;
    rrect(ctx, 78, 96, 6, 10, 2); ctx.fill(); stroke(ctx, 1.6);
    rrect(ctx, 87, 98, 6, 8, 2); ctx.fill(); stroke(ctx, 1.6);
    // gunner (small)
    ctx.fillStyle = '#e8b98c'; ell(ctx, 40, 62, 6.4, 7.2); ctx.fill(); stroke(ctx, 2);
    ctx.fillStyle = P.b; rrect(ctx, 34, 68, 13, 16, 5); ctx.fill(); stroke(ctx, 2.2);
    ctx.fillStyle = P.a; rrect(ctx, 30, 50, 20, 7, 3); ctx.fill(); stroke(ctx, 2);
    ctx.fillStyle = P.c; rrect(ctx, 30, 50, 20, 2.4, 1); ctx.fill();
  }

  /* ---------------- KNIGHT ---------------- */
  function knight(ctx, tier) {
    const P = { a: '#ffd98a', b: '#8a6420', c: '#fff6d8', m: '#dfe8f7' };
    shadowBase(ctx, 48);
    aura(ctx, tier, tier >= 4 ? '#ffd166' : P.a);
    tierCrest(ctx, tier, P.a, P.c);
    legs(ctx, '#2a2a3a', '#15161f');
    // cape
    ctx.fillStyle = lg(ctx, 46, 48, 34, 104, '#a3243c', '#3d0a16');
    poly(ctx, [[50, 50], [30, 104], [50, 100], [58, 52]]); ctx.fill(); stroke(ctx, 2.2);
    // torso
    ctx.fillStyle = lg(ctx, 50, 50, 82, 90, P.m, '#8b96ad');
    poly(ctx, [[50, 52], [80, 52], [84, 74], [78, 92], [50, 92], [46, 74]]); ctx.fill(); stroke(ctx);
    ctx.fillStyle = hexA('#ffffff', 0.4);
    poly(ctx, [[58, 56], [74, 56], [72, 72], [56, 72]]); ctx.fill();
    // gold trim
    ctx.strokeStyle = P.a; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(65, 56); ctx.lineTo(65, 88); ctx.stroke();
    // belt
    ctx.fillStyle = P.b; rrect(ctx, 48, 86, 32, 7, 2); ctx.fill(); stroke(ctx, 2);
    // head
    ctx.fillStyle = P.m;
    rrect(ctx, 55, 32, 19, 19, 6); ctx.fill(); stroke(ctx, 2.6);
    // visor
    ctx.fillStyle = '#0a0d16'; rrect(ctx, 58, 38, 18, 6, 2); ctx.fill();
    ctx.fillStyle = '#ffcf5c';
    ctx.fillRect(61, 40, 5, 2); ctx.fillRect(69, 40, 4, 2);
    // plume
    ctx.fillStyle = '#e0394f';
    poly(ctx, [[64, 32], [60, 16], [66, 22], [64, 10], [72, 20], [70, 32]]); ctx.fill(); stroke(ctx, 1.8);
    // greatsword
    ctx.save();
    ctx.translate(88, 78); ctx.rotate(0.34);
    ctx.fillStyle = lg(ctx, -6, 0, 6, 0, '#ffffff', '#a9b8d0');
    poly(ctx, [[-5, -6], [5, -6], [4, -66], [0, -74], [-4, -66]]); ctx.fill(); stroke(ctx, 2);
    ctx.fillStyle = P.a; rrect(ctx, -9, -6, 18, 4, 2); ctx.fill(); stroke(ctx, 1.6);
    ctx.fillStyle = '#4a3520'; rrect(ctx, -3, -2, 6, 20, 2.4); ctx.fill(); stroke(ctx, 1.6);
    ctx.fillStyle = P.a; ell(ctx, 0, 19, 4, 3.4); ctx.fill(); stroke(ctx, 1.4);
    ctx.restore();
    // tower shield
    ctx.save();
    ctx.translate(44, 78); ctx.rotate(-0.08);
    ctx.fillStyle = lg(ctx, -14, -18, 14, 20, P.m, '#6e7a92');
    poly(ctx, [[-14, -18], [14, -18], [14, 4], [0, 20], [-14, 4]]); ctx.fill(); stroke(ctx, 2.6);
    ctx.fillStyle = P.a;
    poly(ctx, [[-7, -12], [7, -12], [7, 0], [0, 8], [-7, 0]]); ctx.fill();
    ctx.restore();
  }

  /* ---------------- COIN ---------------- */
  function coin(ctx, tier) {
    shadowBase(ctx, 34, 0.3);
    aura(ctx, tier, '#ffcf5c');
    const g = lg(ctx, 34, 40, 94, 100, '#fff2b8', '#e39b1e');
    for (let i = 0; i < 3; i++) {
      const y = 96 - i * 13;
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(64, y, 30, 12, 0, 0, Math.PI * 2); ctx.fill();
      stroke(ctx, 2.4, '#8a5c0a');
      ctx.fillStyle = hexA('#fff6cf', 0.5);
      ctx.beginPath(); ctx.ellipse(64, y - 2, 24, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c8871a';
      ctx.font = '900 11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('$', 64, y + 4);
    }
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.8;
    poly(ctx, [[64, 24], [67, 32], [75, 33], [69, 38], [71, 46], [64, 42], [57, 46], [59, 38], [53, 33], [61, 32]]);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* ---------------- RELIC SYMBOL ---------------- */
  function relicSymbol(ctx, tier) {
    aura(ctx, tier >= 3 ? 4 : 2, '#ff3ea5');
    ctx.save();
    ctx.translate(64, 66);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = lg(ctx, -30, -30, 30, 30, '#ffd0ea', '#8b2dff');
    rrect(ctx, -26, -26, 52, 52, 8); ctx.fill(); stroke(ctx, 2.6, '#2a0a2a');
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(64, 44); ctx.lineTo(64, 88); ctx.moveTo(46, 62); ctx.lineTo(82, 70); ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(64, 66, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffa9dd'; ctx.lineWidth = 1.4;
    ell(ctx, 64, 66, 30, 12, 0.7); ctx.stroke();
  }

  /* ---------------- ENEMIES ---------------- */
  function goblin(ctx) {
    const P = { a: '#8ce05a', b: '#3d7a22', c: '#d8ffc0' };
    shadowBase(ctx, 36, 0.35);
    legs(ctx, '#2c3d1c', '#1a2610');
    // body hunched
    ctx.fillStyle = lg(ctx, 50, 58, 80, 94, P.a, P.b);
    ell(ctx, 64, 76, 20, 20); ctx.fill(); stroke(ctx);
    // loincloth
    ctx.fillStyle = '#6b4a24'; rrect(ctx, 50, 82, 28, 12, 4); ctx.fill(); stroke(ctx, 2.2);
    // head
    ctx.fillStyle = P.a; ell(ctx, 62, 48, 16, 14); ctx.fill(); stroke(ctx);
    // ears
    poly(ctx, [[48, 44], [30, 36], [46, 52]]); ctx.fill(); stroke(ctx, 2.2);
    poly(ctx, [[76, 44], [94, 38], [78, 52]]); ctx.fill(); stroke(ctx, 2.2);
    // eyes
    ctx.fillStyle = '#ffe14d';
    ell(ctx, 58, 46, 4, 4.4); ctx.fill();
    ell(ctx, 70, 46, 4, 4.4); ctx.fill();
    ctx.fillStyle = '#10160a';
    ctx.beginPath(); ctx.arc(59, 47, 1.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(71, 46, 1.8, 0, Math.PI * 2); ctx.fill();
    // grin
    ctx.strokeStyle = '#10160a'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(56, 56); ctx.quadraticCurveTo(64, 62, 72, 55); ctx.stroke();
    ctx.fillStyle = '#fff';
    poly(ctx, [[58, 57], [60, 61], [62, 57]]); ctx.fill();
    // dagger + arm
    ctx.fillStyle = P.b; rrect(ctx, 78, 64, 9, 16, 4); ctx.fill(); stroke(ctx, 2);
    ctx.save(); ctx.translate(86, 74); ctx.rotate(-0.5);
    ctx.fillStyle = '#dce6f2'; poly(ctx, [[-3, 0], [3, 0], [1, -22], [0, -26], [-1, -22]]); ctx.fill(); stroke(ctx, 1.6);
    ctx.restore();
  }

  function orc(ctx) {
    const P = { a: '#e08560', b: '#7a3120', c: '#ffd0b0', m: '#9aa1b5' };
    shadowBase(ctx, 46, 0.4);
    legs(ctx, '#3a2a24', '#231914');
    // torso
    ctx.fillStyle = lg(ctx, 46, 52, 84, 94, P.a, P.b);
    poly(ctx, [[46, 54], [84, 54], [88, 76], [80, 94], [48, 94], [42, 76]]); ctx.fill(); stroke(ctx);
    // chest plate
    ctx.fillStyle = lg(ctx, 48, 56, 82, 84, P.m, '#4a5062');
    poly(ctx, [[50, 56], [80, 56], [82, 72], [48, 72]]); ctx.fill(); stroke(ctx, 2.2);
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    poly(ctx, [[55, 59], [75, 59], [76, 68], [54, 68]]); ctx.fill();
    // belt + loincloth
    ctx.fillStyle = '#3a2418'; rrect(ctx, 46, 88, 36, 8, 2); ctx.fill(); stroke(ctx, 2);
    ctx.fillStyle = '#7a3120'; poly(ctx, [[52, 94], [58, 108], [70, 108], [76, 94]]); ctx.fill(); stroke(ctx, 2);
    // neck
    ctx.fillStyle = P.b; rrect(ctx, 57, 46, 16, 10, 3); ctx.fill(); stroke(ctx, 2);
    // head
    ctx.fillStyle = P.a; ell(ctx, 64, 40, 15, 14); ctx.fill(); stroke(ctx, 2.6);
    // brow
    ctx.fillStyle = P.b;
    poly(ctx, [[50, 34], [78, 34], [76, 29], [52, 29]]); ctx.fill();
    // jaw
    ctx.fillStyle = '#c96a48'; rrect(ctx, 54, 46, 22, 11, 5); ctx.fill(); stroke(ctx, 2.2);
    // tusks
    ctx.fillStyle = '#fff6e0';
    poly(ctx, [[56, 52], [55, 62], [60, 53]]); ctx.fill(); stroke(ctx, 1.4);
    poly(ctx, [[70, 53], [73, 62], [73, 52]]); ctx.fill(); stroke(ctx, 1.4);
    // eyes
    ctx.fillStyle = '#ff3b3b'; ctx.shadowColor = '#ff3b3b'; ctx.shadowBlur = 8;
    ell(ctx, 58, 40, 3.6, 2.8); ctx.fill();
    ell(ctx, 70, 40, 3.6, 2.8); ctx.fill();
    ctx.shadowBlur = 0;
    // helmet
    ctx.fillStyle = lg(ctx, 50, 22, 80, 40, P.m, '#3f4557');
    ctx.beginPath(); ctx.moveTo(49, 34); ctx.quadraticCurveTo(50, 19, 64, 19);
    ctx.quadraticCurveTo(79, 19, 80, 34); ctx.closePath(); ctx.fill(); stroke(ctx, 2.4);
    ctx.fillStyle = 'rgba(255,255,255,.2)'; rrect(ctx, 56, 23, 16, 4, 2); ctx.fill();
    poly(ctx, [[64, 19], [57, 7], [71, 7]]); ctx.fill(); stroke(ctx, 2);
    // axe
    ctx.save();
    ctx.translate(90, 74); ctx.rotate(0.16);
    ctx.fillStyle = '#5b4224'; rrect(ctx, -3, -34, 6, 66, 2.4); ctx.fill(); stroke(ctx, 2);
    ctx.fillStyle = lg(ctx, -22, -38, 18, -8, '#eef4ff', '#8a94aa');
    poly(ctx, [[0, -34], [20, -26], [24, -6], [0, 0]]); ctx.fill(); stroke(ctx, 2.2);
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    poly(ctx, [[3, -30], [15, -24], [17, -10], [3, -6]]); ctx.fill();
    ctx.restore();
    // left arm
    ctx.strokeStyle = '#070a12'; ctx.lineWidth = 13; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(44, 60); ctx.lineTo(38, 82); ctx.stroke();
    ctx.strokeStyle = P.b; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(44, 60); ctx.lineTo(38, 82); ctx.stroke();
  }

  function skeleton(ctx) {
    const P = { a: '#e8e6dc', b: '#9d9a8a', c: '#7fffcf' };
    shadowBase(ctx, 34, 0.3);
    // bones legs
    ctx.strokeStyle = P.a; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(58, 82); ctx.lineTo(53, 106); ctx.moveTo(70, 82); ctx.lineTo(76, 106); ctx.stroke();
    ctx.strokeStyle = '#0b0f16'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(58, 82); ctx.lineTo(53, 106); ctx.moveTo(70, 82); ctx.lineTo(76, 106); ctx.stroke();
    // pelvis
    ctx.fillStyle = P.b; ell(ctx, 64, 80, 11, 7); ctx.fill(); stroke(ctx, 2);
    // spine + ribs
    ctx.strokeStyle = P.a; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(64, 54); ctx.lineTo(64, 78); ctx.stroke();
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const y = 58 + i * 5.5;
      ctx.beginPath(); ctx.moveTo(64, y); ctx.quadraticCurveTo(54, y + 2, 52, y + 5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(64, y); ctx.quadraticCurveTo(74, y + 2, 76, y + 5); ctx.stroke();
    }
    // skull
    ctx.fillStyle = P.a; ell(ctx, 64, 40, 13, 14); ctx.fill(); stroke(ctx, 2.4);
    ctx.fillStyle = P.b; rrect(ctx, 56, 46, 16, 9, 4); ctx.fill();
    // eyes
    ctx.fillStyle = '#0b0f16'; ell(ctx, 59, 38, 4, 4.6); ctx.fill(); ell(ctx, 70, 38, 4, 4.6); ctx.fill();
    ctx.fillStyle = P.c; ctx.beginPath(); ctx.arc(59, 38, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(70, 38, 2, 0, Math.PI * 2); ctx.fill();
    // bow
    ctx.save(); ctx.translate(82, 66); ctx.rotate(-0.1);
    ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(14, 0, 0, 24); ctx.stroke();
    ctx.strokeStyle = P.c; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(-4, 0); ctx.lineTo(0, 24); ctx.stroke();
    ctx.restore();
    // arm
    ctx.strokeStyle = P.a; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(76, 58); ctx.lineTo(82, 66); ctx.stroke();
  }

  function brute(ctx) {
    const P = { a: '#aab4d8', b: '#3c4160', c: '#ff7a5c', m: '#6b7396' };
    shadowBase(ctx, 50, 0.45);
    legs(ctx, '#2b2f44', '#181b28', 1.2);
    // huge torso
    ctx.fillStyle = lg(ctx, 42, 46, 88, 98, P.a, P.b);
    poly(ctx, [[42, 52], [86, 52], [92, 78], [80, 100], [48, 100], [36, 78]]); ctx.fill(); stroke(ctx, 2.8);
    // heavy plates
    ctx.fillStyle = '#d3dbf2';
    rrect(ctx, 48, 56, 32, 12, 4); ctx.fill(); stroke(ctx, 2);
    ctx.fillStyle = '#c3cbe6';
    rrect(ctx, 46, 70, 36, 12, 4); ctx.fill(); stroke(ctx, 2);
    ctx.fillStyle = '#b4bddb';
    rrect(ctx, 50, 84, 28, 10, 4); ctx.fill(); stroke(ctx, 2);
    // rivets
    ctx.fillStyle = '#6b7396';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(54 + i * 10, 62, 1.6, 0, 6.283); ctx.fill(); }
    // neck + head
    ctx.fillStyle = P.b; rrect(ctx, 56, 44, 18, 10, 3); ctx.fill(); stroke(ctx, 2);
    ctx.fillStyle = '#2a2038'; ell(ctx, 64, 38, 13, 12); ctx.fill(); stroke(ctx, 2.4);
    ctx.fillStyle = '#ff3b3b'; ctx.shadowColor = '#ff3b3b'; ctx.shadowBlur = 10;
    ell(ctx, 59, 37, 3.6, 2.6); ctx.fill(); ell(ctx, 70, 37, 3.6, 2.6); ctx.fill();
    ctx.shadowBlur = 0;
    // helm
    ctx.fillStyle = lg(ctx, 48, 20, 80, 38, P.a, P.m);
    ctx.beginPath(); ctx.moveTo(49, 32); ctx.quadraticCurveTo(50, 16, 64, 16);
    ctx.quadraticCurveTo(78, 16, 79, 32); ctx.closePath(); ctx.fill(); stroke(ctx, 2.6);
    ctx.fillStyle = '#eef2ff';
    poly(ctx, [[64, 16], [60, 4], [68, 4]]); ctx.fill(); stroke(ctx, 2);
    // horns
    ctx.strokeStyle = '#eef2ff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(51, 24); ctx.quadraticCurveTo(38, 12, 30, 22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(77, 24); ctx.quadraticCurveTo(90, 12, 98, 22); ctx.stroke();
    // mace
    ctx.save(); ctx.translate(92, 72); ctx.rotate(0.18);
    ctx.fillStyle = '#4a3520'; rrect(ctx, -3.4, -10, 6.8, 58, 2.4); ctx.fill(); stroke(ctx, 2);
    ctx.fillStyle = P.m;
    ctx.beginPath(); ctx.arc(0, -18, 12.5, 0, 6.283); ctx.fill(); stroke(ctx, 2.6);
    ctx.fillStyle = P.c;
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      ctx.beginPath(); ctx.arc(Math.cos(a) * 14.5, -18 + Math.sin(a) * 14.5, 3.4, 0, 6.283); ctx.fill();
    }
    ctx.fillStyle = '#ff8a6a'; ctx.beginPath(); ctx.arc(0, -18, 4, 0, 6.283); ctx.fill();
    ctx.restore();
    // tower shield
    ctx.fillStyle = lg(ctx, 18, 46, 50, 100, '#d3dbf2', '#5b6280');
    poly(ctx, [[20, 50], [48, 50], [48, 84], [34, 100], [20, 84]]); ctx.fill(); stroke(ctx, 2.6);
    ctx.fillStyle = '#2b2f44';
    poly(ctx, [[26, 57], [42, 57], [42, 82], [34, 92], [26, 82]]); ctx.fill();
    ctx.fillStyle = P.c;
    poly(ctx, [[34, 62], [39, 70], [34, 78], [29, 70]]); ctx.fill();
  }

  function wraith(ctx) {
    const P = { a: '#b07dff', b: '#2a1150', c: '#ff8ae0' };
    shadowBase(ctx, 34, 0.25);
    const g = lg(ctx, 64, 20, 64, 112, P.a, P.b);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(64, 18);
    ctx.quadraticCurveTo(92, 26, 88, 70);
    ctx.quadraticCurveTo(90, 96, 76, 110);
    ctx.quadraticCurveTo(70, 98, 64, 112);
    ctx.quadraticCurveTo(58, 98, 52, 110);
    ctx.quadraticCurveTo(38, 96, 40, 70);
    ctx.quadraticCurveTo(36, 26, 64, 18);
    ctx.closePath(); ctx.fill(); stroke(ctx, 2.6);
    // hood opening
    ctx.fillStyle = '#120724';
    ctx.beginPath(); ctx.ellipse(64, 46, 15, 19, 0, 0, Math.PI * 2); ctx.fill();
    // eyes
    ctx.fillStyle = P.c;
    ctx.shadowColor = P.c; ctx.shadowBlur = 12;
    ell(ctx, 58, 46, 3.4, 5); ctx.fill();
    ell(ctx, 70, 46, 3.4, 5); ctx.fill();
    ctx.shadowBlur = 0;
    // scythe
    ctx.save(); ctx.translate(88, 74); ctx.rotate(0.1);
    ctx.fillStyle = '#3a2a1a'; rrect(ctx, -2.4, -34, 4.8, 70, 2); ctx.fill(); stroke(ctx, 1.8);
    ctx.strokeStyle = '#e8f2ff'; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.arc(-6, -34, 18, -0.3, 1.5); ctx.stroke();
    ctx.restore();
  }

  function boss(ctx) {
    const P = { a: '#ff5a6e', b: '#3a0a18', c: '#ffd0d8', m: '#2a1030' };
    // aura
    const g0 = rg(ctx, 64, 64, 10, 62, 'rgba(255,60,90,.4)', 'rgba(255,60,90,0)');
    ctx.fillStyle = g0; ctx.beginPath(); ctx.arc(64, 64, 62, 0, Math.PI * 2); ctx.fill();
    shadowBase(ctx, 52, 0.5);
    legs(ctx, '#1c1024', '#0e0814', 1.3);
    // cape
    ctx.fillStyle = lg(ctx, 46, 44, 30, 108, '#5c0f26', '#1c0410');
    poly(ctx, [[50, 48], [16, 108], [46, 104], [58, 50]]); ctx.fill(); stroke(ctx, 2.4);
    poly(ctx, [[78, 48], [112, 108], [82, 104], [70, 50]]); ctx.fill(); stroke(ctx, 2.4);
    // torso
    ctx.fillStyle = lg(ctx, 44, 48, 86, 96, P.m, '#12060f');
    poly(ctx, [[46, 50], [84, 50], [88, 80], [78, 98], [50, 98], [42, 80]]); ctx.fill(); stroke(ctx, 2.8);
    // chest rune
    ctx.strokeStyle = P.a; ctx.lineWidth = 2;
    ctx.shadowColor = P.a; ctx.shadowBlur = 12;
    poly(ctx, [[64, 60], [72, 74], [64, 88], [56, 74]]); ctx.stroke();
    ctx.shadowBlur = 0;
    // head
    ctx.fillStyle = '#1b0f22'; ell(ctx, 64, 40, 13, 14); ctx.fill(); stroke(ctx, 2.4);
    // eyes
    ctx.fillStyle = '#ff3b5c'; ctx.shadowColor = '#ff3b5c'; ctx.shadowBlur = 14;
    ell(ctx, 58, 40, 4, 3.4); ctx.fill(); ell(ctx, 70, 40, 4, 3.4); ctx.fill();
    ctx.shadowBlur = 0;
    // crown horns
    ctx.fillStyle = '#d9c9a0';
    poly(ctx, [[52, 30], [46, 6], [56, 20], [60, 2], [66, 20], [72, 6], [76, 30]]); ctx.fill(); stroke(ctx, 2.2);
    ctx.fillStyle = P.a; ell(ctx, 64, 16, 3, 3); ctx.fill();
    // great axe
    ctx.save(); ctx.translate(94, 70); ctx.rotate(0.10);
    ctx.fillStyle = '#3a2a1a'; rrect(ctx, -3.6, -38, 7.2, 84, 3); ctx.fill(); stroke(ctx, 2.2);
    ctx.fillStyle = '#8a1a2a'; rrect(ctx, -4.4, 30, 8.8, 10, 3); ctx.fill();
    // blade (crescent)
    ctx.fillStyle = lg(ctx, 0, -34, 30, 4, '#eef4ff', '#7a849e');
    ctx.beginPath();
    ctx.moveTo(2, -34);
    ctx.quadraticCurveTo(34, -30, 32, 2);
    ctx.quadraticCurveTo(16, -4, 2, 4);
    ctx.closePath(); ctx.fill(); stroke(ctx, 2.4);
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath();
    ctx.moveTo(6, -28);
    ctx.quadraticCurveTo(26, -24, 25, -2);
    ctx.quadraticCurveTo(15, -8, 6, -3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.a; ell(ctx, 2, -15, 4.2, 4.2); ctx.fill();
    ctx.restore();
  }

  /* ---------------- glyphs for relic icons ---------------- */
  const GLYPHS = {
    sword: function (c) {
      c.save(); c.translate(48, 48); c.rotate(-0.75);
      c.fillStyle = '#fff'; poly(c, [[-4, 8], [4, 8], [3, -30], [0, -38], [-3, -30]]); c.fill();
      c.fillStyle = '#cfe3ff'; poly(c, [[-4, 8], [4, 8], [3, -30], [0, -38], [-3, -30]]); c.fill();
      c.fillStyle = '#ffcf5c'; rrect(c, -12, 6, 24, 6, 2); c.fill();
      rrect(c, -3, 10, 6, 16, 2); c.fill();
      c.restore();
    },
    shield: function (c) {
      c.fillStyle = '#9fd8ff';
      poly(c, [[48, 20], [72, 28], [72, 50], [48, 74], [24, 50], [24, 28]]); c.fill();
      c.fillStyle = '#1a3a5c';
      poly(c, [[48, 30], [64, 36], [64, 50], [48, 64], [32, 50], [32, 36]]); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 2;
      poly(c, [[48, 36], [48, 58], [40, 47]]); c.stroke();
    },
    bolt: function (c) {
      c.fillStyle = '#ffe15c';
      poly(c, [[54, 16], [32, 52], [46, 52], [40, 80], [66, 40], [50, 40]]); c.fill();
    },
    coin: function (c) {
      c.fillStyle = '#ffcf5c';
      c.beginPath(); c.arc(48, 48, 22, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#8a5c0a';
      c.beginPath(); c.arc(48, 48, 17, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffe9a8'; c.font = '900 22px sans-serif'; c.textAlign = 'center';
      c.fillText('$', 48, 56);
    },
    heart: function (c) {
      c.fillStyle = '#ff5a7a';
      c.beginPath(); c.moveTo(48, 70);
      c.bezierCurveTo(16, 48, 24, 22, 48, 34);
      c.bezierCurveTo(72, 22, 80, 48, 48, 70); c.fill();
      c.fillStyle = 'rgba(255,255,255,.4)';
      c.beginPath(); c.arc(40, 42, 5, 0, Math.PI * 2); c.fill();
    },
    arrow: function (c) {
      c.strokeStyle = '#8effc9'; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(22, 68); c.lineTo(64, 28); c.stroke();
      c.fillStyle = '#8effc9';
      poly(c, [[64, 28], [56, 30], [66, 40], [70, 22]]); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(24, 50); c.lineTo(38, 66); c.stroke();
    },
    crown: function (c) {
      c.fillStyle = '#ffcf5c';
      poly(c, [[24, 62], [26, 34], [38, 46], [48, 26], [58, 46], [70, 34], [72, 62]]); c.fill();
      c.fillStyle = '#fff2c0'; c.fillRect(26, 62, 44, 6);
      c.fillStyle = '#ff5a7a'; c.beginPath(); c.arc(48, 40, 3, 0, Math.PI * 2); c.fill();
    },
    star: function (c) {
      c.fillStyle = '#ffe15c';
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5;
        const r = i % 2 ? 10 : 26;
        pts.push([48 + Math.cos(a) * r, 48 + Math.sin(a) * r]);
      }
      poly(c, pts); c.fill();
    },
    rune: function (c) {
      c.strokeStyle = '#c9a6ff'; c.lineWidth = 3.4; c.lineCap = 'round';
      c.beginPath(); c.arc(48, 48, 20, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(48, 28); c.lineTo(48, 68); c.moveTo(34, 38); c.lineTo(62, 58); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(48, 48, 3.4, 0, Math.PI * 2); c.fill();
    },
    eye: function (c) {
      c.strokeStyle = '#9fe8ff'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(18, 48); c.quadraticCurveTo(48, 20, 78, 48); c.quadraticCurveTo(48, 76, 18, 48); c.stroke();
      c.fillStyle = '#ff3ea5'; c.beginPath(); c.arc(48, 48, 11, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#0a0d16'; c.beginPath(); c.arc(48, 48, 5, 0, Math.PI * 2); c.fill();
    },
    reel: function (c) {
      c.strokeStyle = '#9fe8ff'; c.lineWidth = 3;
      rrect(c, 20, 26, 56, 44, 8); c.stroke();
      c.beginPath(); c.moveTo(33, 32); c.lineTo(33, 64); c.moveTo(48, 32); c.lineTo(48, 64); c.moveTo(63, 32); c.lineTo(63, 64); c.stroke();
    },
    wall: function (c) {
      c.fillStyle = '#9aa8c8';
      c.fillRect(20, 40, 56, 30);
      c.fillStyle = '#6b7797';
      for (let i = 0; i < 4; i++) c.fillRect(20 + i * 15, 30, 10, 12);
      c.fillStyle = '#3a4358';
      c.fillRect(20, 52, 56, 3); c.fillRect(38, 52, 3, 18); c.fillRect(56, 52, 3, 18);
    }
  };

  /* ---------------- public getters ---------------- */
  function unitSprite(type, tier) {
    const key = 'u_' + type + '_' + tier;
    if (cache[key]) return cache[key];
    const c = mk(function (ctx) {
      if (type === 'spear') spear(ctx, tier);
      else if (type === 'archer') archer(ctx, tier);
      else if (type === 'mage') mage(ctx, tier);
      else if (type === 'artillery') artillery(ctx, tier);
      else if (type === 'knight') knight(ctx, tier);
      else if (type === 'coin') coin(ctx, tier);
      else if (type === 'relic') relicSymbol(ctx, tier);
      else spear(ctx, tier);
    });
    cache[key] = c; return c;
  }

  function enemySprite(type) {
    const key = 'e_' + type;
    if (cache[key]) return cache[key];
    const c = mk(function (ctx) {
      if (type === 'goblin') goblin(ctx);
      else if (type === 'orc') orc(ctx);
      else if (type === 'skeleton') skeleton(ctx);
      else if (type === 'brute') brute(ctx);
      else if (type === 'wraith') wraith(ctx);
      else if (type === 'boss') boss(ctx);
      else goblin(ctx);
    });
    cache[key] = c; return c;
  }

  /* white silhouette used for the hit-flash overlay */
  function whiteVersion(src) {
    const c = document.createElement('canvas');
    c.width = src.width; c.height = src.height;
    const x = c.getContext('2d');
    x.drawImage(src, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    x.fillStyle = '#ffffff';
    x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  function unitFlash(type, tier) {
    const key = 'uf_' + type + '_' + (tier || 1);
    if (!cache[key]) cache[key] = whiteVersion(unitSprite(type, tier || 1));
    return cache[key];
  }

  function enemyFlash(type) {
    const key = 'ef_' + type;
    if (!cache[key]) cache[key] = whiteVersion(enemySprite(type));
    return cache[key];
  }

  function iconDataURL(type, tier) {    const key = 'i_' + type + '_' + (tier || 1);
    if (cache[key]) return cache[key];
    const s = unitSprite(type, tier || 1);
    const c = document.createElement('canvas');
    c.width = 160; c.height = 160;
    const x = c.getContext('2d');
    x.drawImage(s, 6, 2, 148, 148);
    const url = c.toDataURL('image/png');
    cache[key] = url;
    return url;
  }

  function relicIcon(glyph, color) {
    const key = 'r_' + glyph + '_' + (color || '');
    if (cache[key]) return cache[key];
    const c = document.createElement('canvas');
    c.width = c.height = 96;
    const x = c.getContext('2d');
    x.lineJoin = 'round'; x.lineCap = 'round';
    // background glow
    const g = x.createRadialGradient(48, 48, 2, 48, 48, 46);
    g.addColorStop(0, hexA(color || '#3ce6ff', 0.35));
    g.addColorStop(1, hexA(color || '#3ce6ff', 0));
    x.fillStyle = g; x.fillRect(0, 0, 96, 96);
    // frame
    x.strokeStyle = hexA(color || '#3ce6ff', 0.5); x.lineWidth = 2;
    x.beginPath(); x.arc(48, 48, 36, 0, Math.PI * 2); x.stroke();
    x.save(); x.translate(0, 0);
    (GLYPHS[glyph] || GLYPHS.star)(x);
    x.restore();
    const url = c.toDataURL('image/png');
    cache[key] = url;
    return url;
  }

  SB.Art = {
    unit: unitSprite,
    enemy: enemySprite,
    unitFlash: unitFlash,
    enemyFlash: enemyFlash,
    icon: iconDataURL,
    relic: relicIcon,
    hexA: hexA,
    shadowBase: shadowBase,
    BOX: BOX
  };
})();
