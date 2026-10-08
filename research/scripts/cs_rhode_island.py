#!/usr/bin/env python3
"""Rhode Island Family Court Administrative Order 2023-02 (effective July 1, 2023): Schedule of
Basic Child Support Obligations, pages 5-19 of the PDF published by the RI Office of Child
Support Services. The PDF is a scan (images only), so the table is read with macOS Vision OCR
(scripts/ocr_vision.swift) on two renderings of every page (raw greyscale and a median-filtered
copy that removes the grey halftone shading of the self-support area). Cells where the two
readings disagree, or that break monotonicity, are listed for manual checking against the page
image; manual readings (done by eye on the scans) are in MANUAL below.
The official server answers 403 to scripts, so the Wayback copy of the official URL is used.
Usage: python3 research/scripts/cs_rhode_island.py"""
import json, os, re, subprocess, sys
from pypdf import PdfReader
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
OFFICIAL = "https://ocss.ri.gov/sites/g/files/xkgbur511/files/2023-07/23-02.pdf"
URL = "https://web.archive.org/web/20250612233534id_/" + OFFICIAL
RAW = os.path.join(RES, "raw", "ri-ao-23-02.pdf")
WORK = os.path.join(RES, "raw", "ri-ao-23-02-pages")
os.makedirs(WORK, exist_ok=True)
if not os.path.exists(RAW) or os.path.getsize(RAW) < 1_000_000:
    subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)

# Manual readings by eye from the page images, keyed (income, children) -> amount.
MANUAL = json.load(open(os.path.join(HERE, "cs_rhode_island_manual.json"))) \
    if os.path.exists(os.path.join(HERE, "cs_rhode_island_manual.json")) else {}
MANUAL = {(int(k.split(",")[0]), int(k.split(",")[1])): v for k, v in MANUAL.items()}

COL_EDGES = [0.26, 0.37, 0.49, 0.61, 0.72, 0.83]  # boundaries between income,1,...,6 (right-edge x)


def ocr(png):
    out = subprocess.run(["swift", os.path.join(HERE, "ocr_vision.swift"), png],
                         capture_output=True, text=True, check=True).stdout
    boxes = []
    for line in out.splitlines():
        b, t = line.split("\t", 1)
        x, y, w, h = map(float, b.split())
        boxes.append((x + w, y + h / 2, t.strip()))
    return boxes


def table(boxes):
    incomes = [(y, int(t)) for xr, y, t in boxes if xr < COL_EDGES[0] and re.fullmatch(r"\d{4,5}", t)]
    rows = {inc: [None] * 6 for _, inc in incomes}
    for xr, y, t in boxes:
        if xr < COL_EDGES[0] or not re.fullmatch(r"[\d,]+", t):
            continue
        col = sum(xr > e for e in COL_EDGES) - 1
        if col < 0 or col > 5:
            continue
        yy, inc = min(incomes, key=lambda p: abs(p[0] - y))
        if abs(yy - y) < 0.007:
            rows[inc][col] = int(t.replace(",", ""))
    return rows


reader = PdfReader(RAW)
merged, disagreements = {}, []
for pno in range(5, 20):
    page = reader.pages[pno - 1]
    img = Image.open(__import__("io").BytesIO(page.images[0].data)).convert("L")
    raw_png = os.path.join(WORK, f"p{pno:02d}.png")
    flt_png = os.path.join(WORK, f"p{pno:02d}f.png")
    img.save(raw_png)
    img.filter(ImageFilter.MedianFilter(3)).save(flt_png)
    a, b = table(ocr(raw_png)), table(ocr(flt_png))
    for inc in sorted(set(a) | set(b)):
        ra, rb = a.get(inc, [None] * 6), b.get(inc, [None] * 6)
        row = []
        for c in range(6):
            v = MANUAL.get((inc, c + 1))
            if v is None:
                if ra[c] is not None and ra[c] == rb[c]:
                    v = ra[c]
                else:
                    disagreements.append((pno, inc, c + 1, ra[c], rb[c]))
                    v = ra[c] if ra[c] is not None else rb[c]
            row.append(v)
        merged[inc] = row

rows = [[inc] + merged[inc] for inc in sorted(merged)]
problems = []
for i, r in enumerate(rows):
    if None in r:
        problems.append(("missing", r))
    if i and r[0] - rows[i - 1][0] != 50:
        problems.append(("step", rows[i - 1][0], r[0]))
    if i and None not in r and None not in rows[i - 1]:
        for c in range(1, 7):
            if r[c] < rows[i - 1][c]:
                problems.append(("decreasing-down", r[0], c, rows[i - 1][c], r[c]))
    if None not in r:
        for c in range(2, 7):
            if r[c] < r[c - 1]:
                problems.append(("decreasing-across", r[0], c, r[c - 1], r[c]))
print("rows", len(rows), rows[0], rows[-1])
print("OCR disagreements (page, income, children, raw, filtered):")
for d in disagreements:
    print(" ", d)
print("problems:")
for p in problems:
    print(" ", p)
out = {
    "slug": "rhode-island",
    "source": OFFICIAL,
    "retrievedVia": URL,
    "edition": "Rhode Island Family Court Administrative Order 2023-02, Schedule of Basic Child Support Obligations (Updated Schedule pages 1-15), effective July 1, 2023",
    "period": "monthly",
    "columns": ["combinedMonthlyIncome", "1", "2", "3", "4", "5", "6"],
    "method": "OCR (macOS Vision) of the scanned official PDF, two renderings cross-checked; disagreements resolved by eye (see scripts/cs_rhode_island_manual.json)",
    "rows": rows,
}
if not problems and all(None not in r for r in rows):
    json.dump(out, open(os.path.join(RES, "cs-schedules", "rhode-island.json"), "w"), indent=0)
    print("written")
