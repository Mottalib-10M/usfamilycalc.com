#!/usr/bin/env python3
"""South Carolina: Schedule of Basic Support Obligations, S.C. Code Regs. 114-4710 to 114-4750
(implementation date January 1, 2024), as printed in SC DSS Booklet 2819 (NOV 24), '2024 Edition'.
dss.sc.gov does not answer scripted clients from outside the US, so the official PDF is fetched through
its Wayback Machine copy (id_ = raw file, captured 2026-05-10)."""
import sys
from cs_shading import shaded_cells
from cs_schedules_lib import download, pdf_text, parse_rows, check, write, sample

URL = "https://dss.sc.gov/media/lmdj4cnh/dss-booklet-2819-nov-24.pdf"
WB = "https://web.archive.org/web/2026id_/" + URL
p = download(WB, "sc-dss-booklet-2819-nov-24.pdf", refresh="--no-refresh" not in sys.argv)
t = pdf_text(p)
t = t[t.find("Schedule of Basic Support Obligations"):t.find("Worksheet A", t.find("40000"))]
# The PDF text layer renders the income label of row 31,350 as "+*1350" (glyph defect); the printed page reads 31350.
t = t.replace("\n+*1350 ", "\n31350 ")
rows = parse_rows(t, 6)
print("rows", len(rows), rows[0], rows[-1])
print("checks", check(rows, step=50, start=750))
for r in sample(rows):
    print(r)
# The booklet's text layer keeps no shading; DSS's own schedule PDF (identical rows) keeps it as a light blue
# fill (0.706/0.776/0.906). Shaded cells = where the self-support reserve applies (Regs. 114-4720(A)(11)).
URL2 = "https://dss.sc.gov/media/mtwi1a5m/proposed-schedule-of-basic-support-obligations-2022-sc-guidelines-002.pdf"
p2 = download("https://web.archive.org/web/2026id_/" + URL2, "sc-dss-schedule-2022-proposed.pdf", refresh="--no-refresh" not in sys.argv)
shade = shaded_cells(p2, (0.706, 0.776, 0.906), 100, 6)
ssr_max = [max(shade[c]) for c in range(1, 7)]
print("shaded SSR area, highest combined income per column:", ssr_max)
write("south-carolina", {
    "ssrShadedMaxIncome": ssr_max,
    "ssrShadedNote": "Highest schedule income inside the shaded (self-support reserve) area, for 1..6 children, read from the cell fill colour of DSS's schedule PDF " + URL2 + " (same rows as the booklet).",
    "slug": "south-carolina", "state": "South Carolina",
    "title": "South Carolina Schedule of Basic Support Obligations (S.C. Code Regs. 114-4750, 2024 guidelines)",
    "period": "monthly",
    "columns": ["combinedMonthlyGrossIncome", "1", "2", "3", "4", "5", "6"],
    "note": "Row 31350: income label repaired (text layer shows '+*1350'). Shading in the printed schedule marks where the self-support reserve applies; it is not recoverable "
            "from the PDF text layer. 114-4720(A)(10): between rows the court is encouraged to extrapolate upwardly.",
    "effective": "2024-01-01", "url": URL, "fetchedVia": WB, "verified": "2026-10-08",
    "script": "research/scripts/cs_parse_south_carolina.py",
}, rows)
