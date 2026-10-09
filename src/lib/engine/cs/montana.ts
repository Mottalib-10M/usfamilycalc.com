/**
 * Montana Child Support Guidelines (ARM 37.62.101-148), CSSD Worksheets A-C and E (2026 tables, CS 404.2).
 * Annual amounts, every line rounded to whole dollars. Income = income after deductions (WS-A line 3).
 * Line 5 income available = line 3 - personal allowance; line 6 = 12 % of line 3, or the WS-C minimum when
 * line 5 is 0 (income ratio table); line 7 = higher of 5 and 6 → parental share. Need = primary allowance +
 * child care + children's health premium. Line 16 = lower of (share × need) and line 5; SOLA = (line 5 − line 16)
 * × SOLA factor; line 22 = higher of (16 + SOLA) and line 6 (a parent on the minimum pays line 6); line 24 =
 * line 22 − expenses paid. Shared parenting (WS-B part 2): a child with more than 110 days in each home, each
 * parent's obligation reduced by credit factor × (own days − 110), then offset. Child care is taken as paid by
 * the parent the child lives with.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = {
  personalAllowanceAnnual: number;
  primaryAllowanceAnnual: Record<string, number>;
  solaFactor: Record<string, number | null>;
  minimumSupport: { incomeRatioTable: Array<[number, number]> };
  minimumPct: number;
  standardParentingDays: number;
  creditFactorPerDay: number;
};

const r = (x: number) => Math.round(x);
const byChildren = (t: Record<string, number | null>, n: number) => {
  const keys = Object.keys(t).map(Number).sort((a, b) => a - b);
  const k = keys.filter((x) => x <= n).pop() ?? keys[0];
  return t[String(k)] ?? 0;
};

export default function montana(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const notes: string[] = [];
  const n = Math.max(1, Math.round(inp.children));
  const PA = f.personalAllowanceAnnual;
  const line3 = [r(n0(inp.payer) * 12), r(n0(inp.other) * 12)];
  const line5 = line3.map((x) => Math.max(0, x - PA));
  const wsC = (inc: number) => {
    const ratio = PA > 0 ? inc / PA : 0;
    const row = f.minimumSupport.incomeRatioTable.find(([upTo]) => ratio <= upTo);
    return r(inc * (row ? row[1] : 0));
  };
  const line6 = line5.map((x, i) => (x === 0 ? wsC(line3[i]) : r(line3[i] * f.minimumPct)));
  const onMin = line5.map((x, i) => line6[i] > x);
  const line7 = line5.map((x, i) => Math.max(x, line6[i]));
  const total7 = line7[0] + line7[1];
  const share = total7 > 0 ? line7[0] / total7 : 1;
  const shares = [share, 1 - share];
  const care = r(n0(inp.childcare) * 12), health = r(n0(inp.health) * 12);
  const need = byChildren(f.primaryAllowanceAnnual, n) + care + health;
  const solaF = byChildren(f.solaFactor, n);
  const line22 = [0, 1].map((i) => {
    if (onMin[i]) return line6[i];
    const l16 = Math.min(r(need * shares[i]), line5[i]);
    const sola = r(Math.max(0, line5[i] - l16) * solaF);
    return Math.max(l16 + sola, line6[i]);
  });
  // Expenses paid (WS-A line 23): child care by the other parent; premium by whoever pays it.
  const paid = [inp.healthBy === 'payer' ? health : 0, care + (inp.healthBy === 'other' ? health : 0)];
  const line24 = [0, 1].map((i) => line22[i] - paid[i]);

  const steps: CSStep[] = [
    money('Income after deductions minus personal allowance (paying parent, a month)', line5[0] / 12),
    percent('Paying parent’s share of income available', share * 100),
    money(`Primary allowance and supplements, ${plural(n)} (a month)`, need / 12),
  ];
  if (onMin[0]) { steps.push(text('Paying parent', 'minimum contribution applies (ARM 37.62.126)')); notes.push('below-min'); }
  else steps.push(percent('Standard of living adjustment factor', solaF * 100));

  const nights = nightsOf(inp.payerOvernights);
  const days = [nights.payer, nights.other];
  let annual: number;
  let reverse = 0;
  if (days[0] > f.standardParentingDays && days[1] > f.standardParentingDays) {
    // WS-B part 2, per child (children treated alike), then summed.
    const ob = line24.map((x) => x / n);
    const red = ob.map((o, i) => o - r(f.creditFactorPerDay * (days[i] - f.standardParentingDays) * o));
    const diff = red[0] - red[1];
    if (diff >= 0) annual = Math.min(diff, ob[0]) * n;
    else { annual = 0; reverse = Math.min(-diff, ob[1]) * n; }
    notes.push('shared-applied');
    steps.push(text('Parenting days', `more than ${f.standardParentingDays} days in each home: credit for days above ${f.standardParentingDays}, then offset`));
  } else {
    annual = Math.max(0, line24[0]);
  }
  steps.push(money('Paying parent’s gross annual support, a month', line22[0] / 12));
  // Monthly payment per child, rounded to whole dollars (ARM 37.62.134(2)).
  const perChildMonthly = (a: number) => r(a / n / 12) * n;
  let monthly = perChildMonthly(annual);
  reverse = reverse > 0 ? perChildMonthly(reverse) : 0;
  if (reverse > 0) { monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: (line22[0] + line22[1]) / 12, payerShare: share, steps, notes };
}
