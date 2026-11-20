#!/usr/bin/env python3
"""
MOA Spin Siege — balance play simulation.

Runs the real engine headlessly (fixed 1/60 s steps, seeded RNG, no rendering)
in Chromium and prints a per-wave table for two player profiles:

  dumb  — spin whenever charged, never hold, never reroll (no strategy)
  smart — hold a matching pair, reroll a miss, draft the best relic

Usage:
    python3 test/balance.py                    # 3 seeds per profile, waves 1-8
    python3 test/balance.py --waves 6 --seeds 1
"""
import json
import os
import sys

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
URL = "file://" + os.path.join(ROOT, "index.html")

WAVES = 8
SEEDS = [7, 21, 42]
for i, a in enumerate(sys.argv):
    if a == "--waves":
        WAVES = int(sys.argv[i + 1])
    if a == "--seeds":
        SEEDS = [int(x) for x in sys.argv[i + 1].split(",")]


def main():
    runs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1440, "height": 900})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL)
        pg.wait_for_timeout(700)
        bal = pg.evaluate("SB.debug.balance()")
        print("BALANCE", json.dumps(bal, ensure_ascii=False))
        for mode in ("dumb", "smart"):
            for seed in SEEDS:
                r = pg.evaluate(
                    "([m, s, w]) => SB.debug.sim({strategy: m, seed: s, maxWave: w})",
                    [mode, seed, WAVES],
                )
                runs.append(r)
        b.close()

    print("\n=== per-wave (gold at wave clear / wall HP) ===")
    header = "%-6s %-6s" % ("mode", "seed")
    waves = range(1, WAVES + 1)
    for w in waves:
        header += " | w%-2d gold/hp" % w
    print(header)
    for r in runs:
        line = "%-6s %-6d" % (r["strategy"], r["seed"])
        by_wave = {x["wave"]: x for x in r["waves"]}
        for w in waves:
            x = by_wave.get(w)
            line += " | %5s/%3s" % (x["gold"], x["hp"]) if x else " |     -/-  "
        print(line)

    print("\n=== summary ===")
    for r in runs:
        g5 = next((x["gold"] for x in r["waves"] if x["wave"] == 5), None)
        print(
            "%-6s seed %-3d reached w%-2d hp %3d/%-3d gold %5d gold+ %5d spins %3d rerolls %2d gameover %s"
            % (
                r["strategy"], r["seed"], r["reachedWave"], r["hp"], r["maxHp"],
                r["gold"], r["goldEarned"], r["spins"], r["rerolls"], r["gameover"],
            )
        )
        print("        wave5 gold: %s | wave5 hp: %s" % (
            g5, next((x["hp"] for x in r["waves"] if x["wave"] == 5), None)))
    if errs:
        print("PAGE ERRORS:", errs[:3])
    with open(os.path.join(HERE, "balance-last.json"), "w") as f:
        json.dump({"balance": bal, "runs": runs}, f, ensure_ascii=False, indent=2)


main()
