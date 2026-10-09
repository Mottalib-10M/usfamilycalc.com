/**
 * Wyoming, W.S. 20-2-303 and 20-2-304. Total obligation from the statutory tables: for the number of children,
 * the line whose band start is at or below the combined net monthly income gives base + marginal % of the income
 * over the band start (304(a); the last band runs without a cap). Net income is after the cost of dependent
 * health coverage (303(a)(iii)): the premium entered is deducted from the income of the parent who pays it.
 * Child care is a deviation factor (307(b)), not an add-on. Shared responsibility when each parent keeps the
 * children overnight more than 25% of the year: total × 150%, each parent's share × the other parent's time,
 * offset (304(c)). Self-support reserve: the obligor never pays more than net income minus the reserve (304(f)).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { bandStarts: number[]; base: Record<string, number[]>; marginalPct: Record<string, number[]>; sharedMultiplier: number };

export default function wyoming(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const ssr = d.lowIncome!.selfSupportReserve as number;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const premium = n0(inp.health);
  const A = n0(inp.payer - (inp.healthBy === 'payer' ? premium : 0));
  const B = n0(inp.other - (inp.healthBy === 'other' ? premium : 0));
  const C = A + B;
  const share = C > 0 ? A / C : 1;
  let i = 0;
  for (let k = 0; k < f.bandStarts.length; k++) if (f.bandStarts[k] <= C) i = k;
  if (C < f.bandStarts[0]) notes.push('below-min');
  const base = f.base[String(n)][i], pct = f.marginalPct[String(n)][i], from = f.bandStarts[i];
  const total = n0(base + (pct / 100) * (C - from));
  const steps: CSStep[] = [];
  if (premium > 0) steps.push(text('Children’s health coverage', `deducted from the net income of the ${inp.healthBy === 'payer' ? 'paying' : 'other'} parent (W.S. 20-2-303(a)(iii))`));
  steps.push(money('Combined net monthly income', C));
  steps.push(money(`Total obligation, ${plural(n)}: $${base.toLocaleString('en-US')} + ${pct}% over $${from.toLocaleString('en-US')}`, total));
  steps.push(percent('Paying parent’s share of net income', share * 100));
  const nights = nightsOf(inp.payerOvernights);
  const sh = d.shared!;
  let net = total * share;
  if (sh.thresholdOvernights != null && nights.payer >= sh.thresholdOvernights && nights.other >= sh.thresholdOvernights) {
    const adj = total * f.sharedMultiplier;
    net = adj * share * (nights.other / 365) - adj * (1 - share) * (nights.payer / 365);
    steps.push(money(`Shared responsibility: total × ${f.sharedMultiplier * 100}%, each share × the other parent’s time, offset`, net));
    notes.push('shared-applied');
  }
  let monthly = 0, reverse = 0;
  if (net >= 0) {
    monthly = net;
    if (A - ssr < monthly) { monthly = n0(A - ssr); notes.push('self-support-reserve'); steps.push(money(`Set at net income minus the $${ssr.toLocaleString('en-US')} self-support reserve`, monthly)); }
  } else {
    reverse = -net;
    if (B - ssr < reverse) { reverse = n0(B - ssr); notes.push('self-support-reserve'); }
    notes.push('reverse');
  }
  if (n0(inp.childcare) > 0) steps.push(text('Child care', 'not added: a ground for deviation in Wyoming (W.S. 20-2-307(b))'));
  return { monthly, reverse, basicMonthly: total, payerShare: share, steps, notes };
}
