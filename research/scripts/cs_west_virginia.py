#!/usr/bin/env python3
"""Re-download W. Va. Code § 48-13-301 (code.wvlegislature.gov) and parse the table of monthly
basic child support obligations into research/cs-schedules/west-virginia.json.
Usage: python3 research/scripts/cs_west_virginia.py"""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); RES = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from cs_fetch_text import text_of
URL = "https://code.wvlegislature.gov/48-13-301/"
RAW = os.path.join(RES, "raw", "wv-48-13-301.html")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
t = text_of(RAW)
a = t.find("COMBINED GROSS MONTHLY INCOME ONE CHILD TWO CHILDREN THREE CHILDREN FOUR CHILDREN FIVE CHILDREN SIX CHILDREN")
b = t.find("Previous §48-13-205", a)
assert a > 0 and b > a
body = t[a:b].split("SIX CHILDREN", 1)[1]
rows = [[int(x) for x in m] for m in re.findall(r"(\d+) (\d+) (\d+) (\d+) (\d+) (\d+) (\d+)", body)]
inc = [r[0] for r in rows]
assert inc[0] == 550 and inc[-1] == 35000, (inc[0], inc[-1])
assert all(y - x == 50 for x, y in zip(inc, inc[1:]))
out = {"slug": "west-virginia", "source": URL,
       "edition": "W. Va. Code § 48-13-301 as amended by 2023 SB 573 (and 2023 1st Ex. Sess. HB 112), read 2026-10-08",
       "period": "monthly", "columns": ["combinedGrossMonthlyIncome", "1", "2", "3", "4", "5", "6"], "rows": rows}
json.dump(out, open(os.path.join(RES, "cs-schedules", "west-virginia.json"), "w"), indent=0)
print(len(rows), "rows", rows[0], rows[-1])
