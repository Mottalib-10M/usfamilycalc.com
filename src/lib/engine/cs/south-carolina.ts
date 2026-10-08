/**
 * South Carolina, S.C. Code Regs. 114-4710 to 114-4750 (2024 guidelines). Schedule of combined monthly gross
 * income, $50 rows, read between rows by interpolation (114-4720(A)(10) "extrapolate"); add-ons prorated
 * (Worksheet A). Self-support reserve (114-4720(A)(11)): when the obligor's income is in the shaded area for the
 * number of children, support is computed on the obligor's income only, without add-ons. Shared physical custody
 * (114-4730(A)): more than 109 overnights, Worksheet C = schedule × 1.5 split by income and weighted by the other
 * parent's overnights, offset; from 110 to 127 overnights, graduated amount between Worksheets A and C.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { sharedMoreThanOvernights: number; graduatedBelowOvernights: number; graduatedDivisorFrom: number; daysPerYear: number };

export default function southCarolina(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!, f = d.formula as unknown as F, mult = d.shared?.multiplier ?? 1;
  const shadedMax = (d as unknown as { extra: { ssrShadedMaxIncome: number[] } }).extra.ssrShadedMaxIncome;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const basic = scheduleLookup(s, C, n, notes);
  const steps: CSStep[] = [money('Combined monthly gross income', C), money(`Basic obligation in the schedule, ${plural(n)}`, basic), percent('Paying parent’s share of income', share * 100)];

  // Shaded area: support on the payer's income alone, no add-ons. The regulation's purpose is to keep the payer
  // above the reserve, so the calculator keeps the pro rata amount when it is lower (convention, see research).
  const careS = n0(inp.childcare), hS = n0(inp.health);
  const proRata = (basic + careS + hS) * share - (inp.healthBy === 'payer' ? hS : 0);
  if (A <= shadedMax[n - 1]) {
    const alone = scheduleLookup(s, A, n);
    if (alone < proRata) {
      steps.push(money(`Self-support reserve area: schedule at the paying parent’s income alone (up to $${shadedMax[n - 1].toLocaleString('en-US')}), no add-ons`, alone));
      notes.push('self-support-reserve');
      return { monthly: alone, reverse: 0, basicMonthly: basic, payerShare: share, steps, notes };
    }
    steps.push(text('Self-support reserve area', 'checked, the pro rata amount is lower'));
  }

  const care = n0(inp.childcare);
  const hPayer = inp.healthBy === 'payer' ? n0(inp.health) : 0;
  const hOther = inp.healthBy === 'other' ? n0(inp.health) : 0;
  const addTotal = care + hPayer + hOther;
  // Worksheet A (sole custody).
  const wsA = (basic + addTotal) * share - hPayer;
  const nights = nightsOf(inp.payerOvernights);
  let amount = wsA;
  if (nights.payer > f.sharedMoreThanOvernights) {
    // Worksheet C: basic × 1.5, each parent's share weighted by the time the children spend with the other one;
    // additional expenses shared by income, each parent credited for what he or she pays directly.
    const shared = basic * mult;
    const yr = f.daysPerYear;
    const basicNet = shared * share * (nights.other / yr) - shared * (1 - share) * (nights.payer / yr);
    const wsC = basicNet + addTotal * share - hPayer;
    steps.push(money(`Worksheet C: basic × ${mult}, offset by overnights`, wsC));
    notes.push('shared-applied');
    if (nights.payer < f.graduatedBelowOvernights) {
      const t = (nights.payer - f.sharedMoreThanOvernights) / (f.graduatedBelowOvernights - f.graduatedDivisorFrom);
      amount = wsA - (wsA - wsC) * t;
      steps.push(money('Worksheet A (sole custody)', wsA));
      steps.push(text('Graduated amount', `${nights.payer} overnights: ${nights.payer - f.sharedMoreThanOvernights}/${f.graduatedBelowOvernights - f.graduatedDivisorFrom} of the way from Worksheet A to Worksheet C`));
    } else amount = wsC;
  } else if (addTotal > 0) steps.push(money('Child care and health insurance, share net of premium paid', addTotal * share - hPayer));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
