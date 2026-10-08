/** Florida § 61.08 (as amended 2023): durational alimony capped at 35% of the net income difference; term limits by marriage length. */
import type { ALData, ALInput, ALResult } from '../alimony';
import { n0, pos, months, rowFor } from './_util';

export default function florida(d: ALData, inp: ALInput): ALResult {
  const P = d.params as { durationalCapPctOfNetIncomeDifference: number; bridgeTheGapMaxYears: number; rehabilitativeMaxYears: number; durationalMinMarriageYears: number };
  const diff = pos(n0(inp.payer) - n0(inp.payee));
  const monthly = (diff * P.durationalCapPctOfNetIncomeDifference) / 100;
  const y = n0(inp.years);
  const rows = (d.durationTable ?? []) as Array<{ category: string; marriageYearsMin: number; marriageYearsMax: number | null; maxPctOfMarriageLength: number }>;
  const notes = [
    `Durational alimony is the lesser of the receiving spouse's reasonable need and ${P.durationalCapPctOfNetIncomeDifference}% of the difference between the two net incomes; this result is the ceiling.`,
    `Bridge-the-gap alimony lasts at most ${P.bridgeTheGapMaxYears} years and rehabilitative alimony at most ${P.rehabilitativeMaxYears} years; permanent alimony is no longer available.`,
  ];
  let durationMonths: number | null = 0, category = 'none';
  if (y < P.durationalMinMarriageYears) {
    notes.push(`Durational alimony is not available after a marriage of less than ${P.durationalMinMarriageYears} years.`);
  } else {
    const row = rowFor(rows, y) ?? rows[rows.length - 1];
    category = row.category;
    durationMonths = (months(y) * row.maxPctOfMarriageLength) / 100;
    notes.push(`A ${category} marriage allows durational alimony for at most ${row.maxPctOfMarriageLength}% of its length, unless exceptional circumstances are shown by clear and convincing evidence.`);
  }
  return {
    monthly, durationMonths,
    steps: [
      { label: 'Difference between net incomes', value: diff, kind: 'money' },
      { label: `Cap: ${P.durationalCapPctOfNetIncomeDifference}% of the difference`, value: monthly, kind: 'money' },
      { label: 'Marriage category', value: category, kind: 'text' },
      { label: 'Longest durational term', value: `${Math.round((durationMonths ?? 0) * 10) / 10} months`, kind: 'text' },
    ],
    notes,
  };
}
