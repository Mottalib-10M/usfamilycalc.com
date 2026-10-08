/**
 * Louisiana, La. R.S. 9:315 to 9:315.22 (schedule of 9:315.19, effective January 1, 2025). Combined adjusted
 * monthly gross income, $50 rows, extrapolated between two rows (9:315.13(B)); above $50,000 the court's discretion
 * but never less than the top row (9:315.13(C)), which the calculator uses. Total obligation = basic + child care +
 * health premium, prorated (9:315.8). Shared custody (9:315.9): approximately equal time, basic × 1.5 split by
 * income and cross-multiplied by the other parent's time, add-ons netted, the difference owed, never more than the
 * sole-custody amount; the calculator treats 165+ overnights a year as approximately equal time. The joint-custody
 * credit over 73 days (9:315.8(E)) is discretionary and not computed.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { sharedConventionOvernights: number; daysPerYear: number };

export default function louisiana(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!, f = d.formula as unknown as F, mult = d.shared?.multiplier ?? 1;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const basic = scheduleLookup(s, C, n, notes);
  const steps: CSStep[] = [
    money('Combined adjusted monthly gross income', C),
    money(C > s.maxIncome ? `Basic obligation: top row of the schedule (the floor above $${s.maxIncome.toLocaleString('en-US')}), ${plural(n)}` : `Basic obligation, extrapolated between schedule rows, ${plural(n)}`, basic),
    percent('Paying parent’s share of combined income', share * 100),
  ];
  const care = n0(inp.childcare);
  const hPayer = inp.healthBy === 'payer' ? n0(inp.health) : 0;
  const hOther = inp.healthBy === 'other' ? n0(inp.health) : 0;
  const addTotal = care + hPayer + hOther;
  const sole = (basic + addTotal) * share - hPayer;
  const nights = nightsOf(inp.payerOvernights);
  let amount = sole;
  if (nights.payer >= f.sharedConventionOvernights) {
    const yr = f.daysPerYear;
    const theo = basic * mult;
    const payerOwes = theo * share * (nights.other / yr) + addTotal * share - hPayer;
    const otherOwes = theo * (1 - share) * (nights.payer / yr) + addTotal * (1 - share) - hOther - care;
    const net = payerOwes - otherOwes;
    steps.push(money(`Shared custody (Worksheet B, ${f.sharedConventionOvernights}+ overnights): basic × ${mult}`, theo));
    steps.push(money('Paying parent’s amount after cross-multiplying by time', payerOwes));
    steps.push(money('Other parent’s amount after cross-multiplying by time', otherOwes));
    notes.push('shared-applied');
    amount = Math.min(net, sole);
    if (net > sole) steps.push(text('Capped', 'at the sole-custody amount (9:315.9(A)(7))'));
  } else if (addTotal > 0) steps.push(money('Child care and health premium, share net of premium paid', addTotal * share - hPayer));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
