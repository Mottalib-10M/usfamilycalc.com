"""Maryland: parse the schedule of basic child support obligations in Md. Code Family Law § 12-204(e)."""
import json, os, re
from _cs_common import *

URL = "https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gfl&section=12-204&enactments=false"
t = html_to_text(download(URL, "md-12-204.html"))
a = t.find("(e) Schedule of basic child support obligations"); b = t.find("(f) The adjusted basic", a)
rows, ssr = [], []
for line in t[a:b].splitlines():
    toks = line.split()
    if len(toks) == 7 and re.fullmatch(r"(0[–-])?\d+", toks[0]) and all(re.fullmatch(r"\*?\d+", x) for x in toks[1:]):
        inc = int(re.sub(r"^0[–-]", "", toks[0]))
        rows.append([inc] + [int(x.strip("*")) for x in toks[1:]])
        ssr.append([inc] + [x.startswith("*") for x in toks[1:]])
incs = [r[0] for r in rows]
assert incs[0] == 1200 and incs[-1] == 30000 and all(b - a == 50 for a, b in zip(incs, incs[1:])), "unexpected grid"
out = {"slug": "maryland", "source": URL, "section": "Md. Code, Family Law § 12-204(e)", "period": "monthly",
       "columns": ["combined adjusted actual monthly income", "1 child", "2 children", "3 children", "4 children", "5 children", "6 or more children"],
       "note": "First row is the statutory range 0-1200 (stored as 1200). Cells flagged true in selfSupportReserveFlags carry an asterisk in the statute (obligation adjusted by the self-support reserve).",
       "rows": rows, "selfSupportReserveFlags": ssr}
json.dump(out, open(os.path.join(RESEARCH, "cs-schedules", "maryland.json"), "w"), indent=None, separators=(",", ":"))
print(len(rows), "rows", rows[0], rows[-1])
