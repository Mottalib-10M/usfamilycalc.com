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
# Emboldened cells (self-support reserve area): the official HTML gives them a span class whose CSS rule
# has font-weight: bold (other than the section number classes SENU / CL).
import html as _html
H = open(RAW, encoding="utf-8", errors="ignore").read()
bold_classes = [c for c in re.findall(r"span\.(\w[\w-]*)\s*\{[^}]*font-weight: bold", H) if not c.endswith(("SENU", "CL"))]
emboldened_to = [None] * 6
for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", H, re.S):
    cells = re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)
    if len(cells) != 7:
        continue
    m = re.fullmatch(r"([\d,]+)-([\d,]+)", _html.unescape(re.sub("<[^>]+>", "", cells[0])).strip())
    if not m:
        continue
    for k, c in enumerate(cells[1:]):
        if any(bc in c for bc in bold_classes):
            emboldened_to[k] = int(m[2].replace(",", ""))
assert emboldened_to == [1200, 1350, 1550, 1700, 1850, 2000], emboldened_to
out = {
    "slug": "south-dakota",
    "source": URL,
    "edition": "SDCL 25-7-6.2 as amended by SL 2022, ch 80, s. 1",
    "period": "monthly",
    "columns": ["combinedNetMonthlyIncomeFrom", "combinedNetMonthlyIncomeTo", "1", "2", "3", "4", "5", "6"],
    "note": "Each row is an income bracket (inclusive bounds). emboldenedTo[n-1] = upper bound of the last bracket whose cell for n children is emboldened in the official HTML (a span class with font-weight: bold), i.e. the area that includes the $871 self-support reserve (SDCL 25-7-6.2).",
    "emboldenedTo": emboldened_to,
    "rows": rows,
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "south-dakota.json"), "w"), indent=0)
print(len(rows), "rows", rows[0], rows[-1])
import random
random.seed(1)
for r in random.sample(rows, 8):
    print(r)
