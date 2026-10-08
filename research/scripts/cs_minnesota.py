"""Minnesota: parse the guideline basic support schedule in Minn. Stat. § 518A.35, subd. 2 (revisor.mn.gov)."""
import json, os, re
from _cs_common import *

URL = "https://www.revisor.mn.gov/statutes/cite/518A.35"
t = html_to_text(download(URL, "mn-518A.35.html"))
a = t.find("Subd. 2.Basic support; guideline."); b = t.find("Subd. 3.Income cap", a)
lines = [l.strip() for l in t[a:b].splitlines() if l.strip()]
rows, i = [], 0
while i < len(lines):
    m = re.fullmatch(r"\$?([\d,]+)\s*-\s*\$?([\d,]+)", lines[i])
    top = lines[i].startswith("20,000 and over")
    if m or top:
        lo = 20000 if top else num(m.group(1)); hi = None if top else num(m.group(2))
        vals = [num(x) for x in lines[i + 1:i + 7]]
        rows.append([lo] + vals); i += 7
    else:
        i += 1
lo = [r[0] for r in rows]
assert lo[0] == 0 and lo[1] == 1400 and lo[-1] == 20000 and all(b - a == 100 for a, b in zip(lo[1:], lo[2:])), "unexpected grid"
out = {"slug": "minnesota", "source": URL, "section": "Minn. Stat. § 518A.35, subd. 2", "period": "monthly",
       "columns": ["lower bound of combined PICS bracket (row covers lower bound to lower bound + 99; first row covers $0-$1,399; last row = $20,000 and over)", "1 child", "2 children", "3 children", "4 children", "5 children", "6 children"],
       "rows": rows}
json.dump(out, open(os.path.join(RESEARCH, "cs-schedules", "minnesota.json"), "w"), separators=(",", ":"))
print(len(rows), "rows", rows[:2], rows[-1])
