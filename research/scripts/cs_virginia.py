#!/usr/bin/env python3
"""Re-download Va. Code § 20-108.2 from law.lis.virginia.gov and parse the
Schedule of Monthly Basic Child Support Obligations (subsection B).
Output: research/cs-schedules/virginia.json"""
import re, html, json, os, subprocess
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = "https://law.lis.virginia.gov/vacode/title20/chapter6.1/section20-108.2/"
RAW = os.path.join(BASE, "raw", "va-20-108.2.html")
subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", "-o", RAW, URL], check=True)
t = open(RAW, encoding="utf-8").read()
t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
t = html.unescape(re.sub(r"<[^>]+>", " ", t))
t = re.sub(r"\s+", " ", t)
i = t.index("SCHEDULE OF MONTHLY BASIC CHILD SUPPORT OBLIGATIONS")
j = t.index("For gross monthly incomes above", i)
body = t[i:j]
body = body[body.rindex("CHILDREN") + len("CHILDREN"):]
body = body.replace("0-350", "350")  # first row covers 0-350
nums = [int(x) for x in body.split()]
assert len(nums) % 7 == 0, len(nums)
rows = [nums[k:k + 7] for k in range(0, len(nums), 7)]
for a, b in zip(rows, rows[1:]):
    assert b[0] - a[0] == 50, (a, b)
pct = re.search(r"b ([\d.]+)% ([\d.]+)% ([\d.]+)% ([\d.]+)% ([\d.]+)% ([\d.]+)%", t[j:j + 600])
out = {
    "slug": "virginia", "source": URL, "retrieved": "2026-10-08",
    "period": "monthly", "incomeBasis": "combined monthly gross income",
    "columns": ["combinedIncome", "c1", "c2", "c3", "c4", "c5", "c6"],
    "note": "First row is printed '0-350' in the statute (income 0 to 350); stored here as 350.",
    "aboveMax": {"from": rows[-1][0], "pctOfExcess": [float(x) for x in pct.groups()]},
    "rows": rows,
}
json.dump(out, open(os.path.join(BASE, "cs-schedules", "virginia.json"), "w"), indent=None, separators=(",", ":"))
print(len(rows), rows[0], rows[-1], out["aboveMax"])
