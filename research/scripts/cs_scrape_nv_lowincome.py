#!/usr/bin/env python3
"""Rebuild Nevada's 2026 low-income schedule (NAC 425.145) from the official NV Child Support Guidelines
Calculator linked by DWSS: for each number of children, walk the brackets ("above $a and up to $b ...
Low-Income Payers table Obligation amount is $x") from $0 upward, and write research/cs-schedules/nevada.json
as rows [upTo, amount for 1..N children]."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cs_query_nv_calculator import obligation

YEAR = 2026
MAXN = 6
OUT = os.path.join(os.path.dirname(__file__), "..", "cs-schedules", "nevada.json")
PAT = re.compile(r"above \$([\d,]+\.\d\d) and up to \$([\d,]+\.\d\d) the (\d{4}) Low-Income Payers table Obligation amount is \$([\d,]+\.\d\d)")
f = lambda s: float(s.replace(",", ""))

table = {}  # upTo -> {n: amount}
bounds_by_n = {}
for n in range(1, MAXN + 1):
    x, bounds = 1.0, []
    while True:
        _, text = obligation(YEAR, f"{x:.2f}", n)
        m = PAT.search(text)
        if not m:
            break
        lo, hi, yr, amt = f(m.group(1)), f(m.group(2)), m.group(3), f(m.group(4))
        assert yr == str(YEAR)
        table.setdefault(hi, {})[n] = amt
        bounds.append((lo, hi, amt))
        print(n, lo, hi, amt, flush=True)
        x = hi + 0.01
    bounds_by_n[n] = bounds

ups = sorted(table)
rows = [[u] + [table[u].get(n) for n in range(1, MAXN + 1)] for u in ups]
out = {
    "slug": "nevada",
    "table": f"Low-income schedule for {YEAR} (NAC 425.145), as applied by the official Nevada Child Support Guidelines Calculator",
    "period": "monthly",
    "columns": "monthly gross income 'up to', then the monthly obligation for 1..6 children",
    "effective": f"{YEAR}",
    "lookup": "bracket: the first row whose 'up to' amount is >= the obligor's monthly gross income (the calculator's first bracket starts at $0.00)",
    "url": "https://nvchildsupportguidelinescalculator.azurewebsites.net/getobligation.aspx",
    "script": "research/scripts/cs_scrape_nv_lowincome.py",
    "rows": rows,
}
json.dump(out, open(OUT, "w"), indent=1)
print(len(rows), "rows written")
