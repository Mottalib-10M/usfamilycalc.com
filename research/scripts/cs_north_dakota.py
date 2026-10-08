#!/usr/bin/env python3
"""Re-download N.D. Admin. Code chapter 75-02-04.1 (ndlegis.gov PDF) and parse the child support
schedule of section 75-02-04.1-10 (obligor's monthly net income, 1..6+ children) into
research/cs-schedules/north-dakota.json.
Usage: python3 research/scripts/cs_north_dakota.py"""
import json, os, re, subprocess, sys, random

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from cs_fetch_text import text_of

URL = "https://www.ndlegis.gov/information/acdata/pdf/75-02-04.1.pdf"
RAW = os.path.join(RES, "raw", "nd-75-02-04.1.pdf")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
t = text_of(RAW)
a = t.find("75-02-04.1-10. Child support amount.")
b = t.find("History:", a)
body = t[a:b]
assert "January  1, 2019." in t[b:b + 200] or "January 1, 2019." in t[b:b + 200], "unexpected history"
rows = []
for line in body.splitlines():
    line = line.strip()
    m = re.fullmatch(r"(800 or less|25000 or more|\d+) (\d+) (\d+) (\d+) (\d+) (\d+) (\d+)", line)
    if m:
        inc = {"800 or less": 800, "25000 or more": 25000}.get(m[1], None)
        inc = inc if inc is not None else int(m[1])
        rows.append([inc] + [int(m[i]) for i in range(2, 8)])
inc = [r[0] for r in rows]
assert inc[0] == 800 and inc[-1] == 25000 and len(rows) == 243, (len(rows), inc[:3], inc[-3:])
assert all(y - x == 100 for x, y in zip(inc, inc[1:]))
out = {
    "slug": "north-dakota",
    "source": URL,
    "edition": "N.D. Admin. Code 75-02-04.1-10, amended effective January 1, 2019",
    "period": "monthly",
    "columns": ["obligorNetMonthlyIncome", "1", "2", "3", "4", "5", "6+"],
    "note": "First row reads '800 or less' (support 0) and last row '25000 or more'. Obligor net income is rounded to the nearest $100 before lookup (75-02-04.1-02(5)).",
    "rows": rows,
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "north-dakota.json"), "w"), indent=0)
print(len(rows), rows[0], rows[-1])
random.seed(2)
for r in random.sample(rows, 8):
    print(r)
