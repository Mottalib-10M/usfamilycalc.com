#!/usr/bin/env python3
"""Re-download RSA 458-C:3 (NH General Court; the live site gencourt.state.nh.us blocks automated
requests, so the Wayback copy is used) and parse the 'Percent of Combined Net Income Devoted to Child
Support' table of 458-C:3, I(a) into research/cs-schedules/new-hampshire.json.
The DHHS 2026 Guideline Calculation Table (DCSS s651) could only be read in a browser; the sample rows
stored below were read from it on 2026-10-08 (see research/cs/new-hampshire.json).
Usage: python3 research/scripts/cs_new_hampshire.py"""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); RES = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from cs_fetch_text import text_of
URL = "https://www.gencourt.state.nh.us/rsa/html/XLIII/458-C/458-C-3.htm"
RAW = os.path.join(RES, "raw", "nh-458-C-3.html")
if not os.path.exists(RAW) or "--refresh" in sys.argv:
    subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, "https://web.archive.org/web/2026/" + URL], check=True)
t = text_of(RAW)
a = t.rfind("Percent of Combined Net Income Devoted to Child Support"); b = t.find("(b) The department", a)
body = t[a:b]
rows = []
first = re.search(r"15,000 or less ([\d.]+) percent ([\d.]+) percent ([\d.]+) percent ([\d.]+) percent", body)
rows.append([15000] + [float(x) for x in first.groups()])
for m in re.finditer(r"\$([\d,]+)(?: or more)? ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)", body):
    rows.append([int(m.group(1).replace(",", ""))] + [float(x) for x in m.groups()[1:]])
assert [r[0] for r in rows] == [15000, 25000, 35000, 50000, 60000, 70000, 80000, 90000, 100000, 125000], rows
assert rows[0][1:] == [25.6, 35.5, 42.5, 45.0] and rows[-1][1:] == [19.0, 26.0, 31.0, 33.5]
out = {"slug": "new-hampshire", "source": URL,
       "edition": "RSA 458-C:3, I(a) (source note ends 2013, 81:3, eff. June 19, 2013), read via Wayback copy 2026",
       "period": "annual combined net income (percentages); DHHS converts to monthly rows",
       "columns": ["annualCombinedNetIncome", "1", "2", "3", "4+"],
       "rows": rows,
       "rowsNote": "First row = $15,000 or less; last row = $125,000 or more. Between levels DHHS interpolates linearly within each column (RSA 458-C:3, I(b)).",
       "dhhsTable": {
         "name": "2026 Child Support Guideline Calculation Table (Form DCSS s651), BCSS PR 26-01",
         "url": "https://www.dhhs.nh.gov/sites/g/files/ehbemt476/files/documents2/css-guidelines-book.pdf",
         "effective": "2026-04-01", "selfSupportReserveMonthly": 1729.00,
         "rows": 2940, "firstRow": [1720, 1729], "lastRow": [31110, 31119], "step": 10,
         "columns": ["grossFrom", "grossTo", "median", "federalTax", "ficaMedicare", "net", "pct1", "amt1", "pct2", "amt2", "pct3", "amt3", "pct4plus", "amt4plus"],
         "sampleRows": [
           [1720, 1729, 1724.50, 38.35, 131.92, 1554.23, 25.384, 394.52, 35.320, 548.95, 42.320, 657.75, 44.820, 696.60],
           [3000, 3009, 3004.50, 178.96, 229.84, 2595.70, 24.390, 633.09, 34.085, 884.74, 41.085, 1066.44, 43.585, 1131.33],
           [6000, 6009, 6004.50, 585.31, 459.34, 4959.85, 22.050, 1093.65, 30.550, 1515.23, 36.575, 1814.06, 39.075, 1938.06],
           [9000, 9009, 9004.50, 1245.31, 688.84, 7070.35, 21.000, 1484.77, 28.760, 2033.43, 34.760, 2457.65, 37.260, 2634.41],
           [15000, 15009, 15004.50, 2662.42, 1147.84, 11194.24, 19.000, 2126.90, 26.000, 2910.50, 31.000, 3470.21, 33.500, 3750.07],
           [25000, 25009, 25004.50, 5679.65, 1390.86, 17934.00, 19.000, 3407.46, 26.000, 4662.84, 31.000, 5559.54, 33.500, 6007.89],
           [31110, 31119, 31114.50, 7818.15, 1534.44, 21761.91, 19.000, 4134.76, 26.000, 5658.10, 31.000, 6746.19, 33.500, 7290.24]]}}
json.dump(out, open(os.path.join(RES, "cs-schedules", "new-hampshire.json"), "w"), indent=1)
print(rows)
