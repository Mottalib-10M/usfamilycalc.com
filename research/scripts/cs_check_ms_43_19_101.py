#!/usr/bin/env python3
"""Mississippi: download the last enacted amendment of Miss. Code § 43-19-101 (HB 1067, 2022, ch. 365,
eff. July 1, 2022) and list every 2023-2026 bill whose title mentions child support, with its
disposition, to show that no later amendment was enacted. Source: billstatus.ls.state.ms.us."""
import os, re, subprocess, urllib.request
from pypdf import PdfReader

RAW = os.path.join(os.path.dirname(__file__), "..", "raw")
UA = {"User-Agent": "Mozilla/5.0"}


def get(url):
    return subprocess.run(["curl", "-sL", "-m", "60", "-A", "Mozilla/5.0", url], capture_output=True, check=True).stdout


pdf = os.path.join(RAW, "ms-hb1067-2022-SG.pdf")
open(pdf, "wb").write(get("https://billstatus.ls.state.ms.us/documents/2022/pdf/HB/1000-1099/HB1067SG.pdf"))
t = "\n".join(p.extract_text() for p in PdfReader(pdf).pages)
print("percentages:", re.findall(r"\n\s+(\d(?: or more)?)\s+(\d\d)% \d+", t))
flat = re.sub(r"\s+\d+\s*\n|\s+", " ", t)
print("findings band:", re.search(r"\(\$100,000\.00\) or less than Ten Thousand Dollars \(\$10,000\.00\)", flat) is not None)

for y in (2023, 2024, 2025, 2026):
    x = get(f"https://billstatus.ls.state.ms.us/{y}/pdf/all_measures/allmsrs.xml").decode("latin-1")
    for g in re.findall(r"<MSRGROUP>(.*?)</MSRGROUP>", x, re.S):
        if re.search(r"child.support", g, re.I):
            m = re.sub(r"\s+", "", re.search(r"<MEASURE>(.*?)</MEASURE>", g, re.S).group(1))
            title = re.search(r"<SHORTTITLE>(.*?)</SHORTTITLE>", g, re.S).group(1)
            link = re.search(r"<ACTIONLINK>\.\./(history/.*?)</ACTIONLINK>", g)
            disp = ""
            if link:
                try:
                    h = get(f"https://billstatus.ls.state.ms.us/{y}/pdf/{link.group(1)}").decode("latin-1")
                    d = re.search(r"<DISPOSITION>(.*?)</DISPOSITION>", h)
                    lt = re.search(r"<LONGTITLE>(.*?)</LONGTITLE>", h, re.S)
                    disp = (d.group(1) if d else "") + " | " + (lt.group(1)[:90] if lt else "")
                except Exception as e:
                    disp = str(e)
            print(y, m, "|", title, "|", disp)
