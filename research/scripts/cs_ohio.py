#!/usr/bin/env python3
"""Re-download the Ohio basic child support schedule JFS 07767 (Rev. 6/2023) and parse every row
into research/cs-schedules/ohio.json.

Source: ODJFS Child Support Program Manual Transmittal Letter No. 186 (May 4, 2023), whose
appendix reproduces JFS 07766 (Rev. 6/2023) and the JFS 07767 (Rev. 6/2023) schedule.
Rule 5101:12-1-99 effective 4/1/2026 (reproduced in CSPMTL No. 206, March 24, 2026) still lists
JFS 07767 (rev. 6/2023) as the current schedule. codes.ohio.gov / odjfs.state.oh.us were not
reachable from our network, so the schedule is read from this official ODJFS PDF on dam.assets.ohio.gov.

Shaded cells (self-sufficiency reserve area) are detected from the gray (0.749 g) cell fills
drawn in the PDF content stream.
Usage: python3 research/scripts/cs_ohio.py"""
import json, os, re, subprocess
import pypdf

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
URL = ("https://dam.assets.ohio.gov/image/upload/jfs.ohio.gov/EBS/Programs%20Rules%20and%20Resources/"
       "Child%20Support/CSPMTLs/2023/CSPMTL_186_-_Five_Year_Rule_Review_Child_Support_Guidelines.pdf")
URL206 = ("https://dam.assets.ohio.gov/image/upload/v1774376628/jfs.ohio.gov/EBS/Programs%20Rules%20and%20Resources/"
          "Child%20Support/CSPMTLs/2026/CSPMTL-206_Ohio_Child_Support_Guideline_Rules_and_Form.pdf")
RAW = os.path.join(RES, "raw", "oh-CSPMTL-186.pdf")
RAW206 = os.path.join(RES, "raw", "oh-CSPMTL-206.pdf")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW206, URL206], check=True)

t206 = "\n".join(p.extract_text() or "" for p in pypdf.PdfReader(RAW206).pages)
assert 'JFS 07767, "Ohio Basic Child Support Guideline Schedule" (rev. 6/2023)' in t206

r = pypdf.PdfReader(RAW)
pages = [i for i, p in enumerate(r.pages) if (p.extract_text() or "").startswith("JFS 07767 (Rev. 6/2023)")]
assert len(pages) == 13, pages

money = r"\$([\d,]+)"
rowpat = re.compile(r"^" + r"\s+".join([money] * 7) + r"\s*$", re.M)
rows = []
for i in pages:
    for m in rowpat.finditer(r.pages[i].extract_text()):
        rows.append([int(x.replace(",", "")) for x in m.groups()])
inc = [x[0] for x in rows]
assert inc[0] == 8400 and inc[-1] == 336000 and len(rows) == 547, (inc[0], inc[-1], len(rows))
assert all(b - a == 600 for a, b in zip(inc, inc[1:]))

# ---- shaded cells: walk the content stream, tracking fill gray with q/Q ----
tok = re.compile(rb"\[(?:[^\]\\]|\\.)*\]|\((?:[^)\\]|\\.)*\)|<<.*?>>|/[^\s/\[\]()<>]+|[-+]?\d*\.?\d+|[A-Za-z'\"*]+", re.S)
shaded = {}  # income -> set(columns 1..6)
for i in pages:
    data = r.pages[i].get_contents().get_data()
    stack, gray, nums, last_re = [], 0.0, [], None
    fills, texts = [], []
    tm = None
    for t in tok.findall(data):
        try:
            nums.append(float(t)); continue
        except ValueError:
            pass
        op = t.decode("latin-1")
        if op == "q": stack.append(gray)
        elif op == "Q": gray = stack.pop() if stack else gray
        elif op == "g" and nums: gray = nums[-1]
        elif op == "re" and len(nums) >= 4: last_re = nums[-4:]
        elif op in ("f", "f*") and last_re and abs(gray - 0.749) < 1e-6:
            fills.append(tuple(last_re))
        elif op == "Tm" and len(nums) >= 6: tm = (nums[-2], nums[-1])
        elif op == "TJ" or op == "Tj":
            pass
        nums = [] if op not in ("TJ", "Tj") else nums
    # row y positions: income labels drawn in the first column (x < 120) - use the text extraction order
    page_rows = [x[0] for x in rows if x in rows]  # placeholder, replaced below
    ys = sorted({round(f[1], 2) for f in fills}, reverse=True)
    fills_by_y = {}
    for x, y, w, h in fills:
        if h < 13:  # skip the inner 12.48-high duplicate rectangles
            continue
        fills_by_y.setdefault(round(y, 2), set()).add(x)
    shaded_page = fills_by_y
    shaded[i] = shaded_page

# map each page's row grid: rows on a page are drawn top-down at a fixed pitch; get the y of every
# row from the full-height cell rectangles of the income column (x = 52.32)
col_x = None
out_shaded = {c: None for c in range(1, 7)}
shaded_lists = {c: [] for c in range(1, 7)}
row_iter = iter(rows)
for i in pages:
    data = r.pages[i].get_contents().get_data().decode("latin-1")
    row_ys = []
    for m in re.finditer(r"([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) re\s+W\* n\s+BT\s+/F\d+ [\d.]+ Tf\s+1 0 0 1 ([\d.]+) ([\d.]+) Tm\s+(?:0 g\s+)?0 G\s+\[\(\$\)", data):
        x, y = float(m.group(1)), float(m.group(2))
        if x < 60 and round(y, 2) not in row_ys:
            row_ys.append(round(y, 2))
    page_rows = [next(row_iter) for _ in row_ys]
    xs = sorted({x for s in shaded[i].values() for x in s})
    for y, income_row in zip(row_ys, page_rows):
        for x in shaded[i].get(y, ()):
            col = None
            # column starts as drawn in the PDF
            for c, x0 in enumerate([123.02, 195.29, 262.73, 334.03, 405.31, 476.62], start=1):
                if abs(x - x0) < 4:
                    col = c
            if col:
                out_shaded[col] = max(out_shaded[col] or 0, income_row[0])
                shaded_lists[col].append(income_row[0])
for c in range(1, 7):
    v = sorted(shaded_lists[c])
    assert v == list(range(v[0], v[-1] + 1, 600)), "shaded cells not contiguous"
    print("col", c, "shaded", v[0], "to", v[-1], len(v), "rows")
print("shaded (SSR) area ends at (1..6 children):", [out_shaded[c] for c in range(1, 7)])

out = {
    "slug": "ohio",
    "source": URL,
    "edition": "JFS 07767 Basic Child Support Schedule (Rev. 6/2023); still listed as current by OAC 5101:12-1-99 eff. 4/1/2026",
    "period": "annual",
    "columns": ["combinedAnnualIncome", "1", "2", "3", "4", "5", "6"],
    "rows": rows,
    "shadedAreaMaxIncomeByChildren": [out_shaded[c] for c in range(1, 7)],
    "parentingTimeReduction": {"minOvernights": 90, "pct": 10, "source": "ORC 3119.051(A)"},
    "childCareSharePctCapInReserve": 50,
    "childCareSharePctCapSource": "ORC 3119.05(P)(2)",
    "minimumOrderMonthly": 80,
    "minimumOrderSource": "ORC 3119.06(A), https://codes.ohio.gov/ohio-revised-code/section-3119.06",
    "cashMedicalAnnualPerChild": 510.21,
    "cashMedicalSource": URL206 + " (JFS 07766 rev. 4/2026, Table 3)",
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "ohio.json"), "w"), indent=0)
print(len(rows), "rows", rows[0], rows[-1])
