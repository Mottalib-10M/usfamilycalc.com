#!/usr/bin/env python3
"""Re-download I.R.F.L.P. 120 (Idaho Supreme Court, printer-friendly version) and parse the bracket
percentages of Rule 120(i)(1) into research/cs-schedules/idaho.json (annual combined Guidelines Income).
The 'Per Month' and 'Per Year' columns are copied as printed.  Usage: python3 research/scripts/cs_idaho.py"""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); RES = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from cs_fetch_text import text_of
URL = "https://isc.idaho.gov/rules-procedure/print/irfl/120"
RAW = os.path.join(RES, "raw", "id-irflp120-print.html")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
t = text_of(RAW)
assert "amended June 3, 2025, effective July 1, 2025" in t, "edition changed"
a = t.find("(i) Computations."); b = t.find("(2) The guidelines income and the children's schedules", a)
body = t[a:b]
names = ["One (1) Child", "Two (2) Children", "Three (3) Children", "Four (4) Children", "Five (5) Children"]
out_br = {}
for n, name in enumerate(names, 1):
    s = body.find(name); e = body.find(names[n], s) if n < 5 else len(body)
    part = body[s:e]
    br = [{"pct": int(p), "width": int(w.replace(",", "")), "perMonthPrinted": int(m.replace(",", "")),
           "perYearPrinted": int(y.replace(",", ""))}
          for p, w, m, y in re.findall(r"(\d+)% of the (?:first|next) \$([\d,]+) of combined Guidelines? Income ([\d,]+) ([\d,]+)", part)]
    assert len(br) == 11, (name, len(br))
    out_br[str(n)] = br
# Check bracket widths: 5 x 10,000, then 5 x 20,000, then 290,000 (four children's last line prints $20,000)
for k, br in out_br.items():
    widths = [x["width"] for x in br]
    assert widths[:10] == [10000] * 5 + [20000] * 5, (k, widths)
out = {"slug": "idaho", "source": URL,
       "edition": "I.R.F.L.P. 120(i)(1), adopted July 1, 2021; amended March 24, 2022, effective July 1, 2022; amended June 3, 2025, effective July 1, 2025",
       "period": "annual combined Guidelines Income; result divided by 12 for monthly support",
       "columns": "per number of children: list of brackets {pct, width (annual $), perMonthPrinted, perYearPrinted}",
       "maxIncome": 440000,
       "brackets": out_br,
       "note": "The last bracket is printed as 'the next $290,000' for 1, 2, 3 and 5 children and as 'the next $20,000' for 4 children; 5x10,000 + 5x20,000 + 290,000 = 440,000, the ceiling stated in Rule 120(i)(7)."}
json.dump(out, open(os.path.join(RES, "cs-schedules", "idaho.json"), "w"), indent=1)
for k, br in out_br.items():
    print(k, [(x["pct"], x["width"]) for x in br], [x["perYearPrinted"] for x in br][-1])
