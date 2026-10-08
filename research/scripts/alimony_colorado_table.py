#!/usr/bin/env python3
"""Re-download the Colorado Judicial Branch (18th JD / Arapahoe County) Spousal/Partner Maintenance
Advisement form and parse the C.R.S. 14-10-114(3)(b)(II) duration table (months of marriage 36..240 ->
percentage of months married -> suggested term in months). Prints the table as JSON and checks a few rows.

Usage: python3 alimony_colorado_table.py [--no-download]
"""
import json, os, re, subprocess, sys

URL = "https://www.coloradojudicial.gov/sites/default/files/2026-06/Spousal%20Maintenance%20Advisement.pdf"
RAW = os.path.join(os.path.dirname(__file__), "..", "raw", "co-spousal-maintenance-advisement.pdf")

if "--no-download" not in sys.argv:
    subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", URL, "-o", RAW], check=True)

from pypdf import PdfReader
text = "\n".join(p.extract_text() or "" for p in PdfReader(RAW).pages)
rows = []
for m in re.finditer(r"^\s*(\d{2,3})\s+(\d{2}\.\d{2})%\s+(\d{1,3})\s*$", text, re.M):
    months, pct, term = int(m.group(1)), float(m.group(2)), int(m.group(3))
    if 36 <= months <= 240:
        rows.append([months, pct, term])
rows.sort()
assert [r[0] for r in rows] == list(range(36, 241)), "missing rows"
# spot checks against the printed form
checks = {36: [31.00, 11], 78: [38.00, 30], 150: [50.00, 75], 240: [50.00, 120]}
for k, v in checks.items():
    r = next(r for r in rows if r[0] == k)
    assert r[1:] == v, (k, r)
print(json.dumps(rows))
