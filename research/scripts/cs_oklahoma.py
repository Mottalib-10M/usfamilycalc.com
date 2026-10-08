#!/usr/bin/env python3
"""Re-download Title 43 of the Oklahoma Statutes (Oklahoma Legislature, complete title RTF), convert it
with macOS textutil and parse the Child Support Guideline Schedule of 43 O.S. s. 119(A) into
research/cs-schedules/oklahoma.json.  Usage: python3 research/scripts/cs_oklahoma.py"""
import json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
URL = "https://www.oklegislature.gov/OK_Statutes/CompleteTitles/os43.rtf"
RTF = os.path.join(RES, "raw", "ok-os43.rtf")
TXT = os.path.join(RES, "raw", "ok-os43.txt")
subprocess.run(["curl", "-sL", "-m", "120", "-A", "Mozilla/5.0", "-o", RTF, URL], check=True)
subprocess.run(["textutil", "-convert", "txt", "-output", TXT, RTF], check=True)
t = open(TXT, encoding="utf-8").read()
a = t.index("§43-119.  Computation of child support obligations.\n")
b = t.index("B.  If combined gross monthly income exceeds", a)
body = t[a:b]
assert "emerg. eff. June 6, 2000" in t[b:b + 900]
num = r"(\d{1,3}(?:,\d{3})*)"
rows = []
for line in body.split("\n"):
    m = re.fullmatch(r"\s*" + r"\s+".join([num] * 7) + r"\s*", line)
    if m:
        rows.append([int(x.replace(",", "")) for x in m.groups()])
inc = [r[0] for r in rows]
assert inc[0] == 50 and inc[1] == 650 and inc[-1] == 15000
assert all(y - x == 50 for x, y in zip(inc[1:], inc[2:]))
assert len(rows) == 1 + (15000 - 650) // 50 + 1
out = {
    "slug": "oklahoma",
    "source": URL,
    "edition": "43 O.S. s. 119(A), Schedule of Basic Child Support Obligations (as amended Laws 2000, c. 345, emerg. eff. June 6, 2000)",
    "period": "monthly",
    "incomeBasis": "combined adjusted gross monthly income",
    "columns": ["combinedGrossMonthlyIncomeEqualToOrAbove", "1", "2", "3", "4", "5", "6+"],
    "rows": rows,
    "lookup": "floor: each row applies when combined gross monthly income is equal to or above the row amount",
    "aboveMax": {"over": 15000, "method": "discretion",
                 "text": "Amount for $15,000 plus an additional amount determined by the court (43 O.S. s. 119(B))"},
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "oklahoma.json"), "w"), indent=0)
print(len(rows), "rows", rows[0], rows[-1])
