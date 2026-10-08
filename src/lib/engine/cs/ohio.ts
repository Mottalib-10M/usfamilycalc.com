/**
 * Ohio, ORC Chapter 3119 and the JFS 07767 schedule (rev. 6/2023, still current under OAC 5101:12-1-99
 * effective April 1, 2026). Annual gross incomes; the out-of-pocket premium for the children is credited
 * against the paying parent's income (3119.30(E)). Basic obligation read in the schedule at combined annual
 * income, proportional between two $600 rows (one of the three methods 3119.05(G)(2) allows); above the
 * $336,000 row the top-row amount is the floor (3119.04). The paying parent's share; if that parent's own
 * income is in the shaded self-sufficiency reserve area, the lesser of that share and the schedule amount at
 * the parent's own income (3119.05(G)(3)). Parenting time order of 90+ overnights: minus 10% (3119.051).
 * Child care by income share, capped at 50% for a parent in the reserve area (3119.05(P)(2)). Minimum order
 * $80 a month (3119.06). Cash medical support is shown separately. Every figure comes from the data file.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type Extra = {
  shadedAreaMaxIncomeByChildren: number[];
  parentingTimeReduction: { minOvernights: number; pct: number };
  minimumOrderMonthly: number;
  cashMedicalAnnualPerChild: number;
  childCareSharePctCapInReserve: number;
};

export default function ohio(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!;
  const x = (d as unknown as { extra: Extra }).extra;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const premiumY = n0(inp.health) * 12;
  const Ay = n0(n0(inp.payer) * 12 - (inp.healthBy === 'payer' ? premiumY : 0));
  const By = n0(n0(inp.other) * 12 - (inp.healthBy === 'other' ? premiumY : 0));
  const Cy = Ay + By;
  const share = Cy > 0 ? Ay / Cy : 1;
  const basicY = scheduleLookup(s, Cy, n, notes);
  const steps: CSStep[] = [
    money('Combined annual gross income, per month (after the premium credit)', Cy / 12),
    money(`Basic obligation in JFS 07767, ${plural(n)}, per month`, basicY / 12),
    percent('Paying parent’s income share', share * 100),
  ];
  let payerY = basicY * share;
  const inReserve = Ay <= x.shadedAreaMaxIncomeByChildren[n - 1];
  if (inReserve) {
    const ownY = scheduleLookup(s, Ay, n);
    steps.push(money('Self-sufficiency reserve area: schedule at the paying parent’s own income, per month', ownY / 12));
    if (ownY < payerY) { payerY = ownY; notes.push('self-support-reserve'); }
  }
  const nights = nightsOf(inp.payerOvernights);
  const pt = x.parentingTimeReduction;
  if (nights.payer >= pt.minOvernights) {
    payerY *= 1 - pt.pct / 100;
    steps.push(percent(`Parenting time order of ${pt.minOvernights}+ overnights: reduction`, pt.pct));
    notes.push('shared-applied');
  }
  const careShare = inReserve ? Math.min(share, x.childCareSharePctCapInReserve / 100) : share;
  const careY = n0(inp.childcare) * 12 * careShare;
  if (careY > 0) steps.push(money('Child care, paying parent’s share, per month', careY / 12));
  let annual = payerY + careY;
  const minY = x.minimumOrderMonthly * 12;
  if (Ay > 0 && annual < minY) { annual = minY; steps.push(text('Minimum order', `${'$'}${x.minimumOrderMonthly} a month for all the children`)); notes.push('below-min'); }
  steps.push(money('Cash medical support, paying parent’s share, per month (ordered separately)', (x.cashMedicalAnnualPerChild * n * share) / 12));
  return { monthly: annual / 12, reverse: 0, basicMonthly: basicY / 12, payerShare: share, steps, notes };
}
