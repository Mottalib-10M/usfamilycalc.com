/**
 * North Carolina Child Support Guidelines (eff. 2023-01-01).
 * Worksheet A (primary custody): combined adjusted gross income, schedule interpolated, × payer's share,
 * plus child care and health premium shared by income. Low income: obligor under the minimum-order income →
 * minimum order; obligor's own income in the shaded (self-support reserve) area of the schedule → obligation
 * read on the obligor's income alone, no child care or premium added.
 * Worksheet B (each parent ≥ 123 overnights): schedule × 1.5, each parent's share weighted by the other
 * parent's overnights, netted; no self-support reserve.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

export default function northCarolina(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!;
  const sh = d.shared!;
  const X = (d as unknown as { extra: { shadedThroughIncome: number[]; minimumOrder: { amount: number; belowObligorIncome: number } } }).extra;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const basic = scheduleLookup(s, C, n, notes);
  const steps: CSStep[] = [money('Combined monthly adjusted gross income', C), money(`Basic obligation in the NC schedule, ${plural(n)}`, basic), percent('Paying parent’s income share', share * 100)];
  const nights = nightsOf(inp.payerOvernights);
  const addOn = n0(inp.childcare) + n0(inp.health);
  const healthCredit = inp.healthBy === 'payer' ? n0(inp.health) : 0;
  let amount: number;

  if (sh.thresholdOvernights != null && sh.multiplier && Math.min(nights.payer, nights.other) >= sh.thresholdOvernights) {
    // Worksheet B: shared custody.
    const adj = basic * sh.multiplier;
    const payerOwes = adj * share * (nights.other / 365);
    const otherOwes = adj * (1 - share) * (nights.payer / 365);
    steps.push(text('Worksheet', 'B (shared custody)'), money(`Shared basic obligation (× ${sh.multiplier})`, adj));
    amount = payerOwes - otherOwes + addOn * share - healthCredit;
    notes.push('shared-applied');
  } else if (A < X.minimumOrder.belowObligorIncome) {
    amount = X.minimumOrder.amount;
    steps.push(text('Worksheet', 'A (primary custody)'), money('Minimum order (paying parent below the minimum-order income)', amount));
    notes.push('below-min');
  } else if (A <= X.shadedThroughIncome[n - 1]) {
    // Shaded area: obligation computed on the obligor's income only; no child care or premium.
    amount = scheduleLookup(s, A, n);
    steps.push(text('Worksheet', 'A, shaded self-support area'), money('Obligation on the paying parent’s income alone', amount));
    notes.push('self-support-reserve');
  } else {
    amount = basic * share + addOn * share - healthCredit;
    steps.push(text('Worksheet', 'A (primary custody)'));
    if (addOn > 0) steps.push(money('Child care and health insurance, paying parent’s share', addOn * share));
  }
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
