/**
 * New Mexico, NMSA 1978 § 40-4-11.1 and 8.50.108 NMAC Appendix 1 (schedule effective January 1, 2024):
 * combined gross monthly income rounded to the nearest $50, read in the $50 bands of the schedule (rows keyed by
 * the band's upper bound); above the top band, the top amount plus a percentage of the excess. Worksheet A:
 * basic + health insurance + child care × income share. Worksheet B (each parent at least 35 % of the year):
 * basic × 1.5, each parent keeps the share of days with him or her, netted; additional payments netted.
 * The self-support reserve (shaded cells) is not encoded in the published text, so it is not applied.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { roundCombinedIncomeTo: number };

export default function newMexico(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!, sh = d.shared!, f = d.formula as unknown as F;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const rounded = Math.round(C / f.roundCombinedIncomeTo) * f.roundCombinedIncomeTo;
  const rows = s.rows, top = rows[rows.length - 1];
  let basic: number;
  if (rounded > top[0]) {
    basic = top[n] + ((rounded - top[0]) * (s.aboveMax.pct?.[n - 1] ?? 0)) / 100;
    notes.push('above-max-pct');
  } else {
    const row = rows.find((r) => rounded <= r[0])!;
    basic = row[n];
    if (row === rows[0]) notes.push('below-min');
  }
  const steps: CSStep[] = [
    money('Combined gross monthly income', C),
    money(`Rounded to the nearest $${f.roundCombinedIncomeTo}`, rounded),
    money(rounded > top[0] ? `Basic support: top amount plus ${s.aboveMax.pct?.[n - 1]} % of the excess, ${plural(n)}` : `Basic support in the New Mexico schedule, ${plural(n)}`, basic),
    percent('Paying parent’s share of income', share * 100),
  ];
  const care = n0(inp.childcare);
  const hPayer = inp.healthBy === 'payer' ? n0(inp.health) : 0;
  const hOther = inp.healthBy === 'other' ? n0(inp.health) : 0;
  const extras = care + hPayer + hOther;
  const extraNet = extras * share - hPayer;
  const nights = nightsOf(inp.payerOvernights);
  let amount: number;
  if (sh.thresholdOvernights != null && sh.multiplier && nights.payer >= sh.thresholdOvernights) {
    const adj = basic * sh.multiplier;
    const basicNet = adj * share * (nights.other / 365) - adj * (1 - share) * (nights.payer / 365);
    amount = basicNet + extraNet;
    steps.push(money(`Shared responsibility (Worksheet B): basic × ${sh.multiplier}`, adj));
    steps.push(money('Basic support after each parent keeps his or her days', basicNet));
    notes.push('shared-applied');
  } else {
    amount = basic * share + extraNet;
  }
  if (extras > 0) steps.push(money('Insurance and child care, paying parent’s share net of premium paid', extraNet));
  steps.push(text('Not applied', 'self-support reserve area of the schedule (shaded cells, 8.50.108.10 NMAC)'));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
