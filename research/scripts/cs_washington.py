"""Washington: parse the economic table in RCW 26.19.020 (version effective January 1, 2026, 2025 c 272 s 14).
The table is published in two parts (1-2 children, then 3-5 children); amounts are PER CHILD."""
import json, os, re
from _cs_common import *

URL = "https://app.leg.wa.gov/RCW/default.aspx?cite=26.19.020"
t = html_to_text(download(URL, "wa-26.19.020.html"))
a = t.find("ECONOMIC TABLE"); b = t.find("The economic table is presumptive", a)
body = t[a:b]
p2 = body.find("three\nchildren")
assert p2 > 0


def parse(seg, ncols):
    toks = [x.strip() for x in seg.split("\n") if re.fullmatch(r"\s*\d+\s*", x)]
    out = {}
    for i in range(0, len(toks), ncols + 1):
        grp = [int(x) for x in toks[i:i + ncols + 1]]
        assert len(grp) == ncols + 1, grp
        out[grp[0]] = grp[1:]
    return out


part1 = parse(body[body.find("RCW 26.19.065(2).") + 17:p2], 2)
p2b = body.find("RCW 26.19.065(2).", p2) + 17
part2 = parse(body[p2b:], 3)
assert list(part1) == list(part2)
incs = list(part1)
assert incs[0] == 2200 and incs[-1] == 50000 and all(y - x == 100 for x, y in zip(incs, incs[1:]))
rows = [[i] + part1[i] + part2[i] for i in incs]
out = {"slug": "washington", "source": URL, "section": "RCW 26.19.020 (as amended by Laws of 2025, ch. 272, § 14, effective January 1, 2026)",
       "period": "monthly",
       "columns": ["combined monthly net income", "per-child amount, one-child family", "per-child amount, two-children family", "per-child amount, three-children family", "per-child amount, four-children family", "per-child amount, five-children family"],
       "note": "Amounts are the monthly basic support obligation PER CHILD; multiply by the number of children for the family total. The 2026 table has no age columns (the former 0-11 / 12-18 split is gone). Below $2,200 combined net income the obligation is based on the resources and living expenses of each household; minimum $50 per child per month except as allowed by RCW 26.19.065(2).",
       "rows": rows}
json.dump(out, open(os.path.join(RESEARCH, "cs-schedules", "washington.json"), "w"), separators=(",", ":"))
print(len(rows), "rows", rows[0], rows[-1])
