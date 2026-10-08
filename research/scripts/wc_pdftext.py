"""Extract text from WC PDFs in research/raw (usage: python3 wc_pdftext.py file.pdf [maxchars])."""
import sys, os
from pypdf import PdfReader
raw = os.path.join(os.path.dirname(__file__), '..', 'raw')
f = os.path.join(raw, sys.argv[1]); n = int(sys.argv[2]) if len(sys.argv) > 2 else 4000
r = PdfReader(f); t = '\n'.join((p.extract_text() or '') for p in r.pages)
open(f[:-4] + '.txt', 'w').write(t)
print('=====', sys.argv[1], len(r.pages), 'pages'); print(t[:n])
