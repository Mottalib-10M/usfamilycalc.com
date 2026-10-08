#!/usr/bin/env python3
"""Re-download Wis. Admin. Code ch. DCF 150 and its Appendix C (low-income payer table) and write
research/cs-schedules/wisconsin.json. docs.legis.wisconsin.gov refuses automated connections from
here, so the official PDFs are fetched through the Wayback Machine (raw 'id_' copies) when needed."""
import json, os, re, subprocess
from pypdf import PdfReader

HERE = os.path.dirname(__file__)
RAW = os.path.join(HERE, "..", "raw")
OFFICIAL = {
    "wi-dcf-150.pdf": "https://docs.legis.wisconsin.gov/code/admin_code/dcf/101_199/150.pdf",
    "wi-dcf-150-appC.pdf": "https://docs.legis.wisconsin.gov/code/admin_code/dcf/101_199/150_c.pdf",
}


def get(name, url):
    path = os.path.join(RAW, name)
    for u in (url, "https://web.archive.org/web/2026id_/" + url):
        subprocess.run(["curl", "-sL", "-m", "90", "-A", "Mozilla/5.0", u, "-o", path])
        if os.path.exists(path) and open(path, "rb").read(4) == b"%PDF":
            return path
    raise SystemExit("could not download " + url)


for n, u in OFFICIAL.items():
    get(n, u)

main = "\n".join(p.extract_text() for p in PdfReader(os.path.join(RAW, "wi-dcf-150.pdf")).pages)
m = re.search(r"\(a\)\s+17% for one child;.*?\(e\)\s+34% for 5 or more children", main, re.S)
print("150.035(2):", re.findall(r"(\d+)%", m.group(0)))
print("150.04(5)(c):", re.findall(r"\d\.\s+(\d+)% for", main.split("is greater than or equal to $7,000")[1][:400]))
print("150.04(5)(d):", re.findall(r"\d\.\s+(\d+)% for", main.split("is greater than $12,500:")[1][:400]))

c = PdfReader(os.path.join(RAW, "wi-dcf-150-appC.pdf")).pages[0].extract_text()
rows = []
for line in c.splitlines():
    mm = re.match(r"^\$([\d,]+\.\d\d)((?: [\d.]+% \$[\d,]+){5})$", line.strip())
    if mm:
        vals = re.findall(r"([\d.]+)% \$([\d,]+)", mm.group(2))
        rows.append([float(mm.group(1).replace(",", ""))] + [[float(p), int(a.replace(",", ""))] for p, a in vals])
eff = re.search(r"Effective (\w+ \d+, \d{4})", c).group(1)
out = {
    "slug": "wisconsin",
    "table": "DCF 150 Appendix C - Child support obligation of low-income payers at 75% to 150% of the 2026 federal poverty guidelines",
    "period": "monthly",
    "columns": "monthly income available for child support 'up to', then [percent, monthly support amount] for 1..5 children",
    "effective": "2026-03-01",
    "effectiveText": eff,
    "lookup": "bracket: use the first row whose 'Monthly Income Up To' is >= the payer's monthly income",
    "belowMin": "Below the lowest income level the court may set an amount appropriate for the payer's total economic circumstances, which may be lower than the lowest amount in the table (DCF 150.04(4)(a)).",
    "aboveMax": "At or above 150% of the federal poverty guidelines the standard percentages of DCF 150.035(2) apply (17/25/29/31/34%).",
    "url": OFFICIAL["wi-dcf-150-appC.pdf"],
    "rows": rows,
}
dst = os.path.join(HERE, "..", "cs-schedules", "wisconsin.json")
json.dump(out, open(dst, "w"), indent=1)
print(len(rows), "rows; first", rows[0], "last", rows[-1])
