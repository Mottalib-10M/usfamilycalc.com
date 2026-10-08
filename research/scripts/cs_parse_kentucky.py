#!/usr/bin/env python3
"""Kentucky: KRS 403.212(9) child support guidelines table (effective July 1, 2025).
Source: official KRS PDF served by the Kentucky Legislative Research Commission."""
import sys
from cs_schedules_lib import download, pdf_text, parse_rows, check, write, sample

URL = "https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=55832"
p = download(URL, "ky-krs-403.212.pdf", refresh="--no-refresh" not in sys.argv)
t = pdf_text(p)
t = t[t.find("(9) The child support guidelines table"):]
rows = parse_rows(t, 6)
print("rows", len(rows), rows[0], rows[-1])
print("checks", check(rows, step=100, start=0))
for r in sample(rows):
    print(r)
write("kentucky", {
    "slug": "kentucky", "state": "Kentucky",
    "title": "KRS 403.212(9) child support guidelines table",
    "period": "monthly",
    "columns": ["combinedMonthlyAdjustedParentalGrossIncome", "1", "2", "3", "4", "5", "6+"],
    "note": "Column 6 is 'six or more' children. Amounts are total combined obligation, divided pro rata under KRS 403.212(5)(a).",
    "effective": "2025-07-01", "url": URL, "verified": "2026-10-08",
    "script": "research/scripts/cs_parse_kentucky.py",
}, rows)
