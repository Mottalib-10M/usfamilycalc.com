/**
 * West Virginia, W. Va. Code §§ 48-13-301 to 48-13-502: combined adjusted gross monthly income table
 * ($550–$35,000); below $550 the basic obligation is $50 (§ 48-13-302); above $35,000 the top amount plus a
 * percentage of the excess (§ 48-13-303). Worksheet A (basic shared parenting): basic + adjustments (child care
 * counted at 75 %, health premium) × income share, minus what the payor pays directly; ability to pay when the
 * payor earns under $2,600: lesser of the order and 80 % of income minus $997, at least $50 (§ 48-13-404).
 * Worksheet B (each parent more than 127 days): basic × 1.6, cross-credited by the other parent's time,
 * additional expenses netted (§ 48-13-501).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { belowTableBasicObligation: number; belowTableIncome: number; abilityToPayIncomeThreshold: number; abilityToPayIncomeFactor: number; abilityToPaySelfSupportReserve: number; abilityToPayMinimum: number; childcareCountedFactor: number };

export default function westVirginia(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!, sh = d.shared!, f = d.formula as unknown as F;
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  let basic: number;
  if (C < f.belowTableIncome) { basic = f.belowTableBasicObligation; notes.push('below-min'); }
  else basic = scheduleLookup(s, C, n, notes);
  const steps: CSStep[] = [
    money('Combined adjusted gross monthly income', C),
    money(C < f.belowTableIncome ? 'Basic obligation below the table (§ 48-13-302)' : `Basic obligation in the West Virginia table, ${plural(n)}`, basic),
    percent('Paying parent’s income share', share * 100),
  ];
  // Additional expenses: child care (taken as paid by the other parent) counted at 75 %, the children's premium.
  const care = n0(inp.childcare) * f.childcareCountedFactor;
  const hPayer = inp.healthBy === 'payer' ? n0(inp.health) : 0;
  const hOther = inp.healthBy === 'other' ? n0(inp.health) : 0;
  const extras = care + hPayer + hOther;
  const nights = nightsOf(inp.payerOvernights);
  let amount: number;
  if (sh.thresholdOvernights != null && sh.multiplier && nights.payer >= sh.thresholdOvernights) {
    // Worksheet B, § 48-13-501.
    const adj = basic * sh.multiplier;
    const basicNet = adj * share * (nights.other / 365) - adj * (1 - share) * (nights.payer / 365);
    const extraNet = extras * share - hPayer; // payer's share minus what the payer pays directly
    amount = basicNet + extraNet;
    steps.push(money(`Extended shared parenting: basic × ${sh.multiplier}`, adj));
    steps.push(money('Basic obligation after cross-credit of overnights', basicNet));
    if (extras > 0) steps.push(money(`Additional expenses, net share (child care at ${f.childcareCountedFactor * 100} %)`, extraNet));
    notes.push('shared-applied');
  } else {
    // Worksheet A, § 48-13-403.
    amount = (basic + extras) * share - hPayer;
    if (extras > 0) steps.push(money(`Child care (at ${f.childcareCountedFactor * 100} %) and health insurance, paying parent’s share net of premium paid`, extras * share - hPayer));
    if (A < f.abilityToPayIncomeThreshold) {
      const room = Math.max(f.abilityToPayMinimum, f.abilityToPayIncomeFactor * A - f.abilityToPaySelfSupportReserve);
      if (amount > room) { amount = room; notes.push('self-support-reserve'); steps.push(money(`Ability to pay: ${f.abilityToPayIncomeFactor * 100} % of income minus the $${f.abilityToPaySelfSupportReserve} reserve (at least $${f.abilityToPayMinimum}), § 48-13-404`, room)); }
    }
  }
  if (C > s.maxIncome) steps.push(text('Above the table', `$${s.maxIncome.toLocaleString('en-US')} amount plus ${s.aboveMax.pct?.[n - 1]} % of the excess, § 48-13-303`));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: basic, payerShare: share, steps, notes };
}
