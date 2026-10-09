/**
 * Vermont, 15 V.S.A. §§ 653-657. Table of Intact Family Expenditures in brackets [from, to, c1..c6] of combined
 * monthly available income; the children's health premium is deducted from the available income of the parent
 * who pays it (§ 653(1)(B)); child care is added to the total support obligation, shared by income (§ 653(9),
 * § 656(a)). Self-support reserve: below it (or below the lowest table income) the court orders a nominal
 * amount; otherwise the payer keeps at least the reserve (§ 656(b)-(c)). Shared custody when each parent has
 * 30% or more of the overnights: table amount × 1.5, payer's income share of the total minus the payer's time
 * share of the increased amount (OCS shared worksheet, Lines 8-15), never more than the sole-custody amount
 * (§ 657(a), (c)); a negative result is paid by the other parent, at least the worksheet minimum (Line 18).
 * The 25% to under 30% shared costs table (§ 657(b)) is not published with the 2024 tables: not applied.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { bracketRow } from './oregon';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { sharedPctOfYear: number; partialSharedPctOfYear: number; sharedMultiplier: number; reverseMinimum: number };

export default function vermont(d: CSData, inp: CSInput): CSResult {
  const rows = d.schedule!.rows as Array<Array<number | null>>;
  const f = d.formula as unknown as F;
  const ssr = d.lowIncome!.selfSupportReserve as number;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const premium = n0(inp.health);
  const A = n0(inp.payer - (inp.healthBy === 'payer' ? premium : 0));
  const B = n0(inp.other - (inp.healthBy === 'other' ? premium : 0));
  const C = A + B;
  const share = C > 0 ? A / C : 1;
  const lowest = rows[0][0] as number;
  const row = bracketRow(rows, C);
  const basic = (row[n + 1] as number) ?? 0;
  if (C < lowest) notes.push('below-min');
  if (C > (rows[rows.length - 1][1] as number)) notes.push('above-max-discretion');
  const care = n0(inp.childcare);
  const steps: CSStep[] = [];
  if (premium > 0) steps.push(text('Children’s health premium', `deducted from the available income of the ${inp.healthBy === 'payer' ? 'paying' : 'other'} parent (15 V.S.A. § 653(1))`));
  steps.push(money('Combined monthly available income', C));
  steps.push(money(`Guideline amount in the Intact Family Expenditures Table, ${plural(n)}`, basic));
  steps.push(percent('Paying parent’s share of available income', share * 100));
  const sole = share * (basic + care);
  if (care > 0) steps.push(money('Child care added to the total, payer’s share', share * care));
  const nights = nightsOf(inp.payerOvernights);
  const full = Math.ceil((f.sharedPctOfYear / 100) * 365), partial = Math.ceil((f.partialSharedPctOfYear / 100) * 365);
  let amount = sole, reverse = 0;
  if (nights.payer >= full) {
    const increased = basic * f.sharedMultiplier;
    const result = share * (increased + care) - (nights.payer / 365) * increased;
    steps.push(money(`Shared custody: table × ${f.sharedMultiplier}, minus the payer’s ${nights.payer} overnights`, result));
    notes.push('shared-applied');
    if (result < 0) {
      reverse = Math.max(-result, f.reverseMinimum);
      amount = 0;
      if (reverse > -result) steps.push(money('Owed by the other parent, worksheet minimum', reverse));
    } else amount = Math.min(result, sole);
    if (result > sole) steps.push(text('Cap', 'not more than the sole-custody amount (15 V.S.A. § 657(c))'));
  } else if (nights.payer >= partial) {
    steps.push(text('Partial shared custody', `${nights.payer} overnights: the shared costs table of § 657(b) is not published; sole-custody amount shown`));
  }
  if (amount > 0) {
    if (A < ssr || A < lowest) {
      steps.push(text('Below the self-support reserve', 'the court sets a nominal amount (15 V.S.A. § 656(b))'));
      notes.push('self-support-reserve');
      amount = 0;
    } else if (A - amount < ssr) {
      amount = A - ssr;
      steps.push(money(`Limited to income above the $${ssr.toLocaleString('en-US')} self-support reserve`, amount));
      notes.push('self-support-reserve');
    }
  }
  if (reverse > 0) notes.push('reverse');
  return { monthly: n0(amount), reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
