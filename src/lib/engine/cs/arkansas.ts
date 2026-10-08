/**
 * Arkansas, Administrative Order No. 10, Family Support Chart (income shares, required July 1, 2020).
 * Chart row at or below the combined gross monthly income ($50 steps, top $30,000 used above it);
 * blue-shaded cells (footnote 1: combined income does not apply) are owed in full, not prorated;
 * the chart builds in the $900 self-support reserve and the $125 minimum order. Child care and health
 * premiums shared by income, with a credit for the premium the payer pays (official sample calculation).
 * No shared-custody adjustment: the rule of the Order was not read from an official source.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, money, percent, text } from './_util';

type F = { selfSupportReserve: number; minimumOrder: number; shadedMaxByChildren: number[] };

export default function arkansas(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const basic = scheduleLookup(d.schedule!, C, n, notes);
  const steps: CSStep[] = [money('Combined gross monthly income', C), money(`Chart amount, ${plural(n)}`, basic)];
  let base: number;
  if (C <= f.shadedMaxByChildren[n - 1]) {
    base = basic;
    steps.push(text('Low-income (blue-shaded) cell', `owed in full; chart built on a $${f.selfSupportReserve} self-support reserve and a $${f.minimumOrder} minimum`));
    notes.push('self-support-reserve');
  } else {
    base = basic * share;
    steps.push(percent('Paying parent’s share of income', share * 100));
  }
  const addOn = n0(inp.childcare) + n0(inp.health);
  const amount = base + addOn * share - (inp.healthBy === 'payer' ? n0(inp.health) : 0);
  if (addOn > 0) steps.push(money('Child care and health premium, income share', addOn * share));
  steps.push(text('Shared custody', 'no adjustment applied (Arkansas rule not modeled)'));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
