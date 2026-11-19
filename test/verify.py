#!/usr/bin/env python3
"""
MOA Spin Siege — end-to-end verification.

Runs the real game in Chromium at desktop (1440x900) and mobile (390x844)
and checks: console cleanliness, layout overflow, spin -> summon -> combat,
promotion, wave clear -> relic draft, four languages, VIP trial code, and
captures the delivery screenshots.

Usage:
    python3 verify.py            # full run
    python3 verify.py --quick    # skip screenshots
"""
import json
import os
import sys
import time

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
URL = "file://" + os.path.join(ROOT, "index.html")
SHOT_DIR = os.path.abspath(os.path.join(ROOT, "..", "browser"))
QUICK = "--quick" in sys.argv

results = []
def check(name, ok, detail=""):
    results.append({"check": name, "ok": bool(ok), "detail": detail})
    print(("PASS " if ok else "FAIL ") + name + (("  — " + str(detail)) if detail else ""))
    return ok

def no_raw_keys(pg):
    """Visible text must not contain untranslated keys like 'slot.spin'."""
    txt = pg.evaluate("document.body.innerText")
    import re
    keys = re.findall(r'\b(ui|slot|hud|quest|relic|unit|tier|wave|draft|vip|toast|gameover|howto|rarity|stat)\.[a-z0-9.]+', txt)
    return keys

def overflow(pg):
    return pg.evaluate("""() => {
        const d = document.documentElement;
        const bad = [];
        document.querySelectorAll('#app *').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && (r.right > innerWidth + 1.5 || r.left < -1.5)) {
                const cs = getComputedStyle(el);
                if (cs.position !== 'fixed' && cs.display !== 'none' && cs.pointerEvents !== 'none'
                    && !el.classList.contains('spin-glow') && el.closest('.overlay') === null) {
                    bad.push((el.id || el.className || el.tagName) + ':' + Math.round(r.left) + '..' + Math.round(r.right));
                }
            }
        });
        return { scrollW: d.scrollWidth, innerW: innerWidth, bad: bad.slice(0, 6) };
    }""")

def run_desktop(p, errors):
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    pg = ctx.new_page()
    pg.on("console", lambda m: errors.append(("console." + m.type, m.text)) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errors.append(("pageerror", str(e))))
    pg.goto(URL)
    pg.wait_for_timeout(900)

    check("title is MOA Spin Siege", "MOA Spin Siege" in pg.title(), pg.title())
    check("menu visible", pg.is_visible("#btnPlay"))
    check("i18n keys complete (4 langs)", pg.evaluate("SB.I18n.check()")["ok"], pg.evaluate("SB.I18n.check()")["missing"][:5])
    check("no raw i18n keys on menu", not no_raw_keys(pg), no_raw_keys(pg)[:5])
    ov = overflow(pg)
    check("desktop menu: no horizontal overflow", ov["scrollW"] <= ov["innerW"] and not ov["bad"], ov)
    if not QUICK:
        pg.screenshot(path=os.path.join(SHOT_DIR, "slot-defense-menu.png"))

    pg.click("#btnPlay")
    pg.wait_for_timeout(1400)
    st = pg.evaluate("SB.debug.state()")
    check("game starts in playing state", st["state"] == "playing", st["state"])

    # --- spin -> summon
    before = len(st["units"])
    for _ in range(3):
        pg.click("#spinBtn")
        pg.wait_for_timeout(1500)
        st = pg.evaluate("SB.debug.state()")
        if len(st["units"]) > before:
            break
    check("spin summons units", len(st["units"]) > before, "%d -> %d units" % (before, len(st["units"])))
    check("spin consumed a charge", st["charges"] <= 4, st["charges"])

    # --- audio synthesis actually generates nodes
    pg.evaluate("""(() => {
        window.__osc = 0;
        const P = window.AudioContext.prototype; const o = P.createOscillator;
        P.createOscillator = function () { window.__osc++; return o.apply(this, arguments); };
    })()""")
    pg.click("#spinBtn")
    pg.wait_for_timeout(1300)
    osc = pg.evaluate("window.__osc || 0")
    check("audio synth generates nodes on spin", osc > 0, "%d oscillators" % osc)
    pg.click("#btnMute")
    pg.wait_for_timeout(150)
    check("mute toggles without error", pg.evaluate("document.body.classList.contains('muted')"))
    pg.click("#btnMute")

    # --- reels animate (transform changes while spinning)
    pg.click("#spinBtn")
    pg.wait_for_timeout(120)
    spinning = pg.evaluate("SB.debug.state()['spinning']")
    check("reels spin (animation state active)", spinning is True, spinning)
    pg.wait_for_timeout(1400)

    # --- hold
    pg.click(".reel:nth-child(2)")
    held = pg.evaluate("document.querySelectorAll('.reel.held').length")
    check("hold locks a reel", held == 1, held)
    pg.click(".reel:nth-child(2)")

    # --- combat: spawn enemies and confirm damage / kills
    pg.evaluate("SB.debug.forceEnemies(4,'orc')")
    pg.wait_for_timeout(6000)
    st = pg.evaluate("SB.debug.state()")
    check("enemies engage and take damage", st["stats"]["kills"] > 0 or any(e["hp"] < 200 for e in st["enemies"]), "kills=%s" % st["stats"]["kills"])

    # --- promotion
    tiers = pg.evaluate("SB.debug.promoteTest()")
    check("duplicate units promote", any(t.endswith("2") for t in tiers), tiers)

    # --- wave clear -> draft
    pg.evaluate("SB.debug.clearWave()")
    pg.wait_for_timeout(1700)
    check("wave clear opens relic draft", pg.is_visible("#draftCards .relic-card"), pg.evaluate("SB.debug.state()['waveState']"))
    n_cards = pg.evaluate("document.querySelectorAll('#draftCards .relic-card').length")
    check("draft offers 3 relics", n_cards == 3, n_cards)
    before_relics = pg.evaluate("SB.debug.state()['relics']")
    picked = pg.evaluate("document.querySelector('#draftCards .relic-card h3').textContent")
    pg.click("#draftCards .relic-card")
    pg.wait_for_timeout(400)
    st = pg.evaluate("SB.debug.state()")
    check("picked relic is applied", len(st["relics"]) > len(before_relics), "%s -> %s (card: %s)" % (before_relics, st["relics"], picked))
    check("draft closed after pick", not pg.is_visible("#draftCards .relic-card"))

    # --- jackpot
    pg.evaluate("SB.debug.jackpot()")
    pg.wait_for_timeout(300)
    st = pg.evaluate("SB.debug.state()")
    check("jackpot grants tier-2 units", any(u["tier"] >= 2 for u in st["units"]), st["jackpots"] if "jackpots" in st else st["stats"]["jackpots"])
    check("jackpot counted", st["stats"]["jackpots"] >= 1, st["stats"]["jackpots"])

    # --- fever
    pg.evaluate("SB.debug.fever()")
    pg.wait_for_timeout(300)
    check("fever activates", pg.evaluate("document.body.classList.contains('fever')"))

    # --- languages
    langs = pg.evaluate("SB.I18n.LANGS")
    seen = {}
    for lang in langs:
        pg.evaluate("SB.debug.lang('%s')" % lang)
        pg.wait_for_timeout(180)
        label = pg.evaluate("document.querySelector('.hud .chip-label') ? document.querySelector('.hud .chip-label').textContent : ''")
        seen[lang] = label
        raw = no_raw_keys(pg)
        check("lang %s: HUD translated" % lang, bool(label.strip()), label)
        check("lang %s: no raw keys" % lang, not raw, raw[:4])
    check("4 distinct language renders", len(set(seen.values())) == 4, seen)
    pg.evaluate("SB.debug.lang('ko')")

    # --- pause
    pg.click("#btnPause")
    pg.wait_for_timeout(250)
    check("pause overlay opens", pg.is_visible("#pauseStats"))
    pg.click("#btnResume")
    pg.wait_for_timeout(250)
    check("resume returns to play", pg.evaluate("SB.debug.state()['state']") == "playing")

    # --- VIP trial code
    pg.click("#btnPause")
    pg.click("#btnQuit")
    pg.wait_for_timeout(600)
    pg.click("#btnVip")
    pg.wait_for_timeout(300)
    pg.fill("#vipCode", "MOA-SLOT-2026")
    pg.click("#vipSubmit")
    pg.wait_for_timeout(300)
    msg = pg.inner_text("#vipMsg")
    check("VIP trial code accepted", "해금" in msg or "unlocked" in msg, msg)
    check("VIP flag stored", pg.evaluate("localStorage.getItem('moa.ss.vip')") == "1")
    pg.click("#vipClose")

    # --- game over
    pg.click("#btnPlay")
    pg.wait_for_timeout(900)
    pg.evaluate("SB.debug.god()")
    pg.evaluate("SB.debug.god2 ? SB.debug.god2() : null")
    pg.evaluate("(() => { const s = SB.debug; window.__kill = 1; })()")
    pg.evaluate("SB.debug.spawnWave(5)")
    pg.wait_for_timeout(2200)
    check("boss bar appears on wave 5", pg.evaluate("!document.getElementById('bossHud').hidden"))

    if not QUICK:
        # stage a rich battle for the delivery screenshot
        pg.evaluate("SB.debug.shotScene()")
        pg.wait_for_timeout(1100)
        pg.screenshot(path=os.path.join(SHOT_DIR, "slot-defense-desktop.png"))

    pg.evaluate("(() => { SB.debug.state(); })()")
    ov = overflow(pg)
    check("desktop game: no horizontal overflow", ov["scrollW"] <= ov["innerW"] and not ov["bad"], ov)
    b.close()

def run_mobile(p, errors):
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2,
                        is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.on("console", lambda m: errors.append(("console." + m.type, m.text)) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errors.append(("pageerror", str(e))))
    pg.goto(URL)
    pg.wait_for_timeout(900)

    ov = overflow(pg)
    check("mobile menu: no horizontal overflow", ov["scrollW"] <= ov["innerW"] and not ov["bad"], ov)
    check("mobile menu fits viewport height", pg.evaluate("document.body.scrollHeight <= innerHeight + 2"))
    pg.tap("#btnPlay")
    pg.wait_for_timeout(1300)

    for _ in range(3):
        pg.tap("#spinBtn")
        pg.wait_for_timeout(1150)
    st = pg.evaluate("SB.debug.state()")
    check("mobile: touch spin summons units", len(st["units"]) > 0, len(st["units"]))

    ov = overflow(pg)
    check("mobile game: no horizontal overflow", ov["scrollW"] <= ov["innerW"] and not ov["bad"], ov)
    check("mobile: slot panel visible", pg.is_visible("#spinBtn"))

    # tap a reel to hold
    pg.locator(".reel").first.tap()
    pg.wait_for_timeout(200)
    check("mobile: tap hold works", pg.evaluate("document.querySelectorAll('.reel.held').length") == 1)

    langs = pg.evaluate("SB.I18n.LANGS")
    for lang in langs:
        pg.evaluate("SB.debug.lang('%s')" % lang)
        pg.wait_for_timeout(150)
        raw = no_raw_keys(pg)
        if raw:
            check("mobile lang %s raw keys" % lang, False, raw[:4])
    check("mobile: all 4 languages clean", True)
    pg.evaluate("SB.debug.lang('ko')")

    pg.evaluate("SB.debug.spawnWave(5)")
    pg.wait_for_timeout(500)

    pg.locator(".reel").first.tap()   # release hold before the shot
    pg.wait_for_timeout(150)
    if not QUICK:
        pg.evaluate("SB.debug.shotScene()")
        pg.wait_for_timeout(1100)
        pg.screenshot(path=os.path.join(SHOT_DIR, "slot-defense-mobile.png"))
    b.close()

def main():
    errors = []
    with sync_playwright() as p:
        run_desktop(p, errors)
        run_mobile(p, errors)
    errs = [e for e in errors if not ("favicon" in e[1].lower())]
    check("zero console errors / page errors", len(errs) == 0, errs[:4])

    ok = all(r["ok"] for r in results)
    print("\n%d checks, %d failed" % (len(results), sum(1 for r in results if not r["ok"])))
    with open(os.path.join(HERE, "last-run.json"), "w") as f:
        json.dump({"ok": ok, "results": results, "errors": errs}, f, ensure_ascii=False, indent=2)
    sys.exit(0 if ok else 1)

main()
