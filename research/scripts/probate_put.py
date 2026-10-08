#!/usr/bin/env python3
"""Helper: write a probate part (and optional fee file) from a compact Python dict literal file.
usage: probate_put.py <file.py>  where file defines dict P (part) and optional F (fee file)."""
import json, sys, os, runpy
ROOT = os.path.join(os.path.dirname(__file__), '..', 'probate')
g = runpy.run_path(sys.argv[1])
P = g['P']; P.setdefault('verified', '2026-10-08')
order = ['slug','name','abbr','verified','creditorClaims','earliestClose','smallEstate','simplified','filingFee','personalRepFee','attorneyFee','uncertain']
P = {k: P[k] for k in order if k in P}
json.dump(P, open(os.path.join(ROOT, 'parts', P['slug'] + '.json'), 'w'), indent=1, ensure_ascii=False)
if g.get('F'):
    json.dump(g['F'], open(os.path.join(ROOT, 'fees', P['slug'] + '.json'), 'w'), indent=1, ensure_ascii=False)
print('wrote', P['slug'], 'fee' if g.get('F') else '')
