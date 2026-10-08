/** New York DRL § 236(B)(5-a), (6): maintenance guideline up to the payor income cap, self-support reserve, advisory duration. */
import type { ALData, ALInput, ALResult } from '../alimony';
import { n0, pos, months, rowFor } from './_util';

export default function newYork(d: ALData, inp: ALInput): ALResult {
  const P = d.params as { incomeCapPayorAnnual: number; incomeCapEffective: string; withChildSupport: { payorPct: number; payeePct: number }; withoutChildSupport: { payorPct: number; payeePct: number }; capPctOfCombined: number; selfSupportReserve: number };
  const payorY = n0(inp.payer) * 12, payeeY = n0(inp.payee) * 12;
  const capped = Math.min(payorY, P.incomeCapPayorAnnual);
  const k = inp.children ? P.withChildSupport : P.withoutChildSupport;
  const a = (capped * k.payorPct) / 100 - (payeeY * k.payeePct) / 100;
  const b = ((capped + payeeY) * P.capPctOfCombined) / 100 - payeeY;
  let annual = pos(Math.min(a, b));
  const notes: string[] = [];
  if (payorY - annual < P.selfSupportReserve) {
    annual = pos(payorY - P.selfSupportReserve);
    notes.push(`The amount is reduced so the payor keeps the self-support reserve of $${P.selfSupportReserve.toLocaleString('en-US')} a year.`);
  }
  if (payorY > P.incomeCapPayorAnnual) notes.push(`The formula uses the payor's income up to the $${P.incomeCapPayorAnnual.toLocaleString('en-US')} cap (since ${P.incomeCapEffective}); maintenance on income above it is at the court's discretion.`);
  notes.push(inp.children ? 'With child support paid by the payor, maintenance is computed first and then deducted from the payor’s income for child support.' : 'Without child support (or when the payor has custody), the 30%/20% formula applies.');
  const rows = (d.durationTable ?? []) as Array<{ marriageYearsMin: number; marriageYearsMax: number | null; pctMin: number; pctMax: number }>;
  const y = n0(inp.years);
  const row = rowFor(rows, y, true) ?? rows[rows.length - 1];
  notes.push(`The duration schedule is advisory: ${row.pctMin}% to ${row.pctMax}% of the length of the marriage for post-divorce maintenance; temporary maintenance ends with the judgment.`);
  return {
    monthly: annual / 12,
    durationMonths: (months(y) * row.pctMax) / 100, durationMinMonths: (months(y) * row.pctMin) / 100,
    steps: [
      { label: 'Payor’s annual income used (up to the cap)', value: capped, kind: 'money' },
      { label: `${k.payorPct}% of payor − ${k.payeePct}% of payee`, value: a, kind: 'money' },
      { label: `${P.capPctOfCombined}% of combined income − payee income`, value: b, kind: 'money' },
      { label: 'Annual guideline maintenance (lower amount)', value: annual, kind: 'money' },
      { label: 'Monthly maintenance', value: annual / 12, kind: 'money' },
    ],
    notes,
  };
}
