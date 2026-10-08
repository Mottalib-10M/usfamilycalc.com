#!/usr/bin/env python3
"""Re-download the Maine Child Support Table (DHHS PDF) and the rule 10-144 C.M.R. ch. 351, Chapter 6
(Secretary of State .docx), parse both and check they match row by row; write
research/cs-schedules/maine.json. Values are WEEKLY amounts PER CHILD, by combined ANNUAL gross income.
Usage: python3 research/scripts/cs_maine.py"""
import html, json, os, re, subprocess, zipfile
from pypdf import PdfReader
HERE = os.path.dirname(os.path.abspath(__file__)); RES = os.path.dirname(HERE)
PDF_URL = "https://www.maine.gov/dhhs/sites/maine.gov.dhhs/files/inline-files/Maine%20Child%20Support%20Table.pdf"
RULE_URL = "https://www.maine.gov/sos/sites/maine.gov.sos/files/content/assets/144c351.docx"
pdf = os.path.join(RES, "raw", "me-child-support-table.pdf"); docx = os.path.join(RES, "raw", "me-144c351.docx")
for u, p in ((PDF_URL, pdf), (RULE_URL, docx)):
    subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", p, u], check=True)
t = "\n".join(pg.extract_text() for pg in PdfReader(pdf).pages)
rows = [list(map(int, m)) for m in re.findall(r"^(\d{5,6})\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*$", t, re.M)]
x = zipfile.ZipFile(docx).read("word/document.xml").decode()
x = html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"</w:p>", "\n", x)))
a = x.find("Schedule of Basic Support Obligation"); b = x.find("CHAPTER 7 - IMPLEMENTATION", a)
nums = [int(n) for n in re.findall(r"\b\d+\b", x[a:b].split("16,800", 1)[1])]
rule_rows = [nums[i:i + 7] for i in range(0, len(nums), 7)]
assert rule_rows == rows, "PDF and rule docx differ"
inc = [r[0] for r in rows]
assert inc[0] == 16800 and inc[-1] == 400000 and len(rows) == 673
assert all(y - x0 == (600 if x0 < 360000 else 400) for x0, y in zip(inc, inc[1:]))
out = {"slug": "maine", "source": PDF_URL, "sourceRule": RULE_URL,
       "edition": "10-144 C.M.R. ch. 351, Chapter 6 Child Support Table, filing 2023-019 effective February 13, 2023",
       "period": "weekly, per child",
       "columns": ["combinedAnnualGrossIncome", "1", "2", "3", "4", "5", "6"],
       "note": "Each cell is the weekly basic support entitlement PER CHILD; multiply by the number of children (19-A M.R.S. § 2006(1)). Step $600 from $16,800 to $360,000, then $400 to $400,000.",
       "rows": rows}
json.dump(out, open(os.path.join(RES, "cs-schedules", "maine.json"), "w"), indent=0)
print(len(rows), "rows", rows[0], rows[-1])
