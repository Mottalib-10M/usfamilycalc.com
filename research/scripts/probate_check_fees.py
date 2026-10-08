#!/usr/bin/env python3
"""Checks every research/probate/fees/*.json: computes each schedule for each testCase and compares."""
import json, glob, os
def calc(s, base):
    if s.get('tiers'):
        tot, prev = 0.0, 0.0
        for t in s['tiers']:
            hi = t['upTo'] if t['upTo'] is not None else float('inf')
            if base > prev: tot += (min(base, hi) - prev) * t['pct'] / 100
            prev = hi
        return round(tot, 2)
    for b in s['fixed']:
        if b['upTo'] is None or base <= b['upTo']:
            pct = b.get('pct') or 0
            part = base if b.get('pctOf', 'total') == 'total' else base - b.get('over', 0)
            return round(b.get('fee', 0) + part * pct / 100, 2)
bad = 0
for f in sorted(glob.glob(os.path.join(os.path.dirname(__file__), '..', 'probate', 'fees', '*.json'))):
    d = json.load(open(f)); sch = {s['who']: s for s in d['schedules']}
    for tc in d['testCases']:
        for who, exp in tc['expected'].items():
            got = calc(sch[who], tc['estate']) if who in sch else 'MISSING WHO'
            ok = got == exp
            bad += not ok
            print(('OK ' if ok else 'BAD'), d['slug'], tc['estate'], who[:50], exp, got)
print('failures:', bad)
