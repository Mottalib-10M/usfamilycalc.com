#!/usr/bin/env python3
"""Re-download SDCL 25-7-6.2 (South Dakota Legislature, codified law API) and parse the
support obligation schedule into research/cs-schedules/south-dakota.json.
Usage: python3 research/scripts/cs_south_dakota.py"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from cs_fetch_text import text_of

URL = "https://sdlegislature.gov/api/Statutes/25-7-6.2.html"
RAW = os.path.join(RES, "raw", "sd-25-7-6.2.html")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
t = text_of(RAW)
assert "SL 2022, ch 80" in t, "unexpected amendment history"
a = t.find("Six Children")
b = t.find("The share of the custodial parent")
body = t[a:b]
rows = []
for m in re.finditer(r"([\d,]+)-([\d,]+) (\d+) (\d+) (\d+) (\d+) (\d+) (\d+)", body):
    lo, hi = int(m[1].replace(",", "")), int(m[2].replace(",", ""))
    rows.append([lo, hi] + [int(m[i]) for i in range(3, 9)])
assert rows[0][:2] == [0, 950] and rows[-1][1] == 30000
for x, y in zip(rows, rows[1:]):
    assert y[0] == x[1] + 1 and y[1] - x[1] == 50, (x, y)
out = {
    "slug": "south-dakota",
    "source": URL,
    "edition": "SDCL 25-7-6.2 as amended by SL 2022, ch 80, s. 1",
    "period": "monthly",
    "columns": ["combinedNetMonthlyIncomeFrom", "combinedNetMonthlyIncomeTo", "1", "2", "3", "4", "5", "6"],
    "note": "Each row is an income bracket (inclusive bounds). Emboldened (self-support reserve) areas of the official table are not marked in the HTML text.",
    "rows": rows,
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "south-dakota.json"), "w"), indent=0)
print(len(rows), "rows", rows[0], rows[-1])
import random
random.seed(1)
for r in random.sample(rows, 8):
    print(r)
