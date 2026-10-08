import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, usdx, pct, num, listOf } from '../../../lib/kit';

const d = cs('ohio');
const S = d.schedule!;
const X = (d as unknown as { extra: { shadedAreaMaxIncomeByChildren: number[]; parentingTimeReduction: { minOvernights: number; pct: number }; minimumOrderMonthly: number; cashMedicalAnnualPerChild: number; childCareSharePctCapInReserve: number } }).extra;
const PT = X.parentingTimeReduction;
const A = 7500, B = 2500;
const base = csCalc('ohio', A, B, 2);
const pt = csCalc('ohio', A, B, 2, { payerOvernights: PT.minOvernights });
const pt89 = csCalc('ohio', A, B, 2, { payerOvernights: PT.minOvernights - 1 });
const prem = 300;
const withPrem = csCalc('ohio', A, B, 2, { health: prem, healthBy: 'payer' });
const lowA = 2500, lowB = 7500;
const low = csCalc('ohio', lowA, lowB, 2);
const lowShare = low.basicMonthly * (lowA / (lowA + lowB));
const bigA = 30000, bigB = 10000;
const big = csCalc('ohio', bigA, bigB, 2);
const step = S.rows[1][0] - S.rows[0][0];
const cashMed = X.cashMedicalAnnualPerChild;

export default defineStatePage({
  topic: 'child-support',
  slug: 'ohio',
  title: `Ohio Child Support Calculator 2026: Gross Income Schedule`,
  description: `Ohio child support 2026: the JFS 07767 gross annual schedule up to ${usd(S.maxIncome)}, the ${pct(PT.pct)} cut at ${num(PT.minOvernights)} overnights and ${usd(base.monthly)} a month for two children in our example.`,
  intro: 'Ohio Revised Code Chapter 3119 and the JFS 07767 schedule, with the parenting time cut, the self-sufficiency reserve and cash medical support.',
  resume: `An Ohio parent earning ${usd(A * 12)} a year in gross pay, whose co-parent earns ${usd(B * 12)}, owes about ${usd(base.monthly)} a month for two children under Chapter 3119 of the Ohio Revised Code, before child care and cash medical support. Ohio is one of the states that start from gross income, before tax, and its table counts in years: the JFS 07767 schedule gives ${usd(base.basicMonthly * 12)} a year for two children at ${usd((A + B) * 12)} of combined income, and the paying parent carries ${pct(Math.round(base.payerShare * 100))} of it. A court order for parenting time of ${num(PT.minOvernights)} overnights or more cuts that parent's share by ${pct(PT.pct)}, here to ${usd(pt.monthly)}. Low earners are protected by a self-sufficiency reserve printed as a shaded zone in the table, and every order also carries cash medical support of ${usdx(cashMed)} per child a year.`,
  body: (h) => `<h2>A yearly table in steps of ${usd(step)}</h2>
<p>JFS 07767 lists combined annual income from ${usd(S.minIncome)} to ${usd(S.maxIncome)} in steps of ${usd(step)}. The form in use is the June 2023 revision, and the Department of Job and Family Services rule that took effect on April 1, 2026 still points to it. When the family's income falls between two lines, § 3119.05(G)(2) lets the court take the higher line, the lower line, or a figure in proportion between them. The calculator uses the proportional figure, so a few hundred dollars of extra income moves the result a little rather than in jumps.</p>
<p>Gross income is broad here: overtime and bonuses count at the lower of the three-year average and last year's total, and the spouse of a parent never counts. Spousal support paid under a court order comes off the payer's income, and so does the out-of-pocket premium a parent pays for the children's health insurance. If our paying parent covers the children for ${usd(prem)} a month, the order drops to ${usd(withPrem.monthly)}.</p>
<h2>The ${num(PT.minOvernights)}-overnight reduction</h2>
<p>Section 3119.051 gives a flat ${pct(PT.pct)} reduction of the annual obligation to a parent whose court-ordered parenting time reaches ${num(PT.minOvernights)} overnights a year. It is all or nothing: at ${num(PT.minOvernights - 1)} nights the payment stays at ${usd(pt89.monthly)}, at ${num(PT.minOvernights)} it becomes ${usd(pt.monthly)}. The order has to grant the time; nights taken informally do not count, and the court can remove the reduction at the other parent's request if the time is not used without good reason. A larger adjustment for extended time needs a deviation.</p>
<h3>The shaded zone and the ${usd(X.minimumOrderMonthly)} floor</h3>
<p>The cells in gray in JFS 07767 carry the self-sufficiency reserve. The zone runs up to ${listOf(X.shadedAreaMaxIncomeByChildren.map((v, i) => `${usd(v)} for ${i + 1}`))} children. When a parent's own income lands there, § 3119.05(G)(3) compares the share of the combined amount with the table read at that parent's income alone and keeps the smaller. Reverse our family, ${usd(lowA * 12)} against ${usd(lowB * 12)}: the ordinary share would be ${usd(lowShare)} a month, the reserve figure is ${usd(low.monthly)}, and that is the order. Such a parent pays at most ${pct(X.childCareSharePctCapInReserve)} of child care. Under § 3119.06 no order goes below ${usd(X.minimumOrderMonthly)} a month for all the children, unless the court finds a reason such as a documented disability.</p>
<h3>Cash medical and the top of the table</h3>
<p>Next to the child support, each order sets cash medical support of ${usdx(cashMed)} per child per year, shared by income; the calculator shows the paying parent's part separately. Above ${usd(S.maxIncome)}, § 3119.04 has the court decide case by case without going under the top-line amount: with ${usd(bigA * 12)} and ${usd(bigB * 12)} a year, the calculator stays at that floor, ${usd(big.monthly)} a month. Across the state line, ${h.a('child-support:pennsylvania', 'Pennsylvania')} works on net income and ${h.a('child-support:michigan', 'Michigan')} on its own formula.</p>`,
  faqs: [
    { q: 'How many overnights reduce Ohio child support?', a: `${num(PT.minOvernights)} overnights in the court order. Under § 3119.051, a parent whose court-ordered parenting time equals or exceeds ${num(PT.minOvernights)} overnights a year gets a ${pct(PT.pct)} reduction of his or her annual support obligation. With ${usd(A * 12)} and ${usd(B * 12)} of yearly gross income and two children, the payment falls from ${usd(pt89.monthly)} to ${usd(pt.monthly)} a month. Bigger adjustments for extended time need a deviation by the court.` },
    { q: 'Does Ohio calculate child support on gross or net income?', a: `Gross. Ohio adds both parents' annual gross income, after a few adjustments such as spousal support paid, support for other children and the health insurance premium a parent pays, and reads the JFS 07767 schedule at that total. Taxes are not deducted. That is why Ohio amounts can look higher than those of neighboring states that read their tables on net pay.` },
    { q: 'What is cash medical support in Ohio?', a: `It is a separate amount every Ohio order includes for the children's ordinary medical costs: ${usdx(cashMed)} per child per year under Table 3 of the JFS 07766 manual, split between the parents by income share. Medical bills above that amount count as extraordinary and are shared under the order. In our two-child example the paying parent's part is about ${usd((cashMed * 2 * base.payerShare) / 12)} a month.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:pennsylvania', 'child-support:michigan'],
});
