/**
 * Arizona Child Support Guidelines (2022, revised September 21, 2022).
 * Basic obligation: the schedule row closest to the combined adjusted income, a tie rounding up (§ III.A.1),
 * the $30,000 row above the table (§ III.A.1.c). Each parent's share by income (§ IV). Parenting time
 * (§ V.D): the percentage of the Parenting Time Table for the paying parent's days is applied to the basic
 * obligation and subtracted from that parent's share. Add-ons (child care, insurance) by income share.
 * Not modeled: the older-child adjustment (no age input) and the Self-Support Reserve Test (its 2026 dollar
 * value is not in the data).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type PT = { daysFrom: number; daysTo: number | null; pct: number };

function closestRow(rows: number[][], income: number): number[] {
  if (income <= rows[0][0]) return rows[0];
  const top = rows[rows.length - 1];
  if (income >= top[0]) return top;
  let lo = 0;
  while (lo + 1 < rows.length && rows[lo + 1][0] <= income) lo++;
  const r0 = rows[lo], r1 = rows[lo + 1];
  return income - r0[0] < r1[0] - income ? r0 : r1; // exactly halfway: round up (§ III.A.1.a)
}

export default function arizona(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const row = closestRow(s.rows, C);
  if (C < s.minIncome) notes.push('below-min');
  if (C > s.maxIncome) notes.push('above-max-cap');
  const basic = row[n];
  const steps: CSStep[] = [
    money('Combined adjusted child support income', C),
    money(`Basic obligation, closest schedule row ($${row[0].toLocaleString('en-US')}), ${plural(n)}`, basic),
    percent('Paying parent’s share of income', share * 100),
  ];
  const addOn = n0(inp.childcare) + n0(inp.health);
  let amount = (basic + addOn) * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  if (addOn > 0) steps.push(money('Child care and insurance, paying parent’s share', addOn * share));
  const days = nightsOf(inp.payerOvernights).payer;
  const sh = d.shared as unknown as { table?: PT[] } | null;
  const table = sh?.table ?? [];
  const band = table.find((t) => days >= t.daysFrom && (t.daysTo == null || days <= t.daysTo));
  if (band && band.pct > 0) {
    const credit = basic * band.pct;
    amount -= credit;
    steps.push(money(`Parenting time adjustment (${days} days, ${(band.pct * 100).toFixed(1)}% of the basic obligation)`, -credit));
    notes.push('shared-applied');
  }
  steps.push(text('Not included', 'older-child (12+) adjustment and Self-Support Reserve Test'));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
