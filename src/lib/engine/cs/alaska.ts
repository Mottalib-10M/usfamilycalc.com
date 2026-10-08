/**
 * Alaska Civil Rule 90.3: percentage of the obligor's adjusted annual income (90.3(a)(2)), income counted up
 * to the cap (90.3(c)(2)), minimum order (90.3(c)(3)), shared physical custody from 30% of the year (110
 * overnights): reciprocal amounts weighted by the other parent's time, offset, × 1.5, never above the
 * primary-custody amount (90.3(b)(1)); health insurance split equally (90.3(d)(1)(B)). Annual amounts.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, money, percent, text, nightsOf } from './_util';

type F = {
  percentages: Record<string, number>; incomeCapAnnual: number; minimumAnnual: number;
  lowIncomeThresholdAnnual: number; lowIncomeDeductionAnnual: number;
  sharedMinOvernights: number; sharedMultiplier: number; healthInsuranceSplit: { shareEach: number };
};

export default function alaska(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const n = Math.max(1, Math.round(inp.children));
  const base = Math.min(n, 3);
  const rate = f.percentages[String(base)] + Math.max(0, n - 3) * f.percentages.eachAdditional;
  const notes: string[] = [];
  const A = n0(inp.payer) * 12, B = n0(inp.other) * 12;
  /** Primary-custody amount of one parent, a year: cap, percentage, minimum. */
  const primary = (inc: number) => Math.max(f.minimumAnnual, (Math.min(inc, f.incomeCapAnnual) * rate) / 100);
  const steps: CSStep[] = [money('Obligor’s adjusted income, a month', A / 12)];
  if (A > f.incomeCapAnnual) { steps.push(money('Income counted (Rule 90.3(c)(2) cap), a month', f.incomeCapAnnual / 12)); notes.push('above-cap'); }
  steps.push(percent(`Rule 90.3 percentage, ${plural(n)}`, rate));
  const pA = primary(A);
  if ((Math.min(A, f.incomeCapAnnual) * rate) / 100 < f.minimumAnnual) { notes.push('below-min'); steps.push(money('Minimum order applied, a month', f.minimumAnnual / 12)); }
  let annual = pA, reverse = 0;
  const nights = nightsOf(inp.payerOvernights);
  if (nights.payer >= f.sharedMinOvernights) {
    const a = pA * (nights.other / 365), b = primary(B) * (nights.payer / 365);
    steps.push(money('Shared custody: obligor’s amount × other parent’s time, a month', a / 12));
    steps.push(money('Other parent’s amount × obligor’s time, a month', b / 12));
    if (a >= b) annual = Math.min((a - b) * f.sharedMultiplier, pA);
    else { annual = 0; reverse = Math.min((b - a) * f.sharedMultiplier, primary(B)); notes.push('reverse'); }
    steps.push(text('Difference', `× ${f.sharedMultiplier}, never above the primary-custody amount`));
    notes.push('shared-applied');
  }
  let monthly = annual / 12, rev = reverse / 12;
  if (inp.health > 0) {
    const half = inp.health * f.healthInsuranceSplit.shareEach;
    const adj = inp.healthBy === 'payer' ? -half : half;
    steps.push(money('Children’s health insurance, equal split', adj));
    if (monthly > 0 || rev === 0) monthly += adj; else rev -= adj;
    if (monthly < 0) { rev += -monthly; monthly = 0; }
  }
  if (A <= f.lowIncomeThresholdAnnual) steps.push(text('Low-income rule 90.3(a)(5)', `if total income is at or under the threshold, adjusted income may not exceed total income minus ${f.lowIncomeDeductionAnnual.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`));
  if (inp.childcare > 0) steps.push(text('Work-related child care', 'deducted from the income of the parent who pays it (90.3(a)(1)(E))'));
  return { monthly, reverse: rev, basicMonthly: pA / 12, payerShare: A + B > 0 ? A / (A + B) : 1, steps, notes };
}
