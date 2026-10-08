#!/usr/bin/env python3
"""Louisiana: La. R.S. 9:315.19 schedule of basic child support obligations
(Acts 2024, No. 86, eff. Jan. 1, 2025), from the Louisiana State Legislature's official law page."""
import sys
from cs_schedules_lib import download, html_text, parse_rows, check, write, sample

URL = "https://www.legis.la.gov/legis/Law.aspx?d=107384"
p = download(URL, "la-rs-9-315.19.html", refresh="--no-refresh" not in sys.argv)
t = html_text(p)
t = t[t.find("SCHEDULE OF BASIC CHILD SUPPORT OBLIGATIONS"):t.find("Acts 2001, No. 1082")]
raw = parse_rows(t, 6)
# The official page prints the rows 45,850 to 47,650 twice (37 rows, identical values). Keep one copy,
# and stop if a repeated income ever carried different amounts.
seen, rows = {}, []
for r in raw:
    if r[0] in seen:
        assert seen[r[0]] == r, ("conflicting duplicate", r)
        continue
    seen[r[0]] = r
    rows.append(r)
rows.sort(key=lambda r: r[0])
print("raw rows", len(raw), "duplicates dropped", len(raw) - len(rows))
print("rows", len(rows), rows[0], rows[-1])
print("checks", check(rows, step=50))
for r in sample(rows):
    print(r)
write("louisiana", {
    "slug": "louisiana", "state": "Louisiana",
    "title": "La. R.S. 9:315.19 Louisiana Child Support Guideline Schedule of Basic Child Support Obligations",
    "period": "monthly",
    "columns": ["combinedAdjustedMonthlyGrossIncome", "1", "2", "3", "4", "5", "6"],
    "note": "The legislature page prints rows 45850-47650 twice with identical values; deduplicated. Amounts are the total basic obligation for all children (columns 2-6 headed '(TOTAL)').",
    "effective": "2025-01-01", "url": URL, "verified": "2026-10-08",
    "script": "research/scripts/cs_parse_louisiana.py",
}, rows)
