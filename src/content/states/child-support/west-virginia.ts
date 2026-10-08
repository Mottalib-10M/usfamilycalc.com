import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day } from '../../../lib/kit';

const d = cs('west-virginia');
const S = d.schedule!;
const SH = d.shared!;
const F = d.formula as { belowTableBasicObligation: number; belowTableIncome: number; abilityToPayIncomeThreshold: number; abilityToPayIncomeFactor: number; abilityToPaySelfSupportReserve: number; abilityToPayMinimum: number; childcareCountedFactor: number };
const T = SH.thresholdOvernights!;
const M = SH.multiplier!;
const A = 4000, B = 2000;
const sole = csCalc('west-virginia', A, B, 2);
const workA = csCalc('west-virginia', A, B, 2, { payerOvernights: T - 1 });
const workB = csCalc('west-virginia', A, B, 2, { payerOvernights: T });
const lowA = 1500, lowB = 1500;
const low = csCalc('west-virginia', lowA, lowB, 1);
const lowRaw = low.basicMonthly * (lowA / (lowA + lowB));
const room = F.abilityToPayIncomeFactor * lowA - F.abilityToPaySelfSupportReserve;
const care = 600;
const withCare = csCalc('west-virginia', A, B, 2, { childcare: care });
const p = S.aboveMax.pct!;

export default defineStatePage({
  topic: 'child-support',
  slug: 'west-virginia',
  title: `West Virginia Child Support 2026: ${num(M, 1)} Shared Factor`,
  description: `West Virginia child support 2026: the § 48-13-301 table on adjusted gross income, Worksheet B past ${num(T - 1)} days at ${num(M, 1)}, and an ability-to-pay test; ${usd(sole.monthly)} in our case`,
  intro: 'Chapter 48, Article 13 of the West Virginia Code, with the two worksheets and the low-income test that set the final figure.',
  resume: `West Virginia prints its whole child support table inside the Code, at § 48-13-301, and the current figures date from the 2023 amendments effective ${day(d.effective!)}. A parent with ${usd(A)} of monthly adjusted gross income, next to a parent with ${usd(B)}, owes about ${usd(sole.monthly)} a month for two children on Worksheet A: two thirds of the ${usd(sole.basicMonthly)} the table lists for ${usd(A + B)}. Three rules make the state unusual. Extended shared parenting starts when each parent keeps the children more than ${num(T - 1)} days a year, and Worksheet B then multiplies the table amount by ${num(M, 1)}, a heavier factor than most states use; our example drops to ${usd(workB.monthly)}. Work-related child care counts at ${pct(F.childcareCountedFactor * 100)} of its cost, to reflect the federal tax credit. A payor under ${usd(F.abilityToPayIncomeThreshold)} a month gets an ability-to-pay check built on ${pct(F.abilityToPayIncomeFactor * 100)} of income and a ${usd(F.abilityToPaySelfSupportReserve)} reserve.`,
  body: (h) => `<h2>Basic or extended shared parenting</h2>
<p>West Virginia does not speak of visitation in its formula. Every case is "shared parenting", and the only question is which worksheet applies. Under ${h.ext('https://code.wvlegislature.gov/48-1-239/', '§ 48-1-239')} basic shared parenting means one parent has the children overnight for less than 35 percent of the year; extended shared parenting means each parent has them more than 127 days, which is 35 percent. Worksheet B then takes the table amount times ${num(M, 1)}, splits it by income, has each parent owe his or her part times the share of nights spent with the other parent, and offsets the two. In our example, ${num(T - 1)} nights keeps the order at ${usd(workA.monthly)}; ${num(T)} nights brings it to ${usd(workB.monthly)}. The ${num(M, 1)} factor assumes that two homes cost more than one, so the drop is smaller than the time shift alone would suggest.</p>
<h2>Child care at ${pct(F.childcareCountedFactor * 100)} of the bill</h2>
<p>Both worksheets enter child care as ${pct(F.childcareCountedFactor * 100)} of what is actually paid, a flat allowance for the federal child care credit that the payee may claim. If the parent with the children spends ${usd(care)} a month, the worksheet adds ${usd(care * F.childcareCountedFactor)}, and the payer's order in our example becomes ${usd(withCare.monthly)} instead of ${usd(sole.monthly)}. Health insurance premiums for the children and uninsured medical costs go in at full value.</p>
<h3>The ability-to-pay line under ${usd(F.abilityToPayIncomeThreshold)}</h3>
<p>Section 48-13-404 adds a second calculation for a payor whose adjusted gross income is below ${usd(F.abilityToPayIncomeThreshold)} a month: take ${pct(F.abilityToPayIncomeFactor * 100)} of that income, subtract ${usd(F.abilityToPaySelfSupportReserve)}, and never go below ${usd(F.abilityToPayMinimum)}; the order is the lower of that result and the worksheet amount. Two parents at ${usd(lowA)} each with one child show the effect: the worksheet gives ${usd(lowRaw)}, the test allows ${usd(room)}, and the calculator returns ${usd(low.monthly)}. When combined income is under ${usd(F.belowTableIncome)}, below the first row, the basic obligation is ${usd(F.belowTableBasicObligation)} or a discretionary amount (§ 48-13-302).</p>
<p>At the top, the table ends at ${usd(S.maxIncome)} of combined income. Section 48-13-303 sets the top amount as a floor and lets the court add ${pct(p[0])} of the excess for one child, up to ${pct(p[p.length - 1])} for six. For the neighbor across the Potomac, open the ${h.a('child-support:virginia', 'Virginia page')}.</p>`,
  faqs: [
    { q: 'What is extended shared parenting in West Virginia child support?', a: `Each parent keeps the children overnight more than 127 days a year, 35 percent of the year. Then Worksheet B applies: the table amount is multiplied by ${num(M, 1)}, split by income, cross-credited by each parent's nights and offset. With ${usd(A)} and ${usd(B)} of adjusted gross income and two children, the order goes from ${usd(workA.monthly)} on Worksheet A to ${usd(workB.monthly)}.` },
    { q: 'Why does West Virginia count only part of child care costs?', a: `Worksheets A and B enter work-related child care at ${pct(F.childcareCountedFactor * 100)} of the actual cost, a built-in allowance for the federal child care tax credit. A parent paying ${usd(care)} a month therefore adds ${usd(care * F.childcareCountedFactor)} to the obligation, shared by income. Children's health insurance premiums and uninsured medical bills are entered at their full amount.` },
    { q: 'Is there a low-income adjustment for West Virginia child support?', a: `Yes, for a payor with adjusted gross income under ${usd(F.abilityToPayIncomeThreshold)} a month in basic shared parenting cases. The order is the lower of the Worksheet A amount and ${pct(F.abilityToPayIncomeFactor * 100)} of the payor's income minus ${usd(F.abilityToPaySelfSupportReserve)}, with a floor of ${usd(F.abilityToPayMinimum)}. At ${usd(lowA)} a month that test limits support to ${usd(room)}.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:virginia', 'child-support:michigan'],
});
