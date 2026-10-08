/** Illinois 750 ILCS 5/504(b-1): 33 1/3% of payor net − 25% of payee net, capped at 40% of combined net; duration factors. */
import type { ALData, ALInput, ALResult } from '../alimony';
import { n0, pos, months, rowFor, frac } from './_util';

export default function illinois(d: ALData, inp: ALInput): ALResult {
  const P = d.params as { combinedGrossAnnualLimit: number; payerNetFraction: string; payeeNetPct: number; capPctOfCombinedNet: number; combinedSupportReviewPctOfPayerNet: number };
  const A = n0(inp.payer), B = n0(inp.payee);
  const share = frac(P.payerNetFraction);
  const raw = pos(A * share - (B * P.payeeNetPct) / 100);
  const cap = pos(((A + B) * P.capPctOfCombinedNet) / 100 - B);
  const monthly = Math.min(raw, cap);
  const y = n0(inp.years);
  const rows = (d.durationTable ?? []) as Array<{ marriageYearsMin: number; marriageYearsMax: number | null; factor: number | null }>;
  const row = rowFor(rows, y);
  const durationMonths = row && row.factor != null ? months(y) * row.factor : months(y);
  const notes = [
    `The guideline applies only if the spouses' combined gross income is under $${P.combinedGrossAnnualLimit.toLocaleString('en-US')} a year and the payor owes no support from a prior relationship; otherwise the court sets the amount from the § 504(a) factors.`,
  ];
  if (cap < raw) notes.push(`The ${P.capPctOfCombinedNet}% limit applies: the payee's net income plus maintenance may not exceed ${P.capPctOfCombinedNet}% of the combined net income.`);
  if (row?.factor == null) notes.push('For a marriage of 20 years or more, maintenance lasts as long as the marriage or for an indefinite term, at the court’s discretion.');
  const cs = n0(inp.childSupport);
  if (cs > 0 && monthly + cs > (A * P.combinedSupportReviewPctOfPayerNet) / 100) notes.push(`Maintenance plus child support exceeds ${P.combinedSupportReviewPctOfPayerNet}% of the payor's net income, so the court may set non-guideline amounts.`);
  return {
    monthly, durationMonths,
    steps: [
      { label: 'One-third of the payor’s net income', value: A * share, kind: 'money' },
      { label: `Minus ${P.payeeNetPct}% of the payee’s net income`, value: raw, kind: 'money' },
      { label: `${P.capPctOfCombinedNet}% limit (40% of combined net − payee net)`, value: cap, kind: 'money' },
      { label: 'Guideline monthly maintenance', value: monthly, kind: 'money' },
      { label: 'Duration factor', value: row?.factor != null ? `${y} years × ${row.factor}` : 'length of the marriage or indefinite', kind: 'text' },
    ],
    notes,
  };
}
