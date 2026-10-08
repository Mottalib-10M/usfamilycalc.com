#!/usr/bin/env python3
"""Re-download the 2024 Hawai'i Child Support Guidelines 'Table of Incomes' (Appendix B, RG-AC-508 (03/2024),
Hawai'i State Judiciary) and parse it into research/cs-schedules/hawaii.json:
rows = [grossMonthlyIncome, netIncome, solaIncome, seventyPctNet] for every whole dollar listed.
Usage: python3 research/scripts/cs_hawaii.py"""
import json, os, re, subprocess
from pypdf import PdfReader
HERE = os.path.dirname(os.path.abspath(__file__)); RES = os.path.dirname(HERE)
URL = "https://www.courts.state.hi.us/wp-content/uploads/2020/10/Table_of_Incomes.pdf"
PDF = os.path.join(RES, "raw", "hi-Table_of_Incomes.pdf")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", PDF, URL], check=True)
t = "\n".join(p.extract_text() for p in PdfReader(PDF).pages)
assert "RG-AC-508 (03/2024)" in t
m = r"\$([\d,]+\.\d\d)"
rows = {}
for g, n, s, p in re.findall(rf"^\s*{m}[ \t]+{m}[ \t]+{m}[ \t]+{m}[ \t]*$", t, re.M):
    vals = [float(x.replace(",", "")) for x in (g, n, s, p)]
    g0 = vals[0]
    if g0 in rows:
        assert rows[g0] == vals, ("conflict", g0)
    rows[g0] = vals
low = re.search(r"\$1 to \$1,303 \$0\.00 \$0\.00 \$0\.00", t)
assert low, "first band missing"
keys = sorted(rows)
assert keys[0] == 1304.0, keys[0]
missing = [k for k in range(1304, int(keys[-1]) + 1) if float(k) not in rows]
assert not missing, missing[:10]
out_rows = [[int(k)] + rows[k][1:] for k in keys]
out = {"slug": "hawaii", "source": URL,
       "edition": "2024 Hawai'i Child Support Guidelines, Appendix B Table of Incomes, RG-AC-508 (03/2024), effective April 1, 2024",
       "period": "monthly",
       "columns": ["grossMonthlyIncome", "netIncome", "solaIncome", "seventyPctNetIncome"],
       "firstBand": {"from": 1, "to": 1303, "netIncome": 0.0, "solaIncome": 0.0, "seventyPctNetIncome": 0.0},
       "note": "Net income = gross minus 2022 federal/state income tax (single, one exemption) and FICA, minus the $1,693 self-support reserve; SOLA income = gross minus $1,303. Gross above the last row: use the Judiciary's automated worksheet (handles gross up to $999,999/month).",
       "rows": out_rows}
json.dump(out, open(os.path.join(RES, "cs-schedules", "hawaii.json"), "w"), separators=(",", ":"))
print(len(out_rows), "rows", out_rows[0], out_rows[-1])
