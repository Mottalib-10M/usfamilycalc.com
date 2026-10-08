#!/usr/bin/env python3
"""usage: probate_grab.py RAWNAME N marker [marker...] -> prints N chars after the LAST occurrence of each marker in research/raw/probate-RAWNAME.txt"""
import sys, os
t = ' '.join(open(os.path.join(os.path.dirname(__file__), '..', 'raw', f'probate-{sys.argv[1]}.txt'), errors='ignore').read().split())
n = int(sys.argv[2])
for m in sys.argv[3:]:
    i = t.rfind(m)
    print('=====', m, '(not found)' if i < 0 else ''); print(t[i:i+n] if i >= 0 else '')
