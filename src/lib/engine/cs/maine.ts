/**
 * Maine, 19-A M.R.S. §§ 2001-2011 and the DHHS Child Support Table (10-144 C.M.R. ch. 351, Chapter 6):
 * combined ANNUAL gross income, the row closest to it, the WEEKLY amount per child × the number of children
 * (§ 2006(1)); at more than the top row, not less than the top amount (§ 2006(5)(B)). Total basic obligation =
 * basic entitlement + child care + health insurance, divided by gross income (§ 2006(3)-(4)).
 * Substantially equal care (§ 2006(5)(D)-(D-1)): basic × 1.5 split by income, the higher earner pays the lower of
 * the difference and the sole-care amount; add-ons shared by income; equal incomes → no transfer.
 * Amounts computed weekly, returned monthly.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup, toMonthly } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { tableAmountsArePerChild: boolean; enhancedMultiplier: number; substantiallyEqualCareMinOvernights: number; maxCombinedAnnualIncome: number };

export default function maine(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!, f = d.formula as unknown as F;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B; // monthly
  const share = C > 0 ? A / C : 1;
  const annual = C * 12;
  const perChild = scheduleLookup(s, annual, n, notes); // weekly, per child
  const basicW = f.tableAmountsArePerChild ? perChild * n : perChild;
  const basicM = toMonthly(basicW, 'weekly');
  const steps: CSStep[] = [
    money('Combined gross income, a year', annual),
    money(`Weekly amount per child in the Maine table, ${plural(n)}${annual > f.maxCombinedAnnualIncome ? ' (top row: the minimum above the table)' : ''}`, perChild),
    money('Basic support entitlement (per child × children), a month', basicM),
    percent('Paying parent’s share of gross income', share * 100),
  ];
  const care = n0(inp.childcare);
  const hPayer = inp.healthBy === 'payer' ? n0(inp.health) : 0;
  const hOther = inp.healthBy === 'other' ? n0(inp.health) : 0;
  const extraNet = (care + hPayer + hOther) * share - hPayer;
  const sole = basicM * share;
  const nights = nightsOf(inp.payerOvernights);
  let basicPart = sole;
  if (nights.payer >= f.substantiallyEqualCareMinOvernights) {
    const enhanced = basicM * f.enhancedMultiplier;
    const diff = enhanced * share - enhanced * (1 - share);
    basicPart = A === B ? 0 : Math.min(Math.abs(diff), diff >= 0 ? sole : basicM * (1 - share)) * Math.sign(diff);
    steps.push(money(`Substantially equal care: enhanced entitlement (× ${f.enhancedMultiplier})`, enhanced));
    steps.push(text('Applied', 'lower of the difference of the enhanced shares and the sole-care amount, § 2006(5)(D-1)'));
    notes.push('shared-applied');
  }
  const amount = basicPart + extraNet;
  if (extraNet !== 0) steps.push(money('Child care and health insurance, paying parent’s share net of premium paid', extraNet));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basicM, payerShare: share, steps, notes };
}
