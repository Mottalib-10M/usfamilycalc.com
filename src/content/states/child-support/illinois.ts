import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, usdx, num, day } from '../../../lib/kit';

const d = cs('illinois');
const S = d.schedule!;
const SH = d.shared!;
const T = SH.thresholdOvernights!;
const M = SH.multiplier!;
const MO = (d as unknown as { extra: { minimumOrder: { perChildMonthly: number; maxTotalMonthly: number; appliesAtOrBelowGrossMonthly: number; approxNetMonthly: number } } }).extra.minimumOrder;
const A = 4000, B = 2000;
const base = csCalc('illinois', A, B, 2);
const n145 = csCalc('illinois', A, B, 2, { payerOvernights: T - 1 });
const nT = csCalc('illinois', A, B, 2, { payerOvernights: T });
const lowA = 850, lowB = 3000;
const low3 = csCalc('illinois', lowA, lowB, 3);
const bigA = 30000, bigB = 5000;
const big = csCalc('illinois', bigA, bigB, 2);
const width = S.rows[1][0] - S.rows[0][0];
const top = S.rows[S.rows.length - 1];

export default defineStatePage({
  topic: 'child-support',
  slug: 'illinois',
  title: `Illinois Child Support Calculator 2026: HFS Income Shares`,
  description: `Illinois child support 2026: the HFS schedule in force since ${day(d.effective!)}, ${num(T)} overnights each for shared care, ${usd(base.monthly)} for two children on net pay here.`,
  intro: '750 ILCS 5/505 and the Department of Healthcare and Family Services tables, from gross pay to the monthly order.',
  resume: `An Illinois parent who nets ${usd(A)} a month, next to a co-parent netting ${usd(B)}, owes ${usd(base.monthly)} a month for two children under 750 ILCS 5/505, before child care and the children's health premium. The figure comes from the Department of Healthcare and Family Services schedule that took effect on ${day(d.effective!)}: ${usd(base.basicMonthly)} for two children in the ${usd(A + B - 25)} to ${usd(A + B + 24.99, 2)} bracket, split two thirds to one third. Illinois works on net income, and HFS publishes a standardized gross-to-net conversion table every year so that both parents' taxes are figured the same way. Time with the children changes nothing until each parent has ${num(T)} overnights; then the basic amount is multiplied by ${num(M, 1)} and cross-credited, which brings this order to ${usd(nT.monthly)}. A very low earner owes a minimum of ${usd(MO.perChildMonthly)} per child instead.`,
  body: (h) => `<h2>Brackets that change every spring</h2>
<p>Since 2024 HFS revises both of its tables every year, and the current pair took effect on ${day(d.effective!)}. The schedule is printed as ${usd(width)} brackets of combined net income, from ${usd(S.minIncome)} up to ${usd(S.maxIncome, 2)} a month, so there is no rounding question: the amount of the bracket that contains the income applies. The 2026 update pushed the ceiling up and redrew the first tier around 75% of the federal poverty guideline for one person.</p>
<h2>Gross pay goes through a conversion table first</h2>
<p>Section 505(a)(3) defines net income as gross income minus a standardized tax amount: federal and Illinois income tax for a single filer with the standard deduction, plus Social Security and Medicare, with the dependency claim given to the parent who has the majority of parenting time. HFS turns that into its Gross to Net Income Conversion Table, with different columns for the two parents. A parent with unusual taxes can ask the court for an individualized amount instead. The calculator on this page expects net figures, so read them from the HFS table or from the court's finding before you type. Maintenance ordered in the same case comes off the payer's net income and is added to the recipient's before support is figured.</p>
<h2>When ${num(T)} nights each changes the order</h2>
<p>Shared physical care under § 505(a)(3.8) requires ${num(T)} or more overnights a year with each parent. Below that, extra visits have no effect: at ${num(T - 1)} nights our paying parent still owes ${usd(n145.monthly)}. At ${num(T)}, the basic obligation is multiplied by ${num(M, 1)}, each parent's part is weighted by the time the child spends with the other one, and the two figures are offset, giving ${usd(nT.monthly)}. HFS publishes a separate worksheet for this case.</p>
<h3>The floor and the ceiling</h3>
<p>Section 505(a)(3.3a) presumes a minimum order of ${usd(MO.perChildMonthly)} per child each month, ${usd(MO.maxTotalMonthly)} at most, for a parent whose gross income is at or under 75% of the poverty guideline for one person. The 2026 HFS addendum puts that at ${usd(MO.appliesAtOrBelowGrossMonthly)} gross a month, about ${usd(MO.approxNetMonthly)} net, and the calculator applies the minimum at or below that net figure. A parent netting ${usd(lowA)} with three children owes ${usd(low3.monthly)}. A parent with no income, only means-tested benefits, a proven disability or a prison term is presumed to owe nothing. At the other end, once combined net income passes ${usd(S.maxIncome, 2)}, the judge sets support case by case but cannot go below the top bracket: with ${usd(bigA)} and ${usd(bigB)} and two children, the calculator keeps the ${usdx(top[2])} top amount and the higher earner's share of it, ${usd(big.monthly)}. Spousal maintenance has its own guideline in Illinois, covered on the ${h.a('alimony:illinois', 'Illinois maintenance page')}.</p>`,
  faqs: [
    { q: 'Does Illinois child support use gross or net income?', a: `Net income. Section 505 subtracts a standardized tax amount from gross income, using the yearly HFS Gross to Net Income Conversion Table, unless the parties stipulate or the court finds an individualized tax amount. The two net incomes are added, the schedule effective ${day(d.effective!)} gives the basic obligation for that bracket, and each parent owes his or her percentage of it.` },
    { q: 'How many overnights count as shared parenting for Illinois child support?', a: `Each parent needs ${num(T)} or more overnights a year with the child. At that point the basic obligation is multiplied by ${num(M, 1)}, each parent's share is weighted by the other parent's time, and the amounts are netted. With ${usd(A)} and ${usd(B)} of net income and two children, the order goes from ${usd(n145.monthly)} at ${num(T - 1)} nights to ${usd(nT.monthly)} at ${num(T)}.` },
    { q: 'What is the minimum child support order in Illinois?', a: `There is a rebuttable presumption of ${usd(MO.perChildMonthly)} a month per child, capped at ${usd(MO.maxTotalMonthly)} in total, for a parent whose gross income is at or below 75% of the federal poverty guideline for one person, ${usd(MO.appliesAtOrBelowGrossMonthly)} a month in 2026 according to HFS. A parent with no gross income, only means-tested aid, a medically proven disability or who is incarcerated is presumed to owe a zero order instead.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:michigan', 'alimony:illinois'],
});
