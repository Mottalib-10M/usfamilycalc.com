"""Colorado: parse the schedule of basic child support obligations, C.R.S. § 14-10-115(7)(b), and the parenting
time table, § 14-10-115(8)(h), as repealed and reenacted by HB 25-1159 (Session Laws 2025, ch. 334, sec. 2),
effective March 1, 2026 (sec. 13). Cross-references corrected by HB 26-1217 (Session Laws 2026, ch. 113), which
does not change the table.

The official CRS printout on leg.colorado.gov (content.leg.colorado.gov) refuses scripts (HTTP 403) and the 2024
printout does not reproduce the table; the session law is the official text that enacted it. In the session law
the whole table is new material (bold italic), so no strike-through handling is needed.
"""
import json, os, re
from _cs_common import *

URL = "https://leg.colorado.gov/laws/session-laws/HB25-1159/334/download"
URL26 = "https://leg.colorado.gov/laws/session-laws/HB26-1217/113/download"
path = download(URL, "co-hb25-1159-sessionlaw.pdf")
download(URL26, "co-hb26-1217-sessionlaw.pdf")
t = pdf_to_text(path)

# --- (7)(b) schedule ---------------------------------------------------------------
a = t.find("(b)  SCHEDULE OF BASIC CHILD SUPPORT OBLIGATIONS:")
b = t.find("(8)  Computation of basic child support", a)
assert a > 0 and b > a
rows = []
for line in t[a:b].splitlines():
    toks = line.split()
    if len(toks) == 7 and all(re.fullmatch(r"\d+", x) for x in toks):
        rows.append([int(x) for x in toks])
incs = [r[0] for r in rows]
assert incs[0] == 50 and incs[-1] == 40000, (incs[0], incs[-1])
assert all(y - x == 50 for x, y in zip(incs, incs[1:])), [(x, y) for x, y in zip(incs, incs[1:]) if y - x != 50][:5]

# --- (8)(h) parenting time table ------------------------------------------------------
c = t.find("(h)  PARENTING TIME TABLE:", b)
d = t.find("SECTION 3.", c)
pt = {}
for m in re.finditer(r"(\d+(?:\.5)?)\s+(\d+\.\d\d)%", t[c:d]):
    k = float(m.group(1)); k = int(k) if k == int(k) else k
    pt[k] = float(m.group(2))
keys = sorted(pt)
assert keys[0] == 0 and keys[-1] == 365 and 182.5 in pt and len(pt) == 367, (keys[:3], keys[-3:], len(pt))
table_pt = [[k, pt[k]] for k in keys]

out = {"slug": "colorado", "section": "C.R.S. § 14-10-115(7)(b) and (8)(h), as reenacted by HB 25-1159 (2025 Sess. Laws ch. 334), effective March 1, 2026",
       "period": "monthly", "source": URL, "effective": "2026-03-01",
       "columns": ["combined adjusted gross monthly income", "1 child", "2 children", "3 children", "4 children", "5 children", "6 or more children"],
       "note": "Amounts between rows are interpolated (14-10-115(7)(a)(II)). Above $40,000 the court has discretion but the presumptive obligation may not be less than the $40,000 amount (7)(a)(VII). Low-income rules (minimum order, reduced low-income adjustment, self-support reserve) are applied on top of the table: see (7)(a)(III)-(V).",
       "rows": rows,
       "parentingTimeTable": {"section": "C.R.S. § 14-10-115(8)(h)", "columns": ["overnights per year", "parenting time credit %"], "rows": table_pt}}
json.dump(out, open(os.path.join(RESEARCH, "cs-schedules", "colorado.json"), "w"), separators=(",", ":"))
print(len(rows), "rows", rows[0], rows[-1], "| parenting table", len(table_pt), table_pt[:2], table_pt[-1])
