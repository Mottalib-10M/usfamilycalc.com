#!/usr/bin/env python3
"""Re-download the Vermont Table of Intact Family Expenditures on Children (Agency of Human
Services, Office of Child Support, revision R 1/2/2024) and parse it into
research/cs-schedules/vermont.json.
The official server (outside.vermont.gov) answers 403 to scripts, so the Wayback Machine copy
of the same official URL is used (snapshot 2025-10-31).
Usage: python3 research/scripts/cs_vermont.py"""
import json, os, re, subprocess, sys, random

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from cs_fetch_text import text_of

OFFICIAL = "https://outside.vermont.gov/dept/DCF/Shared%20Documents/OCS/Calculator/Intact.pdf"
URL = "https://web.archive.org/web/20251031191954id_/" + OFFICIAL
RAW = os.path.join(RES, "raw", "vt-Intact.pdf")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
t = text_of(RAW)
assert t.count("(R 1/2/2024)") == 15, "unexpected revision label"
rows = []
for m in re.finditer(r"^([\d.]+) - ([\d.]+) (\d+) (\d+) (\d+) (\d+) (\d+) (\d+)\s*$", t, flags=re.M):
    rows.append([float(m[1]), float(m[2])] + [int(m[i]) for i in range(3, 9)])
lo = [r[0] for r in rows]
assert lo[0] == 625.0 and rows[-1][1] == 30024.99, (rows[0], rows[-1])
for x, y in zip(rows, rows[1:]):
    assert round(y[0] - x[0], 2) == 50 and round(y[0] - x[1], 2) == 0.01, (x, y)
rows = [[int(r[0]) if r[0] == int(r[0]) else r[0], r[1]] + r[2:] for r in rows]
out = {
    "slug": "vermont",
    "source": OFFICIAL,
    "retrievedVia": URL,
    "edition": "Vermont Table of Intact Family Expenditures on Children, Agency of Human Services, Office of Child Support (R 1/2/2024)",
    "period": "monthly",
    "columns": ["combinedAvailableIncomeFrom", "combinedAvailableIncomeTo", "1", "2", "3", "4", "5", "6"],
    "rows": rows,
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "vermont.json"), "w"), indent=0)
print(len(rows), rows[0], rows[-1])
random.seed(3)
for r in random.sample(rows, 8):
    print(r)
