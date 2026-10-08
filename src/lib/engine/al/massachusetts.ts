/** Massachusetts Alimony Reform Act: general term alimony generally ≤ 30–35% of the gross income difference; duration % of months married. */
import type { ALData, ALInput, ALResult } from '../alimony';
import { n0, pos, months, rowFor } from './_util';

export default function massachusetts(d: ALData, inp: ALInput): ALResult {
  const P = d.params as { pctOfGrossIncomeDifferenceMin: number; pctOfGrossIncomeDifferenceMax: number };
  const diff = pos(n0(inp.payer) - n0(inp.payee));
  const low = (diff * P.pctOfGrossIncomeDifferenceMin) / 100, high = (diff * P.pctOfGrossIncomeDifferenceMax) / 100;
  const rows = (d.durationTable ?? []) as Array<{ marriageYearsMin: number; marriageYearsMax: number | null; maxPctOfMonthsMarried: number | null }>;
  const y = n0(inp.years);
  const row = rowFor(rows, y, true) ?? rows[rows.length - 1];
  const durationMonths = row.maxPctOfMonthsMarried == null ? null : (months(y) * row.maxPctOfMonthsMarried) / 100;
  const notes = [
    `General term alimony should generally not exceed the recipient's need or ${P.pctOfGrossIncomeDifferenceMin}–${P.pctOfGrossIncomeDifferenceMax}% of the difference between gross incomes; the range shown is that ceiling.`,
    durationMonths == null ? 'After a marriage of more than 20 years, the judge may order alimony for as long as is fair.' : `For this marriage length, general term alimony lasts at most ${row.maxPctOfMonthsMarried}% of the months married.`,
    'General term alimony normally ends when the payer reaches full retirement age, and cohabitation of at least 3 months can reduce or end it.',
  ];
  return {
    monthly: high, low, high, durationMonths,
    steps: [
      { label: 'Difference between gross incomes', value: diff, kind: 'money' },
      { label: `${P.pctOfGrossIncomeDifferenceMin}% of the difference`, value: low, kind: 'money' },
      { label: `${P.pctOfGrossIncomeDifferenceMax}% of the difference`, value: high, kind: 'money' },
      { label: 'Longest general term', value: durationMonths == null ? 'set by the judge' : `${Math.round(durationMonths * 10) / 10} months`, kind: 'text' },
    ],
    notes,
  };
}
