#!/usr/bin/env python3
"""Download N.J. Court Rules Appendix IX-F (Schedule of Child Support Awards, revised
effective 2025-09-01) and parse it (combined net WEEKLY income).
njcourts.gov blocks non-browser/foreign clients (HTTP 403, Cloudflare), so this script
uses the Internet Archive copy of the official njcourts.gov PDF (snapshot 2026-03-12).
Output: research/cs-schedules/new-jersey.json"""
import re, json, os, subprocess
from pypdf import PdfReader
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFFICIAL = "https://www.njcourts.gov/sites/default/files/attorneys/rules-of-court/app9f.pdf"
URL = "https://web.archive.org/web/20260312060311id_/" + OFFICIAL
RAW = os.path.join(BASE, "raw", "nj-app9f.pdf")
subprocess.run(["curl", "-sL", "-o", RAW, URL], check=True)
text = "\n".join(p.extract_text() for p in PdfReader(RAW).pages)
assert "Revised to Be Effective September 1, 2025" in text
num = lambda s: int(s.replace("$", "").replace(",", ""))
rows = []
for line in text.splitlines():
    line = re.sub(r"\s+", " ", line.strip())
    if re.fullmatch(r"(\$[\d,]+ ){6}\$[\d,]+", line):
        rows.append([num(x) for x in line.split()])
rows.sort()
for a, b in zip(rows, rows[1:]):
    assert b[0] - a[0] == 10, (a, b)
assert rows[0][0] == 180 and rows[-1][0] == 3600, (rows[0], rows[-1])
out = {
    "slug": "new-jersey", "source": OFFICIAL, "retrievedVia": URL, "retrieved": "2026-10-08",
    "document": "N.J. Court Rules, Appendix IX-F, Schedule of Child Support Awards, revised effective September 1, 2025 (adopted July 31, 2025)",
    "period": "weekly", "incomeBasis": "combined net weekly income",
    "columns": ["combinedIncome", "c1", "c2", "c3", "c4", "c5", "c6"],
    "belowMin": "Below $180 combined net weekly income: award based on obligor's net income, living expenses and child's needs, between $5.00 per week and the $180 schedule amount.",
    "aboveMax": "Above $3,600: the $3,600 award is the minimum basic award; add a discretionary amount under N.J.S.A. 2A:34-23. Do not extrapolate.",
    "rows": rows,
}
json.dump(out, open(os.path.join(BASE, "cs-schedules", "new-jersey.json"), "w"), separators=(",", ":"))
print(len(rows), rows[0], rows[-1])
