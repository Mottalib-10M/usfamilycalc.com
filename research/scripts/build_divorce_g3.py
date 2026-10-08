#!/usr/bin/env python3
"""Merge research/divorce/parts/g3/<slug>.json into parts/g3.json in the assigned order."""
import json, os
D = os.path.join(os.path.dirname(__file__), '..', 'divorce', 'parts')
ORDER = ['north-carolina','new-jersey','virginia','maine','maryland','minnesota','mississippi','missouri','montana']
out = []
for s in ORDER:
    p = os.path.join(D, 'g3', s + '.json')
    if os.path.exists(p):
        out.append(json.load(open(p)))
json.dump(out, open(os.path.join(D, 'g3.json'), 'w'), indent=2, ensure_ascii=False)
print(len(out), 'states written')
