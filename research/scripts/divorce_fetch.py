#!/usr/bin/env python3
"""Fetch an official page (direct, else Internet Archive copy), save it under raw/divorce/, print text around keywords.
usage: divorce_fetch.py NAME URL [kw1 kw2 ...]  (env W=width)"""
import sys, os, re, html, subprocess, io
RAW = os.path.join(os.path.dirname(__file__), '..', 'raw', 'divorce')
name, url, kws = sys.argv[1], sys.argv[2], sys.argv[3:]
W = int(os.environ.get('W', '500'))
def get(u):
    out = os.path.join(RAW, name)
    r = subprocess.run(['curl', '-sL', '-m', '40', '-A', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36', '-o', out, '-w', '%{http_code}', u], capture_output=True, text=True)
    ok = r.stdout.strip() == '200' and os.path.exists(out) and os.path.getsize(out) > 800
    return ok, out
ok, out = get(url); src = url
if not ok and os.environ.get('NOARCH') != '1':
    src = 'https://web.archive.org/web/2026/' + url
    ok, out = get(src)
print('SOURCE:', src, 'OK' if ok else 'FAIL')
if not ok: sys.exit(1)
data = open(out, 'rb').read()
if data[:4] == b'%PDF':
    from pypdf import PdfReader
    t = '\n'.join((p.extract_text() or '') for p in PdfReader(io.BytesIO(data)).pages)
else:
    t = data.decode('utf-8', 'ignore')
    t = re.sub(r'(?is)<(script|style).*?</\1>', ' ', t)
    t = html.unescape(re.sub(r'<[^>]+>', ' ', t))
t = re.sub(r'\s+', ' ', t)
open(out + '.txt', 'w').write(t)
if not kws: print(t[:W*4])
for k in kws:
    for m in list(re.finditer(re.escape(k), t, re.I))[:int(os.environ.get('N', '2'))]:
        print(f'--- [{k}]', t[max(0, m.start()-W):m.end()+W])
