/** New York CSSA (FCA § 413, DRL § 240): % of combined parental income up to the cap, prorated by income; poverty and self-support floors (§ 413(1)(d)); child care and health care prorated. Annual amounts. */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural } from './_util';

export default function newYork(d: CSData, inp: CSInput): CSResult {
  const P = d.percent!;
  const F = d.formula as { combinedIncomeCap: number; povertyGuidelineSingle2026: number; selfSupportReserve2026: number; minimumBelowPoverty: { annual: number }; minimumBelowSSR: { annual: number } };
  const A = n0(inp.payer) * 12, B = n0(inp.other) * 12;
  const C = A + B;
  const n = Math.max(1, Math.round(inp.children));
  const rate = P.byChildren[Math.min(n, P.byChildren.length) - 1];
  const cap = F.combinedIncomeCap;
  const share = C > 0 ? A / C : 1;
  const basic = (Math.min(C, cap) * rate) / 100;
  let annual = basic * share;
  const steps: CSStep[] = [{ label: 'Combined parental income, a year', value: C, kind: 'money' }];
  const notes: string[] = [];
  if (C > cap) { steps.push({ label: 'Income counted (combined income cap)', value: cap, kind: 'money' }); notes.push('above-cap'); }
  steps.push({ label: `CSSA percentage, ${plural(n)}`, value: rate, kind: 'pct' }, { label: 'Paying parent’s share of income', value: share * 100, kind: 'pct' });
  if (A - annual < F.povertyGuidelineSingle2026) { annual = F.minimumBelowPoverty.annual; notes.push('ny-poverty'); }
  else if (A - annual < F.selfSupportReserve2026) { annual = Math.max(F.minimumBelowSSR.annual, A - F.selfSupportReserve2026); notes.push('self-support-reserve'); }
  steps.push({ label: 'Basic obligation of the paying parent, a month', value: annual / 12, kind: 'money' });
  const addTotal = inp.childcare + inp.health;
  if (addTotal > 0) steps.push({ label: 'Child care and health insurance, paying parent’s share', value: addTotal * share, kind: 'money' });
  let monthly = annual / 12 + addTotal * share - (inp.healthBy === 'payer' ? inp.health : 0), reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; }
  return { monthly, reverse, basicMonthly: basic / 12, payerShare: share, steps, notes };
}
