#!/usr/bin/env python3
"""Re-download Fla. Stat. s. 61.30 (2026 Florida Statutes, Online Sunshine) and parse the
guidelines schedule of s. 61.30(6) into research/cs-schedules/florida.json.
Usage: python3 research/scripts/cs_florida.py"""
import html, json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
URL = ("http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute"
       "&URL=0000-0099/0061/Sections/0061.30.html")
RAW = os.path.join(RES, "raw", "fl-61.30.html")

subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
t = open(RAW, encoding="latin-1").read()
assert "The 2026 Florida Statutes" in t, "unexpected edition"
t = re.sub(r"<[^>]+>", " ", t)
t = re.sub(r"\s+", " ", html.unescape(t))
a = t.find("Combined Monthly Net Child or Children Income One Two Three Four Five Six")
b = t.find("(a) If the obligor parent", a)
assert a > 0 and b > a
body = t[a:b].split("Six", 1)[1]
rows = [[float(m[0])] + [int(x) for x in m[1:]]
        for m in re.findall(r"(\d+\.00) (\d+) (\d+) (\d+) (\d+) (\d+) (\d+)", body)]
rows = [[int(r[0])] + r[1:] for r in rows]
incomes = [r[0] for r in rows]
assert incomes[0] == 800 and incomes[-1] == 10000
assert all(b - a == 50 for a, b in zip(incomes, incomes[1:])), "step is not 50"
assert len(rows) == 185
out = {
    "slug": "florida",
    "source": URL,
    "edition": "The 2026 Florida Statutes, s. 61.30(6)",
    "period": "monthly",
    "columns": ["combinedNetMonthlyIncome", "1", "2", "3", "4", "5", "6"],
    "rows": rows,
    "aboveMax": {"over": 10000, "pctOfExcess": [5.0, 7.5, 9.5, 11.0, 12.0, 12.5]},
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "florida.json"), "w"), indent=0)
print(len(rows), "rows", rows[0], rows[-1])
