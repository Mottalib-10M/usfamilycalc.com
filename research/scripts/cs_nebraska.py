#!/usr/bin/env python3
"""Re-download Nebraska Supreme Court 'Table 1 - Income Shares Formula' (DC 6:1.7, form revised January 2025)
and parse it into research/cs-schedules/nebraska.json.  On page 1 the PDF text layer detaches the values of
rows 1100, 1150 and 1200 from their income labels; orphan labels and orphan value lines are re-paired in order.
Usage: python3 research/scripts/cs_nebraska.py"""
import json, os, re, subprocess
from pypdf import PdfReader
HERE = os.path.dirname(os.path.abspath(__file__)); RES = os.path.dirname(HERE)
URL = "https://supremecourt.nebraska.gov/sites/default/files/childsup_table.pdf"
PDF = os.path.join(RES, "raw", "ne-childsup_table.pdf")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", PDF, URL], check=True)
rows, orphan_inc, orphan_vals = [], [], []
for page in PdfReader(PDF).pages:
    for line in page.extract_text().splitlines():
        nums = [int(x) for x in re.findall(r"\d+", line)]
        if re.match(r"^\s*-\s*\d+\s*-\s*$", line):
            continue  # page number
        if len(nums) == 7:
            rows.append(nums)
        elif len(nums) == 6:
            orphan_vals.append(nums)
        elif len(nums) == 1 and nums[0] >= 500 and nums[0] % 50 == 0:
            orphan_inc.append(nums[0])
assert orphan_inc == [1100, 1150, 1200] and len(orphan_vals) == 3, (orphan_inc, orphan_vals)
rows += [[i] + v for i, v in zip(orphan_inc, orphan_vals)]
rows.sort()
inc = [r[0] for r in rows]
assert inc[0] == 500 and inc[-1] == 20000 and all(b - a == 50 for a, b in zip(inc, inc[1:]))
assert rows[inc.index(2000)][1:4] == [387, 575, 712]  # official example, Neb. Ct. R. §§ 4-206, 4-208
out = {"slug": "nebraska", "source": URL,
       "edition": "Neb. Ct. R. § 4-201 et seq., Table 1 - Income Shares Formula (DC 6:1.7), form revised January 2025",
       "period": "monthly", "columns": ["combinedMonthlyNetIncome", "1", "2", "3", "4", "5", "6"], "rows": rows,
       "aboveMax": {"over": 20000, "pctOfExcess": [10, 10, 10, 12, 13, 14], "note": "Guide only, not a rebuttable presumption (Neb. Ct. R. § 4-203(C))"}}
json.dump(out, open(os.path.join(RES, "cs-schedules", "nebraska.json"), "w"), indent=0)
print(len(rows), "rows", rows[0], rows[-1])
