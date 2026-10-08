/**
 * Wisconsin, Wis. Admin. Code ch. DCF 150: percentage of the payer's gross monthly income (DCF 150.035(2)),
 * reduced marginal rates for high-income payers (DCF 150.04(5)), the Appendix C amounts for low-income
 * payers (DCF 150.04(4)), and the shared-placement formula (DCF 150.035(1)): each parent's amount × 150% ×
 * the other parent's share of placement, offset, the payer paying the lesser of that or the designated amount.
 * The low-income table and high-income rates adjust the payer's amount only (DCF 150.035(1)(b)5).
 * All parameters come from src/data/cs/wisconsin.json.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { percentAmount } from '../child-support';
import { n0, plural, money, percent, text, nightsOf } from './_util';

type LowRow = [number, ...Array<[number, number]>];

export default function wisconsin(d: CSData, inp: CSInput): CSResult {
  const P = d.percent!;
  const maxN = P.byChildren.length;
  const n = Math.max(1, Math.min(Math.round(inp.children), maxN));
  const notes: string[] = [];
  if (inp.children > maxN) notes.push('children-capped');
  const low = (d.schedule?.rows ?? []) as unknown as LowRow[];
  const lowTop = low.length ? low[low.length - 1][0] : -Infinity;
  const tiers = P.tiers ?? [];
  const firstTier = tiers[0]?.upTo ?? Infinity;

  /** Designated amount for one parent: Appendix C at low income, (reduced) percentages otherwise. */
  const designated = (income: number): { amount: number; how: string } => {
    if (low.length && income <= lowTop) {
      const row = low.find((r) => income <= r[0])!;
      const [rate, amount] = row[n] as [number, number];
      return { amount, how: `low-income table (DCF 150 Appendix C), ${rate}% bracket` };
    }
    const amount = percentAmount(income, n, P);
    return { amount, how: income > firstTier ? 'high-income rates (DCF 150.04(5))' : 'percentage standard' };
  };

  const A = n0(inp.payer), B = n0(inp.other);
  const nights = nightsOf(inp.payerOvernights);
  const sh = d.shared;
  const steps: CSStep[] = [money('Payer’s monthly income available for child support', A)];
  const dA = designated(A);
  if (dA.how.startsWith('low')) notes.push('low-income-table');
  if (dA.how.startsWith('high')) notes.push('high-income-rates');
  steps.push(percent(`Standard percentage, ${plural(n)}`, P.byChildren[n - 1]));
  steps.push(money(`Designated amount (${dA.how})`, dA.amount));

  let monthly = dA.amount, reverse = 0;
  if (sh && sh.method === 'cross-credit' && sh.thresholdOvernights != null && nights.payer >= sh.thresholdOvernights) {
    const m = sh.multiplier ?? 1;
    // DCF 150.04(4)-(5) adjust the amount of a low- or high-income *payer*; the other parent's side of the
    // shared-placement formula uses the percentage standard (as in the DCF 150.035(1) worked example).
    const dB = { amount: (B * P.byChildren[n - 1]) / 100 };
    const owesA = dA.amount * m * (nights.other / 365);
    const owesB = dB.amount * m * (nights.payer / 365);
    steps.push(money(`Shared placement: payer’s amount × ${m * 100}% × other parent’s ${Math.round((nights.other / 365) * 100)}% of time`, owesA));
    steps.push(money(`Other parent’s amount × ${m * 100}% × payer’s ${Math.round((nights.payer / 365) * 100)}% of time`, owesB));
    const net = owesA - owesB;
    if (net >= 0) monthly = Math.min(net, dA.amount);
    else { monthly = 0; reverse = Math.min(-net, dB.amount); notes.push('reverse'); }
    notes.push('shared-applied');
  }
  if (inp.childcare > 0 || inp.health > 0) steps.push(text('Child care and other variable costs, health insurance', 'assigned separately by the court (DCF 150.035(1)(b)6, DCF 150.05)'));
  return { monthly, reverse, basicMonthly: dA.amount, payerShare: A + B > 0 ? A / (A + B) : 1, steps, notes };
}
