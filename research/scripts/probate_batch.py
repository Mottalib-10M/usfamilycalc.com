#!/usr/bin/env python3
"""Batch fetch: stdin lines 'name|url|marker[|chars]'. Saves raw via probate_fetch.py, prints text from the
first occurrence of marker (or the start). Replayable."""
import sys, subprocess, os
D = os.path.dirname(__file__)
for line in sys.stdin:
    line = line.strip()
    if not line or line.startswith('#'): continue
    p = line.split('|'); name, url, marker = p[0], p[1], (p[2] if len(p) > 2 else '')
    n = int(p[3]) if len(p) > 3 else 1800
    r = subprocess.run([sys.executable, os.path.join(D, 'probate_fetch.py'), name, url, '^$'], capture_output=True, text=True)
    head = [l for l in r.stdout.splitlines() if l.startswith('##')]
    print('=====', name, ' / '.join(h[3:200] for h in head))
    try:
        t = ' '.join(open(os.path.join(D, '..', 'raw', f'probate-{name}.txt'), errors='ignore').read().split())
    except FileNotFoundError:
        print('  (no file)'); continue
    i = t.find(marker) if marker else 0
    print(t[max(i, 0):max(i, 0) + n] if i >= 0 else '  (marker not found) ' + t[:300])
