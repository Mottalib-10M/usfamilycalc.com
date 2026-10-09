/**
 * North Dakota, N.D. Admin. Code ch. 75-02-04.1 (obligor-only model). The schedule of 75-02-04.1-10 is read
 * at the obligor's monthly net income rounded to the nearest $100 (02(5)); the obligee's income is not used.
 * The children's health premium paid by a parent is a deduction in that parent's net income (01(6)(d)); child
 * care is only a deviation factor (09(2)). Extended parenting time (more than 100 court-ordered overnights):
 * per-child amount × (365 − 0.32 × overnights) / 365 (08.1). Equal residential responsibility: an obligation
 * for each parent as if the other had the children, the lesser subtracted from the greater (08.2), without the
 * extended parenting time adjustment (08.1(3)). Amounts rounded to the whole dollar, 50 cents up (02(4)).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, text } from './_util';

type F = { incomeRoundTo: number; extendedParentingOvernightsOver: number; extendedParentingFactor: number; daysInYear: number };

const roundDollar = (x: number) => Math.floor(x + 0.5);

/** Schedule amount for an obligor's monthly net income (rounded to the nearest step, top row above the table). */
function scheduleAmount(rows: number[][], f: F, income: number, n: number): { amount: number; rounded: number } {
  const rounded = Math.floor(n0(income) / f.incomeRoundTo + 0.5) * f.incomeRoundTo;
  let row = rows[0];
  for (const r of rows) if (r[0] <= rounded) row = r; else break;
  return { amount: row[n] ?? 0, rounded };
}

export default function northDakota(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const rows = d.schedule!.rows;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const premium = n0(inp.health);
  // the children's premium is deducted in computing the net income of the parent who pays it (01(6)(d))
  const A = n0(inp.payer - (inp.healthBy === 'payer' ? premium : 0));
  const B = n0(inp.other - (inp.healthBy === 'other' ? premium : 0));
  const own = scheduleAmount(rows, f, A, n);
  const top = rows[rows.length - 1][0];
  if (own.rounded >= top && A > top) notes.push('above-max-cap');
  if (own.rounded <= rows[0][0]) notes.push('below-min');
  const steps: CSStep[] = [];
  if (inp.healthBy === 'payer' && premium > 0) steps.push(money('Obligor’s net income after the children’s health premium', A));
  else steps.push(money('Obligor’s net income (the other parent’s income is not used)', A));
  steps.push(money(`Schedule amount at $${own.rounded.toLocaleString('en-US')}, ${plural(n)}`, own.amount));
  const nights = nightsOf(inp.payerOvernights);
  let monthly = own.amount, reverse = 0;
  if (nights.payer * 2 >= f.daysInYear - 1) {
    // equal residential responsibility (08.2): offset of the two obligations
    const theirs = scheduleAmount(rows, f, B, n);
    steps.push(money(`Other parent’s obligation at $${theirs.rounded.toLocaleString('en-US')} (equal residential responsibility)`, theirs.amount));
    const diff = own.amount - theirs.amount;
    if (diff >= 0) monthly = diff; else { monthly = 0; reverse = -diff; notes.push('reverse'); }
    notes.push('shared-applied');
  } else if (nights.payer > f.extendedParentingOvernightsOver) {
    const fraction = (f.daysInYear - nights.payer * f.extendedParentingFactor) / f.daysInYear;
    monthly = roundDollar((own.amount / n) * fraction * n);
    steps.push(text('Extended parenting time adjustment', `${nights.payer} overnights: × ${fraction.toFixed(4)} per child (75-02-04.1-08.1)`));
    notes.push('shared-applied');
  }
  if (n0(inp.childcare) > 0) steps.push(text('Child care', 'not added: a ground for deviation in North Dakota (75-02-04.1-09(2))'));
  steps.push(money(reverse > 0 ? 'Owed by the other parent' : 'Monthly support', reverse > 0 ? reverse : monthly));
  return { monthly, reverse, basicMonthly: own.amount, payerShare: 1, steps, notes };
}
