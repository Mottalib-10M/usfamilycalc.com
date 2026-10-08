#!/usr/bin/env python3
"""Arkansas Monthly Family Support Chart (Administrative Order No. 10, income shares, required July 1, 2020).
arcourts.gov does not answer from this environment, so the official PDF is fetched from the Internet Archive
copy of the official URL (snapshot 2025-09-17) and parsed into research/cs-schedules/arkansas.json.
Blue-shaded (low-income, payor-income-only) cells are detected from the PDF fill colour (0.741,0.843,0.933).
Usage: python3 research/scripts/cs_arkansas.py"""
import json, os, re, subprocess
from pypdf import PdfReader
from pypdf.generic import ContentStream

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
OFFICIAL = "https://www.arcourts.gov/sites/default/files/formatted-files/monthly-family-support-chart-req-july-2020.pdf"
URL = "http://web.archive.org/web/20250917003441id_/" + OFFICIAL
RAW = os.path.join(RES, "raw", "ar-chart.pdf")
if not os.path.exists(RAW) or os.path.getsize(RAW) < 100000:
    subprocess.run(["curl", "-sL", "-m", "300", "--retry", "2", "-o", RAW, URL], check=True)
r = PdfReader(RAW)
assert "Self-Support Reserve = $900/month, Minimum Order = $125 per month" in r.pages[0].extract_text()

rows, shaded = [], {}
BLUE = (0.741, 0.843, 0.933)
for page in r.pages:
    t = page.extract_text()
    for m in re.finditer(r"^\s*(\d+)(?:-(\d+))?\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*$", t, re.M):
        g = m.groups()
        inc = int(g[1]) if g[1] else int(g[0])
        rows.append([inc] + [int(x) for x in g[2:]])
    # shading
    items = []
    page.extract_text(visitor_text=lambda s, cm, tm, fd, fs: s.strip() and items.append(
        (tm[5] * cm[3] + cm[5], tm[4] * cm[0] + cm[4], s.strip())))
    fill, pend, rects = None, [], []
    for ops, op in ContentStream(page.get_contents(), r).operations:
        o = op.decode() if isinstance(op, bytes) else op
        if o == "rg":
            fill = tuple(round(float(x), 3) for x in ops)
        elif o == "g":
            fill = (round(float(ops[0]), 3),)
        elif o == "re":
            pend.append(tuple(float(x) for x in ops))
        elif o in ("f", "f*"):
            if fill == BLUE:
                rects += pend
            pend = []
        elif o == "n":
            pend = []
    def blue(x, y):
        for a, b, w, h in rects:
            x0, x1 = sorted((a, a + w)); y0, y1 = sorted((b, b + h))
            if x0 - 1 <= x <= x1 + 1 and y0 - 1 <= y <= y1 + 1:
                return True
        return False
    if rects:
        for y, x, s in items:
            m = re.fullmatch(r"(\d+)(?:-(\d+))?", s)
            if m and 150 < x < 200 and s.isdigit():
                inc = int(m.group(2) or m.group(1))
                cells = sorted([(xx, tt) for yy, xx, tt in items if abs(yy - y) < 2 and xx > 200 and tt.isdigit()])
                shaded[inc] = [blue(xx + 2, y + 3) for xx, tt in cells]

inc = [x[0] for x in rows]
assert inc[0] == 1050 and inc[1] == 1100 and inc[-1] == 30000, (inc[:3], inc[-1])
assert all(b - a == 50 for a, b in zip(inc, inc[1:]))
for a, b in zip(rows, rows[1:]):
    assert all(p <= q for p, q in zip(a[1:], b[1:])), (a, b)
for x in rows:
    assert all(p <= q for p, q in zip(x[1:], x[2:])), x
# last income in the shaded (payor-only) area for each number of children
low_max = []
for k in range(6):
    s = [i for i, f in shaded.items() if len(f) == 6 and f[k]]
    low_max.append(max(s) if s else None)
out = {
    "slug": "arkansas",
    "source": OFFICIAL,
    "retrievedFrom": URL,
    "edition": "Arkansas Family Support Chart of Basic Child Support Obligations, monthly (required July 1, 2020), Administrative Order No. 10",
    "period": "monthly",
    "incomeBasis": "combined gross monthly income (payor's own income in the blue-shaded low-income area)",
    "columns": ["combinedGrossMonthlyIncome", "1", "2", "3", "4", "5", "6"],
    "rows": rows,
    "firstRowCovers": "1-1050",
    "selfSupportReserve": 900, "minimumOrder": 125,
    "shadedLowIncomeMaxIncome": {"byChildren": low_max,
        "text": "Blue-shaded cells (chart footnote 1: combined gross monthly income does not apply in the blue shaded area) end at these incomes for 1..6 children; detected from the PDF fill colour."},
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "arkansas.json"), "w"), indent=0)
print(len(rows), rows[0], rows[-1], "shaded max", low_max)
