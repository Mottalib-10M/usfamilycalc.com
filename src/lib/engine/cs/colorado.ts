/**
 * Colorado, C.R.S. § 14-10-115 as reenacted by HB 25-1159 (in force March 1, 2026).
 * Basic obligation interpolated in the (7)(b) schedule ($50 to $40,000; at least the top row above it),
 * shared by income. Parenting time (8)(b), (8)(h): each parent's credit = basic × the table percentage for
 * that parent's overnights, deducted from that parent's share; the larger remaining amount is owed, net of
 * the other (an amount below zero counts as zero), and never more than with no overnights.
 * Low income (7)(a)(III)(A): obligor adjusted gross income at or below $650 → $10 minimum order, unless
 * shared parenting time gives less. The other low-income rules depend on the self-support reserve
 * (minimum wage × 29 h × 50 weeks / 12), whose dollar value is not in the data: not applied.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type LI = { minimumOrderIncomeMax: number; minimumOrder: number; selfSupportReserveMonthly: number | null };

export default function colorado(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!;
  const li = d.formula as unknown as LI;
  const pt = new Map(((d as unknown as { extra: { parentingTimeTable: { rows: number[][] } } }).extra.parentingTimeTable.rows).map(([k, v]) => [k, v]));
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const basic = scheduleLookup(s, C, n, notes);
  const steps: CSStep[] = [
    money('Combined monthly adjusted gross income', C),
    money(`Basic obligation in the Colorado schedule (interpolated), ${plural(n)}`, basic),
    percent('Paying parent’s share of income', share * 100),
  ];
  const nights = nightsOf(inp.payerOvernights);
  const credit = (k: number) => (pt.get(k) ?? 0) / 100;
  const payerPart = n0(basic * share - basic * credit(nights.payer));
  const otherPart = n0(basic * (1 - share) - basic * credit(nights.other));
  let basicNet = payerPart - otherPart;
  const noNights = basic * share;
  if (nights.payer > 0) {
    steps.push(percent(`Parenting time credit for ${nights.payer} overnights`, credit(nights.payer) * 100));
    notes.push('shared-applied');
  }
  if (basicNet > noNights) basicNet = noNights;
  const addOn = n0(inp.childcare) + n0(inp.health);
  let amount = basicNet + addOn * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  if (addOn > 0) steps.push(money('Child care and health insurance, paying parent’s share', addOn * share));
  if (A <= li.minimumOrderIncomeMax && amount > li.minimumOrder) {
    amount = li.minimumOrder;
    notes.push('self-support-reserve');
    steps.push(money(`Minimum order (paying parent’s income at or below $${li.minimumOrderIncomeMax})`, amount));
  } else if (li.selfSupportReserveMonthly == null) {
    steps.push(text(`Low-income adjustment above $${li.minimumOrderIncomeMax}`, 'not applied: the 2026 self-support reserve has no dollar figure in the data'));
  }
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
