"""Print keyword contexts from a raw file (html or txt). usage: wc_ctx.py file before after kw1 [kw2...]"""
import sys, os, re, html
raw = os.path.join(os.path.dirname(__file__), '..', 'raw')
f, b, a = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
t = open(os.path.join(raw, f), errors='ignore').read()
if f.endswith(('.html', '.js')):
    t = re.sub(r'(?is)<(script|style).*?</\1>', ' ', t) if f.endswith('.html') else t
    t = html.unescape(re.sub(r'<[^>]+>', ' ', t))
t = re.sub(r'\s+', ' ', t)
for k in sys.argv[4:]:
    ms = list(re.finditer(k, t, re.I))
    print(f'### {k}: {len(ms)} hits')
    for m in ms[:3]:
        print('...', t[max(0, m.start()-b):m.end()+a], '...\n')
