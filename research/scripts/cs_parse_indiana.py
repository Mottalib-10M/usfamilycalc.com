#!/usr/bin/env python3
"""Indiana: Guideline Schedules for Weekly Support Payments (Indiana Child Support Rules and Guidelines,
2024 revision), official PDF linked from rules.incourts.gov ('See the Guidelines Schedule for Weekly
Support Payments')."""
import sys
from cs_schedules_lib import download, pdf_text, parse_rows, check, write, sample

URL = "https://www.in.gov/courts/files/schedule.pdf"
p = download(URL, "in-schedule.pdf", refresh="--no-refresh" not in sys.argv)
# layout mode: the plain text layer drops one cell in ~90 rows (e.g. 5050, 6010); layout mode keeps them all.
t = pdf_text(p, layout=True)
# Each row: income, 8 children columns, then the 'Maximum Spouse and Child (50%)' column.
rows10 = parse_rows(t, 9)
mism = [r for r in rows10 if r[9] * 2 != r[0]]
print("50% column mismatches (printed in the official PDF):", mism)
rows = [r[:9] for r in rows10]
print("rows", len(rows), rows[0], rows[-1])
print("checks", check(rows, step=10, start=100))
for r in sample(rows):
    print(r)
write("indiana", {
    "slug": "indiana", "state": "Indiana",
    "title": "Indiana Guideline Schedules for Weekly Support Payments",
    "period": "weekly",
    "columns": ["combinedWeeklyAdjustedIncome", "1", "2", "3", "4", "5", "6", "7", "8"],
    "note": "The printed schedule also has a 'Maximum Spouse and Child (50%)' column equal to 50% of combined weekly "
            "adjusted income (not stored; it matches 50% of income on every row except 4220, printed '2101' instead of 2110 in the official PDF). Above $9,200: percentages printed at the foot of the schedule.",
    "aboveMaxPct": [8.1, 11.4, 13.1, 14.7, 16.2, 17.6, 19.0, 20.4],
    "effective": "2024-01-01", "url": URL, "verified": "2026-10-08",
    "script": "research/scripts/cs_parse_indiana.py",
}, rows)
