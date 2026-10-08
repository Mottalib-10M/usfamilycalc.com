/**
 * Iowa, Iowa Ct. R. ch. 9 (schedule of rule 9.26 effective January 1, 2026). Brackets of adjusted net
 * monthly income. Low income (9.3(2), 9.26 note 1): Area A (paying parent's income up to the Area A limit)
 * uses that parent's income alone; Area B uses the lesser of the parent-alone and combined-income amounts;
 * Area C the combined incomes. Extraordinary visitation credit on the paying parent's share (9.9), not
 * below the floors. Joint (equally shared) physical care (9.14(3)): combined incomes, each share × 1.5 ×
 * 0.5, offset. Above $30,000: not less than the top row (used here). The printed schedule has no row for
 * $8,801-$8,850: an income there takes the $8,751-$8,800 row.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';
import { bracketRow } from './oregon';

type F = { visitationBands: Array<[number, number]>; visitationFloorByChildren: number[]; jointMultiplier: number; jointTimeFactor: number; jointMinOvernights: number; areaATo: number; areaBFrom: number; areaBToByChildren: number[] };

export default function iowa(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const rows = d.schedule!.rows as Array<Array<number | null>>;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const at = (inc: number) => bracketRow(rows, inc)[n + 1] as number;
  if (C > (rows[rows.length - 1][1] as number)) notes.push('above-max-discretion');
  const basic = at(C);
  const steps: CSStep[] = [money('Combined adjusted net income', C), money(`Schedule amount, ${plural(n)}`, basic), percent('Paying parent’s share of income', share * 100)];
  const nights = nightsOf(inp.payerOvernights);
  let base: number;
  if (nights.payer >= f.jointMinOvernights && nights.other >= f.jointMinOvernights) {
    const a = basic * share * f.jointMultiplier * f.jointTimeFactor, b = basic * (1 - share) * f.jointMultiplier * f.jointTimeFactor;
    base = a - b;
    steps.push(money(`Joint physical care: each share × ${f.jointMultiplier} × ${f.jointTimeFactor}, offset`, base));
    notes.push('shared-applied');
  } else {
    base = basic * share;
    if (A <= f.areaATo) { base = at(A); steps.push(money('Low income Area A: schedule at the paying parent’s own income', base)); notes.push('self-support-reserve'); }
    else if (A <= f.areaBToByChildren[n - 1]) {
      const alone = at(A);
      if (alone < base) { base = alone; steps.push(money('Low income Area B: own-income amount (lower)', alone)); notes.push('self-support-reserve'); }
      else steps.push(text('Low income Area B', 'combined-income amount is lower'));
    }
    const band = [...f.visitationBands].reverse().find(([min]) => nights.payer >= min);
    if (band) {
      const floor = f.visitationFloorByChildren[n - 1];
      const after = Math.max(base * (1 - band[1] / 100), Math.min(base, floor));
      steps.push(percent(`Extraordinary visitation credit (${nights.payer} overnights)`, band[1]));
      base = after; notes.push('shared-applied');
    }
  }
  const addOn = n0(inp.childcare) + n0(inp.health);
  let amount = base + addOn * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  if (addOn > 0) steps.push(money('Child care and health insurance, income share (rule 9.11A cap not modeled)', addOn * share));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
