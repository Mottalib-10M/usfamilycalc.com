/**
 * Pennsylvania, Pa.R.Civ.P. 1910.16-2 to 1910.16-4 (schedule effective January 1, 2026).
 * Basic obligation read in the 1910.16-3 schedule at combined monthly net income (above the top row,
 * 1910.16-3.1: the top-row amount plus a percentage of the excess), times the obligor's income share.
 * Substantial custody (1910.16-4(c)(1), Part D): at 40%+ of overnights the obligor's percentage share is
 * cut by (overnight % − 30) points. Equal custody (c)(2): only the higher-income party pays, and the amount is
 * capped so the obligee does not end with more than half of combined net income. Low income (1910.16-2(e)(1)):
 * in the shaded area of the schedule, the lesser of the obligor-income-only amount and the income-shares amount.
 * Every figure comes from the data file (schedule rows, extra.sharedCustody, extra.shadedArea…, lowIncome).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type Extra = {
  shadedAreaMaxIncomeByChildren: number[];
  sharedCustody: { minOvernightPct: number; subtractPctPoints: number; equalTimeIncomeEqualization: boolean };
};

export default function pennsylvania(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!;
  const x = (d as unknown as { extra: Extra }).extra;
  const ssr = d.lowIncome?.selfSupportReserve ?? 0;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const basic = scheduleLookup(s, C, n, notes);
  const steps: CSStep[] = [
    money('Combined monthly net income', C),
    money(`Basic child support in the Pennsylvania schedule, ${plural(n)}`, basic),
    percent('Obligor’s percentage of combined net income', share * 100),
  ];
  let base = basic * share;

  // Substantial or equally shared custody.
  const nights = nightsOf(inp.payerOvernights);
  const timePct = (nights.payer / 365) * 100;
  const sc = x.sharedCustody;
  if (timePct >= sc.minOvernightPct) {
    const adjPct = Math.max(0, share * 100 - (timePct - sc.subtractPctPoints));
    base = (basic * adjPct) / 100;
    steps.push(percent(`Adjusted share after ${nights.payer} overnights (minus ${(timePct - sc.subtractPctPoints).toFixed(1)} points)`, adjPct));
    notes.push('shared-applied');
    if (sc.equalTimeIncomeEqualization && nights.payer >= nights.other - 1) {
      if (A <= B) { base = 0; steps.push(text('Equal custody', 'the lower-income party does not pay basic support')); }
      else if (base > (A - B) / 2) { base = (A - B) / 2; steps.push(money('Equal custody: capped so incomes are equalized', base)); }
    }
  }

  // Self-Support Reserve: shaded area of the schedule.
  const shadedTop = x.shadedAreaMaxIncomeByChildren[n - 1];
  if (A <= shadedTop) {
    const own = scheduleLookup(s, A, n);
    steps.push(money('Shaded area: schedule amount at the obligor’s income alone', own));
    if (own < base) { base = own; notes.push('self-support-reserve'); }
    if (A <= ssr) steps.push(text(`Income at or below the ${'$' + ssr.toLocaleString('en-US')} Self-Support Reserve`, 'the court looks at actual resources and living expenses before ordering support'));
  }

  // Additional expenses (1910.16-6): child care and the children's health premium, by income share.
  const addOn = n0(inp.childcare) + n0(inp.health);
  const amount = base + addOn * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  if (addOn > 0) steps.push(money('Child care and health premium, obligor’s share (net of premium paid)', addOn * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0)));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
