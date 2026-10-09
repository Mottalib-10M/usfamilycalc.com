#!/usr/bin/env python3
"""Merge research/probate/parts/<slug>.json into research/probate/states.json (51 states, brief order) and sanity-check."""
import json, os, glob
R = os.path.join(os.path.dirname(__file__), '..', 'probate')
ORDER = "alabama alaska arizona arkansas california colorado connecticut delaware district-of-columbia florida georgia hawaii idaho illinois indiana iowa kansas kentucky louisiana maine maryland massachusetts michigan minnesota mississippi missouri montana nebraska nevada new-hampshire new-jersey new-mexico new-york north-carolina north-dakota ohio oklahoma oregon pennsylvania rhode-island south-carolina south-dakota tennessee texas utah vermont virginia washington west-virginia wisconsin wyoming".split()
out = []
for s in ORDER:
    d = json.load(open(os.path.join(R, 'parts', s + '.json')))
    assert d['slug'] == s
    for k in ['creditorClaims', 'earliestClose', 'smallEstate', 'simplified', 'filingFee', 'personalRepFee', 'attorneyFee', 'uncertain']:
        assert k in d, (s, k)
    out.append(d)
json.dump(out, open(os.path.join(R, 'states.json'), 'w'), indent=1, ensure_ascii=False)
fees = sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(R, 'fees', '*.json')))
print(len(out), 'states written; fee files:', len(fees), fees)
