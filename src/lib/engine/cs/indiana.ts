/**
 * Indiana Child Support Rules and Guidelines (2024 schedule). Weekly table: combined weekly adjusted income,
 * nearest $10 row (Guideline 3D), up to eight children; above $9,200 a week, the percentage printed at the foot
 * of the schedule times combined income (read as a share of total income, see research uncertain). Child care
 * and the children's health premium added and prorated, payer credited (3E, 3G). Parenting time credit
 * (Guideline 6, Table PT): BCSO × TOTAL − BCSO × DUPLICATED × noncustodial parent's income share, from 52
 * overnights. A negative result is shown as owed by the other parent.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup, toPeriod, toMonthly } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type PT = { from: number; to: number; total: number; duplicated: number };

export default function indiana(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!, per = d.period;
  const extra = (d as unknown as { extra: { aboveMaxPct: number[] } }).extra;
  const table = ((d.shared as unknown as { table?: PT[] })?.table ?? []) as PT[];
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), Cm = A + B;
  const share = Cm > 0 ? A / Cm : 1;
  const Cw = toPeriod(Cm, per);
  let basicW: number;
  const steps: CSStep[] = [money('Combined adjusted income (monthly equivalent)', Cm), money('Combined weekly adjusted income', Cw)];
  if (Cw > s.maxIncome) {
    const p = extra.aboveMaxPct[n - 1];
    basicW = (Cw * p) / 100;
    notes.push('above-max-pct');
    steps.push(money(`Basic obligation: ${p} % of combined income above the $${s.maxIncome.toLocaleString('en-US')} top row, ${plural(n)} (weekly)`, basicW));
  } else {
    basicW = scheduleLookup(s, Cw, n, notes);
    steps.push(money(`Basic Child Support Obligation, weekly schedule, ${plural(n)}`, basicW));
  }
  steps.push(percent('Noncustodial parent’s share of income', share * 100));
  const nights = nightsOf(inp.payerOvernights);
  const row = table.find((r) => nights.payer >= r.from && nights.payer <= r.to) ?? (table.length && nights.payer > table[table.length - 1].to ? table[table.length - 1] : undefined);
  let creditW = 0;
  if (row && row.total > 0) {
    creditW = basicW * row.total - basicW * row.duplicated * share;
    steps.push(money(`Parenting time credit, ${nights.payer} overnights (Table PT ${row.total} / ${row.duplicated}), weekly`, creditW));
    notes.push('shared-applied');
  }
  const careW = toPeriod(n0(inp.childcare), per), hPayerW = toPeriod(inp.healthBy === 'payer' ? n0(inp.health) : 0, per), hOtherW = toPeriod(inp.healthBy === 'other' ? n0(inp.health) : 0, per);
  const addW = (careW + hPayerW + hOtherW) * share - hPayerW;
  if (careW + hPayerW + hOtherW > 0) steps.push(money('Child care and health premium, share net of premium paid (weekly)', addW));
  const weekly = basicW * share + addW - creditW;
  steps.push(money('Weekly support', Math.max(0, weekly)));
  let monthly = toMonthly(weekly, per), reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); steps.push(text('Credit larger than the share', 'shown as owed by the other parent')); }
  return { monthly, reverse, basicMonthly: toMonthly(basicW, per), payerShare: share, steps, notes };
}
