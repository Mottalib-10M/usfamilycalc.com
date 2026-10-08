#!/usr/bin/env python3
"""Re-download the Oregon child support guidelines scale (appendix to OAR 137-050-0725, published by
the Oregon DOJ Division of Child Support) and the parenting time credit table (OAR 137-050-0730),
parse them into research/cs-schedules/oregon.json.
Usage: python3 research/scripts/cs_oregon.py"""
import json, os, re, subprocess
from pypdf import PdfReader

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
URL = "https://justice.oregon.gov/child-support/pdf/guidelines_scale.pdf"
URL_PT = "https://justice.oregon.gov/child-support/pdf/137-050-0730.pdf"
RAW = os.path.join(RES, "raw", "or-guidelines_scale.pdf")
RAW_PT = os.path.join(RES, "raw", "or-137-050-0730.pdf")
for u, p in ((URL, RAW), (URL_PT, RAW_PT)):
    subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", p, u], check=True)

INC = re.compile(r"^(\d[\d ]*?)\s*-\s*((?:\d ?)+?)(?=(?: \d+)*$)")
rows = []
for page in PdfReader(RAW).pages:
    lines = [l.strip() for l in page.extract_text().split("\n")]
    incomplete, stream = [], []
    for l in lines:
        m = re.match(r"^(\d+) - (.*)$", l)
        if m and int(m.group(1)) % 50 in (0, 1):
            lo = int(m.group(1))
            want = str(1000 if lo == 0 else lo + 49)
            rest = m.group(2)
            # the upper bound is sometimes printed with spaced digits ("2 9 8 0 0"): consume its digits
            i = k = 0
            while k < len(want):
                if rest[i] == " ":
                    i += 1; continue
                assert rest[i] == want[k], ("bad range line", l)
                i += 1; k += 1
            assert i == len(rest) or rest[i] == " ", ("bad range line", l)
            hi = int(want)
            nums = [int(x) for x in rest[i:].split()]
            rows.append([lo, hi] + nums)
            if len(nums) < 10:
                incomplete.append(rows[-1])
        elif re.fullmatch(r"(\d+ ?)+", l):
            stream += [int(x) for x in l.split()]
    for r in incomplete:
        need = 12 - len(r)
        r += stream[:need]
        stream = stream[need:]
    assert not stream, ("leftover numbers", stream[:20])

assert all(len(r) == 12 for r in rows), [r for r in rows if len(r) != 12][:3]
lows = [r[0] for r in rows]
assert lows[0] == 0 and rows[0][1] == 1000 and lows[1] == 1001 and rows[-1][1] == 30000
assert all(b - a == 50 for a, b in zip(lows[1:], lows[2:]))
for r in rows:
    assert all(x <= y for x, y in zip(r[2:], r[3:])), ("not monotonic across children", r)
for a, b in zip(rows, rows[1:]):
    assert all(x <= y for x, y in zip(a[2:], b[2:])), ("not monotonic down", a, b)

# parenting time credit table (OAR 137-050-0730(6))
t = "\n".join(p.extract_text() for p in PdfReader(RAW_PT).pages)
pt = dict((int(a), float(b)) for a, b in re.findall(r"(?<![\d.])(\d{1,3}) (\d{1,3}\.\d{2})%", t))
assert sorted(pt) == list(range(366)), len(pt)

out = {
    "slug": "oregon",
    "source": URL,
    "edition": "Oregon child support guidelines scale, appendix to OAR 137-050-0725 (form CSF 02 0809F Rev. 02/09/07)",
    "period": "monthly",
    "incomeBasis": "combined adjusted gross income",
    "columns": ["incomeFrom", "incomeTo", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    "rows": rows,
    "lookup": "Use the lower income amount on the scale (OAR 137-050-0725(5)); row = bracket containing the income.",
    "aboveMax": {"over": 30000, "method": "cap", "text": "Same as $30,000 (OAR 137-050-0725(3))"},
    "parentingTimeCredit": {
        "source": URL_PT,
        "formula": "credit% = 1/(1+e^(-7.14*((overnights/365)-0.5))) - 2.74% + (2*2.74%*(overnights/365))",
        "table": [[n, pt[n]] for n in range(366)],
    },
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "oregon.json"), "w"), indent=0)
print(len(rows), "rows", rows[0], rows[-1])
