/**
 * South Dakota, SDCL 25-7-6.1 to 25-7-6.27. Schedule of SDCL 25-7-6.2 in $50 brackets [from, to, c1..c6] of
 * combined monthly net income (top bracket above $30,000, where the court sets support on the child's needs,
 * 25-7-6.9); the obligation is split by net income. Self-support reserve: when the amount read on the
 * noncustodial parent's income alone falls in the emboldened area of the table, the lesser of that amount and
 * the proportionate share is ordered (25-7-6.2). Shared parenting cross credit at 180 nights or more in each
 * home (25-7-6.27). Child care (25-7-6.18) and the children's health insurance (25-7-6.16) shared by income.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { bracketRow } from './oregon';
import { n0, plural, nightsOf, money, percent, text } from './_util';

export default function southDakota(d: CSData, inp: CSInput): CSResult {
  const rows = d.schedule!.rows as Array<Array<number | null>>;
  const extra = (d as unknown as { extra: { emboldenedTo: number[] } }).extra;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const row = bracketRow(rows, C);
  const basic = (row[n + 1] as number) ?? 0;
  if (C > (rows[rows.length - 1][1] as number)) notes.push('above-max-discretion');
  const steps: CSStep[] = [
    money('Combined monthly net income', C),
    money(`Schedule amount, ${plural(n)} (bracket $${(row[0] as number).toLocaleString('en-US')}–$${(row[1] as number).toLocaleString('en-US')})`, basic),
    percent('Noncustodial parent’s share of net income', share * 100),
  ];
  const nights = nightsOf(inp.payerOvernights);
  const sh = d.shared!;
  let base = basic * share;
  if (sh.method === 'cross-credit' && sh.thresholdOvernights != null && nights.payer >= sh.thresholdOvernights && nights.other >= sh.thresholdOvernights) {
    const adj = basic * (sh.multiplier ?? 1);
    base = adj * share * (nights.other / 365) - adj * (1 - share) * (nights.payer / 365);
    steps.push(money(`Shared parenting cross credit: schedule × ${sh.multiplier}, offset by nights`, base));
    notes.push('shared-applied');
  } else {
    // self-support reserve: amount on the noncustodial parent's income alone, if in the emboldened area
    const alone = bracketRow(rows, A);
    const inBold = (alone[1] as number) <= extra.emboldenedTo[n - 1];
    if (inBold && (alone[n + 1] as number) < base) {
      base = alone[n + 1] as number;
      steps.push(money('Lesser amount on the payer’s income alone (self-support reserve area)', base));
      notes.push('self-support-reserve');
    }
  }
  const addOn = n0(inp.childcare) + n0(inp.health);
  let amount = base + addOn * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  if (addOn > 0) steps.push(money('Child care and children’s health insurance, payer’s share', addOn * share));
  if (inp.healthBy === 'payer' && n0(inp.health) > 0) steps.push(money('Credit for the premium the payer already pays', -n0(inp.health)));
  if (nights.payer > 0 && !notes.includes('shared-applied')) steps.push(text('Parenting time', 'the abatement for nights with the payer is set by the court within a range (SDCL 25-7-6.14); not applied'));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
