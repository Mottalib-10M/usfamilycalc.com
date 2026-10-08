/** Texas Family Code § 154.125: % of the obligor's monthly net resources up to the cap (§ 154.125(a)); low-income percentages under the threshold (§ 154.125(c)). Possession time is not in the formula (§ 154.123). */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural } from './_util';

export default function texas(d: CSData, inp: CSInput): CSResult {
  const P = d.percent!;
  const A = n0(inp.payer);
  const n = Math.max(1, Math.round(inp.children));
  const cap = P.cap?.amount ?? Infinity;
  const low = !!P.lowIncome && A < P.lowIncome.threshold;
  const table = low ? P.lowIncome!.byChildren : P.byChildren;
  const rate = table[Math.min(n, table.length) - 1];
  const base = Math.min(A, cap);
  const monthly = (base * rate) / 100;
  const steps: CSStep[] = [{ label: 'Paying parent’s monthly net resources', value: A, kind: 'money' }];
  const notes: string[] = [];
  if (A > cap) { steps.push({ label: 'Net resources counted (cap)', value: cap, kind: 'money' }); notes.push('above-cap'); }
  steps.push({ label: `${low ? 'Low-income guideline' : 'Guideline'} percentage, ${plural(n)}`, value: rate, kind: 'pct' });
  if (n > table.length) notes.push('children-capped');
  return { monthly, reverse: 0, basicMonthly: monthly, payerShare: 1, steps, notes };
}
