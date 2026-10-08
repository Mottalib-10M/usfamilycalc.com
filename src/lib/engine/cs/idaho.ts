/**
 * Idaho Child Support Guidelines, I.R.F.L.P. 120: marginal percentages applied to the parents' combined annual
 * Guidelines Income (brackets of 120(i)(1), up to the income ceiling of 120(i)(7)); the total is shared in
 * proportion to income. Shared physical custody when each parent has more than 25 % of the overnights:
 * obligation × 1.5, each share weighted by the other parent's time, offset, never more than the sole amount
 * (120(i)(4)). Child care and health insurance shared pro rata (120(g)(1), (g)(4)). Rebuttable minimum of
 * $50 per child per month (120(c)(4)). Five children at most in the schedules (120(i)(2)).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { bracketWidths: number[]; pctByChildren: Record<string, number[]>; maxCombinedAnnualIncome: number; minimumPerChildMonthly: number; sharedNoMoreThanSole: boolean };

export default function idaho(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F, sh = d.shared!;
  const notes: string[] = [];
  const maxN = Object.keys(f.pctByChildren).length;
  const n = Math.max(1, Math.min(Math.round(inp.children), maxN));
  if (inp.children > maxN) notes.push('children-capped');
  const A = n0(inp.payer) * 12, B = n0(inp.other) * 12, C = A + B;
  const share = C > 0 ? A / C : 1;
  const counted = Math.min(C, f.maxCombinedAnnualIncome);
  if (C > f.maxCombinedAnnualIncome) notes.push('above-max-discretion');
  const pct = f.pctByChildren[String(n)];
  let left = counted, annual = 0;
  f.bracketWidths.forEach((w, i) => { const part = Math.max(0, Math.min(left, w)); annual += (part * pct[i]) / 100; left -= part; });
  const basicM = annual / 12;
  const steps: CSStep[] = [
    money('Combined Guidelines Income, a year', C),
    ...(C > f.maxCombinedAnnualIncome ? [money('Income counted by the schedules (more is at the court’s discretion)', counted)] : []),
    money(`Basic child support from the bracket percentages, ${plural(n)}, a month`, basicM),
    percent('Paying parent’s share of Guidelines Income', share * 100),
  ];
  const care = n0(inp.childcare);
  const hPayer = inp.healthBy === 'payer' ? n0(inp.health) : 0;
  const hOther = inp.healthBy === 'other' ? n0(inp.health) : 0;
  const extraNet = (care + hPayer + hOther) * share - hPayer;
  const sole = basicM * share;
  const nights = nightsOf(inp.payerOvernights);
  let basicPart = sole;
  if (sh.thresholdOvernights != null && sh.multiplier && nights.payer >= sh.thresholdOvernights) {
    const adj = basicM * sh.multiplier;
    const offset = adj * share * (nights.other / 365) - adj * (1 - share) * (nights.payer / 365);
    basicPart = f.sharedNoMoreThanSole ? Math.min(offset, sole) : offset;
    steps.push(money(`Shared physical custody: basic × ${sh.multiplier}, offset by overnights`, offset));
    if (f.sharedNoMoreThanSole && offset > sole) steps.push(text('Applied', 'sole-custody amount (a parent never pays more than without shared custody)'));
    notes.push('shared-applied');
  }
  let amount = basicPart + extraNet;
  if (extraNet !== 0) steps.push(money('Child care and health insurance, paying parent’s share net of premium paid', extraNet));
  const floor = f.minimumPerChildMonthly * n;
  if (!notes.includes('shared-applied') && basicPart < floor && A > 0) {
    amount = floor + extraNet; notes.push('below-min');
    steps.push(money(`Rebuttable minimum, $${f.minimumPerChildMonthly} per child`, floor));
  }
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basicM, payerShare: share, steps, notes };
}
