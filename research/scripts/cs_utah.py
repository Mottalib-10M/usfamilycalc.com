#!/usr/bin/env python3
"""Re-download Utah Code 81-6-304 (base combined child support obligation table, both parents) and
81-6-305 (low income table, obligor parent only) from le.utah.gov (current versions, effective 9/1/2024)
and parse them into research/cs-schedules/utah.json.  Usage: python3 research/scripts/cs_utah.py"""
import html, json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.dirname(HERE)
BASE = "https://le.utah.gov/xcode/Title81/Chapter6/"
URLS = {"304": BASE + "C81-6-S304_2024090120240501.html", "305": BASE + "C81-6-S305_2024090120240501.html"}


def table(sec):
    path = os.path.join(RES, "raw", "ut-81-6-%s.html" % sec)
    subprocess.run(["curl", "-sL", "-m", "120", "-A", "Mozilla/5.0", "-o", path, URLS[sec]], check=True)
    t = open(path, encoding="utf-8", errors="ignore").read()
    assert "Effective 9/1/2024" in t
    rows = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", t, flags=re.S):
        tds = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", td))).strip()
               for td in re.findall(r"<td[^>]*>(.*?)</td>", tr, flags=re.S)]
        if len(tds) == 9 and re.fullmatch(r"[\d,]+ -", tds[1] or "x"):
            lo = int(tds[1].rstrip(" -").replace(",", ""))
            hi = int(tds[2].replace(",", ""))
            vals = [int(v.replace(",", "")) if v else None for v in tds[3:]]
            rows.append([lo, hi] + vals)
    return rows


base = table("304")
low = table("305")
for rows in (base, low):
    for a, b in zip(rows, rows[1:]):
        assert b[0] == a[1] + 1, (a, b)          # contiguous brackets
        assert all(x is None or y is None or x <= y for x, y in zip(a[2:], b[2:])), (a, b)
assert base[0][:2] == [1951, 2000] and base[-1][1] == 100000, (base[0], base[-1])
out = {
    "slug": "utah",
    "source": URLS["304"],
    "edition": "Utah Code 81-6-304, base combined child support obligation table -- both parents -- orders entered on or after January 1, 2023 (Effective 9/1/2024, renumbered from 78B-12-301 by Laws 2024, ch. 366)",
    "period": "monthly",
    "incomeBasis": "combined monthly adjusted gross income",
    "columns": ["incomeFrom", "incomeTo", "1", "2", "3", "4", "5", "6"],
    "rows": base,
    "note": "null = no amount printed in 81-6-304 for that income/number of children (the low income table of 81-6-305 governs there).",
    "lowIncomeTable": {
        "source": URLS["305"],
        "edition": "Utah Code 81-6-305, low income table -- obligor parent only -- orders entered on or after January 1, 2023 (Effective 9/1/2024)",
        "incomeBasis": "obligor parent's monthly adjusted gross income",
        "columns": ["incomeFrom", "incomeTo", "1", "2", "3", "4", "5", "6"],
        "rows": low,
    },
}
json.dump(out, open(os.path.join(RES, "cs-schedules", "utah.json"), "w"), indent=0)
print("base", len(base), base[0], base[-1]); print("low", len(low), low[0], low[-1])
