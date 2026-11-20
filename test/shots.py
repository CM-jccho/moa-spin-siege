#!/usr/bin/env python3
"""Capture the delivery screenshots: guide, battle, jackpot, campaign map, mobile."""
import os
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
URL = "file://" + os.path.join(ROOT, "index.html")
OUT = os.path.abspath(os.path.join(ROOT, "..", "browser"))
os.makedirs(OUT, exist_ok=True)


def stage(pg, wave=6):
    pg.evaluate("SB.debug.spawnWave(%d)" % wave)
    pg.wait_for_timeout(2600)          # let the zone banner finish
    pg.evaluate("SB.debug.shotScene(); SB.debug.setGold(180)")
    pg.wait_for_timeout(900)


with sync_playwright() as p:
    # ---------- desktop ----------
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    pg = ctx.new_page()
    errs = []
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL)
    pg.wait_for_timeout(800)
    pg.click("#btnPlay")
    pg.wait_for_timeout(2200)
    pg.screenshot(path=os.path.join(OUT, "moa-spin-siege-v2-guide.png"))
    guide = pg.evaluate("!document.getElementById('coachCard').hidden")

    stage(pg, 6)
    pg.evaluate("SB.debug.juice(false)")
    pg.wait_for_timeout(220)
    pg.evaluate("SB.debug.freeze()")
    pg.wait_for_timeout(120)
    pg.screenshot(path=os.path.join(OUT, "moa-spin-siege-v2-desktop.png"))
    pg.evaluate("SB.debug.unfreeze()")

    pg.wait_for_timeout(400)
    pg.evaluate("SB.debug.juice(true)")
    pg.wait_for_timeout(300)
    pg.evaluate("SB.debug.freeze()")
    pg.wait_for_timeout(120)
    pg.screenshot(path=os.path.join(OUT, "moa-spin-siege-v2-jackpot.png"))
    pg.evaluate("SB.debug.unfreeze()")

    # campaign map in the pause panel
    pg.click("#btnPause")
    pg.wait_for_timeout(400)
    pg.screenshot(path=os.path.join(OUT, "moa-spin-siege-v2-campaign.png"))
    pg.click("#btnResume")

    st = pg.evaluate("SB.debug.state()")
    b.close()

    # ---------- mobile ----------
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2,
                        is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL)
    pg.wait_for_timeout(800)
    pg.tap("#btnPlay")
    pg.wait_for_timeout(2300)
    pg.screenshot(path=os.path.join(OUT, "moa-spin-siege-v2-mobile-guide.png"))
    stage(pg, 6)
    pg.evaluate("SB.debug.juice(false)")
    pg.wait_for_timeout(220)
    pg.evaluate("SB.debug.freeze()")
    pg.wait_for_timeout(120)
    pg.screenshot(path=os.path.join(OUT, "moa-spin-siege-v2-mobile.png"))
    b.close()

print("guide_visible", guide)
print("state", st["state"], "wave", st["wave"], "zone", st["zone"], "kills", st["stats"]["kills"])
print("errors", [e for e in errs if "favicon" not in e.lower()][:5])
print("shots in", OUT)
