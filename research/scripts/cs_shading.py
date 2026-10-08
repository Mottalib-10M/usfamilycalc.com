#!/usr/bin/env python3
"""Reads the SHADED cells (self-support reserve area) of an official schedule PDF: finds the rectangles
filled with the shading colour in each page's content stream and the schedule cells (income row, children
column) whose text lies inside them. Used by cs_parse_tennessee.py and cs_parse_south_carolina.py.

Returns {children: [incomes of shaded cells]} where children = 1..N (column order of the table)."""
import re
from pypdf import PdfReader
from pypdf.generic import ContentStream


def _page(r, p, colour):
    cs = ContentStream(p.get_contents(), r)
    fill, rects, pending = None, [], []
    for operands, op in cs.operations:
        o = op.decode()
        if o in ('g', 'rg', 'k', 'sc', 'scn'):
            try:
                fill = tuple(round(float(x), 3) for x in operands)
            except Exception:
                fill = None
        elif o == 're':
            pending.append([float(x) for x in operands])
        elif o in ('f', 'f*', 'F', 'B', 'b'):
            if fill == colour:
                rects.extend(pending)
            pending = []
        elif o in ('n', 'S', 's'):
            pending = []
    txt = []

    def vis(text, cm, tm, fd, fs):
        t = text.strip()
        if t:
            txt.append((tm[4] * cm[0] + cm[4], tm[5] * cm[3] + cm[5], t))
    p.extract_text(visitor_text=vis)
    return rects, txt


def shaded_cells(path, colour, first_col_max_x, ncols, income_re=r'^[\d,]+(\.\d\d)?$'):
    r = PdfReader(path)
    out = {c: [] for c in range(1, ncols + 1)}
    for p in r.pages:
        rects, txt = _page(r, p, colour)
        # rows: income labels in the first column
        rows = [(y, float(t.replace(',', ''))) for x, y, t in txt if x < first_col_max_x and re.match(income_re, t)]
        if not rows:
            continue
        cells = [(x, y, t) for x, y, t in txt if x >= first_col_max_x and re.match(r'^[\d,]+$', t)]
        # column x positions of this page: cluster the cells' x
        xs = sorted(set(round(x) for x, _, _ in cells))
        clusters = []
        for x in xs:
            if clusters and x - clusters[-1][-1] < 25:
                clusters[-1].append(x)
            else:
                clusters.append([x])
        centers = [sum(c) / len(c) for c in clusters]
        if len(centers) != ncols:
            continue
        for x, y, t in cells:
            inside = any(rx - 1 <= x <= rx + rw + 1 and ry - 1 <= y <= ry + rh + 1 for rx, ry, rw, rh in rects)
            if not inside:
                continue
            row = min(rows, key=lambda ry: abs(ry[0] - y))
            if abs(row[0] - y) > 3:
                continue
            col = min(range(ncols), key=lambda i: abs(centers[i] - x)) + 1
            out[col].append(row[1])
    return {c: sorted(set(v)) for c, v in out.items()}
