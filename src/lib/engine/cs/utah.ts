/**
 * Utah, Utah Code §§ 81-6-204 to 81-6-209 and tables 81-6-304 / 81-6-305 (formerly Title 78B, Chapter 12).
 * Base combined obligation in the bracket of combined adjusted gross income; no amount listed = $0, then
 * the obligor-only low income table (205(3)); a parent under the top of the low income table pays the
 * lesser of the two (205(4)); $30 minimum in sole custody (205(5)). Joint physical custody (more than 30%
 * of overnights): income share minus .0027 × base per overnight over 110 and under 131 and .0084 × base per
 * overnight over 130, for the parent with fewer overnights (206). Child care and premiums split 50/50.
 * Above $100,000 the court sets the amount, not below the top row (204(8)): the top row is used.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';
import { bracketRow } from './oregon';

type F = { jointMinPctOfYear: number; jointBand1From: number; jointBand1To: number; jointBand1Factor: number; jointBand2From: number; jointBand2Factor: number; equalTimeLowerIncomeOvernights: number; soleMinimumAward: number; childcareSharePct: number; healthSharePct: number };
type Row = Array<number | null>;

export default function utah(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const rows = d.schedule!.rows as Row[];
  const low = (d as unknown as { extra: { lowIncomeTable: { rows: Row[] } } }).extra.lowIncomeTable.rows;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const r = C < (rows[0][0] as number) ? null : bracketRow(rows, C);
  if (C > (rows[rows.length - 1][1] as number)) notes.push('above-max-discretion');
  const basic = r ? ((r[n + 1] as number | null) ?? 0) : 0;
  const steps: CSStep[] = [money('Combined adjusted gross income', C), money(`Base combined obligation, ${plural(n)}${basic === 0 ? ' (none listed: $0)' : ''}`, basic), percent('Paying parent’s share of income', share * 100)];
  const lowTop = Math.max(...low.filter((x) => x[n + 1] != null).map((x) => x[1] as number));
  const lowAmt = (inc: number) => { const x = bracketRow(low, inc); return inc <= lowTop ? (x[n + 1] as number | null) : null; };
  let nights = nightsOf(inp.payerOvernights);
  const joint = Math.max(nights.payer, nights.other) < 365 * (1 - f.jointMinPctOfYear / 100);
  let award: number;
  if (!joint) {
    award = basic * share;
    const la = lowAmt(A);
    if (basic === 0) { award = la ?? 0; steps.push(money('Low income table, paying parent’s own income', award)); notes.push('self-support-reserve'); }
    else if (la != null && la < award) { award = la; steps.push(money('Low income table amount (lesser applies)', la)); notes.push('self-support-reserve'); }
    if (award < f.soleMinimumAward) award = f.soleMinimumAward;
  } else {
    if (nights.payer === 182 || nights.payer === 183) {
      const p = A <= B ? f.equalTimeLowerIncomeOvernights : 365 - f.equalTimeLowerIncomeOvernights;
      nights = { payer: p, other: 365 - p };
    }
    const red = (k: number) => n0(Math.min(k, f.jointBand1To) - f.jointBand1From) * f.jointBand1Factor + n0(k - f.jointBand2From) * f.jointBand2Factor;
    // the formula is applied to the parent with fewer overnights
    if (nights.payer <= nights.other) award = basic * share - red(nights.payer) * basic;
    else award = -(basic * (1 - share) - red(nights.other) * basic);
    steps.push(money(`Joint physical custody reduction (${Math.min(nights.payer, nights.other)} overnights)`, red(Math.min(nights.payer, nights.other)) * basic));
    notes.push('shared-applied');
  }
  const add = n0(inp.childcare) * f.childcareSharePct / 100 + n0(inp.health) * f.healthSharePct / 100;
  let amount = award + add - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  if (add > 0) steps.push(money('Child care and premium, half each', add));
  if (joint) steps.push(text('Custody', 'joint physical custody (more than 30% of overnights each)'));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
