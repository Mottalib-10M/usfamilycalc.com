/**
 * Oregon, OAR 137-050-0700 to 0765. Scale in $50 brackets of combined adjusted gross income (appendix to
 * 137-050-0725; lower amount between two rows, same as $30,000 above the top); each parent's share capped at
 * income minus the self-support reserve (0745); parenting time credit for each parent from the logistic
 * formula of 0730(6) applied to the combined basic obligation (0730(7)); only the parent with the greater
 * net obligation pays (0710(1)(i)); $100 presumed minimum (0755).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { ptcSlope: number; ptcOffsetPct: number; selfSupportReserve: number; minimumOrder: number; minimumOrderExemptEqualOvernights: number };

/** Row [from, to, c1..c10] whose bracket holds the income; the top row above the scale. */
export function bracketRow(rows: Array<Array<number | null>>, income: number): Array<number | null> {
  if (income >= (rows[rows.length - 1][0] as number)) return rows[rows.length - 1];
  let best = rows[0];
  for (const r of rows) if ((r[0] as number) <= income) best = r; else break;
  return best;
}

export default function oregon(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const rows = d.schedule!.rows as Array<Array<number | null>>;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const row = bracketRow(rows, C);
  if (C > (rows[rows.length - 1][1] as number)) notes.push('above-max-cap');
  const basic = (row[n + 1] as number) ?? 0;
  const steps: CSStep[] = [money('Combined adjusted gross income', C), money(`Scale amount, ${plural(n)} (bracket $${row[0]}–$${row[1]})`, basic), percent('Paying parent’s share of income', share * 100)];
  const credit = (nights: number) => { const x = nights / 365; return 1 / (1 + Math.exp(-f.ptcSlope * (x - 0.5))) - f.ptcOffsetPct / 100 + (2 * f.ptcOffsetPct / 100) * x; };
  const nights = nightsOf(inp.payerOvernights);
  const availA = n0(A - f.selfSupportReserve), availB = n0(B - f.selfSupportReserve);
  const careA = n0(inp.childcare) * share, careB = n0(inp.childcare) * (1 - share);
  const hA = n0(inp.health) * share, hB = n0(inp.health) * (1 - share);
  let oblA = Math.min(basic * share, availA); oblA += Math.min(careA, n0(availA - oblA)) + hA;
  let oblB = Math.min(basic * (1 - share), availB); oblB += Math.min(careB, n0(availB - oblB)) + hB;
  if (basic * share > availA) { notes.push('self-support-reserve'); steps.push(money(`Capped at income above the $${f.selfSupportReserve} self-support reserve`, availA)); }
  const crA = basic * credit(nights.payer), crB = basic * credit(nights.other);
  if (nights.payer > 0) { steps.push(money(`Parenting time credit, ${nights.payer} overnights (${(credit(nights.payer) * 100).toFixed(2)}%)`, crA)); notes.push('shared-applied'); }
  // child care is taken as paid by the other parent; the premium by whoever the input says
  const netA = oblA - crA - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  const netB = oblB - crB - n0(inp.childcare) - (inp.healthBy === 'other' ? n0(inp.health) : 0);
  let monthly = 0, reverse = 0;
  if (netA >= netB) monthly = n0(netA); else reverse = n0(netB);
  const equal = nights.payer * 2 === 365 || Math.abs(nights.payer - f.minimumOrderExemptEqualOvernights) < 0.6;
  if (monthly > 0 && monthly < f.minimumOrder && !equal) { monthly = f.minimumOrder; steps.push(text('Minimum order', `raised to $${f.minimumOrder} (OAR 137-050-0755)`)); }
  else if (reverse > 0 && reverse < f.minimumOrder && !equal) reverse = f.minimumOrder;
  if (reverse > 0) notes.push('reverse');
  steps.push(money('Net obligation of the parent who pays', monthly || reverse));
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
