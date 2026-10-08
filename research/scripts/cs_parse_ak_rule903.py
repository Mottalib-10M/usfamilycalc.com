#!/usr/bin/env python3
"""Alaska Civil Rule 90.3: download the official Rules of Civil Procedure PDF (courts.alaska.gov; the
Wayback raw copy is used when the court server does not answer) and print the parameters used in
research/cs/alaska.json (percentages, income cap, minimum, low-income adjustment, shared custody,
amendment history)."""
import os, re, subprocess
from pypdf import PdfReader

RAW = os.path.join(os.path.dirname(__file__), "..", "raw")
URL = "https://courts.alaska.gov/rules/docs/civ.pdf"
path = os.path.join(RAW, "ak-civil-rules.pdf")
for u in (URL, "https://web.archive.org/web/2026id_/" + URL):
    subprocess.run(["curl", "-sL", "-m", "180", "-A", "Mozilla/5.0", u, "-o", path])
    if os.path.exists(path) and open(path, "rb").read(4) == b"%PDF":
        print("from", u)
        break
t = "\n".join((p.extract_text() or "") for p in PdfReader(path).pages)
s = t[t.find("Rule 90.3. Child Support Awards."):]
flat = re.sub(r"\s+", " ", s)
for pat in [r"\(A\) 20% \(\.20\) for one child; \(B\) 27% \(\.27\) for two children; \(C\) 33% \(\.33\) for three children; and \(D\) an extra 3% \(\.03\) for each additional child",
            r"adjusted annua ?l inco ?me of over \$13 ?8,000",
            r"minimum child support amount that may be ordered is \$50 per month \(\$600 per year\)",
            r"\$30,000 or less.{0,300}?minus \$7,500",
            r"at least 30, but no more than 70, percent of the year",
            r"multiplied by 1\.5",
            r"not exceed 7\.5% of the parent ’s total income",
            r"\(Thirty percent of the overnights in a year total 110 overnights\.\)",
            r"by SCO 2004 effective October 16, 2023\)"]:
    m = re.search(pat, flat)
    print("OK " if m else "MISSING ", pat[:70], "->", m.group(0)[:160] if m else "")
