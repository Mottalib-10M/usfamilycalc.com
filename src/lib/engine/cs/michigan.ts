/**
 * Michigan Child Support Formula 2025 (MCSF 3.02-3.03, 2025 MCSF-S 2.01, 2.03).
 * Each parent's base support: at or below the Low Income Threshold, 10% of net income (and that income is
 * left out of family income); above it, the lower of the General Care Equation {A + B(C − D)} × E and the
 * Low Income Transition Equation (H × 10%) + (I − H) × P, rounded to the dollar. Parental time offset:
 * (Ao^e·Bs − Bo^e·As)/(Ao^e + Bo^e), negative = the paying parent pays. Child care and premiums are
 * apportioned by each parent's share of combined net income (3.01(B)).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, percent } from './_util';

type Band = { incomeAmount: number; basePercentage: number; baseSupport: number; marginalPercentage: number };
type F = { lowIncomeThreshold: number; lowIncomePct: number; transitionPctByChildren: number[]; offsetExponent: number; generalCareTables: Record<string, Band[]> };

const round = (x: number) => Math.round(x);

export default function michigan(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const bands = f.generalCareTables[String(n)];
  const H = f.lowIncomeThreshold;
  const A = n0(inp.payer), B = n0(inp.other);
  // Family income: only parents above the Low Income Threshold count (2.09(B), 3.02(B)(1)).
  const C = (A > H ? A : 0) + (B > H ? B : 0);
  // Band with the highest income amount not exceeding C (the first band below it: see research uncertain).
  const band = [...bands].reverse().find((b) => b.incomeAmount <= C) ?? bands[0];
  const general = band.baseSupport + (band.marginalPercentage / 100) * (C - band.incomeAmount);
  const P = f.transitionPctByChildren[n - 1] / 100;
  const baseOf = (I: number) => {
    if (I <= H) return { v: round((I * f.lowIncomePct) / 100), low: true };
    const E = Math.round((I / C) * 10000) / 10000; // percentage rounded to the hundredth percent
    const G = round(general * E);
    const T = round((H * f.lowIncomePct) / 100 + (I - H) * P);
    return { v: Math.min(G, T), low: T < G };
  };
  const a = baseOf(A), b = baseOf(B);
  if (a.low || b.low) notes.push('self-support-reserve');
  const steps: CSStep[] = [
    money('Family net income counted', C),
    money(`General care support, ${plural(n)}`, general),
    money('Paying parent’s base support', a.v),
    money('Other parent’s base support', b.v),
  ];
  const nights = nightsOf(inp.payerOvernights);
  const e = f.offsetExponent;
  const ao = nights.payer ** e, bo = nights.other ** e;
  const offset = ao + bo > 0 ? round((ao * b.v - bo * a.v) / (ao + bo)) : -a.v;
  if (nights.payer > 0) { steps.push(money(`After the parental time offset (${nights.payer} overnights, power ${e})`, -offset)); notes.push('shared-applied'); }
  const tot = A + B;
  const share = tot > 0 ? A / tot : 1;
  const addOn = n0(inp.childcare) + n0(inp.health);
  if (addOn > 0) steps.push(money('Child care and health insurance, paying parent’s share', addOn * share));
  let monthly = -offset + addOn * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0), reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  steps.push(percent('Paying parent’s share of combined net income', share * 100));
  return { monthly, reverse, basicMonthly: general, payerShare: share, steps, notes };
}
