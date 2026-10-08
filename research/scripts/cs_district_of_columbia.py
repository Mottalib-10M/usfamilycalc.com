#!/usr/bin/env python3
"""Re-download D.C. Code § 16-916.01a (Appendix I, Schedule of Basic Child Support Obligations,
code.dccouncil.gov) and parse it into research/cs-schedules/district-of-columbia.json.
Usage: python3 research/scripts/cs_district_of_columbia.py"""
import json, os, re, subprocess, sys, random

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from cs_fetch_text import text_of

URL = "https://code.dccouncil.gov/us/dc/council/code/sections/16-916.01a"
RAW = os.path.join(RES, "raw", "dc-16-916.01a.html")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
t = text_of(RAW)
a = t.find("Four or More Children")
b = t.find("[The above appendices supplement")
assert a > 0 and b > a
nums = [int(x.replace(",", "")) for x in re.findall(r"\d{1,3}(?:,\d{3})+|\d+", t[a + len("Four or More Children"):b])]
assert len(nums) % 5 == 0, len(nums)
rows = [nums[i:i + 5] for i in range(0, len(nums), 5)]
inc = [r[0] for r in rows]
assert inc[0] == 12382 and inc[1] == 12600 and inc[-1] == 240000
assert all(y - x == 600 for x, y in zip(inc[1:], inc[2:]))
anomalies = [r for r in rows if not (r[1] < r[2] < r[3] < r[4])]
# Known anomaly in the official text, kept as published: 132,000 -> 3 children 20,473
# (neighbours 131,400 -> 30,357 and 132,600 -> 30,590; looks like a typo for 30,473).
assert anomalies == [[132000, 20297, 27282, 20473, 34281]], anomalies
out = {
    "slug": "district-of-columbia",
    "source": URL,
    "edition": "D.C. Code § 16-916.01a, Appendix I, Schedule of Basic Child Support Obligations (as published by the D.C. Council, read 2026-10-08)",
    "period": "annual",
    "columns": ["combinedAdjustedGrossAnnualIncome", "1", "2", "3", "4+"],
    "note": "First row 12,382 (the 2007 self-support reserve), then every $600 from 12,600 to 240,000. Between two rows the obligation is rounded up to the next higher amount (16-916.01(f)(1)(B)).",
    "anomalies": [{"row": 132000, "column": "3", "published": 20473, "note": "Published as 20,473 in the official code text; neighbouring rows are 30,357 (131,400) and 30,590 (132,600), so it is probably a typo for 30,473. Kept as published."}],
    "rows": rows,
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "district-of-columbia.json"), "w"), indent=0)
print(len(rows), rows[0], rows[-1])
random.seed(4)
for r in random.sample(rows, 8):
    print(r)
