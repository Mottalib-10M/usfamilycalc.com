#!/usr/bin/env python3
"""Replay the extraction of 2026 workers' comp TTD max/min for ND..WY (17 states).

Re-downloads each official source (direct, then Wayback fallback) and prints the
text around the figures recorded in research/wc/<slug>.json, so they can be
compared by eye. Requires: curl, pypdf, openpyxl.

Usage: python3 wc_rates_nd_to_wy.py [slug ...]
"""
import html, io, re, subprocess, sys, zlib

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"

# slug -> list of (url, needle regex, wayback_fallback)
SOURCES = {
    "north-dakota": [("https://www.workforcesafety.com/about-wsi/reports/north-dakota-weekly-benefit-levels", r"7/1/2026.{0,60}", False)],
    "ohio": [("https://dam.assets.ohio.gov/image/upload/info.bwc.ohio.gov/Workers/CompRates.pdf", r"2026 \$1,281.{0,120}", False)],
    "oklahoma": [("https://www.wcc.ok.gov/home/showpublisheddocument/2469/639035528438400000", r"1/1/26.{0,80}", True)],
    "oregon": [("https://wcd.oregon.gov/Bulletins/bul_111.pdf", r"SAWW is \$1,461\.21.{0,40}|7/1/2023 . 6/30/2027.{0,20}", False)],
    "pennsylvania": [("https://www.pa.gov/content/dam/copapwp-pagov/en/hrmoa/documents/workplace-support/workers-comp/documents/wc-historical-rate-schedules.pdf", r"\$774\.43.{0,10}|\$1,394\.00", False)],
    "rhode-island": [("https://dlt.ri.gov/workers-compensation/insurers-and-adjusters/maximum-compensation-rates", r"Effective date.{0,80}", True)],
    "south-carolina": [("https://wcc.sc.gov/claims/compensation-rates", r"2026 Maximum.{0,400}", True)],
    "south-dakota": [("https://dlr.sd.gov/workers_compensation/rates.aspx", r"Effective July 1, 2026, the minimum.{0,60}", False)],
    "tennessee": [("https://www.tn.gov/workforce/injuries-at-work/injured-workers/injured-workers/benefits/wage-replacement/comp-rates.html", r"Dates Mini Rate.{0,400}", True)],
    "texas": [("https://www.tdi.texas.gov/wc/employee/maxminbens.html", r"2027 \(10/01/26.{0,120}", False)],
    "utah": [("https://laborcommission.utah.gov/wp-content/uploads/2026-Quick-Reference-Guide.pdf", r"Maximum temporary total disability benefits are \$[0-9.]+", False)],
    "vermont": [("https://labor.vermont.gov/minimum-and-maximum-compensation-rates-annual-change", r"7/1/26 to 6/30/27.{0,60}", False)],
    "virginia": [("https://workcomp.virginia.gov/documents/rates-min-max-benefits-cola-mileage", r"Effective July 1, 2026 the (maximum|minimum) compensation rate will be \$[0-9.,]+", True)],
    "washington": [("https://lni.wa.gov/insurance/_docs/maxtlrates.pdf", r"9,981\.00 \(332\.70\)", False),
                   ("https://content.govdelivery.com/accounts/WADLI/bulletins/41de9eb", r"(maximum monthly time-loss rate|15% of the state.s average monthly wage).{0,90}", False)],
    "west-virginia": [("https://www.wvinsurance.gov/LinkClick.aspx?fileticket=Sn8WgOE_vBg%3d&tabid=73&portalid=0&mid=1756", None, False)],
    "wisconsin": [("https://dwd.wisconsin.gov/dwd/publications/wc/WKC-9572-P.pdf", r"TEMPORARY, PERMANENT TOTAL & DEATH BENEFITS WEEKLY RATE.{0,60}", False)],
    "wyoming": [("https://dws.wyo.gov/dws-division/workers-compensation/employers/wage-reporting-and-coverage/", r"2026/QTR 4.{0,40}", False)],
}


def fetch(url):
    r = subprocess.run(["curl", "-sL", "-A", UA, "--max-time", "90", url], capture_output=True)
    b = r.stdout
    if b[:2] == b"\x1f\x8b":
        b = zlib.decompress(b, 47)
    return b


def to_text(b):
    if b[:4] == b"%PDF":
        from pypdf import PdfReader
        return " ".join(" ".join(p.extract_text() or "" for p in PdfReader(io.BytesIO(b)).pages).split())
    if b[:2] == b"PK":
        import openpyxl
        wb = openpyxl.load_workbook(io.BytesIO(b), data_only=True)
        out = []
        for ws in wb:
            for row in ws.iter_rows(values_only=True):
                cells = [str(c) for c in row if c is not None]
                if cells:
                    out.append(" | ".join(cells))
        return "\n".join(out)
    s = b.decode("utf-8", "ignore")
    s = re.sub(r"<(script|style).*?</\1>", "", s, flags=re.S | re.I)
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", s)).split())


def main(slugs):
    for slug in slugs:
        for url, needle, wb in SOURCES[slug]:
            text = to_text(fetch(url))
            hits = re.findall(needle, text) if needle else []
            if needle and not hits and wb:
                text = to_text(fetch("https://web.archive.org/web/2026id_/" + url))
                hits = [m.group(0) for m in re.finditer(needle, text)]
            elif needle:
                hits = [m.group(0) for m in re.finditer(needle, text)]
            print(f"== {slug} :: {url}")
            if needle is None:
                for line in text.splitlines():
                    if line.startswith("2027") or "Weekly Rate" in line or "Weekly " in line:
                        print("  ", line[:200])
            else:
                for h in hits[:4]:
                    print("  ", h)
                if not hits:
                    print("   (no match - source blocked or changed)")


if __name__ == "__main__":
    main(sys.argv[1:] or list(SOURCES))
