/**
 * New Hampshire, RSA 458-C: total support = combined net income × the percentage of RSA 458-C:3, I(a) for the
 * number of children, the percentage interpolated between the income levels of the table within each column
 * (I(b)); shared in proportion to income (II(b)), rounded to the nearest dollar (II(d)). Self-support reserve
 * (IV): an obligor below the reserve owes the minimum order; otherwise the order may not take the obligor below
 * the reserve, and is never less than the minimum order. The statutory table is in annual net income.
 * The obligee's child care is deducted from the obligee's income before proration (II(c)); medical support is a
 * separate 4 % obligation (V) and is not added here.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, money, percent, text } from './_util';

export default function newHampshire(d: CSData, inp: CSInput): CSResult {
  const rows = d.schedule!.rows; // [annual net level, %1, %2, %3, %4+]
  const li = d.lowIncome!;
  const reserve = li.selfSupportReserve ?? 0, minimum = li.minimumOrder ?? 0;
  const notes: string[] = [];
  const maxN = rows[0].length - 1;
  const n = Math.max(1, Math.min(Math.round(inp.children), maxN));
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const annual = C * 12;
  let pct: number;
  if (annual <= rows[0][0]) pct = rows[0][n];
  else if (annual >= rows[rows.length - 1][0]) pct = rows[rows.length - 1][n];
  else {
    const i = rows.findIndex((r) => r[0] > annual);
    const r0 = rows[i - 1], r1 = rows[i];
    pct = r0[n] + ((annual - r0[0]) / (r1[0] - r0[0])) * (r1[n] - r0[n]);
  }
  const total = (C * pct) / 100;
  // II(c): the obligee's child care is deducted from the obligee's income for the proration.
  const Badj = n0(B - n0(inp.childcare));
  const share = A + Badj > 0 ? A / (A + Badj) : 1;
  let amount = total * share;
  const steps: CSStep[] = [
    money('Combined net income, a year', annual),
    percent(`Guideline percentage for ${plural(n)} (interpolated, RSA 458-C:3)`, pct),
    money('Total support obligation, a month', total),
    percent('Paying parent’s share of income', share * 100),
  ];
  if (inp.children > maxN) notes.push('children-capped');
  if (A < reserve) { amount = minimum; notes.push('self-support-reserve'); steps.push(money(`Income below the self-support reserve ($${reserve.toLocaleString('en-US')}): minimum order`, minimum)); }
  else if (A - amount < reserve) { amount = Math.max(minimum, A - reserve); notes.push('self-support-reserve'); steps.push(money(`Limited by the self-support reserve of $${reserve.toLocaleString('en-US')}`, amount)); }
  steps.push(text('Self-support reserve test', 'applied to the income entered (the statute compares the obligor’s adjusted gross income)'));
  if (inp.childcare > 0) steps.push(text('Child care', 'deducted from the receiving parent’s income before the shares (RSA 458-C:3, II(c))'));
  const monthly = Math.round(amount);
  return { monthly, reverse: 0, basicMonthly: total, payerShare: share, steps, notes };
}
