#!/usr/bin/env python3
"""Fetch current Utah Code section text: reads versionArr from le.utah.gov section page, then the version file.
usage: probate_utah.py 75-3-S803 ..."""
import sys, re, subprocess, html, os
RAW = os.path.join(os.path.dirname(__file__), '..', 'raw')
def get(u): return subprocess.run(['curl', '-sL', '-m', '40', '-A', 'Mozilla/5.0', u], capture_output=True).stdout.decode('utf-8', 'replace')
for s in sys.argv[1:]:
    t, c = s.split('-')[0], s.split('-')[1]
    base = f'https://le.utah.gov/xcode/Title{t}/Chapter{c}/'
    page = get(base + s + '.html')
    m = re.search(r"versionDefault=\"([^\"]+)\"", page)
    if not m: print('=====', s, 'no version'); continue
    url = base + m.group(1) + '.html'
    body = get(url)
    txt = ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', re.sub(r'(?is)<(script|style).*?</\1>', ' ', body))).split())
    open(os.path.join(RAW, f'probate-ut-{s}.txt'), 'w').write(txt)
    print('=====', s, url); print(txt[:1800])
