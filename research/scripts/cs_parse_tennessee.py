#!/usr/bin/env python3
"""Tennessee: Tenn. Comp. R. & Regs. 1240-02-04-.09 Child Support Schedule (October 2021 revision).
The Secretary of State server (publications.tnsosfiles.com) answers 403 to scripted clients
(CloudFront), so the official PDF is fetched through its Wayback Machine copy (id_ = raw file)."""
import re, sys
from cs_shading import shaded_cells
from cs_schedules_lib import download, pdf_text, parse_rows, check, write, sample

URL = "https://publications.tnsosfiles.com/rules/1240/1240-02/1240-02-04.20211001.pdf"
WB = "https://web.archive.org/web/2026id_/" + URL
p = download(WB, "tn-1240-02-04.20211001.pdf", refresh="--no-refresh" not in sys.argv)
t = pdf_text(p)
t = t[t.find("1240-02-04-.09 CHILD SUPPORT SCHEDULE."):]
# first row is a range "150-950.00  100 100 100 100 100"
m = re.search(r"^\s*150-950\.00\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)", t, re.M)
first = [950.0] + [int(x) for x in m.groups()]
rows = [first] + parse_rows(t, 5)
rows = [[float(r[0])] + r[1:] for r in rows]
print("rows", len(rows), rows[0], rows[1], rows[-1])
print("checks", check(rows[1:], step=50))
for r in sample(rows):
    print(r)
# Shaded cells (light blue fill 0.776/0.851/0.945 in the PDF) = where the self-support reserve applies
# (Rule 1240-02-04-.03(4)(a)2(ii)); the upper edge per number of children is what the engine needs.
shade = shaded_cells(p, (0.776, 0.851, 0.945), 160, 5)
ssr_max = [max(shade[c]) for c in range(1, 6)]
print("shaded SSR area, highest combined income per column:", ssr_max)
write("tennessee", {
    "ssrShadedMaxIncome": ssr_max,
    "ssrShadedNote": "Highest schedule income inside the shaded (self-support reserve) area, for 1..5+ children, read from the fill colour of the cells in the official PDF.",
    "slug": "tennessee", "state": "Tennessee",
    "title": "Tenn. Comp. R. & Regs. 1240-02-04-.09 Schedule of Basic Child Support Obligations",
    "period": "monthly",
    "columns": ["combinedAdjustedGrossIncome", "1", "2", "3", "4", "5+"],
    "note": "First row is printed '150-950.00' in the rule (stored as 950.0). Column 5 is 'five +' children. "
            "Rule 1240-02-04-.04(6)(b): when combined AGI falls between rows, round UP to the next row. "
            "The shaded (self-support reserve) area of the printed schedule is not recoverable from the PDF text layer.",
    "effective": "2021-10-01", "url": URL, "fetchedVia": WB, "verified": "2026-10-08",
    "script": "research/scripts/cs_parse_tennessee.py",
}, rows)
