/**
 * Maryland, Family Law §§ 12-201 to 12-204.
 * Basic obligation: between two schedule amounts, the next higher amount (§ 12-204(c)); first row 0–1,200;
 * above $30,000 the court's discretion (the top row is shown). Cells marked * include the self-support
 * reserve. Shared physical custody (§ 12-201(o), § 12-204(m)) when the paying parent keeps the children at
 * least 92 overnights: basic × 1.5, each parent's share weighted by the other parent's time; a parent with
 * 92–109 overnights has his or her theoretical obligation raised by the § 12-204(m)(2)(ii) percentage; the
 * net is owed, but never more than the sole-custody amount (§ 12-204(m)(5)). Add-ons by income share.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type Adj = { overnightsFrom: number; overnightsTo: number; adjustment: number };

export default function maryland(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!;
  const sh = d.shared!;
  const flags = ((d as unknown as { extra: { selfSupportReserveFlags: Array<Array<number | boolean>> } }).extra.selfSupportReserveFlags);
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const rows = s.rows;
  let i = rows.findIndex((r) => r[0] >= C);
  if (i < 0) { i = rows.length - 1; if (C > s.maxIncome) notes.push('above-max-discretion'); }
  const basic = rows[i][n];
  const steps: CSStep[] = [
    money('Combined adjusted actual income', C),
    money(`Basic obligation, next higher schedule row ($${rows[i][0].toLocaleString('en-US')}), ${plural(n)}`, basic),
    percent('Paying parent’s share of income', share * 100),
  ];
  if (flags?.[i]?.[n] === true) steps.push(text('Schedule cell', 'marked *: adjusted by the self-support reserve'));
  const addOn = n0(inp.childcare) + n0(inp.health);
  const premiumCredit = inp.healthBy === 'payer' ? n0(inp.health) : 0;
  const sole = basic * share;
  let basicPart = sole;
  const nights = nightsOf(inp.payerOvernights);
  if (sh.thresholdOvernights != null && sh.multiplier && nights.payer >= sh.thresholdOvernights) {
    const adjBasic = basic * sh.multiplier;
    let payerTheo = adjBasic * share * (nights.other / 365);
    const otherTheo = adjBasic * (1 - share) * (nights.payer / 365);
    const band = (((sh as unknown as { table?: Adj[] }).table) ?? []).find((b) => nights.payer >= b.overnightsFrom && nights.payer <= b.overnightsTo);
    steps.push(money(`Shared physical custody: basic × ${sh.multiplier}`, adjBasic));
    if (band) {
      payerTheo *= 1 + band.adjustment;
      steps.push(percent(`Shared custody adjustment for ${nights.payer} overnights`, band.adjustment * 100));
    }
    basicPart = Math.min(payerTheo - otherTheo, sole);
    if (payerTheo - otherTheo > sole) steps.push(text('Limit', 'not more than the sole-custody amount, § 12-204(m)(5)'));
    notes.push('shared-applied');
  }
  const amount = basicPart + addOn * share - premiumCredit;
  if (addOn > 0) steps.push(money('Child care and health insurance, paying parent’s share', addOn * share));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
