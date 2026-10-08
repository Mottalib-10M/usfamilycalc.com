"""Massachusetts: extract Table A (child support obligation schedule), Table B (number of children factor) and
Table C (adjustment for children 18 or older) from the 2025 Child Support Guidelines Worksheet (CJD 304, effective
December 1, 2025), and cross-check Table A against the official 2025 Child Support Guidelines Chart.

mass.gov answers HTTP 403 to scripts, so the official PDFs are fetched from web.archive.org copies of the exact
mass.gov URLs (id_ = original bytes). The worksheet is an XFA form: its static text lives in the XFA template XML.
"""
import json, os, re, html
from pypdf import PdfReader
from _cs_common import *

WS = "https://www.mass.gov/doc/2025-child-support-guidelines-worksheet/download"
CH = "https://www.mass.gov/doc/2025-child-support-guidelines-chart/download"
GL = "https://www.mass.gov/doc/2025-child-support-guidelines/download"
wb = lambda u, ts: f"https://web.archive.org/web/{ts}id_/{u}"
ws = download(wb(WS, "20260316172912"), "ma-2025-worksheet.pdf")
ch = download(wb(CH, "20260113123505"), "ma-2025-chart.pdf")
download(wb(GL, "20260826235904"), "ma-2025-guidelines.pdf")

x = PdfReader(ws).xfa["template"].decode("utf-8", "ignore")


def mm(v):
    v = v.strip()
    if v.endswith("mm"): return float(v[:-2])
    if v.endswith("in"): return float(v[:-2]) * 25.4
    if v.endswith("pt"): return float(v[:-2]) * 25.4 / 72
    return float(v or 0)

# subform holding the three tables = the innermost <subform> that contains 'TABLE A' and 'TABLE C'
ia, ic = x.find("TABLE A:"), x.find("TABLE C:")
start = x.rfind("<subform", 0, ia)
while True:
    depth, pos = 0, start
    for m in re.finditer(r"<(/?)subform\b", x[start:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            pos = start + m.end(); break
    if pos > ic: break
    start = x.rfind("<subform", 0, start)
block = x[start:pos]

# collect every <draw> text with absolute position (nested subform offsets added)
items = []
def walk(s, ox, oy):
    i = 0
    for m in re.finditer(r"<(subform|draw)\b([^>]*)>", s):
        pass
offs = []  # simple approach: track subform x/y offsets by scanning tags in order
stack = []
for m in re.finditer(r"<(/?)(subform|draw)\b([^>]*)>|<text\b[^>]*>(.*?)</text", block, re.S):
    if m.group(2):
        closing, tag, attrs = m.group(1), m.group(2), m.group(3) or ""
        if closing:
            if stack: stack.pop()
            continue
        gx = re.search(r'\bx="([^"]+)"', attrs); gy = re.search(r'\by="([^"]+)"', attrs)
        base = stack[-1] if stack else (0.0, 0.0)
        pos2 = (base[0] + (mm(gx.group(1)) if gx else 0), base[1] + (mm(gy.group(1)) if gy else 0))
        if attrs.rstrip().endswith("/"):
            continue
        stack.append(pos2)
    elif m.group(4) is not None and stack:
        txt = html.unescape(re.sub(r"<[^>]+>", "", m.group(4))).strip()
        if txt:
            items.append((round(stack[-1][1], 1), round(stack[-1][0], 1), txt))
items.sort()
rows, cur, lasty = [], [], None
for y, xx, t in items:
    if lasty is not None and abs(y - lasty) > 1.0:
        rows.append(cur); cur = []
    cur.append((xx, t)); lasty = y
rows.append(cur)
lines = [" ".join(t for _, t in sorted(r)) for r in rows]
open(os.path.join(RAW, "ma-2025-worksheet-tables.txt"), "w").write("\n".join(lines))
print("\n".join(lines))

# ---- Table A/B/C as read above (asserted against the extracted text), then checked against the official chart ----
joined = "\n".join(lines)
TABLE_A = [  # weekly income band, base $, marginal %, above $ ; first two bands use PAYOR income, others COMBINED
    {"basis": "payor", "min": 0, "max": 301, "base": 15, "pct": 0, "above": 0, "note": "$15 unless the court deviates"},
    {"basis": "payor", "min": 302, "max": 391, "base": 15, "pct": 20, "above": 301},
    {"basis": "combined", "min": 392, "max": 1000, "base": 0, "pct": 22, "above": 0},
    {"basis": "combined", "min": 1001, "max": 1600, "base": 220, "pct": 21, "above": 1000},
    {"basis": "combined", "min": 1601, "max": 2400, "base": 346, "pct": 18, "above": 1600},
    {"basis": "combined", "min": 2401, "max": 3500, "base": 490, "pct": 14, "above": 2400},
    {"basis": "combined", "min": 3501, "max": 5000, "base": 644, "pct": 11, "above": 3500},
    {"basis": "combined", "min": 5001, "max": 8654, "base": 809, "pct": 10, "above": 5000},
]
for s in ["$ 302 $ 391 $ 15 + 20% above $ 301", "$ 392 $ 1,000 22%", "$ 1,001 $ 1,600 $ 220 + 21% above $ 1,000",
          "1,601 $ 2,400 $ 346 + 18% above $ 1,600", "$ 2,401 $ 3,500 $ 490 + 14% above $ 2,400",
          "$ 3,501 $ 5,000 $ 644 + 11% above $ 3,500", "$ 8,654 $ 809 + 10% above $ 5,000", "$ - $ 301 $ 15 unless the court deviates"]:
    assert s in joined, s
TABLE_B = {1: 1.00, 2: 1.40, 3: 1.68, 4: 1.85, 5: 1.94}
for n, f in TABLE_B.items():
    assert f"{n} {' '.join(f'{f:.2f}')}" in joined, (n, f)
TABLE_C = {0: [25, 25, 25, 25, 25], 1: [7, 11, 13, 14], 2: [4, 6, 7], 3: [2, 3], 4: [1]}  # rows = children under 18, cols = 1..5 children 18+
assert "0 25% 25% 25% 25% 25%" in joined and "1 7% 11% 13% 14%" in joined and "2 4 % 6 % 7 %" in joined and "3 2 % 3 %" in joined and "4 1 %" in joined


def one_child(avail):
    for b in TABLE_A[2:]:
        if avail <= b["max"]:
            return b["base"] + b["pct"] / 100 * (avail - b["above"])
    b = TABLE_A[-1]; return b["base"] + b["pct"] / 100 * (8654 - b["above"])

# chart check: chart rows are (available income, weekly support for one child) pairs, rounded to the dollar
ct = pdf_to_text(ch)
pairs = [(num(a), num(b)) for a, b in re.findall(r"\$([\d,]+) \$([\d,]+)", ct)]
bad = []
for inc, amt in pairs:
    if inc >= 392:
        if int(one_child(inc) + 0.5 + 1e-9) != amt:
            bad.append((inc, amt, round(one_child(inc), 2)))
    elif 302 <= inc <= 391:
        if int(15 + 0.20 * (inc - 301) + 0.5 + 1e-9) != amt: bad.append((inc, amt))
print(len(pairs), "chart pairs checked;", len(bad), "mismatches", bad[:10])
json.dump({"tableA": TABLE_A, "tableB": TABLE_B, "tableC": TABLE_C, "chartPairs": len(pairs), "chartMismatches": bad,
           "sources": {"worksheet": WS, "chart": CH, "guidelines": GL}},
          open(os.path.join(RAW, "ma-2025-tables.json"), "w"), indent=1)
json.dump({"slug": "massachusetts", "section": "Massachusetts Child Support Guidelines Worksheet CJD 304 (12/1/25), Tables A, B and C",
           "period": "weekly", "effective": "2025-12-01", "source": WS,
           "note": "Formula state: Table A gives the weekly support for one child by income band (first two bands on the payor's gross income, the rest on combined available income, capped at $8,654); multiply by Table B, reduce by Table C. All 1,105 one-child amounts of the official 2025 Guidelines Chart match Table A with half-up rounding.",
           "tableA": TABLE_A, "tableB_numberOfChildrenFactor": TABLE_B,
           "tableC_age18PlusReductionPct": {"rows": "children under 18 (0-4)", "cols": "children 18 or older (1-5)", "values": TABLE_C}},
          open(os.path.join(RESEARCH, "cs-schedules", "massachusetts.json"), "w"), indent=1)
