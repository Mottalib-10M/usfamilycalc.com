#!/usr/bin/env python3
"""Replayable fetcher for the probate dataset.
usage: probate_fetch.py NAME URL [regex ...]
Downloads URL (falls back to the Internet Archive copy) into research/raw/probate-NAME.(html|pdf),
writes plain text to research/raw/probate-NAME.txt and prints the text (or lines around each regex)."""
import sys, re, subprocess, os, html, io
RAW = os.path.join(os.path.dirname(__file__), '..', 'raw')
EFFECTIVE = ''
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'

def get(url):
    r = subprocess.run(['curl', '-sL', '--max-time', '45', '-A', UA, '-w', '\n%{http_code} %{url_effective}', url], capture_output=True)
    body, _, tail = r.stdout.rpartition(b'\n')
    code, _, eff = tail.decode().partition(' ')
    global EFFECTIVE; EFFECTIVE = eff
    return int(code or 0), body

def to_text(body):
    if body[:4] == b'%PDF':
        from pypdf import PdfReader
        return 'pdf', '\n'.join((p.extract_text() or '') for p in PdfReader(io.BytesIO(body)).pages)
    t = body.decode('utf-8', 'replace')
    t = re.sub(r'(?is)<(script|style).*?</\1>', ' ', t)
    t = re.sub(r'(?i)<br\s*/?>|</p>|</div>|</tr>|</li>|</h\d>', '\n', t)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = html.unescape(t)
    t = re.sub(r'[ \t\xa0]+', ' ', t)
    t = re.sub(r'\n\s*\n+', '\n', t)
    return 'html', t

def main():
    name, url, pats = sys.argv[1], sys.argv[2], sys.argv[3:]
    code, body = (0, b'') if os.environ.get('ARCHIVE') else get(url)
    src = url
    if code != 200 or len(body) < 800:
        import time
        for attempt in range(5):
            time.sleep(3 + 12 * attempt)
            code2, body2 = get('https://web.archive.org/web/2026/' + url)
            if code2: break
        if code2 == 200:
            print(f'## official returned {code}; using Internet Archive copy')
            body, src = body2, 'https://web.archive.org/web/2026/' + url
        else:
            print(f'## FAILED {code} / archive {code2}'); return
    kind, text = to_text(body)
    open(os.path.join(RAW, f'probate-{name}.{kind}'), 'wb').write(body)
    open(os.path.join(RAW, f'probate-{name}.txt'), 'w').write(text)
    print(f'## {src} -> {EFFECTIVE} ({len(text)} chars)')
    if not pats:
        print(text[:20000]); return
    lines = text.split('\n')
    for p in pats:
        for i, l in enumerate(lines):
            if re.search(p, l, re.I):
                print(f'--[{p}] L{i}:', ' '.join(lines[max(0, i-1):i+3])[:1500])
main()
