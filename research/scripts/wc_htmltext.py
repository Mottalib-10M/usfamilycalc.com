"""Strip an HTML file in research/raw to text (usage: python3 wc_htmltext.py file.html [grep-regex])."""
import sys, os, re, html
raw = os.path.join(os.path.dirname(__file__), '..', 'raw')
h = open(os.path.join(raw, sys.argv[1]), errors='ignore').read()
h = re.sub(r'(?is)<(script|style).*?</\1>', ' ', h)
t = html.unescape(re.sub(r'<[^>]+>', ' ', h)); t = re.sub(r'[ \t\r]+', ' ', t); t = re.sub(r'\n\s*\n+', '\n', t)
if len(sys.argv) > 2:
    for line in t.split('\n'):
        if re.search(sys.argv[2], line, re.I): print(line.strip()[:400])
else: print(t)
