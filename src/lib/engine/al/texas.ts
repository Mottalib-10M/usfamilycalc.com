/** Texas Fam. Code § 8.055 cap (lesser of $5,000 or 20% of average monthly gross) and § 8.054 duration limits. */
import type { ALData, ALInput, ALResult } from '../alimony';
import { n0, rowFor } from './_util';

export default function texas(d: ALData, inp: ALInput): ALResult {
  const P = d.params as { capMonthly: number; capPctOfObligorAvgMonthlyGross: number };
  const pctCap = (n0(inp.payer) * P.capPctOfObligorAvgMonthlyGross) / 100;
  const monthly = Math.min(P.capMonthly, pctCap);
  const rows = (d.durationTable ?? []) as Array<{ marriageYearsMin: number; marriageYearsMax: number | null; maxYears: number; note?: string }>;
  const y = n0(inp.years);
  const row = rowFor(rows, y);
  const durationMonths = row ? row.maxYears * 12 : null;
  const notes = [
    'This is the most a Texas court can order, not a likely amount: the spouse must first qualify under Family Code § 8.051 and lack property to meet minimum reasonable needs.',
    monthly === P.capMonthly ? `The $${P.capMonthly.toLocaleString('en-US')} monthly cap applies because ${P.capPctOfObligorAvgMonthlyGross}% of the payer's income is higher.` : `The cap is ${P.capPctOfObligorAvgMonthlyGross}% of the payer's average monthly gross income because it is below $${P.capMonthly.toLocaleString('en-US')}.`,
  ];
  if (row?.note) notes.push(`For a marriage under 10 years, maintenance is available only when the claim rests on family violence (§ 8.051(1)); the ${row.maxYears}-year limit then applies.`);
  notes.push('A court may order maintenance beyond these limits for as long as a disability of the spouse or of a child of the marriage continues (§ 8.054(b)).');
  return {
    monthly, durationMonths,
    steps: [
      { label: 'Payer’s average monthly gross income', value: n0(inp.payer), kind: 'money' },
      { label: `${P.capPctOfObligorAvgMonthlyGross}% of that income`, value: pctCap, kind: 'money' },
      { label: 'Fixed monthly cap', value: P.capMonthly, kind: 'money' },
      { label: 'Maximum monthly maintenance (lesser of the two)', value: monthly, kind: 'money' },
      { label: 'Longest duration for this marriage length', value: durationMonths == null ? 'none' : `${durationMonths / 12} years`, kind: 'text' },
    ],
    notes,
  };
}
