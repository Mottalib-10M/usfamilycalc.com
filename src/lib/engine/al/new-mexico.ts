/** New Mexico Statewide Alimony Guidelines (2006): 30% − 50% without children, 28% − 58% with children, gross incomes. */
import type { ALData, ALInput, ALResult } from '../alimony';
import { n0, pos, rowFor } from './_util';

export default function newMexico(d: ALData, inp: ALInput): ALResult {
  const P = d.params as Record<'withoutChildren' | 'withChildren', { payorGrossPct: number; recipientGrossPct: number }>;
  const k = inp.children ? P.withChildren : P.withoutChildren;
  const a = (n0(inp.payer) * k.payorGrossPct) / 100, b = (n0(inp.payee) * k.recipientGrossPct) / 100;
  const monthly = pos(a - b);
  const rows = (d.durationTable ?? []) as Array<{ marriageYearsMin: number; marriageYearsMax: number | null; rule: string }>;
  const row = rowFor(rows, n0(inp.years));
  const notes = [
    'New Mexico’s alimony guidelines are advisory; the judge weighs the factors of NMSA § 40-4-7(E).',
    inp.children ? 'With child support, alimony is computed first and then used to adjust both incomes for child support.' : 'With no child support, the 30%/50% formula applies.',
  ];
  if (row) notes.push(`Guideline commentary on duration for this marriage length: ${row.rule}.`);
  return {
    monthly, durationMonths: null,
    steps: [
      { label: `${k.payorGrossPct}% of the payer’s gross monthly income`, value: a, kind: 'money' },
      { label: `${k.recipientGrossPct}% of the recipient’s gross monthly income`, value: b, kind: 'money' },
      { label: 'Guideline monthly alimony', value: monthly, kind: 'money' },
    ],
    notes,
  };
}
