/**
 * Alabama, Ala. R. Jud. Admin. 32 (schedule of the January 14, 2022 order, rule as amended June 1, 2023).
 * Basic obligation: the closer schedule row, the higher one from halfway (32(C)(1)); percentages rounded to the
 * nearest 1 % and dollars to the nearest dollar (32(C)(3)); child care and health coverage added and prorated,
 * the parent paying the premium credited (Form CS-42). Self-support reserve (32(C)(5)): the order is the lesser
 * of the obligor's share and 85 % of (income − SSR), with a $50 presumptive minimum; zero-dollar order when the
 * obligor has no income (32(C)(6)). Shared 50 % physical custody (32(C)(7), Form CS-42-S): basic × 150 %, each
 * parent credited half of it, the higher net amount paid; the calculator treats 182+ overnights as 50 %.
 */
import type { CSData, CSInput, CSResult, CSStep, CSSchedule } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { incomeAvailablePct: number; minimumOrder: number; sharedMultiplier: number; sharedConventionOvernights: number };

/** Closest row, the higher one at exactly halfway (Rule 32(C)(1)). */
function closest(s: CSSchedule, income: number, n: number, notes: string[]): number {
  const rows = s.rows;
  if (income <= rows[0][0] || income >= rows[rows.length - 1][0]) return scheduleLookup(s, income, n, notes);
  const i = rows.findIndex((r) => r[0] > income);
  const lo = rows[i - 1], hi = rows[i];
  return income - lo[0] < hi[0] - income ? lo[n] : hi[n];
}

export default function alabama(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!, f = d.formula as unknown as F, ssr = d.lowIncome?.selfSupportReserve ?? 0;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = Math.round(n0(inp.payer)), B = Math.round(n0(inp.other)), C = A + B;
  const sharePct = C > 0 ? Math.round((A / C) * 100) : 100;
  const share = sharePct / 100;
  const basic = closest(s, C, n, notes);
  const steps: CSStep[] = [money('Combined monthly adjusted gross income', C), money(`Basic obligation, closest schedule row, ${plural(n)}`, basic), percent('Obligor’s share (rounded to 1 %)', sharePct)];
  const care = Math.round(n0(inp.childcare));
  const hPayer = inp.healthBy === 'payer' ? Math.round(n0(inp.health)) : 0;
  const hOther = inp.healthBy === 'other' ? Math.round(n0(inp.health)) : 0;
  const addTotal = care + hPayer + hOther;
  const nights = nightsOf(inp.payerOvernights);

  if (nights.payer >= f.sharedConventionOvernights) {
    // Form CS-42-S. No SSR, no $50 minimum, no zero-dollar order (32(C)(7)(e)).
    const shared = Math.round(basic * f.sharedMultiplier);
    const half = Math.round(shared / 2);
    const payerNet = Math.round((shared + addTotal) * share) - half - hPayer;
    const otherNet = Math.round((shared + addTotal) * (1 - share)) - half - hOther - care;
    steps.push(money(`Shared 50 % custody: basic × ${f.sharedMultiplier * 100} % (Form CS-42-S, ${f.sharedConventionOvernights}+ overnights taken as 50 %)`, shared));
    steps.push(money('Obligor’s amount after the half credit', payerNet));
    steps.push(money('Other parent’s amount after the half credit', otherNet));
    notes.push('shared-applied');
    const owes = payerNet >= otherNet ? Math.max(0, payerNet) : 0;
    const rev = otherNet > payerNet ? Math.max(0, otherNet) : 0;
    if (rev > 0) notes.push('reverse');
    return { monthly: owes, reverse: rev, basicMonthly: basic, payerShare: share, steps, notes };
  }

  let amount = Math.round((basic + addTotal) * share) - hPayer;
  if (addTotal > 0) steps.push(money('Child care and health coverage added to the total, obligor’s share net of premium paid', Math.round(addTotal * share) - hPayer));
  if (A === 0) {
    steps.push(text('No gross income', 'zero-dollar order presumed (32(C)(6))'));
    return { monthly: 0, reverse: 0, basicMonthly: basic, payerShare: share, steps, notes };
  }
  const available = Math.round((Math.max(0, A - ssr) * f.incomeAvailablePct) / 100);
  if (available < amount) {
    const floor = available < f.minimumOrder ? f.minimumOrder : available;
    steps.push(money(`Income available for support: ${f.incomeAvailablePct} % of income above the $${ssr} reserve${available < f.minimumOrder ? `, raised to the $${f.minimumOrder} minimum` : ''}`, floor));
    amount = floor;
    notes.push('self-support-reserve');
  }
  return { monthly: Math.max(0, amount), reverse: 0, basicMonthly: basic, payerShare: share, steps, notes };
}
