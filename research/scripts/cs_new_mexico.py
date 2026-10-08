#!/usr/bin/env python3
"""Re-download the New Mexico Register, Vol. XXXIV, Issue 24 (Dec. 19, 2023, State Records Center and
Archives) and parse 8.50.108 NMAC Appendix 1 'Basic Child Support Schedule' (effective 1/1/2024) into
research/cs-schedules/new-mexico.json.  Rows are income BANDS (from - to); 'rows' uses the upper bound.
Usage: python3 research/scripts/cs_new_mexico.py"""
import json, os, re, subprocess
from pypdf import PdfReader
HERE = os.path.dirname(os.path.abspath(__file__)); RES = os.path.dirname(HERE)
URL = "https://www.srca.nm.gov/nmac/nmregister/pdf/xxxiv24.pdf"
PDF = os.path.join(RES, "raw", "nm-register-xxxiv24.pdf")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", PDF, URL], check=True)
pages = [p.extract_text() or "" for p in PdfReader(PDF).pages]
start = next(i for i, t in enumerate(pages) if "APPENDIX 1" in t and "Basic Child Support Schedule" in t)
text = "\n".join(pages[start:start + 20])
text = text[text.find("APPENDIX 1"):text.find("Income over $40,000")]
num = r"(\d{1,3}(?:,\d{3})*)"
pat = re.compile(rf"^{num}\s*-?\s+{num}\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*$", re.M)
bands = [[int(g.replace(",", "")) for g in m.groups()] for m in pat.finditer(text)]
assert bands[0][:2] == [0, 1450] and bands[-1][:2] == [39951, 40000], (bands[0], bands[-1])
for a, b in zip(bands, bands[1:]):
    assert b[0] == a[1] + 1 and b[1] - a[1] == 50, (a, b)
rows = [[b[1]] + b[2:] for b in bands]
out = {"slug": "new-mexico", "source": URL,
       "edition": "8.50.108 NMAC Appendix 1, Basic Child Support Schedule, New Mexico Register Vol. XXXIV Issue 24 (Dec. 19, 2023), effective January 1, 2024",
       "period": "monthly",
       "columns": ["combinedAdjustedGrossMonthlyIncomeUpTo", "1", "2", "3", "4", "5", "6"],
       "bandNote": "Each row is an income band: from (previous row's upper bound + 1) to the listed upper bound; first band is 0 - 1,450. Worksheet A/B instructions: round combined income to the nearest $50 and read the matching row.",
       "rowsFromTo": [b[:2] for b in bands],
       "rows": rows,
       "aboveMax": {"over": 40000, "base": [2956, 4341, 5058, 5650, 6214, 6755], "pctOfExcess": [5.4, 7.7, 8.7, 9.7, 10.7, 11.6]},
       "moreThanSix": "When there are more than six children and the payer's income is within the SSR (shaded area), add $15 per extra child."}
json.dump(out, open(os.path.join(RES, "cs-schedules", "new-mexico.json"), "w"), indent=0)
print(len(rows), "rows", bands[0], bands[-1])
