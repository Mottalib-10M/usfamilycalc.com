import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day } from '../../../lib/kit';

const d = cs('washington');
const S = d.schedule!;
const F = d.formula as unknown as { maxPctOfNetIncome: number; minimumPerChildMonthly: number; selfSupportReservePctOfPovertyLevel: number };
const A = 5000, B = 3000, C = A + B;
const one = csCalc('washington', A, B, 1);
const two = csCalc('washington', A, B, 2);
const row = S.rows.filter((r) => r[0] <= C).pop()!;
const rowTop = S.rows[S.rows.length - 1];
const capA = 2500, capB = 1000;
const capped = csCalc('washington', capA, capB, 4);
const cappedRow = S.rows.filter((r) => r[0] <= capA + capB).pop()!;
const minA = 200, minB = 2500;
const floor = csCalc('washington', minA, minB, 2);
const rowLow = S.rows.filter((r) => r[0] <= minA + minB).pop()!;

export default defineStatePage({
  topic: 'child-support',
  slug: 'washington',
  title: `Washington Child Support 2026: The New Per-Child Table`,
  description: `Washington child support 2026 under RCW 26.19.020: a per-child table from ${usd(S.minIncome)} to ${usd(S.maxIncome)} of combined net income, a ${pct(F.maxPctOfNetIncome)} limit, ${usd(two.monthly)} a month for two kids.`,
  intro: 'RCW 26.19 as amended in 2025: a new economic table, read per child, on combined monthly net income.',
  resume: `Washington replaced its economic table on ${day(d.effective!)}. The new RCW 26.19.020 table gives an amount per child, by family size, for combined monthly net income from ${usd(S.minIncome)} to ${usd(S.maxIncome)}, and it has no age columns. For parents with ${usd(A)} and ${usd(B)} of net income, the row at ${usd(row[0])} lists ${usd(row[1])} for an only child and ${usd(row[2])} per child in a two-child family, so the basic obligation for two is ${usd(two.basicMonthly)} and the parent with ${usd(A)} owes ${usd(two.monthly)} a month. Washington works from net income: taxes, FICA, mandatory pension and union dues, paid family leave premiums and up to a set amount of voluntary retirement savings come off first. Two limits frame the result: no more than ${pct(F.maxPctOfNetIncome)} of the paying parent's net income for all children, and a presumptive minimum of ${usd(F.minimumPerChildMonthly)} per child a month.`,
  body: (h) => `<h2>Reading the table per child</h2>
<p>The 2026 table is printed as two blocks: one for families of one or two children, another for three to five. Each cell is a monthly amount for each child, and the per-child figure falls as the family grows. The obligation for the family is that figure times the number of children: at ${usd(row[0])} of combined net income, ${usd(row[1])} for one child, ${usd(row[2] * 2)} for two, ${usd(row[3] * 3)} for three. Rows are printed every ${usd(S.rows[1][0] - S.rows[0][0])} and the statute says nothing about amounts between rows; this calculator uses the row at or below the income.</p>
<p>Age plays no part. In the table effective ${day(d.effective!)}, a teenager and a toddler in the same family carry the same figure, so the calculator asks only for the number of children. The table has no column beyond five children, and this calculator stops at five.</p>
<h2>The ${pct(F.maxPctOfNetIncome)} ceiling and the ${usd(F.minimumPerChildMonthly)} floor</h2>
<p>RCW 26.19.065 limits a parent's support for all his or her children to ${pct(F.maxPctOfNetIncome)} of net income, unless the court finds good cause such as substantial wealth or a large family. Take a parent with ${usd(capA)} of net income, a co-parent at ${usd(capB)}, and four children: the table gives ${usd(cappedRow[4])} per child at ${usd(cappedRow[0])}, ${usd(capped.basicMonthly)} in all, and the paying parent's share would exceed the limit, so the calculator shows ${usd(capped.monthly)}.</p>
<p>At the bottom, a parent with very little income still owes the presumptive minimum unless the court finds it unjust. With ${usd(minA)} of net income against ${usd(minB)}, two children and the ${usd(rowLow[0])} row, the income share alone would be about ${usd(floor.basicMonthly * minA / (minA + minB))}; the order shown is ${usd(floor.monthly)}. The statute also protects a self-support reserve of ${num(F.selfSupportReservePctOfPovertyLevel)}% of the federal poverty level for one person, which our data does not hold in dollars, so it is not applied here. Below ${usd(S.minIncome)} of combined income, the table does not apply at all and the court looks at each household's resources and expenses.</p>
<h3>Residential time is a deviation</h3>
<p>Washington has no overnight formula. Time with the paying parent can justify a deviation under RCW 26.19.075(1)(d), weighed against the receiving household's costs, and not if it would leave that household short or the children receive TANF. The calculator therefore ignores overnights for this state. Above ${usd(rowTop[0])} of combined net income, the court may go beyond the top row with written findings. Idaho, next door, uses a different method, shown on the ${h.a('child-support:idaho', 'Idaho child support page')}.</p>`,
  faqs: [
    { q: 'Does the age of the child change Washington child support?', a: `No. The economic table in force since ${day(d.effective!)} has one per-child amount for each family size and no column by age. At ${usd(row[0])} of combined monthly net income, every child in a two-child family counts for ${usd(row[2])}, whatever the ages. The table comes from Laws of 2025, chapter 272, and runs to ${usd(S.maxIncome)} of combined income.` },
    { q: `What is the ${pct(F.maxPctOfNetIncome)} limit in Washington child support?`, a: `RCW 26.19.065 says a parent's child support for all biological or legal children may not exceed ${pct(F.maxPctOfNetIncome)} of net income, except for good cause such as substantial wealth, day care or special needs, or a larger family. In our four-child example with ${usd(capA)} and ${usd(capB)} of net income, the limit holds the order at ${usd(capped.monthly)} a month.` },
    { q: 'Does residential time reduce Washington child support?', a: `Not automatically. Washington's standard calculation ignores overnights; a court may deviate when the children spend a significant amount of time with the paying parent, after weighing that parent's extra costs and the other household's savings. It cannot deviate if the receiving household would lack funds for the children's basic needs or receives TANF.` },
    { q: 'What happens below the start of the Washington economic table?', a: `Under ${usd(S.minIncome)} of combined monthly net income, the table gives no figure: support is set from the resources and living expenses of each household, with a presumptive minimum of ${usd(F.minimumPerChildMonthly)} per child a month. The court can go below that minimum only when applying it would be unjust, given the children's interests and both parents' situations.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:idaho', 'child-support:california'],
});
