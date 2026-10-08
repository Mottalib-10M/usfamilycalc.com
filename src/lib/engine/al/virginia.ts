/** Virginia pendente lite spousal support (§ 16.1-278.17:1, § 20-103); § 20-107.1(D) reservation presumption. */
import type { ALData, ALInput, ALResult } from '../alimony';
import { n0, pos, months } from './_util';

export default function virginia(d: ALData, inp: ALInput): ALResult {
  const P = d.params as { withChildren: { payorGrossPct: number; payeeGrossPct: number }; withoutChildren: { payorGrossPct: number; payeeGrossPct: number }; combinedMonthlyGrossMax: number; reservationPresumptionPctOfMarriage: number };
  const k = inp.children ? P.withChildren : P.withoutChildren;
  const A = n0(inp.payer), B = n0(inp.payee);
  const a = (A * k.payorGrossPct) / 100, b = (B * k.payeeGrossPct) / 100;
  const formula = pos(a - b);
  const applies = A + B <= P.combinedMonthlyGrossMax;
  const notes = [
    'This presumptive formula covers temporary (pendente lite) support only; final spousal support is decided on the factors of § 20-107.1.',
    inp.children ? 'With minor children in common, spousal support is set first, then child support.' : 'With no minor children in common, the 27%/50% formula applies.',
    `If the court reserves the right to future support, the reservation is presumed to last ${P.reservationPresumptionPctOfMarriage}% of the time from marriage to separation (${Math.round((months(inp.years) * P.reservationPresumptionPctOfMarriage) / 100 * 10) / 10} months here).`,
  ];
  if (!applies) notes.unshift(`The formula is presumptive only when combined monthly gross income is $${P.combinedMonthlyGrossMax.toLocaleString('en-US')} or less; above that the court sets temporary support on the evidence.`);
  return {
    monthly: applies ? formula : 0, durationMonths: null,
    steps: [
      { label: `${k.payorGrossPct}% of the payer’s monthly gross income`, value: a, kind: 'money' },
      { label: `${k.payeeGrossPct}% of the payee’s monthly gross income`, value: b, kind: 'money' },
      { label: 'Formula result', value: formula, kind: 'money' },
      { label: 'Combined monthly gross income', value: A + B, kind: 'money' },
    ],
    notes,
  };
}
