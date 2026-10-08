/**
 * Massachusetts Child Support Guidelines (effective December 1, 2025), worksheet CJD 304. Weekly amounts.
 * Available income = gross income minus the children's health premium paid by that parent (§ II.H).
 * Support for one child from Table A on combined available income, capped at $8,654 a week (§ II.C.2);
 * × Table B factor for the number of children; Table C (children 18+) not applied: the inputs carry no ages.
 * Paying parent's share by income; plus his or her share of child care up to $430 per child per week.
 * Box 2 (children mainly with one parent): when support is under 10% of the recipient's available income,
 * the lesser of the support and (that percentage + 10%) × payer income (line 7b; the chart's shaded floor is
 * not modeled). Box 1 (shared approximately equally; this calculator uses it from half the year, 182 overnights): each parent's share is
 * computed and the larger one pays the difference. Low payer income (Table A first tranches, § II.C.1):
 * no more than $15 a week up to $301, no more than $15 + 20% above $301 up to $391.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { toPeriod, toMonthly } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type Band = { basis: 'payor' | 'combined'; min: number; max: number; base: number; pct: number; above: number };
type F = {
  weeklyCap: number; tableA: Band[]; tableB_numberOfChildrenFactor: Record<string, number>;
  childCareCapPerChildPerWeek: number; incomeDisparityThresholdPct: number;
};

export default function massachusetts(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const w = (m: number) => toPeriod(m, 'weekly');
  const hP = inp.healthBy === 'payer' ? n0(inp.health) : 0, hO = inp.healthBy === 'other' ? n0(inp.health) : 0;
  const payerGross = w(n0(inp.payer));
  const A = n0(w(n0(inp.payer) - hP)), B = n0(w(n0(inp.other) - hO)), C = A + B;
  const share = C > 0 ? A / C : 1;
  const applied = Math.min(C, f.weeklyCap);
  if (C > f.weeklyCap) notes.push('above-cap');
  const combinedBands = f.tableA.filter((b) => b.basis === 'combined');
  const band = combinedBands.find((b) => applied <= b.max) ?? combinedBands[combinedBands.length - 1];
  const oneChild = band.base + (band.pct / 100) * (Math.max(applied, band.min) - band.above);
  const factor = f.tableB_numberOfChildrenFactor[String(n)];
  const combinedSupport = oneChild * factor;
  const steps: CSStep[] = [
    money('Combined available income (shown monthly)', toMonthly(C, 'weekly')),
    money('Table A amount for one child (shown monthly)', toMonthly(oneChild, 'weekly')),
    text(`Table B factor, ${plural(n)}`, factor.toFixed(2)),
    percent('Paying parent’s share of income', share * 100),
  ];
  if (C > f.weeklyCap) steps.splice(1, 0, money(`Income counted (cap $${f.weeklyCap.toLocaleString('en-US')} a week, shown monthly)`, toMonthly(f.weeklyCap, 'weekly')));
  const care = Math.min(w(n0(inp.childcare)), f.childCareCapPerChildPerWeek * n);
  const nights = nightsOf(inp.payerOvernights);
  let amount: number;
  if (nights.payer >= Math.floor(365 / 2)) { // calculator convention for “approximately equal”: half the year
    amount = combinedSupport * share - combinedSupport * (1 - share) + care * share;
    steps.push(text('Parenting plan', 'shared approximately equally (worksheet Box 1): difference of the two shares'));
    notes.push('shared-applied');
  } else {
    const before = combinedSupport * share;
    amount = before + care * share;
    const R = B;
    const ratio = R > 0 ? amount / R : 1;
    const t = f.incomeDisparityThresholdPct / 100;
    if (ratio < t) {
      const limit = (ratio + t) * A;
      if (limit < amount) { amount = Math.min(before, limit); steps.push(money('Income disparity limit, line 7b (shown monthly)', toMonthly(amount, 'weekly'))); }
    }
  }
  if (care > 0) steps.push(money('Child care, paying parent’s share (shown monthly)', toMonthly(care * share, 'weekly')));
  const low = f.tableA.filter((b) => b.basis === 'payor');
  const lowBand = low.find((b) => payerGross <= b.max);
  if (lowBand && amount > 0) {
    const ceiling = lowBand.base + (lowBand.pct / 100) * Math.max(0, payerGross - lowBand.above);
    if (amount > ceiling) { amount = ceiling; notes.push('self-support-reserve'); steps.push(money('Low-income limit of Table A (shown monthly)', toMonthly(ceiling, 'weekly'))); }
  }
  steps.push(text('Children 18 or older (Table C)', 'not applied: all children counted as under 18'));
  let monthly = toMonthly(amount, 'weekly'), reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: toMonthly(combinedSupport, 'weekly'), payerShare: share, steps, notes };
}
