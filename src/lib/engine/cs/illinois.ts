/**
 * Illinois, 750 ILCS 5/505 (HFS schedule effective March 20, 2026).
 * Basic obligation: the HFS $50 bracket that contains the combined monthly net income, times the payer's
 * share (505(a)(1.5)); above the last bracket, not less than the top amount (505(a)(3.5)). Shared physical
 * care (505(a)(3.8)): 146+ overnights each, basic × 1.5, each share weighted by the other parent's time,
 * netted. Child care and the children's premium are shared by income (505(a)(3.7), (4)). Minimum order
 * (505(a)(3.3a)): $40 a month per child, $120 at most, for a payer at or below 75% of the poverty guideline
 * for one person; the calculator applies it at or below the net income the 2026 HFS Addendum gives for that
 * threshold. Every figure comes from the data file.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type Extra = { minimumOrder: { perChildMonthly: number; maxTotalMonthly: number; appliesAtOrBelowGrossMonthly: number; approxNetMonthly: number } };

export default function illinois(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!;
  const sh = d.shared!;
  const mo = (d as unknown as { extra: Extra }).extra.minimumOrder;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const basic = scheduleLookup(s, C, n, notes);
  const steps: CSStep[] = [
    money('Combined monthly net income', C),
    money(`Basic obligation in the HFS income shares schedule, ${plural(n)}`, basic),
    percent('Paying parent’s share of net income', share * 100),
  ];
  const nights = nightsOf(inp.payerOvernights);
  let base = basic * share;
  if (sh.method === 'cross-credit' && sh.thresholdOvernights != null && sh.multiplier && nights.payer >= sh.thresholdOvernights && nights.other >= sh.thresholdOvernights) {
    const care = basic * sh.multiplier;
    base = care * share * (nights.other / 365) - care * (1 - share) * (nights.payer / 365);
    steps.push(money(`Shared physical care obligation (basic × ${sh.multiplier})`, care));
    notes.push('shared-applied');
  }
  const addOn = n0(inp.childcare) + n0(inp.health);
  let amount = base + addOn * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  if (addOn > 0) steps.push(money('Child care and health premium, paying parent’s share (net of premium paid)', addOn * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0)));
  if (A > 0 && A <= mo.approxNetMonthly) {
    amount = Math.min(mo.perChildMonthly * n, mo.maxTotalMonthly);
    steps.push(text('Minimum order', `payer at or below 75% of the poverty guideline: ${'$'}${mo.perChildMonthly} a month per child, ${'$'}${mo.maxTotalMonthly} at most`));
    notes.push('self-support-reserve');
  }
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
