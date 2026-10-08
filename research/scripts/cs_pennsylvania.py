#!/usr/bin/env python3
"""Re-download Pa.R.Civ.P. 1910.16-3 (Basic Child Support Schedule, eff. 2026-01-01) from the
Pennsylvania Code and parse every row into research/cs-schedules/pennsylvania.json.
The shaded (Self-Support Reserve) area is not marked in the PA Code HTML; it is read from the
filled rectangles drawn on the schedule pages of the official Pennsylvania Bulletin PDF
(55 Pa.B. 5978, Vol. 55 No. 34, Aug. 23 2025, pages 6005-6006 of the issue).
Usage: python3 research/scripts/cs_pennsylvania.py"""
import html, json, os, re, subprocess
import pypdf

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
RAW = os.path.join(RES, "raw")
URL = ("https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/231/"
       "chapter1910/s1910.16-3.html")
PDF_URL = "https://www.pacodeandbulletin.gov/secure/pabulletin/data/vol55/55-34/55-34.pdf"

def get(url, path):
    subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", path, url], check=True)
    return path

h = open(get(URL, os.path.join(RAW, "pa-1910.16-3.html")), encoding="utf-8", errors="replace").read()
assert "amended August 11, 2025, effective January 1, 2026, 55 Pa.B. 5978" in h
rows = []
for tr in re.split(r"(?i)<TR[^>]*>", h)[1:]:
    tr = re.split(r"(?i)</TABLE>", tr)[0]
    cells = [html.unescape(re.sub(r"<[^>]+>", "", c)).strip()
             for c in re.findall(r"(?is)<TD[^>]*>(.*?)(?=</TD>|<TD|</TR>|$)", tr)]
    if len(cells) == 7 and all(re.fullmatch(r"\d+", c) for c in cells):
        rows.append([int(c) for c in cells])
inc = [r[0] for r in rows]
assert inc[0] == 1300 and inc[-1] == 30000 and len(rows) == 575
assert all(b - a == 50 for a, b in zip(inc, inc[1:]))

# ---- shaded area from the Bulletin PDF ----
pdf = pypdf.PdfReader(get(PDF_URL, os.path.join(RAW, "pa-bulletin-55-34.pdf")))
X0, CW, RH = 147.351, 69.846, 13.47   # x of "One Child" column, column width, row height
start = None
for i, p in enumerate(pdf.pages):
    if "1300 41 41 41 42 42 43" in (p.extract_text() or "").replace("\n", " ") or \
       re.search(r"1300\s+1350\s+1400", p.extract_text() or ""):
        start = i
        break
assert start is not None
# rectangles: "x y w h re" followed by fill (f) or clip+shading (W n ... sh)
segs = []
for pg in (start, start + 1):
    c = pdf.pages[pg].get_contents().get_data().decode("latin-1")
    for m in re.finditer(r"([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+re\s+(f|W\s+n\s+/(?:GS\d+\s+gs\s+/)?Sh\d+\s+sh)", c):
        x, y, w, hgt = map(float, m.groups()[:4])
        if x < 140 or w > 500:
            continue
        nrows = round(hgt / RH)
        firstcol = round((x - X0) / CW) + 1
        segs.append((pg, -y, nrows, firstcol))
segs.sort()
shaded_through = {}
r = 0
for pg, _, nrows, firstcol in segs:
    for k in range(nrows):
        income = inc[r + k]
        for col in range(firstcol, 7):
            shaded_through[col] = income
    r += nrows
shaded = [shaded_through[c] for c in range(1, 7)]
print("shaded area ends at (1..6 children):", shaded)

out = {
    "slug": "pennsylvania",
    "source": URL,
    "edition": "Pa.R.Civ.P. 1910.16-3, amended Aug. 11, 2025, effective Jan. 1, 2026, 55 Pa.B. 5978",
    "period": "monthly",
    "columns": ["combinedMonthlyNetIncome", "1", "2", "3", "4", "5", "6"],
    "rows": rows,
    "shadedAreaMaxIncomeByChildren": shaded,
    "shadedAreaSource": PDF_URL + " (filled cells on the schedule pages, issue pages 6005-6006)",
    "selfSupportReserveMonthly": 1255,
    "selfSupportReserveSource": "https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/231/chapter1910/s1910.16-2.html (1910.16-2(e)(1)(i)(B))",
    "sharedCustody": {"minOvernightPct": 40, "subtractPctPoints": 30, "equalTimeIncomeEqualization": True,
                      "source": "https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/231/chapter1910/s1910.16-4.html (1910.16-4(a)(1) Part D, (c))"},
    "aboveMax": {"over": 30000, "base": [3749, 4981, 5803, 6482, 7130, 7750],
                 "pctOfExcess": [4.0, 4.0, 4.7, 5.3, 5.8, 6.3],
                 "rule": "Pa.R.Civ.P. 1910.16-3.1(a)(2)(i)"},
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "pennsylvania.json"), "w"), indent=0)
print(len(rows), "rows", rows[0], rows[-1])
