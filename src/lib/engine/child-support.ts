/**
 * Child support guideline engine: one function, the model of each state chosen by its data file
 * (src/data/cs/<slug>.json, built from research/cs by scripts/build-data.mjs).
 *
 * Inputs are MONTHLY amounts in the income basis the state uses (gross, net, adjusted gross…):
 * the calculator says which one. The engine converts them to the period of the state's table
 * (weekly, monthly, annual), applies the model, and returns a monthly obligation.
 *
 * Models:
 *  - income-shares: basic obligation read in the official schedule at the combined income,
 *    shared in proportion to incomes; child care and children's health insurance added and shared;
 *    shared-parenting rule of the state (cross-credit with a multiplier, or a percentage reduction).
 *  - percent-obligor: a percentage of the paying parent's income (with tiers and a cap).
 *  - percent-combined: a percentage of combined income (capped), shared in proportion to incomes.
 *  - ca-formula: California Family Code § 4055, CS = K[HN − (H%)(TN)].
 *  - melson / bands / custom: per-state functions in ./cs-custom.ts.
 */
import { customModel } from './cs-custom';

export type Period = 'monthly' | 'weekly' | 'annual' | 'biweekly';
export interface CSSchedule {
  rows: number[][];
  lookup: 'floor' | 'nearest' | 'interpolate' | 'bracket';
  minIncome: number;
  maxIncome: number;
  /** Rule above the top row: add pct (by number of children) of the excess, cap at the top row, or extrapolate. */
  aboveMax: { method: 'percent-of-excess' | 'cap' | 'discretion' | 'extrapolate'; pct?: number[] | null };
  /** Number of children per column when the table has age columns (WA, ME, KS): index of the column for n children. */
  columnFor?: number[] | null;
}
export interface CSShared {
  method: 'cross-credit' | 'percent-reduction' | 'none' | 'other';
  thresholdOvernights?: number | null;
  multiplier?: number | null;
  /** [minimum overnights of the paying parent, reduction in percent of the basic obligation] */
  reductionTable?: Array<[number, number]> | null;
}
export interface CSData {
  slug: string; name: string; abbr: string; verified: string;
  model: 'income-shares' | 'percent-obligor' | 'percent-combined' | 'ca-formula' | 'melson' | 'bands-combined' | 'other';
  modelName: string;
  incomeBasis: string;
  incomeLabel: string;
  period: Period;
  maxChildren: number;
  schedule?: CSSchedule | null;
  percent?: {
    byChildren: number[];
    /** Marginal tiers on the payer's income: each tier gives the rate by number of children. */
    tiers?: Array<{ upTo: number | null; pct: number[] }> | null;
    cap?: { amount: number; period: Period; appliesTo: 'obligor' | 'combined' } | null;
    /** Reduced percentages under an income threshold (Texas § 154.125(c)). */
    lowIncome?: { threshold: number; byChildren: number[] } | null;
  } | null;
  formula?: Record<string, unknown> | null;
  shared?: CSShared | null;
  addOns: { childcare: boolean; health: boolean };
  lowIncome?: { selfSupportReserve?: number | null; period?: Period; minimumOrder?: number | null; method?: 'cap-to-reserve' | 'built-in' | 'text' } | null;
}

export interface CSInput {
  /** Monthly income of the parent who pays (fewer overnights). */
  payer: number;
  /** Monthly income of the other parent. */
  other: number;
  children: number;
  /** Overnights per year with the paying parent (0–365). */
  payerOvernights: number;
  /** Monthly work-related child care. */
  childcare: number;
  /** Monthly health insurance premium for the children. */
  health: number;
  /** Who pays the premium. */
  healthBy: 'payer' | 'other';
}
export interface CSStep { label: string; value: string | number; kind?: 'money' | 'pct' | 'text' }
export interface CSResult {
  /** Monthly amount the paying parent owes (0 when the other parent owes). */
  monthly: number;
  /** Monthly amount owed the other way, when shared parenting reverses the flow. */
  reverse: number;
  /** Basic combined obligation, monthly. */
  basicMonthly: number;
  payerShare: number;
  steps: CSStep[];
  notes: string[];
}

const PER_YEAR: Record<Period, number> = { monthly: 12, weekly: 52, annual: 1, biweekly: 26 };
/** Monthly amount → amount per period of the table ($1,000 a month = $230.77 a week = $12,000 a year). */
export const toPeriod = (monthly: number, p: Period) => (monthly * 12) / PER_YEAR[p];
/** Amount per period of the table → monthly. */
export const toMonthly = (x: number, p: Period) => (x * PER_YEAR[p]) / 12;

const clampN = (n: number, max: number) => Math.max(1, Math.min(Math.round(n), max));
const at = (arr: number[] | null | undefined, i: number): number => (arr && arr.length ? arr[Math.min(i, arr.length - 1)] : 0);

/** Basic obligation from an income-shares schedule, in the period of the table. */
export function scheduleLookup(s: CSSchedule, combined: number, children: number, notes: string[] = []): number {
  const col = s.columnFor ? s.columnFor[children - 1] : children;
  const rows = s.rows;
  const top = rows[rows.length - 1];
  if (combined <= rows[0][0]) {
    if (combined < s.minIncome) notes.push('below-min');
    return rows[0][col] ?? 0;
  }
  if (combined >= top[0]) {
    const base = top[col] ?? 0;
    const excess = combined - top[0];
    if (excess <= 0) return base;
    if (s.aboveMax.method === 'percent-of-excess' && s.aboveMax.pct) { notes.push('above-max-pct'); return base + (excess * at(s.aboveMax.pct, children - 1)) / 100; }
    if (s.aboveMax.method === 'extrapolate') { notes.push('above-max-extrapolated'); return (base / top[0]) * combined; }
    notes.push(s.aboveMax.method === 'cap' ? 'above-max-cap' : 'above-max-discretion');
    return base;
  }
  // binary search for the last row whose income ≤ combined
  let lo = 0, hi = rows.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (rows[mid][0] <= combined) lo = mid; else hi = mid - 1; }
  const r0 = rows[lo], r1 = rows[Math.min(lo + 1, rows.length - 1)];
  if (s.lookup === 'interpolate' && r1[0] > r0[0]) {
    const t = (combined - r0[0]) / (r1[0] - r0[0]);
    return (r0[col] ?? 0) + t * ((r1[col] ?? 0) - (r0[col] ?? 0));
  }
  if (s.lookup === 'nearest') return combined - r0[0] <= r1[0] - combined ? (r0[col] ?? 0) : (r1[col] ?? 0);
  return r0[col] ?? 0; // floor / bracket: the row whose bracket contains the income
}

/** Amount of a percentage rule with optional marginal tiers, in the period of the rule. */
export function percentAmount(income: number, n: number, p: NonNullable<CSData['percent']>): number {
  if (p.tiers && p.tiers.length) {
    let left = income, prev = 0, total = 0;
    for (const t of p.tiers) {
      const width = t.upTo == null ? Infinity : t.upTo - prev;
      const part = Math.max(0, Math.min(left, width));
      total += (part * at(t.pct, n - 1)) / 100;
      left -= part; prev = t.upTo ?? prev;
      if (left <= 0) break;
    }
    return total;
  }
  return (income * at(p.byChildren, n - 1)) / 100;
}

export function childSupport(d: CSData, inp: CSInput): CSResult {
  const custom = customModel(d.slug);
  if (custom) return custom(d, inp);
  const n = clampN(inp.children, d.maxChildren);
  const notes: string[] = [];
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const per = d.period;
  const A = Math.max(0, inp.payer), B = Math.max(0, inp.other);
  const combinedM = A + B;
  const share = combinedM > 0 ? A / combinedM : 1;
  const steps: CSStep[] = [];
  const nights = Math.max(0, Math.min(365, inp.payerOvernights));
  let basicM = 0, payerBasicM = 0, reverse = 0;

  if (d.model === 'income-shares' && d.schedule) {
    basicM = toMonthly(scheduleLookup(d.schedule, toPeriod(combinedM, per), n, notes), per);
    steps.push({ label: 'Combined income', value: combinedM, kind: 'money' });
    steps.push({ label: `Basic obligation in the ${d.abbr} schedule, ${n} ${n === 1 ? 'child' : 'children'}`, value: basicM, kind: 'money' });
    steps.push({ label: 'Paying parent’s share of income', value: share * 100, kind: 'pct' });
  } else if (d.model === 'percent-combined' && d.percent) {
    const cap = d.percent.cap;
    const capM = cap ? toMonthly(cap.amount, cap.period) : Infinity;
    const base = Math.min(combinedM, capM);
    if (combinedM > capM) notes.push('above-cap');
    basicM = percentAmount(base, n, d.percent);
    steps.push({ label: 'Combined income', value: combinedM, kind: 'money' });
    if (combinedM > capM) steps.push({ label: 'Income counted (cap)', value: capM, kind: 'money' });
    steps.push({ label: `Guideline percentage, ${n} ${n === 1 ? 'child' : 'children'}`, value: at(d.percent.byChildren, n - 1), kind: 'pct' });
    steps.push({ label: 'Combined child support obligation', value: basicM, kind: 'money' });
    steps.push({ label: 'Paying parent’s share of income', value: share * 100, kind: 'pct' });
  } else if (d.model === 'percent-obligor' && d.percent) {
    const cap = d.percent.cap;
    const capM = cap ? toMonthly(cap.amount, cap.period) : Infinity;
    const base = Math.min(A, capM);
    if (A > capM) notes.push('above-cap');
    payerBasicM = percentAmount(base, n, d.percent);
    basicM = payerBasicM;
    steps.push({ label: 'Paying parent’s income', value: A, kind: 'money' });
    if (A > capM) steps.push({ label: 'Income counted (cap)', value: capM, kind: 'money' });
    if (!d.percent.tiers?.length) steps.push({ label: `Guideline percentage, ${n} ${n === 1 ? 'child' : 'children'}`, value: at(d.percent.byChildren, n - 1), kind: 'pct' });
  } else {
    notes.push('model-not-modeled');
    return { monthly: 0, reverse: 0, basicMonthly: 0, payerShare: share, steps, notes };
  }

  if (d.model !== 'percent-obligor') {
    const sh = d.shared;
    if (sh?.method === 'cross-credit' && sh.thresholdOvernights != null && nights >= sh.thresholdOvernights) {
      const adj = basicM * (sh.multiplier ?? 1);
      const payerOwes = adj * share * ((365 - nights) / 365);
      const otherOwes = adj * (1 - share) * (nights / 365);
      steps.push({ label: `Shared parenting: basic × ${sh.multiplier ?? 1}`, value: adj, kind: 'money' });
      payerBasicM = payerOwes - otherOwes;
      notes.push('shared-applied');
    } else if (sh?.method === 'percent-reduction' && sh.reductionTable?.length) {
      const red = [...sh.reductionTable].reverse().find(([min]) => nights >= min)?.[1] ?? 0;
      payerBasicM = basicM * share * (1 - red / 100);
      if (red > 0) { steps.push({ label: 'Parenting-time reduction', value: red, kind: 'pct' }); notes.push('shared-applied'); }
    } else {
      payerBasicM = basicM * share;
    }
  }

  // Add-ons: child care and children's health insurance, shared in proportion to income.
  const addOn = (d.addOns.childcare ? inp.childcare : 0) + (d.addOns.health ? inp.health : 0);
  let monthly = payerBasicM + addOn * share;
  if (d.addOns.health && inp.healthBy === 'payer') monthly -= inp.health;
  if (addOn > 0) steps.push({ label: 'Child care and health insurance, paying parent’s share', value: addOn * share, kind: 'money' });
  if (d.addOns.health && inp.healthBy === 'payer' && inp.health > 0) steps.push({ label: 'Credit for the premium the paying parent already pays', value: -inp.health, kind: 'money' });

  // Low income: a few states cap the order so the payer keeps a self-support reserve.
  const li = d.lowIncome;
  if (li?.method === 'cap-to-reserve' && li.selfSupportReserve) {
    const reserveM = toMonthly(li.selfSupportReserve, li.period ?? 'monthly');
    const room = Math.max(li.minimumOrder ? toMonthly(li.minimumOrder, li.period ?? 'monthly') : 0, A - reserveM);
    if (monthly > room) { monthly = room; notes.push('self-support-reserve'); steps.push({ label: 'Capped by the self-support reserve', value: reserveM, kind: 'money' }); }
  }

  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basicM, payerShare: share, steps, notes };
}
