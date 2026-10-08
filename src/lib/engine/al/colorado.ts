/** Colorado C.R.S. § 14-10-114 advisory guideline, per the Colorado Judicial Branch advisement worksheet and duration table. */
import type { ALData, ALInput, ALResult } from '../alimony';
import { n0, pos } from './_util';

export default function colorado(d: ALData, inp: ALInput): ALResult {
  const P = d.params as { combinedAnnualLimit: number; minMarriageMonths: number; pctOfCombined: number; nonDeductibleFactor: Array<{ combinedMonthlyMin?: number; combinedMonthlyMax: number; factor: number }> };
  const A = n0(inp.payer), B = n0(inp.payee), C = A + B;
  const m = Math.round(n0(inp.years) * 12);
  const T = d.durationTable as unknown as { rows: Array<[number, number, number]> };
  const rows = T?.rows ?? [];
  const notes = ['Colorado’s guideline is advisory: it creates no presumption that maintenance will be awarded, and the court keeps full discretion.'];
  if (m < P.minMarriageMonths) {
    notes.push(`The guideline does not apply to marriages shorter than ${P.minMarriageMonths} months.`);
    return { monthly: 0, durationMonths: 0, steps: [{ label: 'Months of marriage', value: m, kind: 'text' }, { label: 'Minimum for the guideline', value: `${P.minMarriageMonths} months`, kind: 'text' }], notes };
  }
  if (C * 12 > P.combinedAnnualLimit) {
    notes.push(`The guideline does not apply when combined income exceeds $${P.combinedAnnualLimit.toLocaleString('en-US')} a year; the court decides from the statutory factors.`);
    return { monthly: 0, durationMonths: null, steps: [{ label: 'Combined annual income', value: C * 12, kind: 'money' }, { label: 'Guideline income limit', value: P.combinedAnnualLimit, kind: 'money' }], notes };
  }
  const lineF = pos((C * P.pctOfCombined) / 100 - Math.min(A, B));
  const band = P.nonDeductibleFactor.find((b) => C <= b.combinedMonthlyMax) ?? P.nonDeductibleFactor[P.nonDeductibleFactor.length - 1];
  const monthly = lineF * band.factor;
  notes.push(`For orders not deductible for federal tax (agreements after 2018), the worksheet multiplies the result by ${band.factor}.`);
  const last = rows[rows.length - 1];
  const row = rows.find((r) => r[0] === m);
  let durationMonths: number | null = row ? row[2] : null;
  if (!row && last && m > last[0]) notes.push(`The table stops at ${last[0]} months of marriage; beyond it the term is set by the court.`);
  return {
    monthly, durationMonths,
    steps: [
      { label: 'Combined adjusted gross monthly income', value: C, kind: 'money' },
      { label: `${P.pctOfCombined}% of combined income − lower income (Line F)`, value: lineF, kind: 'money' },
      { label: `Non-deductible adjustment × ${band.factor}`, value: monthly, kind: 'money' },
      { label: 'Suggested term', value: row ? `${row[1]}% of ${m} months = ${row[2]} months` : 'set by the court', kind: 'text' },
    ],
    notes,
  };
}
