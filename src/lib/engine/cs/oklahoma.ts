/**
 * Oklahoma, 43 O.S. §§ 118D, 118E, 119. Schedule rows apply from their income up ("equal to or above");
 * above $15,000 the court adds an amount (here the $15,000 amount). Parenting time adjustment from 121
 * overnights: combined amount × 2 / 1.75 / 1.5 by band, each parent's share weighted by the other parent's
 * time and offset; never more than the unadjusted amount, and no support from a parent with more than 205
 * overnights. Child care and medical support shared by income.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { sharedBands: Array<[number, number]>; maxOvernightsOfPayingParent: number };

export default function oklahoma(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const basic = scheduleLookup(d.schedule!, C, n, notes);
  const steps: CSStep[] = [money('Combined gross monthly income', C), money(`Schedule amount, ${plural(n)}`, basic), percent('Paying parent’s share of income', share * 100)];
  const nights = nightsOf(inp.payerOvernights);
  const sole = basic * share;
  let base = sole;
  const band = [...f.sharedBands].reverse().find(([min]) => nights.payer >= min);
  if (band) {
    const adj = basic * band[1];
    const owes = adj * share * (nights.other / 365), owed = adj * (1 - share) * (nights.payer / 365);
    base = Math.max(Math.min(owes - owed, sole), -basic * (1 - share));
    steps.push(money(`Parenting time adjustment: schedule × ${band[1]} (${nights.payer} overnights)`, adj));
    notes.push('shared-applied');
  }
  if (nights.payer > f.maxOvernightsOfPayingParent && base > 0) { base = 0; steps.push(text('Rule', `no support from a parent with more than ${f.maxOvernightsOfPayingParent} overnights`)); }
  const addOn = n0(inp.childcare) + n0(inp.health);
  let amount = base + addOn * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  if (addOn > 0) steps.push(money('Child care and medical support, paying parent’s share', addOn * share));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
