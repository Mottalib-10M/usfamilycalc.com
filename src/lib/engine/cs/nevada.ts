/**
 * Nevada, NAC 425: marginal tiers of the obligor's gross monthly income with an extra rate per child beyond
 * four (NAC 425.140), the yearly low-income schedule (NAC 425.145, rows rebuilt from the official calculator),
 * and joint physical custody: each parent's obligation computed and offset (NAC 425.115(3)), joint custody
 * being taken from the threshold stored in the data (NRS 125C.003(1)(a) days). No multiplier, no cap.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, money, text, nightsOf } from './_util';

type Tier = { upTo: number | null; pct: number[]; additionalChildPct: number };

export default function nevada(d: CSData, inp: CSInput): CSResult {
  const tiers = (d.percent!.tiers ?? []) as unknown as Tier[];
  const F = d.formula as { jointCustody: { minDaysEachParent: number } };
  const rows = d.schedule?.rows ?? [];
  const cols = rows.length ? rows[0].length - 1 : 0;
  const n = Math.max(1, Math.round(inp.children));
  const notes: string[] = [];

  /** Obligation of one parent for n children: low-income row, or the sum over tiers. */
  const obligation = (gmi: number): { amount: number; how: string } => {
    if (rows.length && gmi <= rows[rows.length - 1][0]) {
      const row = rows.find((r) => gmi <= r[0])!;
      if (n > cols) notes.push('children-capped');
      return { amount: row[Math.min(n, cols)], how: `low-income schedule, row up to $${row[0].toLocaleString('en-US')}` };
    }
    let left = gmi, prev = 0, total = 0;
    for (const t of tiers) {
      const width = t.upTo == null ? Infinity : t.upTo - prev;
      const part = Math.max(0, Math.min(left, width));
      const base = t.pct[Math.min(n, t.pct.length) - 1];
      const rate = base + Math.max(0, n - t.pct.length) * t.additionalChildPct;
      total += (part * rate) / 100;
      left -= part; prev = t.upTo ?? prev;
      if (left <= 0) break;
    }
    return { amount: total, how: 'NAC 425.140 tiers' };
  };

  const A = n0(inp.payer), B = n0(inp.other);
  const oA = obligation(A);
  if (oA.how.startsWith('low')) notes.push('low-income-table');
  const steps: CSStep[] = [money('Obligor’s gross monthly income', A), money(`Base obligation, ${plural(n)} (${oA.how})`, oA.amount)];
  let monthly = oA.amount, reverse = 0;
  const nights = nightsOf(inp.payerOvernights);
  if (nights.payer >= F.jointCustody.minDaysEachParent) {
    const oB = obligation(B);
    steps.push(money(`Joint physical custody: other parent’s obligation (${oB.how})`, oB.amount));
    const net = oA.amount - oB.amount;
    if (net >= 0) monthly = net; else { monthly = 0; reverse = -net; notes.push('reverse'); }
    steps.push(money('Offset (NAC 425.115(3))', net));
    notes.push('shared-applied');
  }
  if (inp.childcare > 0 || inp.health > 0) steps.push(text('Child care and medical support', 'divided equitably by the court (NAC 425.130, 425.135), outside the base obligation'));
  return { monthly, reverse, basicMonthly: oA.amount, payerShare: A + B > 0 ? A / (A + B) : 1, steps, notes };
}
