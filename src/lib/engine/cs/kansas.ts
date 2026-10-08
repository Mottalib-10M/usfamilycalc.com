/**
 * Kansas Child Support Guidelines (effective July 1, 2025), Appendix II: one schedule per number of
 * children, per-child monthly amounts by age group. The calculator has no ages: it uses the 6-11 column for
 * every child and says so. Income rounded to the nearest schedule row; above $18,000 the discretionary
 * extended formula (income^exponent × multiplier, × age factor). Share rounded to a tenth of a percent.
 * Parenting time adjustment (IV.H.2) as a percentage of the paying parent's share; equal time: direct
 * expense formula (VI.F.3), taking the paying parent as the one not paying direct expenses.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { timeAdjustment: Array<[number, number]>; equalTimePct: number; directExpense: { pctLow: number; pctMid: number; pctHigh: number; lowMax: number; highFrom: number }; ageFactor0to5: number; ageFactor6to11: number; extendedExponent: number; extendedMultiplierByChildren: number[]; shareRoundPct: number };
type X = { schedulesByChildren: Record<string, number[][]> };

export default function kansas(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const x = (d as unknown as { extra: X }).extra;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const rows = x.schedulesByChildren[String(n)];
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const top = rows[rows.length - 1];
  let perChild: number;
  if (C > top[0]) {
    perChild = Math.round(C ** f.extendedExponent * f.extendedMultiplierByChildren[n - 1] * f.ageFactor6to11);
    notes.push('above-max-discretion');
  } else {
    let best = rows[0];
    for (const r of rows) if (Math.abs(r[0] - C) < Math.abs(best[0] - C)) best = r;
    if (C < rows[0][0]) notes.push('below-min');
    perChild = best[2];
  }
  const total = perChild * n;
  const step = f.shareRoundPct / 100;
  const share = C > 0 ? Math.round(A / C / step) * step : 1;
  const steps: CSStep[] = [money('Combined child support income', C), money(`Per-child amount, age 6-11 column used for every child, ${plural(n)}`, perChild), money('Gross child support obligation', total), percent('Paying parent’s share (nearest tenth)', share * 100)];
  const nights = nightsOf(inp.payerOvernights);
  const pct = (nights.payer / 365) * 100;
  let base = total * share;
  if (Math.round(pct) >= f.equalTimePct && nights.payer <= nights.other + 1) {
    const other = total * (1 - share);
    const de = f.directExpense;
    const p = C <= de.lowMax ? de.pctLow : C >= de.highFrom ? de.pctHigh : de.pctMid;
    base = (base - other) / 2 + (total * p) / 100;
    steps.push(money(`Equal parenting time, direct expense formula (half the difference + ${p}% of the obligation)`, base));
    steps.push(text('Assumption', 'the other parent pays the children’s direct expenses'));
    notes.push('shared-applied');
  } else {
    const band = [...f.timeAdjustment].reverse().find(([min]) => Math.floor(pct) >= min);
    if (band) { steps.push(percent(`Parenting time adjustment (${Math.floor(pct)}% of the time)`, band[1])); base *= 1 - band[1] / 100; notes.push('shared-applied'); }
  }
  const addOn = n0(inp.childcare) + n0(inp.health);
  const amount = base + addOn * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  if (addOn > 0) steps.push(money('Health premium and work-related child care, income share', addOn * share));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: total, payerShare: share, steps, notes };
}
