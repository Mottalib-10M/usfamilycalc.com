#!/usr/bin/env python3
"""Assemble research/divorce/parts/g5.json from the per-state files in parts/g5/ (listed order)."""
import json, os
D = os.path.join(os.path.dirname(__file__), '..', 'divorce', 'parts')
ORDER = ['indiana','colorado','oregon','rhode-island','south-carolina','south-dakota','utah','vermont','west-virginia','wisconsin','wyoming']
out = []
for s in ORDER:
    p = os.path.join(D, 'g5', s + '.json')
    if os.path.exists(p):
        out.append(json.load(open(p)))
json.dump(out, open(os.path.join(D, 'g5.json'), 'w'), indent=2, ensure_ascii=False)
print(len(out), 'states written to g5.json:', [o['slug'] for o in out])
