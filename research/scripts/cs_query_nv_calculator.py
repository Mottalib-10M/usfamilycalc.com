#!/usr/bin/env python3
"""Query the official Nevada Child Support Guidelines Calculator (linked from
https://dwss.nv.gov/programs/child-support/child-support-guidelines/) for primary-custody test cases.
Usage: python3 cs_query_nv_calculator.py [year] [gmi children]..."""
import html, re, sys, urllib.parse, urllib.request, http.cookiejar

URL = "https://nvchildsupportguidelinescalculator.azurewebsites.net/getobligation.aspx"
cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
op.addheaders = [("User-Agent", "Mozilla/5.0")]


def fields(page):
    return {m.group(1): html.unescape(m.group(2)) for m in
            re.finditer(r'<input type="hidden" name="([^"]+)" id="[^"]*" value="([^"]*)"', page)}


def post(data):
    return op.open(URL, urllib.parse.urlencode(data).encode()).read().decode("utf-8", "ignore")


def obligation(year, gmi, children):
    page = op.open(URL).read().decode("utf-8", "ignore")
    f = fields(page)
    f.update({"ddCalculationYear": str(year), "__EVENTTARGET": "ddCalculationYear", "txtNcpGMI": "0", "txtCstNumChildren": "0"})
    page = post(f)
    f = fields(page)
    f.update({"ddCalculationYear": str(year), "txtNcpGMI": str(gmi), "txtCstNumChildren": str(children), "btnObligation": "Calculate"})
    page = post(f)
    text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<script.*?</script>", "", page, flags=re.S))))
    m = re.search(r'id="txtObligation"[^>]*value="([^"]*)"', page) or re.search(r'id="lblObligation"[^>]*>([^<]*)<', page)
    return (m.group(1) if m else None), text


if __name__ == "__main__":
    year = sys.argv[1] if len(sys.argv) > 1 else "2026"
    pairs = sys.argv[2:] or ["5000", "1", "8000", "2", "12000", "3", "1500", "1", "15000", "5"]
    for g, c in zip(pairs[0::2], pairs[1::2]):
        val, text = obligation(year, g, c)
        i = text.find("Respondent's Obligation: $", text.find("Calculation Year"))
        j = text.find("Respondent's Obligation", i + 30)
        print(year, g, c, "->", text[i:j].strip())


def joint(year, gmi_resp, kids_with_pet, gmi_pet, kids_with_resp):
    """Joint/Mixed custody mode of the official calculator (NAC 425.115(3)-(4) offset)."""
    page = op.open(URL).read().decode("utf-8", "ignore")
    f = fields(page)
    f.update({"ddCalculationYear": str(year), "txtNcpGMI": "0", "txtCstNumChildren": "0", "btnMixed": "Switch to Joint/Mixed"})
    page = post(f)
    f = fields(page)
    f.update({"ddCalculationYear": str(year), "txtNcpGMI": str(gmi_resp), "txtCstNumChildren": str(kids_with_pet),
              "txtCstGMI": str(gmi_pet), "txtNcpNumChildren": str(kids_with_resp), "btnObligation": "Calculate"})
    page = post(f)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<script.*?</script>|<style.*?</style>", "", page, flags=re.S))))
