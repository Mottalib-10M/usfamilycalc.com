#!/usr/bin/env python3
"""Re-download the Connecticut Child Support and Arrearage Guidelines (effective August 1, 2026,
Commission for Child Support Guidelines, published by the CT Judicial Branch) and parse the Schedule of
Basic Child Support Obligations (Regs. Conn. State Agencies s. 46b-215a-2c(e)) into
research/cs-schedules/connecticut.json. Also detects the darker shaded (low-income obligor) cells from
the PDF drawing operators. Usage: python3 research/scripts/cs_connecticut.py"""
import json, os, re, subprocess
from pypdf import PdfReader
from pypdf.generic import ContentStream

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
URL = "https://www.jud.ct.gov/Publications/ChildSupport/CSguidelines.pdf"
RAW = os.path.join(RES, "raw", "ct-CSguidelines.pdf")
subprocess.run(["curl", "-sL", "-m", "120", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
r = PdfReader(RAW)
assert "Effective August 1, 2026" in r.pages[0].extract_text()

rows, dark_rows = [], {}
for pn, page in enumerate(r.pages):
    t = page.extract_text() or ""
    if "Combined" not in t or "Weekly" not in t or "6 Children" not in t:
        continue
    for m in re.finditer(r"^(\d{3,4}) " + r" ".join([r"(\d+\.\d\d)% (\d+)"] * 6) + r"\s*$", t, re.M):
        g = m.groups()
        rows.append([int(g[0])] + [int(g[i]) for i in range(2, 13, 2)] + [float(g[i]) for i in range(1, 13, 2)])
    # shading: darker fill (gray 0.749) rectangles vs. text cell positions
    items = []
    page.extract_text(visitor_text=lambda s, cm, tm, fd, fs: s.strip() and items.append(
        (tm[5] * cm[3] + cm[5], tm[4] * cm[0] + cm[4], s.strip())))
    fill, pend, rects = None, [], []
    for ops, op in ContentStream(page.get_contents(), r).operations:
        o = op.decode() if isinstance(op, bytes) else op
        if o == "g":
            fill = float(ops[0])
        elif o == "re":
            pend.append(tuple(float(x) for x in ops))
        elif o in ("f*", "f"):
            if fill == 0.749:
                rects += pend
            pend = []
        elif o == "n":
            pend = []
    def dark(x, y):
        for a, b, w, h in rects:
            x0, x1 = sorted((a, a + w)); y0, y1 = sorted((b, b + h))
            if x0 <= x <= x1 and y0 <= y <= y1:
                return True
        return False
    for y, x, s in items:
        if x < 100 and s.isdigit():
            cells = sorted([(xx, tt) for yy, xx, tt in items if abs(yy - y) < 1.5 and xx > 100 and tt.endswith("%")])
            flags = [dark(xx + 1.5, y + 3) for xx, tt in cells]
            if any(flags):
                dark_rows[int(s)] = flags.index(True) + 1   # first child-column where the dark band starts

inc = [x[0] for x in rows]
assert inc[0] == 150 and inc[-1] == 6000 and all(b - a == 10 for a, b in zip(inc, inc[1:])), "rows"
assert len(rows) == 586
for x in rows:
    assert all(a <= b for a, b in zip(x[1:7], x[2:7])), x
for a, b in zip(rows, rows[1:]):
    assert all(p <= q for p, q in zip(a[1:7], b[1:7])), (a, b)
# last income that is in the darker shaded (low-income obligor) area, per number of children
low_max = []
for k in range(1, 7):
    shaded = [i for i, start in dark_rows.items() if start <= k]
    low_max.append(max(shaded))
assert low_max[0] == 470, low_max   # preamble: shading ends at $470 net weekly income (one child)

out = {
    "slug": "connecticut",
    "source": URL,
    "edition": "Connecticut Child Support and Arrearage Guidelines, effective August 1, 2026, Regs. Conn. State Agencies s. 46b-215a-2c(e)",
    "period": "weekly",
    "incomeBasis": "combined net weekly income (noncustodial parent income only in the darker shaded low-income area)",
    "columns": ["combinedNetWeeklyIncome", "1", "2", "3", "4", "5", "6",
                "pct1", "pct2", "pct3", "pct4", "pct5", "pct6"],
    "rows": rows,
    "lookup": "nearest: income rounded to the nearest ten dollars (s. 46b-215a-2c(c)(3)(A)-(B))",
    "lowIncomeShadedMaxIncome": {"byChildren": low_max,
        "text": "Darker shaded area (low-income obligor, noncustodial parent income only) covers incomes up to these amounts for 1..6 children; detected from the PDF fill colour (gray 0.749)."},
    "aboveMax": {"over": 6000, "method": "discretion",
                 "text": "Above $6,000 combined net weekly income: case by case; minimum presumptive = amount at $6,000; maximum presumptive = combined net weekly income x the percentage at $6,000 (s. 46b-215a-2c(a)(2))",
                 "pctAt6000": rows[-1][7:]},
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "connecticut.json"), "w"), indent=0)
print(len(rows), "rows", rows[0], rows[-1], "low-income max", low_max)
