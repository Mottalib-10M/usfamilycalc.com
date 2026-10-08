/**
 * Tennessee, Tenn. Comp. R. & Regs. 1240-02-04 (October 2021). Schedule of .09: combined adjusted gross income
 * rounded UP to the next $50 row (.04(6)(b)); above $28,250 the top amount plus a percentage of the excess.
 * Parenting time (.04(7)(h)-(i)): from 92 days, variable multiplier days × per diem on the BCSO, the extra cost
 * shared by income and the PRP's part credited to the ARP; at 68 days or fewer, the ARP's share is increased by
 * (69 − days)/365 (a rebuttable presumption). Self-support reserve (.03(4)(a)2): when the obligor's own AGI is in
 * the shaded area of the schedule, the schedule amount at that income alone is compared with the pro rata share
 * and the lesser applies, without parenting time credit. Minimum order $100 (.04(12)), not when the parenting
 * time adjustment brings it lower. Add-ons (child care, health insurance) prorated.
 */
import type { CSData, CSInput, CSResult, CSStep, CSSchedule } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { perDiem: number; creditFromDays: number; increaseBelowDays: number; daysPerYear: number; minimumOrder: number };

/** BCSO with the Tennessee rounding: the first row whose income is at or above the combined AGI. */
function roundUp(s: CSSchedule, income: number, n: number, notes: string[]): number {
  if (income >= s.rows[s.rows.length - 1][0]) return scheduleLookup(s, income, n, notes);
  const row = s.rows.find((r) => r[0] >= income)!;
  return row[n];
}

export default function tennessee(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!, f = d.formula as unknown as F;
  const shadedMax = (d as unknown as { extra: { ssrShadedMaxIncome: number[] } }).extra.ssrShadedMaxIncome;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const bcso = roundUp(s, C, n, notes);
  const steps: CSStep[] = [
    money('Combined adjusted gross income', C),
    money(`BCSO from the schedule (next row up), ${plural(n)}`, bcso),
    percent('Alternate residential parent’s income share', share * 100),
  ];
  const nights = nightsOf(inp.payerOvernights).payer;
  const pro = bcso * share;
  // Self-support reserve: obligor's AGI inside the shaded area for this number of children.
  const alone = A <= shadedMax[n - 1] ? roundUp(s, A, n, []) : null;
  let arp = pro;
  let ptAdjusted = false;
  const useReserve = () => {
    arp = alone!; ptAdjusted = false;
    notes.push('self-support-reserve');
    steps.push(money('Self-support reserve: schedule at the obligor’s income alone (shaded area), no parenting time credit', alone!));
  };
  if (nights >= f.creditFromDays) {
    const mult = nights * f.perDiem;
    const credit = (bcso * mult - bcso) * (1 - share);
    arp = pro - credit;
    ptAdjusted = true;
    steps.push(money(`Parenting time credit: ${nights} days × ${f.perDiem} = ${mult.toFixed(4)} multiplier, PRP part of the added cost`, credit));
    notes.push('shared-applied');
    if (alone != null && alone < arp) { notes.pop(); steps.pop(); useReserve(); }
  } else {
    if (alone != null && alone < pro) useReserve();
    if (nights < f.increaseBelowDays) {
      // .04(7)(i): the increase also applies to a share already set by the self-support reserve.
      const inc = (arp * (f.increaseBelowDays - nights)) / f.daysPerYear;
      arp += inc;
      steps.push(money(`Increase for ${nights} days of parenting time ((${f.increaseBelowDays} − ${nights}) / ${f.daysPerYear} of the share, rebuttable)`, inc));
    }
  }
  const care = n0(inp.childcare);
  const hPayer = inp.healthBy === 'payer' ? n0(inp.health) : 0;
  const hOther = inp.healthBy === 'other' ? n0(inp.health) : 0;
  const add = (care + hPayer + hOther) * share - hPayer;
  if (care + hPayer + hOther > 0) steps.push(money('Health insurance and child care, share net of premium paid', add));
  let amount = arp + add;
  if (amount >= 0 && amount < f.minimumOrder && !(ptAdjusted && nights >= f.creditFromDays)) {
    amount = f.minimumOrder;
    steps.push(text('Minimum order (.04(12))', `$${f.minimumOrder} a month`));
  }
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: bcso, payerShare: share, steps, notes };
}
