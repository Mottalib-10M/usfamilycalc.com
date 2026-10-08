/**
 * Minnesota, Minn. Stat. §§ 518A.34–518A.42.
 * Basic support: the $100 bracket of the § 518A.35 schedule containing the combined PICS ($20,000 and over:
 * the top row), shared by PICS. Parenting expense adjustment (§ 518A.36, subd. 2) when the paying parent has
 * overnights: parent A (fewer overnights = payer), parent B; (A³ × B's share − B³ × A's share) / (A³ + B³);
 * a negative result is owed by parent A, a positive one by parent B. Child care and medical support by PICS
 * share. The ability-to-pay test (§ 518A.42) needs the self-support reserve in dollars (120% of the federal
 * poverty guideline), which is not in the data: not applied; the schedule's first row already equals the
 * § 518A.42 minimum basic support.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { parentingExpenseExponent: number; selfSupportReserveMonthly: number | null };

export default function minnesota(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!;
  const f = d.formula as unknown as F;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const basic = scheduleLookup(s, C, n, notes);
  const steps: CSStep[] = [
    money('Combined parental income for determining child support (PICS)', C),
    money(`Basic support in the Minnesota schedule, ${plural(n)}`, basic),
    percent('Paying parent’s share of PICS', share * 100),
  ];
  const aShare = basic * share, bShare = basic - aShare;
  const nights = nightsOf(inp.payerOvernights);
  let basicPart = aShare;
  if (nights.payer > 0) {
    const e = f.parentingExpenseExponent;
    const a3 = nights.payer ** e, b3 = nights.other ** e;
    const r = (a3 * bShare - b3 * aShare) / (a3 + b3);
    basicPart = -r; // negative r: parent A (payer) owes |r|; positive r: parent B owes r
    steps.push(money(`Parenting expense adjustment (${nights.payer} / ${nights.other} overnights, power ${e})`, basicPart));
    notes.push('shared-applied');
  }
  const addOn = n0(inp.childcare) + n0(inp.health);
  const amount = basicPart + addOn * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  if (addOn > 0) steps.push(money('Child care and medical support, paying parent’s share', addOn * share));
  if (f.selfSupportReserveMonthly == null) steps.push(text('Ability-to-pay test (§ 518A.42)', 'not applied: no dollar self-support reserve in the data'));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
