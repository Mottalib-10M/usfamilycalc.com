#!/usr/bin/env python3
"""Merge research/divorce/parts/*.json (group arrays + single-state files) into research/divorce/states.json,
ordered by the brief's state list. Prints missing states and basic schema checks."""
import json, os, glob
D = os.path.join(os.path.dirname(__file__), '..', 'divorce')
ORDER = """alabama alaska arizona arkansas california colorado connecticut delaware district-of-columbia florida georgia
hawaii idaho illinois indiana iowa kansas kentucky louisiana maine maryland massachusetts michigan minnesota mississippi
missouri montana nebraska nevada new-hampshire new-jersey new-mexico new-york north-carolina north-dakota ohio oklahoma
oregon pennsylvania rhode-island south-carolina south-dakota tennessee texas utah vermont virginia washington
west-virginia wisconsin wyoming""".split()
REQ = ['slug', 'name', 'abbr', 'filingFee', 'responseFee', 'feeScope', 'feeText', 'feeUrl', 'otherFees', 'waiver',
       'residency', 'waitingPeriod', 'simplified', 'parentingClass', 'uncertain']
got = {}
for f in sorted(glob.glob(os.path.join(D, 'parts', '*.json'))):
    data = json.load(open(f))
    for s in (data if isinstance(data, list) else [data]):
        if s['slug'] in got and os.path.basename(f).startswith('g'):
            continue  # single-state file wins over group array
        got[s['slug']] = s
out = [got[s] for s in ORDER if s in got]
missing = [s for s in ORDER if s not in got]
for s in out:
    miss = [k for k in REQ if k not in s]
    if miss: print('schema', s['slug'], 'missing', miss)
json.dump(out, open(os.path.join(D, 'states.json'), 'w'), indent=2, ensure_ascii=False)
print(len(out), 'states written; missing:', missing)
