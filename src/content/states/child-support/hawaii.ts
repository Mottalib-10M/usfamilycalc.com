import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day } from '../../../lib/kit';

const d = cs('hawaii');
const F = d.formula as { basePrimarySupportPerChild: number; selfSupportReserve: number; solaIncomeDeduction: number; solaPctPerChild: number; solaPctMax: number; minimumPerChild: number; cashMedicalPctOfNet: number; soleCustodyMaxOvernights: number; equalTimeOvernights: number; extensiveAdjustmentDivisor: number; equalTimeMonthsEach: number };
const rows = d.schedule!.rows;
const row = (g: number) => rows[g - rows[0][0]];
const A = 8000, B = 3000;
const sole = csCalc('hawaii', A, B, 1);
const ext = csCalc('hawaii', A, B, 1, { payerOvernights: 160 });
const eq = csCalc('hawaii', A, B, 1, { payerOvernights: 365 - F.equalTimeOvernights });
const netA = row(A)[1], netB = row(B)[1];
const shareA = Math.round((netA / (netA + netB)) * 100);
const solaAmt = sole.basicMonthly - F.basePrimarySupportPerChild;
const lowA = 1800, lowB = 5000;
const low = csCalc('hawaii', lowA, lowB, 1);
const lastGross = rows[rows.length - 1][0];

export default defineStatePage({
  topic: 'child-support',
  slug: 'hawaii',
  title: `Hawaii Child Support 2026: Melson Steps and SOLA in 2024 CSG`,
  description: `Hawaii child support 2026 under the 2024 Guidelines: ${usd(F.basePrimarySupportPerChild)} a child, a SOLA share of income, time-sharing tiers at ${num(F.soleCustodyMaxOvernights)} nights; ${usd(sole.monthly)} in our one-child example.`,
  intro: 'The 2024 Hawaii Child Support Guidelines worksheet, line by line, with the three time-sharing tiers that follow it.',
  resume: `A Hawaii parent earning ${usd(A)} a month gross, with the other parent at ${usd(B)} and one child living with that other parent, owes about ${usd(sole.monthly)} a month under the 2024 Hawaii Child Support Guidelines, in force since April 1, 2024. Hawaii does not use an income-shares table. Its worksheet follows a Melson-style sequence: first each parent's net income and SOLA income are read in the Judiciary's Table of Incomes, then the child's basic need is set at ${usd(F.basePrimarySupportPerChild)} per child plus child care and health insurance, and finally a Standard of Living Adjustment hands the child ${pct(F.solaPctPerChild)} of the parents' remaining income per child, ${pct(F.solaPctMax)} at most. In this example the need is ${usd(F.basePrimarySupportPerChild)}, the SOLA adds ${usd(solaAmt)}, and the higher earner carries ${pct(shareA)} of the total. Time-sharing changes the order in three tiers: at ${num(F.soleCustodyMaxOvernights)} overnights or fewer nothing moves, between that and equal time a per-night credit applies, and at equal time the order here falls to ${usd(eq.monthly)}.`,
  body: (h) => `<h2>Four incomes per parent, read in one table</h2>
<p>Appendix B, the Table of Incomes, gives for each dollar of monthly gross income a net income, a SOLA income and 70 percent of net. Net income is gross minus 2022 federal and state taxes for a single filer and FICA, minus a self-support reserve of ${usd(F.selfSupportReserve)}; a parent at ${usd(A)} shows ${usd(netA)} of net income and a parent at ${usd(B)} shows ${usd(netB)}. SOLA income is simpler: gross minus ${usd(F.solaIncomeDeduction)}. The worksheet divides each net income by the total and rounds the share to the nearest whole percent, so a share of ${pct(shareA)} is an exact figure here, not an approximation.</p>
<h2>Need first, standard of living second</h2>
<p>Line 4 puts ${usd(F.basePrimarySupportPerChild)} per child on the table, the monthly difference between a two-person and a one-person household in the 2022 federal poverty guidelines. Child care and the children's premium join it to form the Primary Child Support Need. Only then does the SOLA come in: the parents' combined SOLA income minus that need, times ${pct(F.solaPctPerChild)} per child. Each parent owes the total times his or her share, at least ${usd(F.minimumPerChild)} per child, and the paying parent's premium and child care are credited at the end. A parent at ${usd(lowA)} beside a parent at ${usd(lowB)} reaches the ${usd(F.minimumPerChild)} floor in our calculator: ${usd(low.monthly)}. When no affordable insurance exists, a cash medical payment of ${pct(F.cashMedicalPctOfNet)} of net income may be ordered separately.</p>
<h3>Sole, extensive, equal</h3>
<p>The Extensive Time-Sharing Worksheet has three outcomes. With ${num(F.soleCustodyMaxOvernights)} overnights or fewer the Line 17 amount stands. At equal time, about ${num(F.equalTimeOvernights)} nights each, both Line 17 amounts are multiplied by ${num(F.equalTimeMonthsEach)} months and the difference is spread over twelve: ${usd(eq.monthly)} in our case. In between, the gap between those two figures is divided by ${num(F.extensiveAdjustmentDivisor)} nights and credited for every night above ${num(F.soleCustodyMaxOvernights)}; at 160 nights the order is ${usd(ext.monthly)}. Our calculator treats ${num(365 - F.equalTimeOvernights)} nights for the parent with less time as equal time, since ${num(365 - F.equalTimeOvernights)} and ${num(F.equalTimeOvernights)} are as even as a year allows.</p>
<p>The Table of Incomes stops at ${usd(lastGross)} of gross income. Above it the Judiciary's spreadsheet computes taxes directly; our calculator extends net income at the table's last rate and says so. The guidelines date from ${day('2024-04-01')} and the next review is scheduled for 2026. For another state that starts from net income, see ${h.a('child-support:california', 'California')}.</p>`,
  faqs: [
    { q: 'What is SOLA in Hawaii child support?', a: `The Standard of Living Adjustment. After the child's basic need of ${usd(F.basePrimarySupportPerChild)} per child plus child care and insurance is covered, the parents' combined SOLA income (gross minus ${usd(F.solaIncomeDeduction)} each) is reduced by that need, and the child receives ${pct(F.solaPctPerChild)} of what remains for each child, ${pct(F.solaPctMax)} at most. In our example it adds ${usd(solaAmt)} a month to the need.` },
    { q: 'How do overnights change child support in Hawaii?', a: `With ${num(F.soleCustodyMaxOvernights)} overnights or fewer for the parent with less time, nothing changes. Above that, the Extensive Time-Sharing Worksheet credits each night beyond ${num(F.soleCustodyMaxOvernights)} at the gap between regular and equal-time support divided by ${num(F.extensiveAdjustmentDivisor)}. With ${usd(A)} and ${usd(B)} gross and one child, support is ${usd(sole.monthly)} on the regular worksheet, ${usd(ext.monthly)} at 160 nights and ${usd(eq.monthly)} at equal time.` },
    { q: 'What is the minimum child support amount in Hawaii?', a: `${usd(F.minimumPerChild)} per child per month under the 2024 Guidelines, unless exceptional circumstances justify less; the equal time-sharing calculation can also produce a lower figure. Net income in the Table of Incomes already deducts a self-support reserve of ${usd(F.selfSupportReserve)}, so a parent earning little shows little or no net income and lands on that floor.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:california', 'child-support:maine'],
});
