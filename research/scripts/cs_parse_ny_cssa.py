#!/usr/bin/env python3
"""Download the current NY Child Support Standards Chart (LDSS-4515) and print the poverty guideline,
self-support reserve, combined parental income amount, percentages and a few chart rows.
www.childsupport.ny.gov resets automated connections; the same OTDA PDF is served by the official
language mirror es.childsupport.ny.gov (the PDF itself is the English original)."""
import os, re, subprocess
from pypdf import PdfReader

RAW = os.path.join(os.path.dirname(__file__), "..", "raw")
URLS = ["https://www.childsupport.ny.gov/pdfs/CSSA.pdf", "https://es.childsupport.ny.gov/pdfs/CSSA.pdf"]
out = os.path.join(RAW, "ny-cssa-current-es-mirror.pdf")
for u in URLS:
    r = subprocess.run(["curl", "-sL", "-m", "60", "-A", "Mozilla/5.0", u, "-o", out, "-w", "%{http_code}"],
                       capture_output=True, text=True)
    if r.stdout == "200" and open(out, "rb").read(4) == b"%PDF":
        print("downloaded from", u)
        break
t = "\n".join(p.extract_text() for p in PdfReader(out).pages)
print(re.search(r"Released: (\S+)", t).group(0))
print(re.search(r"poverty income guidelines amount for a single person.*?is \$([\d,]+)", t, re.S).group(1), "poverty")
print(re.search(r"self-support reserve is \$([\d,]+)", t).group(1), "SSR")
print(re.search(r"combined parental\s+income amount of \$([\d,]+)", t).group(1), "cap")
for row in ["30,000 30,099", "50,000 50,099", "75,000 75,099"]:
    i = t.find(row)
    print(t[i:i + 50].split("\n")[0])
