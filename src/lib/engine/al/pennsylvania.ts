/** Pennsylvania Pa.R.Civ.P. 1910.16-4(a)(1) Part B: spousal support / APL for orders since 2019, computed before child support. */
import type { ALData, ALInput, ALResult } from '../alimony';
import { n0, pos } from './_util';

export default function pennsylvania(d: ALData, inp: ALInput): ALResult {
  const P = d.params as { post2018: Record<'noChildren' | 'withChildren', { obligorNetPct: number; obligeeNetPct: number }>; highIncomeCombinedMonthlyNet: number };
  const k = inp.children ? P.post2018.withChildren : P.post2018.noChildren;
  const A = n0(inp.payer), B = n0(inp.payee);
  const a = (A * k.obligorNetPct) / 100, b = (B * k.obligeeNetPct) / 100;
  const monthly = pos(a - b);
  const notes = [
    'This is the guideline for spousal support or alimony pendente lite while the spouses are separated or the divorce is pending; alimony after the divorce has no formula.',
    inp.children ? 'With children, spousal support is computed first and deducted from the payer’s income before child support is calculated.' : 'Without dependent children the higher percentages apply.',
    'The guideline amount is presumed correct unless the court finds it unjust or inappropriate under the deviation factors.',
  ];
  if (A + B > P.highIncomeCombinedMonthlyNet) notes.push(`Combined net income exceeds $${P.highIncomeCombinedMonthlyNet.toLocaleString('en-US')} a month: this result is only a preliminary figure that the court adjusts.`);
  return {
    monthly, durationMonths: null,
    steps: [
      { label: `${k.obligorNetPct}% of the payer’s monthly net income`, value: a, kind: 'money' },
      { label: `${k.obligeeNetPct}% of the payee’s monthly net income`, value: b, kind: 'money' },
      { label: 'Monthly spousal support or APL (difference, not below zero)', value: monthly, kind: 'money' },
    ],
    notes,
  };
}
