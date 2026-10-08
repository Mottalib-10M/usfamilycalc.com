#!/usr/bin/env python3
"""Alabama: Schedule of Basic Child-Support Obligations, Appendix I to the Supreme Court of Alabama order
of January 14, 2022 amending Ala. R. Jud. Admin. Rule 32 (effective May 1, 2022; unchanged by the
March 3, 2023 order effective June 1, 2023).
judicial.alabama.gov does not answer from outside the US; the official PDF is fetched through its Wayback
Machine copy (id_ = raw file, captured 2026-01-14).
NB: the 'Appendix to Rule 32' still linked from judicial.alabama.gov/library/RulesJudicialAdm
(docs/library/rules/JA32_appx.pdf) is the superseded 2009 schedule (0-800 ... 20,000) and is NOT used."""
import re, sys
from cs_schedules_lib import download, pdf_text, parse_rows, check, write, sample

URL = "https://judicial.alabama.gov/docs/rules/Rule32AlaRJudAdminOrder.pdf"
WB = "https://web.archive.org/web/2026id_/" + URL
p = download(WB, "al-Rule32AlaRJudAdminOrder.pdf", refresh="--no-refresh" not in sys.argv)
t = pdf_text(p)
t = t[t.find("APPENDIX I"):]
m = re.search(r"^\s*0-250\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)", t, re.M)
first = [250] + [int(x) for x in m.groups()]
rows = [first] + parse_rows(t, 6)
print("rows", len(rows), rows[0], rows[1], rows[-1])
print("checks", check(rows, step=50))
for r in sample(rows):
    print(r)
write("alabama", {
    "slug": "alabama", "state": "Alabama",
    "title": "Alabama Schedule of Basic Child-Support Obligations (Appendix I to the Jan. 14, 2022 order, Ala. R. Jud. Admin. 32)",
    "period": "monthly",
    "columns": ["combinedAdjustedGrossIncome", "1", "2", "3", "4", "5", "6"],
    "note": "First row is printed '0-250' (stored as 250). Rule 32(C)(1): between rows use the lower value if less than "
            "halfway, the higher value if halfway or more (i.e. nearest row, ties up). No SSR shading: the SSR is applied "
            "on Form CS-42 lines 11-13 (Rule 32(C)(5)).",
    "effective": "2022-05-01", "url": URL, "fetchedVia": WB, "verified": "2026-10-08",
    "script": "research/scripts/cs_parse_alabama.py",
}, rows)
