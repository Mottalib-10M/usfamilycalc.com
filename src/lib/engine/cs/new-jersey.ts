/**
 * New Jersey, Rule 5:6A Appendix IX-F (combined net WEEKLY income) and Appendix IX-A.
 * Basic award from the schedule row of the combined weekly income, × the paying parent's income share.
 * Paying parent at or above the shared-parenting threshold (28% of overnights) and with fewer overnights:
 * shared-parenting award (para. 14(g)-(h)): PAR share × (award + PAR fixed) − PAR fixed − PAR variable,
 * with PAR fixed = 2 × PAR% × fixed% × award and PAR variable = PAR% × variable% × award. Below the threshold,
 * the maximum PAR-time credit (para. 13(b)(1)): award × variable% × PAR%. Supplemental expenses (child care,
 * premium) shared by income. Self-support reserve (para. 7(h)): if paying would leave the obligor under the
 * reserve while the other parent stays above it, the award is reduced to the income above the reserve, not
 * under the minimum award. Amounts computed weekly and returned monthly.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup, toPeriod, toMonthly } from '../child-support';
import { n0, plural, nightsOf, money, percent } from './_util';

type F = { fixedPct: number; variablePct: number; sharedMinPctOfOvernights: number; minimumAwardWeekly: number };

export default function newJersey(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!;
  const f = d.formula as unknown as F;
  const per = d.period;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = toPeriod(n0(inp.payer), per), B = toPeriod(n0(inp.other), per), C = A + B;
  const share = C > 0 ? A / C : 1;
  const award = scheduleLookup(s, C, n, notes);
  const steps: CSStep[] = [money('Combined net income, a month', toMonthly(C, per)), money(`Basic award in Appendix IX-F, ${plural(n)}`, toMonthly(award, per)), percent('Paying parent’s income share', share * 100)];
  const nights = nightsOf(inp.payerOvernights);
  const p = nights.payer / 365;
  const fx = f.fixedPct / 100, vr = f.variablePct / 100;
  let basicPart: number;
  if (nights.payer <= nights.other && p * 100 >= f.sharedMinPctOfOvernights) {
    const parFixed = 2 * p * fx * award, parVar = p * vr * award;
    basicPart = share * (award + parFixed) - parFixed - parVar;
    steps.push(money('Shared parenting: PAR fixed and variable expenses deducted', toMonthly(parFixed + parVar, per)));
    notes.push('shared-applied');
  } else if (nights.payer > 0 && nights.payer <= nights.other) {
    const credit = award * vr * p;
    basicPart = award * share - credit;
    steps.push(money('Parenting-time credit (maximum: variable expenses × time share)', toMonthly(credit, per)));
    notes.push('shared-applied');
  } else basicPart = award * share;
  const addOn = toPeriod(n0(inp.childcare) + n0(inp.health), per);
  if (addOn > 0) steps.push(money('Child care and health insurance, paying parent’s share', toMonthly(addOn * share, per)));
  let weekly = basicPart + addOn * share - (inp.healthBy === 'payer' ? toPeriod(n0(inp.health), per) : 0);
  // Self-support reserve (para. 7(h)).
  const li = d.lowIncome;
  if (li?.selfSupportReserve && weekly > 0 && A - weekly < li.selfSupportReserve && B - (award - award * share) > li.selfSupportReserve) {
    const capped = Math.max(f.minimumAwardWeekly, A - li.selfSupportReserve);
    if (capped < weekly) { weekly = capped; notes.push('self-support-reserve'); steps.push(money('Reduced to keep the self-support reserve', toMonthly(weekly, per))); }
  }
  let monthly = toMonthly(weekly, per), reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: toMonthly(award, per), payerShare: share, steps, notes };
}
