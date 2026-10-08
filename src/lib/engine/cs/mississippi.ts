/**
 * Mississippi, Miss. Code § 43-19-101: percentage of the absent parent's monthly adjusted gross income
 * (after taxes, Social Security and mandatory retirement), with the written-findings band of § 43-19-101(4).
 * Child care, health coverage and shared time are deviation factors (§ 43-19-103), not formula terms.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, money, percent, text } from './_util';

export default function mississippi(d: CSData, inp: CSInput): CSResult {
  const P = d.percent!;
  const F = d.formula as { findingsAboveAnnual: number; findingsBelowAnnual: number };
  const maxN = P.byChildren.length;
  const n = Math.max(1, Math.min(Math.round(inp.children), maxN));
  const notes: string[] = [];
  if (inp.children > maxN) notes.push('children-capped');
  const A = n0(inp.payer);
  const rate = P.byChildren[n - 1];
  const monthly = (A * rate) / 100;
  const steps: CSStep[] = [money('Monthly adjusted gross income of the paying parent', A), percent(`Guideline percentage, ${plural(n)}`, rate), money('Guideline support', monthly)];
  const annual = A * 12;
  if (annual > F.findingsAboveAnnual || annual < F.findingsBelowAnnual) {
    notes.push('findings-required');
    steps.push(text('Court must make written findings', annual > F.findingsAboveAnnual ? 'income above the § 43-19-101(4) band' : 'income below the § 43-19-101(4) band'));
  }
  if (inp.payerOvernights > 0 || inp.childcare > 0 || inp.health > 0) steps.push(text('Parenting time, child care, health coverage', 'grounds to deviate under § 43-19-103, not added by formula'));
  return { monthly, reverse: 0, basicMonthly: monthly, payerShare: 1, steps, notes };
}
