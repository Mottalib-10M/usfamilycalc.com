#!/usr/bin/env python3
"""Re-download the official WC rate sources used for research/wc/{AL..KS}.json
and print the passages containing the max/min figures, for re-verification.

Usage: python3 wc_check_sources.py
Notes:
- Alabama SAWW notice is a scanned image (no text layer): saved to raw/ for visual check.
- Some hosts block automated clients (azica.gov, cdle.colorado.gov, dol.ks.gov,
  iic.idaho.gov, ilga.gov, capitol.hawaii.gov); the script reports the failure.
"""
import io, re, subprocess, html, os, sys

RAW = os.path.join(os.path.dirname(__file__), "..", "raw")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36"

SOURCES = [
    ("AL", "https://workforce.alabama.gov/documents/states-average-weekly-wage/", "pdf-image", None),
    ("AK", "https://labor.alaska.gov/wc/bulletins/25-06.pdf", "pdf", r"maximum compensation rate|minimum compensation rate"),
    ("AZ", "https://www.azica.gov/claims-amw-statutory-maximum-information-page", "html", r"\$6,131\.00"),
    ("AR", "https://labor.arkansas.gov/wp-content/uploads/Advisory-2000-1-CY26_formatted.pdf", "pdf", r"maximums in 2026|minimum weekly"),
    ("CA", "https://www.dir.ca.gov/DIRNews/2025/2025-116.html", "html", r"minimum|maximum"),
    ("CO", "https://codwc.box.com/shared/static/9def89oiq7q4z24v2y4axffrgfuehf5g.pdf", "pdf", r"Maximum Compensation Benefit Rate"),
    ("CT", "https://portal.ct.gov/wcc/knowledge-base/articles/news-and-memos/2026/memo-2026-05", "html", r"effective October 1, 2026"),
    ("DE", "https://industrialaffairs.delaware.gov/hubfs/Workers%20Compensation%20Rate%20Letter%202026.pdf", "pdf", r"maximum weekly|minimum workers"),
    ("DC", "https://does.dc.gov/sites/default/files/dc/sites/does/publication/attachments/Supplemental%20Allowance%20Min-Max%202026.pdf", "pdf", r"01/01/26"),
    ("FL", "https://myfloridacfo.com/docs-sf/workers-compensation-libraries/workers-comp-documents/bulletins/max-comp-rate-2026---information-bulletin.pdf", "pdf", r"shall be \$"),
    ("GA", "https://sbwc.georgia.gov/frequently-asked-questions/workers-compensation-law-faqs", "html", r"not more than \$"),
    ("HI", "https://labor.hawaii.gov/dcd/files/2025/12/2026-Maximum-Weekly-Wage-Base.pdf", "pdf", r"Maximum Weekly Benefit Amount"),
    ("ID", "https://iic.idaho.gov/wp-content/uploads/2025/09/2026-Comp-Rate-Benefits.pdf", "pdf", r"MAXIMUM|MINIMUM"),
    ("IL", "https://iwcc.illinois.gov/resources/resources-for/benefits.html", "html", r"07/15/2026"),
    ("IN", "https://www.in.gov/dA/5bdd77d9c6/PPIandTTD-benefits2023_1.3_.pdf?language_id=1", "pdf", r"7/1/26"),
    ("IA", "https://dial.iowa.gov/hearings/workers-comp/rates", "html", r"July 1, 2026, through June 30, 2027"),
    ("KS", "https://www.dol.ks.gov/workers-compensation", "html", r"maximum"),
]


def get(url):
    r = subprocess.run(["curl", "-sL", "--compressed", "-m", "60", "-A", UA, url], capture_output=True)
    return r.stdout


def text_of(kind, data):
    if kind.startswith("pdf"):
        from pypdf import PdfReader
        try:
            return " ".join((p.extract_text() or "") for p in PdfReader(io.BytesIO(data)).pages)
        except Exception as e:
            return f"<pdf error {e}>"
    t = data.decode("utf-8", "ignore")
    t = re.sub(r"(?is)<(script|style).*?</\1>", " ", t)
    return html.unescape(re.sub(r"<[^>]+>", " ", t))


for st, url, kind, pat in SOURCES:
    data = get(url)
    print(f"== {st} {url} ({len(data)} bytes)")
    if not data:
        print("   FAILED (blocked or unreachable)")
        continue
    if kind == "pdf-image":
        p = os.path.join(RAW, f"{st.lower()}-source.pdf")
        open(p, "wb").write(data)
        print(f"   scanned PDF saved to {p}; read the image visually")
        continue
    t = re.sub(r"\s+", " ", text_of(kind, data))
    hits = [m.start() for m in re.finditer(pat, t, re.I)] if pat else []
    if not hits:
        print("   pattern not found (page may be JS-rendered or blocked)")
    for i in hits[:3]:
        print("   ...", t[max(0, i - 150): i + 250])
