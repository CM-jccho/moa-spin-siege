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

    # --- ranged enemy counterplay (v1.1: melee sortie + longer ranged reach) ---
    pg.evaluate("SB.debug.arena(); SB.debug.summon('spear', 1, 1, 0); SB.debug.spawnAt('skeleton', 1, 0.86)")
    pg.wait_for_timeout(900)
    charged = pg.evaluate("SB.debug.unitPos()")
    check("melee unit steps out of its slot toward a ranged enemy",
          bool(charged) and charged[0]["x"] > 0.49, charged)
    hit = False
    sk = []
    for _ in range(14):
        pg.wait_for_timeout(500)
        st = pg.evaluate("SB.debug.state()")
        sk = [e for e in st["enemies"] if e["t"] == "skeleton"]
        if not sk or sk[0]["hp"] < 80:
            hit = True
        if not sk:
            break
    check("melee-only lane reaches and kills a skeleton archer", hit and not sk, sk)
    xs = [u["x"] for u in pg.evaluate("SB.debug.unitPos()")]
    check("charging units stay on the battlefield", all(0.05 <= x <= 0.92 for x in xs), xs)

    pg.evaluate("SB.debug.arena(); SB.debug.summon('archer', 1, 1, 0); SB.debug.spawnAt('skeleton', 1, 0.90)")
    ranged_hit = False
    sk2 = []
    for _ in range(18):
        pg.wait_for_timeout(500)
        st = pg.evaluate("SB.debug.state()")
        sk2 = [e for e in st["enemies"] if e["t"] == "skeleton"]
        if not sk2 or sk2[0]["hp"] < 80:
            ranged_hit = True
        if not sk2:
            break
    check("archer lane reaches a skeleton at its standoff distance", ranged_hit and not sk2, sk2)

    pg.evaluate("SB.debug.arena(); SB.debug.summon('spear', 1, 1, 0); SB.debug.spawnAt('goblin', 1, 0.62)")
    pg.wait_for_timeout(3500)
    home = pg.evaluate("SB.debug.unitPos()")
    check("melee unit walks back to its slot after the lane clears",
          bool(home) and abs(home[0]["x"] - 0.465) < 0.02, home)

    # --- gold reroll economy (v1.3: wave-scaled + consecutive-reroll ladder) ---
    bal = pg.evaluate("SB.debug.balance()")
    pg.evaluate("SB.debug.spawnWave(3)")
    pg.wait_for_timeout(260)
    base3 = pg.evaluate("SB.debug.state()['rerollCost']")
    check("reroll price scales with the wave", base3 == bal["rerollCostAtWave"]["3"] and base3 > 10, (base3, bal["rerollCostAtWave"]))
    check("reroll price is on the button", pg.inner_text("#rerollCost") == "%dG" % base3, pg.inner_text("#rerollCost"))
    pg.evaluate("SB.debug.setGold(400)")
    pg.wait_for_timeout(120)
    pg.evaluate("document.getElementById('rerollBtn').click()")
    pg.wait_for_timeout(220)
    st = pg.evaluate("SB.debug.state()")
    check("reroll spends gold and raises the next price",
          st["gold"] == 400 - base3 and st["rerollCost"] == base3 + bal["rerollStep"], (st["gold"], st["rerollCost"], base3))
    pg.wait_for_timeout(1100)
    pg.evaluate("document.getElementById('rerollBtn').click()")
    pg.wait_for_timeout(300)
    st2 = pg.evaluate("SB.debug.state()")
    check("consecutive rerolls keep climbing with no cap",
          st2["rerollCost"] == base3 + bal["rerollStep"] * 2, st2["rerollCost"])
    pg.evaluate("SB.debug.setGold(5)")
    pg.wait_for_timeout(160)
    check("reroll is disabled when gold is short",
          pg.evaluate("document.getElementById('rerollBtn').disabled") and
          "poor" in pg.evaluate("document.getElementById('rerollBtn').className"))
    pg.evaluate("SB.debug.spawnWave(4)")
    pg.wait_for_timeout(300)
    check("reroll ladder resets on the next wave at that wave's base price",
          pg.evaluate("SB.debug.state()['rerollCost']") == bal["rerollCostAtWave"]["4"],
          pg.inner_text("#rerollCost"))

    # --- v1.3 tactical missions supply ordnance ---
    pg.evaluate("SB.debug.setGold(0)")
    q = pg.evaluate("SB.debug.quests()")
    check("missions are tactical (no spin/kill counters)",
          all(x["id"].startswith("m") and x["stat"] not in ("spins", "kills", "goldEarned") for x in q),
          [(x["id"], x["stat"]) for x in q])
    before = pg.evaluate("SB.debug.state()")
    q0 = q[0]
    pg.evaluate("SB.debug.progress('%s', %d)" % (q0["stat"], q0["target"]))
    pg.wait_for_timeout(700)
    st = pg.evaluate("SB.debug.state()")
    gained = (st["ord"]["bolt"] > before["ord"]["bolt"] or st["ord"]["meteor"] > before["ord"]["meteor"]
              or st["freeRerolls"] > before["freeRerolls"] or st["hp"] > before["hp"] or st["gold"] > before["gold"])
    check("tactical mission pays a tactical reward", gained, (q0["reward"], before["ord"], st["ord"], st["freeRerolls"]))

    # --- campaign map / zones ---
    pg.evaluate("SB.debug.spawnWave(1)")
    pg.wait_for_timeout(420)
    z1 = pg.evaluate("SB.debug.state()['zone']")
    label1 = pg.inner_text("#cmpLabel")
    dots = pg.evaluate("document.querySelectorAll('#cmpTrack .cmp-dot').length")
    check("campaign map shows 5 zone nodes", dots == 5, dots)
    check("fresh run starts in zone 1", z1 == 0 and bool(label1.strip()), (z1, label1))
    pg.evaluate("SB.debug.spawnWave(6)")
    pg.wait_for_timeout(420)
    z2 = pg.evaluate("SB.debug.state()['zone']")
    label2 = pg.inner_text("#cmpLabel")
    on_nodes = pg.evaluate("document.querySelectorAll('#cmpTrack .cmp-dot.on').length")
    check("wave 6 moves the campaign marker to zone 2", z2 == 1 and label2 != label1 and on_nodes == 1, (z2, label1, label2))
    pg.click("#btnPause")
    pg.wait_for_timeout(260)
    rows = pg.evaluate("document.querySelectorAll('#pauseMap li').length")
    on_row = pg.evaluate("document.querySelectorAll('#pauseMap li.on').length")
    check("pause panel lists the 5-zone campaign map", rows == 5 and on_row == 1, (rows, on_row))
    pg.click("#btnResume")
    pg.wait_for_timeout(260)

    # --- tactical missions rotate and announce ---
    pg.evaluate("document.getElementById('toastLayer').innerHTML = ''")
    pg.wait_for_timeout(140)
    q0 = pg.evaluate("SB.debug.quests()[0]")
    before = pg.evaluate("SB.debug.state()")
    pg.evaluate("SB.debug.progress('%s', %d)" % (q0["stat"], q0["target"]))
    pg.wait_for_timeout(700)
    st = pg.evaluate("SB.debug.state()")
    ids = [q["id"] for q in st["quests"]]
    toast_txt = pg.evaluate("document.getElementById('toastLayer').innerText")
    check("mission completes and rotates to a new one", q0["id"] not in ids, (q0["id"], ids))
    check("mission completion is announced", ("미션" in toast_txt) or ("mission" in toast_txt.lower()), toast_txt[:70])
    check("mission rows show a numeric progress", pg.evaluate("document.querySelectorAll('#questList .q-p').length") == 2)

    # --- v1.3 slot special items: lightning + meteor clear a lane ---
    pg.evaluate("SB.debug.arena(); SB.debug.forceEnemies(8,'orc')")
    pg.wait_for_timeout(200)
    hp0 = sum(e["hp"] for e in pg.evaluate("SB.debug.state()")["enemies"])
    pg.evaluate("SB.debug.cast('bolt')")
    pg.wait_for_timeout(300)
    st = pg.evaluate("SB.debug.state()")
    hp1 = sum(e["hp"] for e in st["enemies"])
    check("lightning strikes every enemy on screen", hp1 < hp0, (hp0, hp1, st["stats"]["specialKills"]))
    pg.evaluate("SB.debug.arena(); SB.debug.forceEnemies(10,'orc')")
    pg.wait_for_timeout(150)
    pg.evaluate("SB.debug.cast('meteor')")
    pg.wait_for_timeout(1500)
    st = pg.evaluate("SB.debug.state()")
    check("meteor barrage lands and damages the swarm",
          st["stats"]["specialKills"] > 0 and st["meteors"] == 0, (st["stats"]["specialKills"], st["meteors"]))
    pg.evaluate("SB.debug.arena(); SB.debug.cast('paladin')")
    pg.wait_for_timeout(900)
    units = pg.evaluate("SB.debug.state()")["units"]
    check("golden paladin joins the line", any(u["t"] == "paladin" and u["tier"] >= 3 for u in units), units)
    pg.evaluate("SB.debug.cast('frenzy')")
    pg.wait_for_timeout(200)
    check("jackpot frenzy fills the reels", pg.evaluate("SB.debug.state()")["frenzy"]
          and pg.evaluate("document.body.classList.contains('frenzy')"))

    # --- v1.3 ordnance buttons: mission-earned casts ---
    have = pg.evaluate("SB.debug.state()")["ord"]["bolt"]
    pg.evaluate("SB.debug.ord('bolt', 1)")
    pg.wait_for_timeout(180)
    check("earned lightning shows on its button", pg.inner_text("#ordBolt").strip() == str(have + 1), pg.inner_text("#ordBolt"))
    pg.evaluate("SB.debug.arena(); SB.debug.forceEnemies(5,'goblin')")
    pg.wait_for_timeout(150)
    n0 = len(pg.evaluate("SB.debug.state()")["enemies"])
    pg.click("#btnBolt")
    pg.wait_for_timeout(400)
    check("ordnance button spends a charge", pg.evaluate("SB.debug.state()")['ord']['bolt'] == have and n0 > 0, n0)

    # --- v1.3 slot codex (deck) ---
    pg.click("#btnPause")
    pg.wait_for_timeout(250)
    pg.click("#btnDeckPause")
    pg.wait_for_timeout(300)
    cards = pg.evaluate("document.querySelectorAll('#deckList .deck-card').length")
    statuses = pg.evaluate("[...document.querySelectorAll('.deck-card')].map(c=>c.getAttribute('data-status'))")
    check("slot codex lists four special slots", cards == 4, cards)
    check("codex separates free and premium slots", statuses.count("free") == 2 and len([x for x in statuses if x != "free"]) == 2, statuses)
    check("codex explains the trial or the lock", bool(pg.inner_text("#deckNote").strip()), pg.inner_text("#deckNote")[:60])
    pg.click("#btnDeckClose")
    pg.wait_for_timeout(200)
    pg.click("#btnResume")
    pg.wait_for_timeout(200)

    # --- v1.3 premium trial: one free hit, then locked ---
    pg.evaluate("SB.debug.vipSet(false)")
    pg.evaluate("SB.debug.trialReset()")
    pg.wait_for_timeout(120)
    check("trial marks premium slots as try-able", not pg.evaluate("SB.debug.deck()")[2]["status"] == "locked",
          pg.evaluate("SB.debug.deck()"))
    pg.evaluate("SB.debug.cast('paladin')")
    pg.wait_for_timeout(400)
    deck = pg.evaluate("SB.debug.deck()")
    check("trial ends after the first premium draw and locks the slot",
          deck[2]["status"] == "locked" and deck[3]["status"] == "locked", deck)
    check("trial state is remembered across sessions",
          pg.evaluate("localStorage.getItem('moa.ss.trial')") == "1")

    # --- v1.3 defeat lifeline: lightning drop revive ---
    pg.evaluate("SB.debug.die()")
    pg.wait_for_timeout(700)
    check("defeat offers the lightning lifeline", pg.is_visible("#btnRevive"), pg.is_visible("#reviveBox"))
    wave_before = pg.evaluate("SB.debug.state()")["wave"]
    pg.click("#btnRevive")
    pg.wait_for_timeout(1200)
    st = pg.evaluate("SB.debug.state()")
    check("revive restores the wall and resumes the run",
          st["state"] == "playing" and st["hp"] > 0 and st["revived"] is True, (st["state"], st["hp"], st["revived"]))
    check("revive keeps the player on the same wave", st["wave"] == wave_before, (wave_before, st["wave"]))

    # --- v1.3 balance: the wave-5 boss bites ---
    sim = pg.evaluate("SB.debug.sim({strategy:'dumb', seed:7, maxWave:6})")
    w5 = next((x for x in sim["waves"] if x["wave"] == 5), None)
    check("no-strategy run bleeds wall HP at the wave-5 boss", bool(w5) and w5["dmgTaken"] > 20, w5 and w5["dmgTaken"])
    check("wave-5 gold stays tight (30-55% below v1.2's ~2,600G)",
          bool(w5) and 900 <= w5["gold"] <= 2000, w5 and w5["gold"])

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
    check("mobile: live missions are on screen",
          pg.is_visible("#missionBar") and pg.evaluate("document.querySelectorAll('#missionBar .mb-item').length") == 2,
          pg.evaluate("document.getElementById('missionBar').innerText"))

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
