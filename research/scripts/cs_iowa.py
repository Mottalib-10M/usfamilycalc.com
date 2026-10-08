#!/usr/bin/env python3
"""Re-download the Iowa Supreme Court order attachment amending Iowa Court Rules chapter 9 (order of
September 29, 2025, effective January 1, 2026; iowacourts.gov) and parse the replacement Rule 9.26
Schedule of Basic Support Obligations into research/cs-schedules/iowa.json.
The consolidated chapter 9 published by the Legislature (legis.iowa.gov, July 2026) prints the schedule
as scanned images (compared by eye).
Usage: python3 research/scripts/cs_iowa.py"""
import json, os, re, shutil, subprocess, tempfile
from pypdf import PdfReader

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
URL = "https://www.iowacourts.gov/collections/953/files/2105/embedDocument"
URL_LEGIS = "https://www.legis.iowa.gov/docs/ACO/CourtRulesChapter/9.pdf"
RAW = os.path.join(RES, "raw", "ia-953-2105.pdf")
RAW_LEGIS = os.path.join(RES, "raw", "ia-ch9-legis.pdf")
subprocess.run(["curl", "-sL", "-m", "120", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
r = PdfReader(RAW)
start = next(i for i, p in enumerate(r.pages) if "Rule 9.26 Child Support Guidelines Schedule" in (p.extract_text() or ""))
rows = []
for p in r.pages[start:]:
    t = p.extract_text() or ""
    for m in re.finditer(r"^\s*(\d+)\s+-?\s*(\d+) (\d+) (\d+) (\d+) (\d+) (\d+)\s*$", t, re.M):
        rows.append([int(x) for x in m.groups()])
    if rows and rows[-1][1] == 30000:
        break
assert rows[0][:2] == [0, 100] and rows[-1][1] == 30000
gaps = []
for a, b in zip(rows, rows[1:]):
    if b[0] != a[1] + 1:
        gaps.append([a[1] + 1, b[0] - 1])
    assert all(x <= y for x, y in zip(a[2:], b[2:])), (a, b)
for x in rows:
    assert all(p <= q for p, q in zip(x[2:], x[3:])), x
# The published schedule has no row for 8801 - 8850 (same gap in the order attachment and in the
# Legislature's consolidated July 2026 scan); keep it as published and flag it.
assert gaps == [[8801, 8850]], gaps
assert len(rows) == 8 + (30000 - 800) // 50 - 1, len(rows)

out = {
    "slug": "iowa",
    "source": URL,
    "edition": "Iowa Ct. R. 9.26, Iowa Schedule of Basic Support Obligations, as replaced by Iowa Supreme Court order of September 29, 2025, effective January 1, 2026",
    "period": "monthly",
    "incomeBasis": "combined (or, in the low-income Area A/B, the noncustodial parent's individual) adjusted net monthly income",
    "columns": ["incomeFrom", "incomeTo", "1", "2", "3", "4", "5+"],
    "rows": rows,
    "areas": {
        "A": {"to": 1250, "text": "Only the noncustodial parent's income is used ($0 to $1250), except joint physical care"},
        "B": {"from": 1251, "toByChildren": [1800, 2200, 2550, 2550, 2650],
              "text": "Lower of (1) noncustodial parent's income alone and (2) parents' combined incomes"},
        "C": {"text": "Nonshaded area: parents' combined incomes"},
    },
    "gaps": {"missingRows": gaps, "text": "No row 8801 - 8850 is printed in the official schedule (order attachment and legis.iowa.gov July 2026 consolidated chapter 9)."},
    "aboveMax": {"over": 30000, "method": "discretion",
                 "text": "Above $30,000 combined net monthly income: court or agency discretion, not less than the amount at $30,000 (Rule 9.26 note 3)"},
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "iowa.json"), "w"), indent=0)
print(len(rows), "rows", rows[0], rows[-1])

# The Legislature's consolidated chapter 9 (legis.iowa.gov, July 2026) prints the same schedule as scanned
# images (pages 16-29 of that PDF); rows were compared by eye, see research/cs/iowa.json uncertain[].
