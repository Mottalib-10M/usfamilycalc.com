/**
 * Georgia, O.C.G.A. § 19-6-15 (version in force January 1, 2026).
 * Basic obligation: closest row of the (o) table at the combined adjusted gross income (top row above
 * $40,000), prorated by income (b)(5). Parenting time adjustment (g)(2)(B): NCP share + (Dn^e·CPshare −
 * Dc^e·NCPshare)/(Dn^e + Dc^e) is the adjustment, deducted from the NCP share (it can bring it to zero or
 * reverse it, (g)(1)(B)). Additional expenses (h) prorated. Low-income adjustment (i.1)/(p): when the
 * paying parent's income is under the top of the low-income table for the number of children, the lesser of
 * the presumptive amount and the table amount (a percentage of income at or below the first threshold).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type LowTable = { rows: Array<Array<number | null>> };
type F = { exponent: number; lowIncomeAtOrBelow: number; lowIncomePctAtOrBelow1500: number[] };

/** Low-income table amount for a parent's income, or null when the table does not apply. */
function lowIncomeAmount(t: LowTable, f: F, income: number, n: number): number | null {
  const col = t.rows.filter((r) => r[n] != null);
  const top = col[col.length - 1][0] as number;
  if (income >= top) return null;
  if (income <= f.lowIncomeAtOrBelow) return (income * f.lowIncomePctAtOrBelow1500[n - 1]) / 100;
  // closest row, as for the basic table (§ 19-6-15(b)(4))
  let best = col[0];
  for (const r of col) if (Math.abs((r[0] as number) - income) < Math.abs((best[0] as number) - income)) best = r;
  return best[n] as number;
}

export default function georgia(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!;
  const f = d.formula as unknown as F;
  const low = (d as unknown as { extra: { lowIncomeAdjustmentTable: LowTable } }).extra.lowIncomeAdjustmentTable;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const basic = scheduleLookup(s, C, n, notes);
  const ncp = basic * share, cp = basic - ncp;
  const steps: CSStep[] = [money('Combined monthly adjusted gross income', C), money(`Basic obligation in the Georgia table, ${plural(n)}`, basic), percent('Noncustodial parent’s pro rata share', share * 100)];
  const nights = nightsOf(inp.payerOvernights);
  let base = ncp;
  if (nights.payer > 0) {
    const e = f.exponent;
    const dn = nights.payer ** e, dc = nights.other ** e;
    const adjustment = ncp + (dn * cp - dc * ncp) / (dn + dc);
    base = ncp - adjustment;
    steps.push(money(`Parenting time adjustment (${nights.payer} days, power ${e})`, adjustment));
    notes.push('shared-applied');
  }
  const addOn = n0(inp.childcare) + n0(inp.health);
  let amount = base + addOn * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  if (addOn > 0) steps.push(money('Work-related child care and health insurance, NCP share', addOn * share));
  const li = lowIncomeAmount(low, f, A, n);
  if (li != null && li < amount) {
    amount = li;
    steps.push(money('Low-income adjustment table amount (lesser applies)', li));
    notes.push('self-support-reserve');
  } else if (li != null) steps.push(text('Low-income adjustment table', 'checked, presumptive amount is lower'));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
