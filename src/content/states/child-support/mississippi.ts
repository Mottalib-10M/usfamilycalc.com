import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, listOf } from '../../../lib/kit';

const d = cs('mississippi');
const R = d.percent!.byChildren;
const F = d.formula as { findingsAboveAnnual: number; findingsBelowAnnual: number };
const hiM = F.findingsAboveAnnual / 12;
const loM = F.findingsBelowAnnual / 12;

const two = csCalc('mississippi', 4000, 0, 2);
const top = csCalc('mississippi', 10000, 0, 1);
const small = csCalc('mississippi', 700, 0, 1);
const gross = 5200, deductions = 1200;
const fromGross = csCalc('mississippi', gross - deductions, 0, 3);

export default defineStatePage({
  topic: 'child-support',
  slug: 'mississippi',
  title: `Mississippi Child Support 2026: ${pct(R[0])} to ${pct(R[R.length - 1])} of Adjusted Pay`,
  description: `Mississippi child support 2026 under § 43-19-101: ${pct(R[0])} of adjusted gross income for one child, ${usd(two.monthly)} a month for two at ${usd(4000)}, findings over ${usd(F.findingsAboveAnnual)} a year.`,
  intro: 'Miss. Code § 43-19-101 in numbers: five percentages, a short list of deductions, and a band outside which the judge must explain the award.',
  resume: `In Mississippi, a parent with ${usd(4000)} of monthly adjusted gross income owes ${usd(two.monthly)} a month for two children, because § 43-19-101 sets support at ${pct(R[1])} of that income. The scale is short: ${listOf(R.map((r, i) => `${pct(r)} for ${i + 1 === R.length ? `${i + 1} or more` : i + 1}`))} children. Adjusted gross income is not take-home pay in the payroll sense: the statute starts from income of every kind, then removes only federal, state and local taxes actually owed, Social Security, and mandatory retirement or disability contributions, plus court-ordered support for other children. The other parent's income does not enter the formula. When adjusted income is above ${usd(F.findingsAboveAnnual)} or under ${usd(F.findingsBelowAnnual)} a year, the chancellor must state in writing whether the percentage is reasonable. Shared time, child care and medical bills are grounds to depart from the figure, not lines added to it.`,
  body: (h) => `<h2>Five rates and an age of majority at 21</h2>
<p>Mississippi's rates look modest next to states that take a share of gross pay, for a simple reason: they apply after taxes. A payer earning ${usd(gross)} gross who loses ${usd(deductions)} to withholding, FICA and a required pension plan has ${usd(gross - deductions)} of adjusted gross income; with three children the guideline order is ${usd(fromGross.monthly)}. The same paycheck with five children gives ${usd(csCalc('mississippi', gross - deductions, 0, 5).monthly)}, and the rate stops climbing there.</p>
<p>Duration is the other half of the bill. Support in Mississippi generally runs until the child turns 21, three years longer than in most states, so a guideline order is usually paid for far more months than a comparable one across the state line.</p>
<h2>The chancellor's written findings</h2>
<p>The percentages are a rebuttable presumption. Section 43-19-101(4) forces the court to address their fit when adjusted gross income is above ${usd(F.findingsAboveAnnual)} a year, about ${usd(hiM)} a month, or below ${usd(F.findingsBelowAnnual)}, about ${usd(loM)} a month. At ${usd(10000)} a month with one child the formula gives ${usd(top.monthly)}; the judge may keep it, cut it or raise it, but must say why. At ${usd(700)} a month the formula gives ${usd(small.monthly)}, and since 2022 the statute tells the court to weigh the payer's basic subsistence needs.</p>
<p>The same 2022 amendment closed a common shortcut: income can no longer be imputed at a standard figure, such as full-time minimum wage, without looking at the parent's actual work history, skills, health and local job market.</p>
<h3>What moves the number away from the table</h3>
<p>Section 43-19-103 lists the reasons to deviate, and several match costs other states add by formula: a noncustodial parent who spends a great deal of time with the children, child care paid so the custodial parent can work, extraordinary medical or educational expenses, the child's own income, seasonal earnings. Health coverage is handled in every order; if the custodial parent is told to carry it, the premium is taken into account in the award. The calculator above returns the presumptive figure only.</p>
<p>The Department of Human Services enforces orders and can review an amount every three years. Bills to replace the percentages with an income-shares table were filed in 2025 and 2026 and died in committee. For another percentage state that caps the income counted, see ${h.a('child-support:texas', 'Texas')}; for a state that uses both incomes, ${h.a('child-support:georgia', 'Georgia')}.</p>`,
  faqs: [
    { q: 'What percentage of income is child support in Mississippi?', a: `Section 43-19-101 sets ${pct(R[0])} of the paying parent's adjusted gross income for one child, ${pct(R[1])} for two, ${pct(R[2])} for three, ${pct(R[3])} for four and ${pct(R[4])} for five or more. Adjusted gross income is income from all sources minus taxes owed, Social Security and mandatory retirement contributions, so ${usd(4000)} of it means ${usd(two.monthly)} a month for two children.` },
    { q: 'Do Mississippi judges have to follow the percentages for high earners?', a: `They start from them, but when adjusted gross income exceeds ${usd(F.findingsAboveAnnual)} a year the chancellor must make a written finding on whether the guideline amount is reasonable. A parent earning ${usd(10000)} a month after deductions would owe ${usd(top.monthly)} for one child under the table; the court can order more or less once it explains the reason on the record.` },
    { q: 'Does the custodial parent’s income count in Mississippi child support?', a: `Not in the formula. Mississippi applies its percentage to the noncustodial parent's adjusted gross income only, and even a new spouse's income is excluded. The custodial parent's situation can still matter through the deviation criteria of § 43-19-103, such as the total assets of both parents or child care paid so that the custodial parent can keep a job.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:texas', 'child-support:georgia'],
});
