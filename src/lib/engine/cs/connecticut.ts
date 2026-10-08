/**
 * Connecticut, Regs. Conn. State Agencies § 46b-215a-2c (guidelines effective August 1, 2026). Weekly
 * net incomes rounded to the nearest $10. Low-income obligor: when the paying parent's own income falls
 * in the darker shaded area for the number of children, the block amount at that income is the obligation
 * (c)(3)(A)(i). Otherwise the block at the combined income × the paying parent's share rounded to a whole
 * percent (c)(4). Above $6,000 a week: the amount at $6,000 is the minimum presumptive obligation, the
 * $6,000 percentage × income the maximum (a)(2); the engine returns the minimum and shows the maximum.
 * No time-sharing formula: shared custody is a deviation (§ 46b-215a-5c(b)(6)(A)).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { toPeriod, toMonthly } from '../child-support';
import { n0, plural, money, percent, text } from './_util';

type F = { incomeRoundTo: number; shareRoundToPct: number; columnsAmount: number[]; columnsPct: number[] };
type X = { lowIncomeShadedMaxIncome: { byChildren: number[] } };

export default function connecticut(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const x = (d as unknown as { extra: X }).extra;
  const rows = d.schedule!.rows;
  const per = d.period;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const round10 = (v: number) => Math.round(v / f.incomeRoundTo) * f.incomeRoundTo;
  const A = toPeriod(n0(inp.payer), per), B = toPeriod(n0(inp.other), per);
  const C = round10(A + B), Ar = round10(A);
  const top = rows[rows.length - 1];
  const rowAt = (inc: number) => rows.find((r) => r[0] === inc) ?? (inc < rows[0][0] ? null : top);
  const amt = (r: number[] | null) => (r ? r[f.columnsAmount[n - 1]] : 0);
  const steps: CSStep[] = [money('Combined net income, a month', toMonthly(A + B, per)), text('Weekly income used (rounded to $10)', `$${C} combined, $${Ar} paying parent`)];
  let weekly: number, basicW: number, share: number;
  const lowMax = x.lowIncomeShadedMaxIncome.byChildren[n - 1];
  if (Ar <= lowMax) {
    const r = rowAt(Ar);
    if (!r) notes.push('below-min');
    basicW = amt(r); weekly = basicW; share = 1;
    steps.push(money(`Low-income obligor: block at the paying parent’s own $${Ar} a week, ${plural(n)} (a month)`, toMonthly(basicW, per)));
    notes.push('self-support-reserve');
  } else {
    const r = C > top[0] ? top : rowAt(C)!;
    basicW = amt(r);
    share = Math.round((A / (A + B)) * 100 / f.shareRoundToPct) * f.shareRoundToPct / 100;
    steps.push(money(`Schedule block, ${plural(n)} (a month)`, toMonthly(basicW, per)));
    steps.push(percent('Paying parent’s share, rounded to a whole percent', share * 100));
    weekly = basicW * share;
    if (C > top[0]) {
      notes.push('above-max-discretion');
      const maxW = (A + B) * (top[f.columnsPct[n - 1]] / 100) * share;
      steps.push(money(`Above $${top[0]} a week: maximum presumptive (${top[f.columnsPct[n - 1]]}% of income), a month`, toMonthly(maxW, per)));
    }
  }
  const care = n0(inp.childcare) * (A + B > 0 ? A / (A + B) : 1);
  if (care > 0) steps.push(money('Child care contribution, paying parent’s income share (low-income limits not modeled)', care));
  if (n0(inp.health) > 0) steps.push(text('Health insurance', 'premiums are deducted from each parent’s net income in Connecticut, not added here'));
  weekly = Math.round(weekly);
  let monthly = toMonthly(weekly, per) + care;
  steps.push(text('Shared physical custody', 'no formula in Connecticut: possible deviation only'));
  return { monthly, reverse: 0, basicMonthly: toMonthly(basicW, per), payerShare: share, steps, notes };
}
