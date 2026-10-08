#!/usr/bin/env python3
"""Fetch Code of Alabama sections from the official ALISON GraphQL endpoint used by
https://alison.legislature.state.al.us/code-of-alabama?section=<id>. usage: probate_alabama.py 43-2-350 ..."""
import json, sys, subprocess, os, re, html
RAW = os.path.join(os.path.dirname(__file__), '..', 'raw')
Q = """query codeOfAlabamaSection($displayId: String!) { codesOfAlabama(where: { type: { eq: Section }, displayId: { eq: $displayId } } versions: true) { data { codeId displayId title content history effectiveDate } } }"""
for sid in sys.argv[1:]:
    r = subprocess.run(['curl', '-s', '-m', '40', '-A', 'Mozilla/5.0', '-H', 'Content-Type: application/json', '-X', 'POST',
                        'https://alison.legislature.state.al.us/graphql', '-d', json.dumps({'query': Q, 'variables': {'displayId': sid}})], capture_output=True)
    open(os.path.join(RAW, f'probate-al-{sid}.json'), 'wb').write(r.stdout)
    for d in json.loads(r.stdout)['data']['codesOfAlabama']['data']:
        txt = html.unescape(re.sub(r'<[^>]+>', ' ', d['content'] or ''))
        print('==', d['displayId'], d['title'], '| effective', d['effectiveDate'])
        print(' '.join(txt.split())[:3000]); print('HISTORY:', ' '.join(re.sub(r'<[^>]+>', ' ', d['history'] or '').split())[:300])
