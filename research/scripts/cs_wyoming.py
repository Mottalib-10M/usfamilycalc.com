#!/usr/bin/env python3
"""Re-download Wyoming Statutes Title 20 (wyoleg.gov compiled PDF) and parse the presumptive
child support tables of W.S. 20-2-304(a)(i)-(v) (base support + marginal percentage bands)
into research/cs-schedules/wyoming.json.
Usage: python3 research/scripts/cs_wyoming.py"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from cs_fetch_text import text_of

URL = "https://wyoleg.gov/statutes/compress/title20.pdf"
RAW = os.path.join(RES, "raw", "wy-title20.pdf")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
t = re.sub(r"\s+", " ", text_of(RAW))
a = t.find("20-2-304. Presumptive child support.")
b = t.find("(b) Repealed by Laws 2018, ch. 42", a)
assert a > 0 and b > a
body = t[a:b]
parts = re.split(r"\((?:i|ii|iii|iv|v)\) (?:One|Two|Three|Four|Five)[^:]*:", body)[1:]
assert len(parts) == 5
bands = {}
for n, p in enumerate(parts, 1):
    rows = []
    for m in re.finditer(r"\$([\d,]+\.\d\d) (\d+\.\d) \$([\d,]+\.\d\d) \+ (\d+\.\d)% (?:of anything )?over", p):
        rows.append({
            "from": float(m[1].replace(",", "")),
            "pctOfIncomeAtFrom": float(m[2]),
            "base": float(m[3].replace(",", "")),
            "marginalPct": float(m[4]),
        })
    assert [r["from"] for r in rows] == [1000, 2000, 3200, 4000, 4500, 8000, 15000], rows
    bands[str(n)] = rows
out = {
    "slug": "wyoming",
    "source": URL,
    "edition": "Wyoming Statutes Title 20 compiled PDF (file dated 2026-05-08), W.S. 20-2-304(a)",
    "period": "monthly",
    "model": "bands-combined",
    "columns": "for each number of children (5 = five or more): band start (combined net monthly income), percentage of income allocated at the band start, base support, marginal percentage applied to income over the band start",
    "rule": "total obligation = base + marginalPct% x (combined net monthly income - from), using the highest band whose 'from' does not exceed the income; the last band (from 15,000) applies to anything over $15,000",
    "belowFirstBand": "The statute's first line starts at $1,000.00 with base $230.00 (1 child) = 23.0% of $1,000; it gives no line below $1,000.",
    "bands": bands,
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "wyoming.json"), "w"), indent=1)
for n, rows in bands.items():
    print(n, [(r["from"], r["base"], r["marginalPct"]) for r in rows])
