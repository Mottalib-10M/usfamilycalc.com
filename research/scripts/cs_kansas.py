#!/usr/bin/env python3
"""Re-download the Kansas Child Support Guidelines (effective July 1, 2025, Kansas Supreme Court
Administrative Order 2025-RL-121, kscourts.gov) and extract Appendix II, Child Support Schedules
(one to six children, per-child monthly amounts by age group 0-5 / 6-11 / 12-18), into
research/cs-schedules/kansas.json.

The first schedule page carries a (noisy) text layer; the other eleven pages are images, read here with
tesseract OCR column by column. Every row is validated against the guidelines' own construction rule
(0-5 = 0.84 x and 6-11 = 0.94 x the unrounded 12-18 value, so each must be within 1 of the rounded
12-18 value x factor), income steps and monotonicity; rows failing validation are listed and must be
checked by eye (see FIXES below, each read by eye from the page image).
Requires: pypdf, Pillow, tesseract.  Usage: python3 research/scripts/cs_kansas.py"""
import csv, io, json, os, re, subprocess, tempfile
from pypdf import PdfReader
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
URL = ("https://kscourts.gov/KSCourts/media/KsCourts/Child%20Support%20Guidelines/"
       "2024-Child-Support-Guidlines-adopted-July-1-2025-clean.pdf")
RAW = os.path.join(RES, "raw", "ks-csg-2025.pdf")
subprocess.run(["curl", "-sL", "-m", "180", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
r = PdfReader(RAW)
assert "Effective July 1, 2025" in r.pages[0].extract_text()

# Values read by eye from the page images where OCR failed validation: {(children, income): [a05, a611, a1218]}
FIXES = {
    (3, 50): [6, 7, 7],        # page 33 (Appendix II, three children), first row
    (3, 7300): [694, 777, 827],  # page 33, third block
    (5, 450): [39, 44, 47],    # page 37 (five children), first block
    (5, 11000): [712, 797, 848],  # page 38 (five children continued)
    (5, 11100): [717, 802, 854],  # page 38
}


def ocr_column(img, x0, x1, y0, y1):
    crop = img.crop((max(0, x0 - 4), y0, x1 + 5, y1))
    crop = crop.resize((crop.width * 3, crop.height * 3), Image.LANCZOS)
    with tempfile.TemporaryDirectory() as d:
        f = os.path.join(d, "c.png"); crop.save(f)
        out = subprocess.run(["tesseract", f, "-", "--psm", "6", "-c", "tessedit_char_whitelist=0123456789", "tsv"],
                             capture_output=True, text=True).stdout
    vals = []
    for row in csv.DictReader(io.StringIO(out), delimiter="\t", quoting=csv.QUOTE_NONE):
        t = (row.get("text") or "").strip()
        if t.isdigit():
            vals.append((y0 + (int(row["top"]) + int(row["height"]) / 2) / 3, int(t)))
    return vals


def clean(img):
    """Whiten table rules: vertical runs > 40 px and horizontal runs > 150 px of dark pixels."""
    g = img.convert("L"); w, h = g.size; px = g.load()
    dark = lambda x, y: px[x, y] < 140
    kill = []
    for x in range(w):
        run = 0
        for y in range(h):
            run = run + 1 if dark(x, y) else 0
            if run > 40:
                kill.append(("v", x)); break
    for y in range(h):
        run = 0
        for x in range(w):
            run = run + 1 if dark(x, y) else 0
            if run > 150:
                kill.append(("h", y)); break
    for kind, k in kill:
        if kind == "v":
            for y in range(h): px[k, y] = 255
        else:
            for x in range(w): px[x, k] = 255
    hl = [k for kind, k in kill if kind == "h" and k > 600]
    return g, (min(hl) if hl else 1170)


def page_rows(img):
    g, bottom = clean(img); w, h = g.size; px = g.load()
    y0, y1 = 285, bottom
    prof = [sum(1 for y in range(y0, y1) if px[x, y] < 128) for x in range(w)]
    cols, s = [], None
    for x, v in enumerate(prof + [0]):
        if v > 3 and s is None: s = x
        if v <= 3 and s is not None:
            if cols and s - cols[-1][1] < 9:
                cols[-1] = (cols[-1][0], x - 1)
            else:
                cols.append((s, x - 1))
            s = None
    cols = [c for c in cols if c[1] - c[0] >= 6]
    assert len(cols) % 4 == 0, cols
    rows = []
    for k in range(0, len(cols), 4):
        cs = cols[k:k + 4]
        colvals = [ocr_column(g, a, z, y0, y1) for a, z in cs]
        for y, inc in colvals[0]:
            vals = []
            for cv in colvals[1:]:
                near = [v for yy, v in cv if abs(yy - y) < 8]
                vals.append(near[0] if near else None)
            rows.append([inc] + vals)
    return rows


def text_rows(t):
    t = t.replace("IO", "10").replace("Ill", "111").replace("I", "1").replace("l", "1").replace("O", "0")
    rows = []
    for line in t.split("\n"):
        nums = re.findall(r"\b\d+\b", line)
        if len(nums) == 12:
            for k in range(0, 12, 4):
                rows.append([int(x) for x in nums[k:k + 4]])
    return rows


start = next(i for i, p in enumerate(r.pages) if "ONE CHILD FAMILIES" in (p.extract_text() or ""))
schedules = {}
names = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX"]
for k in range(6):
    rows = []
    for pn in (start + 2 * k, start + 2 * k + 1):
        page = r.pages[pn]
        txt = page.extract_text() or ""
        if len(txt) > 1000 and re.search(r"\d+ \d+ \d+ \d+ \d+ \d+ \d+ \d+", txt):
            rows += text_rows(txt)
        else:
            img = Image.open(io.BytesIO(page.images[0].data)).convert("RGB")
            rows += page_rows(img)
    rows = sorted({x[0]: x for x in rows if x[0] is not None}.values())
    for key, v in FIXES.items():
        if key[0] == k + 1:
            for x in rows:
                if x[0] == key[1]:
                    x[1:] = v
    schedules[k + 1] = rows

problems = []
for n, rows in schedules.items():
    inc = [x[0] for x in rows]
    exp = list(range(50, 2001, 50)) + list(range(2100, 18001, 100))
    if inc != exp:
        problems.append((n, "income sequence", sorted(set(exp) ^ set(inc))[:20]))
    for x in rows:
        a, b, c = x[1:]
        if None in (a, b, c) or abs(a - 0.84 * c) > 1.01 or abs(b - 0.94 * c) > 1.01:
            problems.append((n, "ratio", x))
    for p, q in zip(rows, rows[1:]):
        if not all(None not in (u, v) and u <= v for u, v in zip(p[1:], q[1:])):
            problems.append((n, "monotonic", p, q))
for p in problems:
    print("CHECK", p)

out = {
    "slug": "kansas",
    "source": URL,
    "edition": "Kansas Child Support Guidelines, Appendix II Child Support Schedules (guidelines effective July 1, 2025, Kansas Supreme Court Administrative Order 2025-RL-121)",
    "period": "monthly",
    "incomeBasis": "combined gross monthly income (domestic gross income)",
    "unit": "dollars per month PER CHILD, by the child's age group",
    "columns": ["combinedGrossMonthlyIncome", "age0to5", "age6to11", "age12to18"],
    "schedulesByChildren": {str(n): rows for n, rows in schedules.items()},
    "construction": "0-5 and 6-11 values = 0.84 and 0.94 x the unrounded 12-18 value (Appendix II note **).",
    "aboveMax": {"over": 18000, "method": "formula",
                 "exponent": 0.6386,
                 "multiplierByChildren": [4.8982, 3.5596, 3.0359, 2.6015, 2.3175, 2.1083],
                 "text": "Appendix II note ** on each schedule: to determine child support at higher income levels, age 12-18 per-child amount = income ^ .6386 x multiplier (4.8982, 3.5596, 3.0359, 2.6015, 2.3175, 2.1083 for 1-6 children); age 6-11 = that x 0.94; age 0-5 = that x 0.84. The extended formula is discretionary (Guidelines IV.G)."},
    "validationProblems": problems,
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "kansas.json"), "w"), indent=0)
print({n: (len(v), v[0], v[-1]) for n, v in schedules.items()}, "problems:", len(problems))
