/**
 * Nebraska Child Support Guidelines, Neb. Ct. R. § 4-201 et seq.: combined monthly net income, Table 1
 * ($50 rows); above the top row, the top amount plus a percentage of the excess (§ 4-203(C)); share by income
 * (§ 4-207); health insurance added and prorated, the paying parent credited (§ 4-215); child care prorated
 * (§ 4-214). Joint physical custody (each parent more than 142 days): Worksheet 3, table × 1.5 cross-credited by
 * the other parent's days (§ 4-212). Basic subsistence limitation: the order may not leave the obligor below the
 * monthly limit, but never below the minimum support, the greater of $50 or 10 % of net income (§§ 4-209, 4-218).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent } from './_util';

type F = { minimumSupportFloor: number; minimumSupportPctOfNet: number; basicSubsistenceLimitMonthly: number; jointCustodyPresumptionDaysOver: number };

export default function nebraska(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!, sh = d.shared!, f = d.formula as unknown as F;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const basic = scheduleLookup(s, C, n, notes);
  const steps: CSStep[] = [
    money('Combined monthly net income', C),
    money(C > s.maxIncome ? `Table 1 amount at $${s.maxIncome.toLocaleString('en-US')} plus ${s.aboveMax.pct?.[n - 1]} % of the excess, ${plural(n)}` : `Table 1 amount, ${plural(n)}`, basic),
    percent('Paying parent’s percentage contribution', share * 100),
  ];
  const care = n0(inp.childcare);
  const hPayer = inp.healthBy === 'payer' ? n0(inp.health) : 0;
  const hOther = inp.healthBy === 'other' ? n0(inp.health) : 0;
  const nights = nightsOf(inp.payerOvernights);
  let amount: number;
  if (sh.thresholdOvernights != null && sh.multiplier && nights.payer >= sh.thresholdOvernights) {
    // Worksheet 3, lines 1-16.
    const adj = basic * sh.multiplier;
    const basicNet = adj * share * (nights.other / 365) - adj * (1 - share) * (nights.payer / 365);
    const premium = (hPayer + hOther) * share - hPayer;
    amount = basicNet + premium + care * share;
    steps.push(money(`Joint physical custody (Worksheet 3): table × ${sh.multiplier}`, adj));
    steps.push(money('Support after cross-credit of days', basicNet));
    notes.push('shared-applied');
  } else {
    // Worksheet 1: premium added to the table amount and prorated, credit to the parent who pays it.
    amount = (basic + hPayer + hOther) * share - hPayer + care * share;
    if (care + hPayer + hOther > 0) steps.push(money('Health insurance and child care, paying parent’s share net of premium paid', (hPayer + hOther + care) * share - hPayer));
  }
  // § 4-218 basic subsistence limitation, floored by the § 4-209 minimum.
  const minimum = Math.max(f.minimumSupportFloor, (A * f.minimumSupportPctOfNet) / 100);
  const room = Math.max(minimum, A - f.basicSubsistenceLimitMonthly);
  if (amount > room) {
    amount = room; notes.push('self-support-reserve');
    steps.push(money(`Basic subsistence limitation: income above $${f.basicSubsistenceLimitMonthly.toLocaleString('en-US')} (minimum $${f.minimumSupportFloor} or ${f.minimumSupportPctOfNet} % of net income)`, room));
  }
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
