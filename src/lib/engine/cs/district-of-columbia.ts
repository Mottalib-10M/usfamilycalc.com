/**
 * District of Columbia, D.C. Code § 16-916.01 and Appendix I (§ 16-916.01a). Annual schedule of combined adjusted
 * gross income; between two rows the next higher row applies ((f)(1)(B)); above $240,000 the top row is the
 * floor and the rest is at the judge's discretion ((h)). Obligation split by income share, health insurance and
 * child care added by share ((i), (k)). Shared physical custody presumed when the child spends 35% or more of
 * the year with each parent: basic × 1.5, each parent keeps his or her share × own time, offset, never more than
 * the sole-custody amount ((q)(1)). Total capped at 35% of the payer's adjusted gross income ((n)); last, the
 * low-income adjustment: the lesser of the obligation and income minus the self-support reserve, or the $75 a
 * month presumption when that remainder is under $900 a year ((m), (g)).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { toMonthly, toPeriod } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { lookupRoundUp: boolean; lowIncomeMinAbilityAnnual: number; presumedMinimumMonthly: number; capPctOfAdjustedGross: number; sharedMultiplier: number; sharedCappedAtSole: boolean };

export default function districtOfColumbia(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const rows = d.schedule!.rows;
  const per = d.period; // annual
  const ssr = d.lowIncome!.selfSupportReserve as number; // annual
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = toPeriod(n0(inp.payer), per), B = toPeriod(n0(inp.other), per), C = A + B;
  const share = C > 0 ? A / C : 1;
  const top = rows[rows.length - 1];
  let row = top;
  if (C > top[0]) notes.push('above-max-discretion');
  else {
    // first row at or above the income (next higher amount), or the last row at or below it
    const up = rows.find((r) => r[0] >= C) ?? top;
    row = f.lookupRoundUp ? up : [...rows].reverse().find((r) => r[0] <= C) ?? rows[0];
    if (C < rows[0][0]) notes.push('below-min');
  }
  const basic = row[n] ?? 0;
  const steps: CSStep[] = [
    money('Combined adjusted gross income, monthly', toMonthly(C, per)),
    money(`Schedule row $${row[0].toLocaleString('en-US')} a year, ${plural(n)} (next higher row)`, toMonthly(basic, per)),
    percent('Paying parent’s share of income', share * 100),
  ];
  const addOn = toPeriod(n0(inp.childcare) + n0(inp.health), per);
  const premiumCredit = inp.healthBy === 'payer' ? toPeriod(n0(inp.health), per) : 0;
  const sole = basic * share + addOn * share - premiumCredit;
  const nights = nightsOf(inp.payerOvernights);
  const sh = d.shared!;
  let net = sole;
  if (sh.thresholdOvernights != null && nights.payer >= sh.thresholdOvernights && nights.other >= sh.thresholdOvernights) {
    const adj = basic * f.sharedMultiplier;
    const payerOwes = adj * share * (1 - nights.payer / 365);
    const otherOwes = adj * (1 - share) * (1 - nights.other / 365);
    net = payerOwes - otherOwes + addOn * share - premiumCredit;
    steps.push(money(`Shared physical custody: basic × ${f.sharedMultiplier}, each parent keeps the share for own time`, toMonthly(payerOwes - otherOwes, per)));
    notes.push('shared-applied');
    if (f.sharedCappedAtSole && net > sole) { net = sole; steps.push(text('Cap', 'not more than the sole-custody amount (§ 16-916.01(q)(1)(G))')); }
  }
  if (addOn > 0) steps.push(money('Child care and health insurance, payer’s share', toMonthly(addOn * share, per)));
  // 35% cap, then the low-income adjustment, for whichever parent pays
  const limit = (amount: number, agi: number) => {
    let x = amount;
    const cap = (f.capPctOfAdjustedGross / 100) * agi;
    if (x > cap) { x = cap; notes.push('above-cap'); steps.push(money(`Capped at ${f.capPctOfAdjustedGross}% of the payer’s adjusted gross income`, toMonthly(cap, per))); }
    const ability = agi - ssr;
    if (ability < f.lowIncomeMinAbilityAnnual) {
      const presumed = toPeriod(f.presumedMinimumMonthly, per);
      if (x > presumed) { x = presumed; notes.push('self-support-reserve'); steps.push(money('Low-income presumption (income near the self-support reserve)', f.presumedMinimumMonthly)); }
    } else if (x > ability) {
      x = ability; notes.push('self-support-reserve');
      steps.push(money(`Low-income adjustment: income minus the $${ssr.toLocaleString('en-US')} self-support reserve`, toMonthly(ability, per)));
    }
    return x;
  };
  let monthly = 0, reverse = 0;
  if (net >= 0) monthly = toMonthly(limit(net, A), per);
  else { reverse = toMonthly(limit(-net, B), per); notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: toMonthly(basic, per), payerShare: share, steps, notes };
}
