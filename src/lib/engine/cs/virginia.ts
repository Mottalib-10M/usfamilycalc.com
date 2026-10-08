/**
 * Virginia, Va. Code § 20-108.2: combined monthly gross income schedule (extrapolated between rows,
 * percentages of the excess above the top row); sole custody (G 1); shared custody when the paying parent
 * has more than 90 days (G 3): schedule × 1.4 weighted by the other parent's custody share, each parent's
 * total (plus the other parent's child care / health costs) × income share, netted; the lesser of the shared
 * and sole amounts applies, and the shared amount applies when it reverses the flow (G 3 (f)).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

export default function virginia(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!;
  const sh = d.shared!;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const basic = scheduleLookup(s, C, n, notes);
  const steps: CSStep[] = [
    money('Combined monthly gross income', C),
    money(`Basic obligation in the Virginia schedule, ${plural(n)}`, basic),
    percent('Paying parent’s income share', share * 100),
  ];
  // Costs paid by each parent (child care is taken as paid by the parent the child mainly lives with).
  const healthPayer = inp.healthBy === 'payer' ? n0(inp.health) : 0;
  const healthOther = inp.healthBy === 'other' ? n0(inp.health) : 0;
  const care = n0(inp.childcare);
  // G 1: sole custody.
  const sole = (basic + care + healthPayer + healthOther) * share - healthPayer;
  const nights = nightsOf(inp.payerOvernights);
  let amount = sole;
  if (sh.thresholdOvernights != null && sh.multiplier && nights.payer >= sh.thresholdOvernights) {
    // G 3: shared custody.
    const need = basic * sh.multiplier;
    const payerOwes = (need * (nights.other / 365) + care + healthOther) * share;
    const otherOwes = (need * (nights.payer / 365) + healthPayer) * (1 - share);
    const shared = payerOwes - otherOwes;
    steps.push(money(`Shared support need (schedule × ${sh.multiplier})`, need));
    steps.push(money('Shared custody amount (netted)', shared));
    steps.push(money('Sole custody amount', sole));
    if (shared < 0) { amount = shared; notes.push('shared-applied'); }
    else if (shared <= sole) { amount = shared; notes.push('shared-applied'); steps.push(text('Applied', 'shared amount (lower than sole)')); }
    else steps.push(text('Applied', 'sole amount (lower than shared), § 20-108.2(G)(3)(a)'));
  } else if (care + healthPayer + healthOther > 0) {
    steps.push(money('Child care and health coverage, paying parent’s share (net of premium paid)', (care + healthPayer + healthOther) * share - healthPayer));
  }
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
