"""Arizona: parse the Schedule of Basic Support Obligations from the 2022 Arizona Child Support Guidelines
(AOCDRS10H-092122.pdf, effective January 1, 2022, revised September 21, 2022 by AO 2022-116).
The azcourts.gov page links the PDF through a SharePoint guest link; azcourts.gov itself answers 403 to curl,
so the file is fetched through SharePoint's download.aspx with the guest cookie."""
import json, os, re, subprocess
from _cs_common import *

SHARE = "https://azcourts.sharepoint.com/:b:/s/CourtForms/EegNpEjAF6FPiz-0exBurYwBHm1-12aQmw2S55gP9Ga9pw"
DL = "https://azcourts.sharepoint.com/sites/CourtForms/_layouts/15/download.aspx?SourceUrl=%2Fsites%2FCourtForms%2FShared%20Documents%2FAOCDRS10H-092122.pdf"
path = os.path.join(RAW, "az-2022-guidelines.pdf")
jar = os.path.join(RAW, ".sp-cookies")
subprocess.run(["curl", "-sL", "-c", jar, "-b", jar, "-m", "60", "-A", UA, "-o", os.devnull, SHARE])
subprocess.run(["curl", "-sL", "-c", jar, "-b", jar, "-m", "300", "-A", UA, "-o", path + ".part", DL])
if open(path + ".part", "rb").read(5) == b"%PDF-":
    os.replace(path + ".part", path)
else:
    os.remove(path + ".part"); print("warning: download failed, using saved copy")
if os.path.exists(jar):
    os.remove(jar)
t = pdf_to_text(path)
a = t.find("Schedule of Basic Support Obligations", t.find("SCHEDULE OF BASIC SUPPORT OBLIGATION", 8000))
b = t.find("CORRELATION TABLE", a)
seg = t[a:b if b > 0 else len(t)]
rows = []
for line in seg.splitlines():
    toks = line.replace(",", "").split()
    if len(toks) == 7 and all(re.fullmatch(r"\d+", x) for x in toks):
        rows.append([int(x) for x in toks])
incs = [r[0] for r in rows]
assert incs[0] == 750 and incs[-1] == 30000, (incs[0], incs[-1])
assert all(y - x == 50 for x, y in zip(incs, incs[1:])), [(x, y) for x, y in zip(incs, incs[1:]) if y - x != 50][:5]
out = {"slug": "arizona", "section": "Arizona Child Support Guidelines (2022), Schedule of Basic Support Obligations", "period": "monthly",
       "source": "https://www.azcourts.gov/familylaw/Child-Support-Family-Law-Information/Arizona-Child-Support-Guidelines (PDF AOCDRS10H-092122.pdf via " + SHARE + ")",
       "columns": ["combined adjusted child support income (monthly)", "1 child", "2 children", "3 children", "4 children", "5 children", "6 children"],
       "note": "Use the row closest to the combined income; exactly halfway rounds up (Section III.A.1). Above $30,000 the $30,000 row is presumptive (III.A.1.c). More than 6 children: 6-children column is presumptive (III.A.1.b).",
       "rows": rows}
json.dump(out, open(os.path.join(RESEARCH, "cs-schedules", "arizona.json"), "w"), separators=(",", ":"))
print(len(rows), "rows", rows[0], rows[-1])
