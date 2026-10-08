#!/usr/bin/env python3
"""Re-download the North Carolina Child Support Guidelines (AOC-A-162, Rev. 1/23,
effective 2023-01-01) as published by NC DHHS Child Support Services, and parse the
Schedule of Basic Support Obligations (combined monthly adjusted gross income).
Output: research/cs-schedules/north-carolina.json"""
import re, json, os, subprocess
from pypdf import PdfReader
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "https://www.ncdhhs.gov/css2255a1/download?attachment"
RAW = os.path.join(BASE, "raw", "nc-guidelines-2023.pdf")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
text = "\n".join(p.extract_text() for p in PdfReader(RAW).pages)
rows = []
for line in text.splitlines():
    line = re.sub(r"\s+", " ", line.strip()).replace("0 - 1300", "1300")
    m = re.fullmatch(r"(\d+)((?: \d+){6})", line)
    if m:
        rows.append([int(m.group(1))] + [int(x) for x in m.group(2).split()])
rows.sort()
for a, b in zip(rows, rows[1:]):
    assert b[0] - a[0] == 50, (a, b)
assert rows[0][0] == 1300 and rows[-1][0] == 40000, (rows[0], rows[-1])
out = {
    "slug": "north-carolina", "source": URL, "retrieved": "2026-10-08",
    "document": "North Carolina Child Support Guidelines, AOC-A-162, Rev. 1/23, effective January 1, 2023",
    "period": "monthly", "incomeBasis": "combined monthly adjusted gross income",
    "columns": ["combinedIncome", "c1", "c2", "c3", "c4", "c5", "c6"],
    "note": "First row is printed '0 - 1300' (income 0 to 1,300, $50 minimum order); stored here as 1300. "
            "The PDF shades the self-support-reserve cells; shading is not recoverable from the text layer.",
    "rows": rows,
}
# Shaded (self-support reserve) cells: the PDF text layer loses the shading, so it is read from the
# official NC DHHS HTML version of the same schedule (cells with bgcolor="#CCCCCC").
HURL = "https://ncchildsupport.ncdhhs.gov/ecoa/getGuideLinesTable.htm"
HRAW = os.path.join(BASE, "raw", "nc-table.html")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", HRAW, HURL], check=True)
h = open(HRAW, encoding="utf-8", errors="ignore").read()
hrows = []
for tr in re.findall(r"<tr>(.*?)</tr>", h, re.S):
    cells = re.findall(r'<td( bgcolor="#CCCCCC")?>(.*?)</td>', tr, re.S)
    if len(cells) >= 7:
        vals = [float(re.sub(r"<[^>]+>|\s|\$|,", "", c[1])) for c in cells[:7]]
        hrows.append((vals, [bool(c[0]) for c in cells[:7]]))
assert [[int(v) for v in r] for r, _ in hrows] == rows, "HTML table differs from PDF schedule"
shaded_through = []
for col in range(1, 7):
    inc = [r[0] for r, sh in hrows if sh[col]]
    # shading must be one contiguous block starting at the first row
    assert inc and inc == [r[0] for r, _ in hrows[:len(inc)]], col
    shaded_through.append(int(inc[-1]))
out["shadedThroughIncome"] = shaded_through
out["shadedSource"] = HURL
out["shadedNote"] = ("Highest combined-income row whose cell is shaded (self-support reserve area), for 1..6 children, read from the "
                     "NC DHHS HTML schedule; its values were checked identical to the PDF schedule.")
out["minimumOrder"] = {"amount": 50, "belowObligorIncome": 1150, "source": URL,
                       "text": "For obligors with an adjusted gross income of less than $1,150, the Guidelines require, absent a deviation, a minimum support order ($50) (Guidelines, 'Self-Support Reserve; Supporting Parents With Low Incomes')."}
assert "less than $1,150" in re.sub(r"\s+", " ", text) and "minimum support order ($50)" in re.sub(r"\s+", " ", text)
json.dump(out, open(os.path.join(BASE, "cs-schedules", "north-carolina.json"), "w"), separators=(",", ":"))
print(len(rows), rows[0], rows[-1], out["shadedThroughIncome"])
