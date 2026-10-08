#!/usr/bin/env python3
"""Re-download the 2025 Michigan Child Support Formula Supplement (SCAO, effective
2025-01-01) and parse the General Care Support Tables (2025 MCSF-S 2.03(C)) and the
Low Income Threshold (2025 MCSF-S 2.01(A)).
Output: research/cs-schedules/michigan.json"""
import re, json, os, subprocess
from pypdf import PdfReader
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "https://www.courts.michigan.gov/4a9e90/siteassets/court-administration/standardsguidelines/foc/2025mcsfsupp.pdf"
RAW = os.path.join(BASE, "raw", "mi-2025-mcsf-supplement.pdf")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
pages = [p.extract_text() for p in PdfReader(RAW).pages[:15]]
text = re.sub(r"\s+", " ", "\n".join(pages))
lit = re.search(r"Low Income Threshold is \$([\d,]+\.\d\d)", text).group(1)
names = ["One Child", "Two Children", "Three Children", "Four Children", "Five Children"]
tables = {}
for n, name in enumerate(names, 1):
    start = text.index("General Care Support Table: " + name)
    end = text.index("General Care Support Table:", start + 10) if n < 5 else text.index("3. EXPLANATORY", start)
    chunk = re.sub(r"\s+", " ", text[start:end])
    rows = re.findall(r"\$([\d,]+\.\d\d) ([\d.]+)% \$([\d,]+\.\d\d) \+ ([\d.]+)% over \$([\d,]+\.\d\d)", chunk)
    assert len(rows) == 6, (name, rows)
    bands = []
    for inc, basepct, base, marg, over in rows:
        assert inc == over
        bands.append({"incomeAmount": float(inc.replace(",", "")), "basePercentage": float(basepct),
                      "baseSupport": float(base.replace(",", "")), "marginalPercentage": float(marg)})
    tables[str(n)] = bands
out = {
    "slug": "michigan", "source": URL, "retrieved": "2026-10-08",
    "document": "2025 Michigan Child Support Formula Supplement (2025 MCSF-S), effective January 1, 2025",
    "period": "monthly", "incomeBasis": "monthly net family income (2025 MCSF 3.02(B))",
    "lowIncomeThreshold": float(lit.replace(",", "")),
    "columns": "bands per number of children (1..5, 5 = five or more): incomeAmount D, basePercentage, baseSupport A, marginalPercentage B",
    "equation": "{ A + [ B x ( C - D ) ] } x E = G, using the band with the highest incomeAmount not exceeding C (2025 MCSF 3.02(B)(2))",
    "belowFirstBand": "The supplement lists no band below the first incomeAmount; base support for a family income below it is not stated in the tables (see uncertain).",
    "generalCareTables": tables,
}
json.dump(out, open(os.path.join(BASE, "cs-schedules", "michigan.json"), "w"), indent=1)
print(out["lowIncomeThreshold"]); [print(k, v[0], v[-1]) for k, v in tables.items()]
