#!/usr/bin/env python3
"""Shared helpers for the child-support schedule parsers (cs_parse_<state>.py).

Each parser re-downloads the official document into research/raw/, extracts its text with pypdf
(or strips HTML), parses every schedule row and writes research/cs-schedules/<slug>.json.
"""
import html, json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.normpath(os.path.join(HERE, "..", "raw"))
OUT = os.path.normpath(os.path.join(HERE, "..", "cs-schedules"))


def download(url, name, wayback=False, refresh=True):
    path = os.path.join(RAW, name)
    if refresh or not os.path.exists(path):
        u = ("https://web.archive.org/web/2026/" + url) if wayback else url
        subprocess.run(["curl", "-sL", "--max-time", "120", "-A",
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", u, "-o", path], check=True)
    return path


def pdf_text(path, pages=None, layout=False):
    from pypdf import PdfReader
    r = PdfReader(path)
    idx = range(len(r.pages)) if pages is None else pages
    if layout:
        return "\n".join((r.pages[i].extract_text(extraction_mode="layout") or "") for i in idx)
    return "\n".join((r.pages[i].extract_text() or "") for i in idx)


def html_text(path):
    t = open(path, encoding="utf-8", errors="ignore").read()
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S | re.I)
    t = re.sub(r"<br\s*/?>|</p>|</tr>|</div>|</li>", "\n", t, flags=re.I)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    return t


NUM = r"\$?\s*\d{1,3}(?:,\d{3})+(?:\.\d{2})?|\$?\s*\d+(?:\.\d{2})?"


def to_num(s):
    s = s.replace("$", "").replace(",", "").strip()
    v = float(s)
    return int(v) if v == int(v) and "." not in s else v


def parse_rows(text, ncols, line_filter=None):
    """Return rows [income, c1..cN] from lines made of exactly 1+ncols numbers."""
    rows = []
    pat = re.compile(r"^\s*(" + NUM + r")(?:\s+(" + NUM + r")){" + str(ncols) + r"}\s*$")
    for line in text.splitlines():
        line = line.replace(" ", " ")
        if line_filter:
            line = line_filter(line)
        if not pat.match(line):
            continue
        toks = re.findall(NUM, line)
        toks = [to_num(t) for t in toks]
        if len(toks) == ncols + 1:
            rows.append(toks)
    return rows


def check(rows, step=None, start=None):
    """Sanity checks: strictly increasing income, constant step (if given), columns non-decreasing."""
    problems = []
    for i in range(1, len(rows)):
        if rows[i][0] <= rows[i - 1][0]:
            problems.append(("income order", rows[i - 1][0], rows[i][0]))
        elif step and round(rows[i][0] - rows[i - 1][0], 2) != step:
            problems.append(("step", rows[i - 1][0], rows[i][0]))
        for c in range(1, len(rows[i])):
            if rows[i][c] < rows[i - 1][c]:
                problems.append(("col decreasing", c, rows[i - 1][0], rows[i][0]))
    for r in rows:
        for c in range(2, len(r)):
            if r[c] < r[c - 1]:
                problems.append(("row not increasing with children", r[0]))
                break
    if start is not None and rows and rows[0][0] != start:
        problems.append(("start", rows[0][0]))
    return problems


def write(slug, meta, rows):
    os.makedirs(OUT, exist_ok=True)
    doc = dict(meta)
    doc["rows"] = rows
    doc["rowCount"] = len(rows)
    with open(os.path.join(OUT, slug + ".json"), "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=None, separators=(",", ":"))
        f.write("\n")
    return os.path.join(OUT, slug + ".json")


def sample(rows, k=8, seed=7):
    import random
    rnd = random.Random(seed)
    return [rows[i] for i in sorted(rnd.sample(range(len(rows)), min(k, len(rows))))]
