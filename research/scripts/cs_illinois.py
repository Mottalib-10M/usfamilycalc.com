#!/usr/bin/env python3
"""Re-download the Illinois HFS "Income Shares Schedule Based on Net Income" (2026 edition,
effective March 20, 2026) and parse every bracket into research/cs-schedules/illinois.json.
Each row is [bracketLow, c1..c6]; the bracket runs from bracketLow to bracketLow + 49.99.
Usage: python3 research/scripts/cs_illinois.py"""
import json, os, re, subprocess
import pypdf

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
URL = ("https://hfs.illinois.gov/content/dam/soi/en/web/hfs/childsupport/parents/"
       "2026ilschedofbobligations.pdf")
RAW = os.path.join(RES, "raw", "il-2026ilschedofbobligations.pdf")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)

r = pypdf.PdfReader(RAW)
text = "\n".join(p.extract_text() for p in r.pages)
pat = re.compile(r"^\s*([\d,]+\.\d\d)\s*-?\s*([\d,]+\.\d\d)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*$", re.M)
rows, uppers = [], []
for m in pat.finditer(text):
    lo, hi = (float(x.replace(",", "")) for x in m.groups()[:2])
    vals = [int(x) for x in m.groups()[2:]]
    rows.append([int(lo) if lo == int(lo) else lo] + vals)
    uppers.append(hi)
lows = [r_[0] for r_ in rows]
assert lows[0] == 25 and uppers[-1] == 27374.99, (lows[0], uppers[-1])
assert all(abs(b - a - 50) < 1e-9 for a, b in zip(lows, lows[1:])), "bracket width is not 50"
assert all(abs(u - l - 49.99) < 1e-6 for l, u in zip(lows, uppers))
out = {
    "slug": "illinois",
    "source": URL,
    "edition": "2026 Illinois Schedule of Basic Obligations (HFS), effective March 20, 2026",
    "period": "monthly",
    "columns": ["combinedNetIncomeBracketLow (bracket = low to low+49.99)", "1", "2", "3", "4", "5", "6"],
    "bracketWidth": 50,
    "lastBracketHigh": uppers[-1],
    "rows": rows,
    "minimumOrder": {"perChildMonthly": 40, "maxTotalMonthly": 120,
                     "appliesAtOrBelowGrossMonthly": 998, "approxNetMonthly": 884,
                     "rule": "750 ILCS 5/505(a)(3.3a); 75% of the 2026 HHS poverty guideline for one person = $998 gross a month, about $884 net (2026 Addendum p. 8)",
                     "source": "https://hfs.illinois.gov/content/dam/soi/en/web/hfs/childsupport/parents/2026addendumbosnit.pdf"},
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "illinois.json"), "w"), indent=0)
print(len(rows), "rows", rows[0], rows[-1])
