#!/usr/bin/env python3
"""Download O.C.G.A. § 19-6-15 as in force January 1, 2026 (PDF published by the Georgia
Child Support Commission at csc.georgiacourts.gov) and parse:
  - subsection (o) Basic Child Support Obligation Table (combined monthly adjusted gross income)
  - subsection (p) Low-income Adjustment Table (parent's individual monthly adjusted gross income)
csc.georgiacourts.gov answers HTTP 403 to non-US / automated clients, so this script uses the
Internet Archive copy of the official PDF (snapshot 2026-02-03).
Output: research/cs-schedules/georgia.json"""
import re, json, os, subprocess
from pypdf import PdfReader
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFFICIAL = "https://csc.georgiacourts.gov/wp-content/uploads/2026/01/O.C.G.A.-_-19-6-15_01.01.2026.pdf"
URL = "https://web.archive.org/web/20260203152629id_/" + OFFICIAL
RAW = os.path.join(BASE, "raw", "ga-ocga-19-6-15-2026-01-01.pdf")
subprocess.run(["curl", "-sL", "-o", RAW, URL], check=True)
text = "\n".join(p.extract_text() for p in PdfReader(RAW).pages)
i_o = text.index("(o) Basic Child Support Obligation Table")
i_p = text.index("(p) Low-income Adjustment Table")
i_q = text.index("(q) ", i_p)
num = lambda s: float(s.replace("$", "").replace(",", ""))
ROW = re.compile(r"^\s*\$?([\d,]+\.\d\d)((?:\s+\$?[\d,]+\.\d\d){6})\s*$")
def parse(chunk):
    rows = []
    for line in chunk.splitlines():
        m = ROW.match(line)
        if m:
            vals = [num(m.group(1))] + [num(x) for x in m.group(2).split()]
            rows.append([int(v) if v == int(v) else v for v in vals])
    return rows
bcso = parse(text[i_o:i_p])
# Low-income table is a staircase: for higher incomes the left-most columns (fewer children)
# end, because the table no longer applies; missing cells are stored as null (right-aligned).
ROW_LI = re.compile(r"^\s*\$?([\d,]+\.\d\d)((?:\s+\$?[\d,]+\.\d\d){1,6})\s*$")
lowinc = []
for line in text[i_p:i_q].splitlines():
    m = ROW_LI.match(line)
    if m:
        vals = [int(num(x)) for x in m.group(2).split()]
        lowinc.append([int(num(m.group(1)))] + [None] * (6 - len(vals)) + vals)
for rows in (bcso, lowinc):
    for a, b in zip(rows, rows[1:]):
        assert b[0] - a[0] == 50, (a, b)
assert bcso[0][0] == 800 and bcso[-1][0] == 40000, (bcso[0], bcso[-1])
head = re.sub(r"\s+", " ", text[i_p:i_p + 900])
pct = [int(x) for x in re.findall(r"(\d+)% of income", head)]
assert len(pct) == 6, head
out = {
    "slug": "georgia", "source": OFFICIAL, "retrievedVia": URL, "retrieved": "2026-10-08",
    "document": "O.C.G.A. § 19-6-15, version effective January 1, 2026 (current through the 2025 Regular Session), as published by the Georgia Child Support Commission",
    "period": "monthly", "incomeBasis": "combined monthly adjusted gross income",
    "columns": ["combinedIncome", "c1", "c2", "c3", "c4", "c5", "c6"],
    "rows": bcso,
    "lowIncomeAdjustmentTable": {
        "subsection": "O.C.G.A. § 19-6-15(p)",
        "incomeBasis": "parent's individual monthly adjusted gross income",
        "atOrBelow1500PctOfIncome": pct,
        "columns": ["parentIncome", "c1", "c2", "c3", "c4", "c5", "c6"],
        "note": "Rows are right-aligned: null means the low-income table does not extend to that income for that number of children (the column has ended).",
        "rows": lowinc,
    },
}
json.dump(out, open(os.path.join(BASE, "cs-schedules", "georgia.json"), "w"), separators=(",", ":"))
print(len(bcso), bcso[0], bcso[-1]); print(len(lowinc), lowinc[0], lowinc[-1], pct)
