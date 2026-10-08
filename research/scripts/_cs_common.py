"""Shared helpers for the child support schedule parsers (re-download + text extraction)."""
import html, os, re, subprocess

RESEARCH = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(RESEARCH, "raw")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"


def download(url, name):
    """Re-download url into raw/<name>; keep the previously saved copy if the server refuses (429/403...)."""
    path = os.path.join(RAW, name)
    tmp = path + ".part"
    r = subprocess.run(["curl", "-sL", "-m", "300", "-A", UA, "-H", "Accept: text/html,application/pdf,*/*",
                        "-o", tmp, "-w", "%{http_code}", url], capture_output=True, text=True)
    ok = r.stdout.strip() == "200" and os.path.getsize(tmp) > 1000
    if ok and name.endswith(".pdf"):
        ok = open(tmp, "rb").read(5) == b"%PDF-"
    if ok:
        os.replace(tmp, path)
    else:
        if os.path.exists(tmp):
            os.remove(tmp)
        print(f"warning: download of {url} failed (HTTP {r.stdout.strip()}); using saved copy {path}")
        if not os.path.exists(path):
            raise SystemExit("no saved copy")
    return path


def html_to_text(path):
    t = open(path, encoding="utf-8", errors="ignore").read()
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S | re.I)
    t = re.sub(r"<(br|/p|/tr|/div|/h\d|/li)[^>]*>", "\n", t, flags=re.I)
    t = re.sub(r"</t[dh]>", " ", t, flags=re.I)
    t = re.sub(r"<[^>]+>", "", t)
    t = html.unescape(t)
    t = re.sub(r"[ \xa0\t]+", " ", t)
    t = re.sub(r"\n\s*\n+", "\n", t)
    return t


def pdf_to_text(path, layout=False):
    from pypdf import PdfReader
    r = PdfReader(path)
    out = []
    for p in r.pages:
        out.append(p.extract_text(extraction_mode="layout") if layout else p.extract_text())
    return "\n".join(out)


def num(s):
    s = s.replace(",", "").replace("$", "").replace("*", "").strip()
    return float(s) if "." in s else int(s)
