#!/usr/bin/env python3
"""Re-download Texas Family Code ch. 154 (official file server behind statutes.capitol.texas.gov)
and the OAG calculator config, then print the § 154.125 percentages, the § 154.129 multiple-family
tables and the OAG income cap. Source for research/cs/texas.json."""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from cs_fetch_text import text_of

RAW = os.path.join(os.path.dirname(__file__), "..", "raw")
STAT = "https://tcss.legis.texas.gov/resources/FA/htm/FA.154.htm"
CALC = "https://csapps.oag.texas.gov/monthly-child-support-calculator"
UA = "Mozilla/5.0 (Macintosh) Chrome/126"

subprocess.run(["curl", "-sL", "-A", UA, STAT, "-o", os.path.join(RAW, "tx-fa-154.htm")], check=True)
subprocess.run(["curl", "-sL", "-A", UA, CALC, "-o", os.path.join(RAW, "tx-oag-calculator.html")], check=True)

t = text_of(os.path.join(RAW, "tx-fa-154.htm"))


def section(num):
    i = t.find(f"Sec. {num}.")
    j = t.find("Sec. 154.", i + 15)
    return t[i:j]


s125 = section("154.125")
print("154.125 standard:", re.findall(r"(\d) child(?:ren)? (\d+)% of Obligor", s125.split("LOW-INCOME")[0]))
print("154.125 low-income:", re.findall(r"(\d) child(?:ren)? (\d+)% of Obligor", s125.split("LOW-INCOME")[1]))

s129 = section("154.129")
out = {}
for name, part in (("standard", s129.split("(b)")[0]), ("lowIncome", s129.split("(b)")[1])):
    rows = []
    for k in range(8):
        m = re.search(rf"(?:Number of|other|children for|whom the|obligor|has a|duty of|support) {k} ((?:\d+\.\d\d ?){{7}})", part)
        rows.append([k] + [float(x) for x in m.group(1).split()])
    out[name] = rows
print(json.dumps(out))

h = open(os.path.join(RAW, "tx-oag-calculator.html"), errors="ignore").read()
cfg = json.loads(re.search(r'drupal-settings-json">(.*?)</script>', h, re.S).group(1))["cs_calc_vars"]
print("OAG income_cap:", cfg["income_cap"], "low-income threshold:", cfg["cs_guidelines_low_inc_threshold"],
      "standard_deduction:", cfg["standard_deduction"], "max_oasdi:", cfg["max_oasdi"])
