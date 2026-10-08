/**
 * Washington, RCW 26.19 (economic table in force January 1, 2026).
 * The table gives a monthly amount PER CHILD for a family of 1 to 5 children: basic obligation = that amount
 * × the number of children, at the $100 row of combined net income at or below the income (below $2,200 the
 * first row is shown: the statute leaves it to the households' resources; above $50,000 the top row).
 * Shared by net income (RCW 26.19.080); add-ons by the same share. Limits (RCW 26.19.065): not more than 45%
 * of the paying parent's net income, not less than the presumptive minimum per child. The self-support
 * reserve (180% of the poverty level) has no dollar value in the data: not applied. Residential time is a
 * deviation (RCW 26.19.075(1)(d)), not a formula.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, money, percent, text } from './_util';

type F = { maxPctOfNetIncome: number; minimumPerChildMonthly: number };

export default function washington(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!;
  const f = d.formula as unknown as F;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const perChild = scheduleLookup(s, C, n, notes);
  const basic = perChild * n;
  const steps: CSStep[] = [
    money('Combined monthly net income', C),
    money(`Economic table, per child in a family of ${plural(n)}`, perChild),
    money(`Basic obligation (× ${n})`, basic),
    percent('Paying parent’s share of net income', share * 100),
  ];
  const addOn = n0(inp.childcare) + n0(inp.health);
  let amount = (basic + addOn) * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  if (addOn > 0) steps.push(money('Day care and health care, paying parent’s share', addOn * share));
  const limit = (A * f.maxPctOfNetIncome) / 100;
  const floor = f.minimumPerChildMonthly * n;
  if (amount > limit) { amount = Math.max(limit, floor); notes.push('above-cap'); steps.push(money(`Limited to ${f.maxPctOfNetIncome}% of the paying parent’s net income`, amount)); }
  else if (amount < floor && amount > 0) { amount = floor; steps.push(money(`Presumptive minimum, $${f.minimumPerChildMonthly} per child`, floor)); }
  if (inp.payerOvernights > 0) steps.push(text('Residential time', 'a ground for deviation in Washington, not in the standard calculation'));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
