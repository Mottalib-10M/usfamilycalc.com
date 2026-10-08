#!/usr/bin/env python3
"""Download an official page (or its Wayback copy when the official server blocks bots),
strip HTML and print the text around a marker. Replayable source for research/cs/*.json.

Usage: python3 cs_fetch_text.py <url> <outfile-in-raw> [marker] [nchars] [--wayback]
"""
import html, re, subprocess, sys, os

RAW = os.path.join(os.path.dirname(__file__), "..", "raw")


def fetch(url, out, wayback=False):
    if wayback:
        url = "https://web.archive.org/web/2026/" + url
    path = os.path.join(RAW, out)
    subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", url, "-o", path], check=True)
    return path


def text_of(path):
    if path.endswith(".pdf"):
        from pypdf import PdfReader
        return "\n".join((p.extract_text() or "") for p in PdfReader(path).pages)
    t = open(path, encoding="utf-8", errors="ignore").read()
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    return re.sub(r"\s+", " ", t)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--wayback"]
    wb = "--wayback" in sys.argv
    url, out = args[0], args[1]
    marker = args[2] if len(args) > 2 else ""
    n = int(args[3]) if len(args) > 3 else 6000
    t = text_of(fetch(url, out, wb))
    i = max(t.find(marker), 0) if marker else 0
    print(t[i:i + n])
