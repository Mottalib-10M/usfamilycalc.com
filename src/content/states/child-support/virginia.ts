import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day, listOf } from '../../../lib/kit';

const d = cs('virginia');
const S = d.schedule!;
const SH = d.shared!;
const T = SH.thresholdOvernights!;
const M = SH.multiplier!;
const A = 5000, B = 3000;
const sole = csCalc('virginia', A, B, 2);
const at90 = csCalc('virginia', A, B, 2, { payerOvernights: T - 1 });
const at91 = csCalc('virginia', A, B, 2, { payerOvernights: T });
const hiA = 9000, hiB = 1000;
const hiSole = csCalc('virginia', hiA, hiB, 1);
const hiShared = csCalc('virginia', hiA, hiB, 1, { payerOvernights: T });
const need = hiShared.basicMonthly * M;
const share = hiA / (hiA + hiB);
const hiSharedRaw = need * ((365 - T) / 365) * share - need * (T / 365) * (1 - share);
const bigA = 45000, bigB = 5000;
const big = csCalc('virginia', bigA, bigB, 1);
const pctAbove = S.aboveMax.pct!;

export default defineStatePage({
  topic: 'child-support',
  slug: 'virginia',
  title: `Virginia Child Support 2026: Shared Custody at ${num(T - 1)} Days`,
  description: `Virginia child support 2026 under Va. Code § 20-108.2: gross income schedule, shared custody past ${num(T - 1)} days with a ${num(M, 1)} multiplier, and ${usd(sole.monthly)} for two children.`,
  intro: 'Va. Code § 20-108.2 applied step by step: the schedule, the shared custody formula and the rule that picks the lower amount.',
  resume: `Under Va. Code § 20-108.2, a Virginia parent with ${usd(A)} of monthly gross income, when the other parent earns ${usd(B)} and the two children live mostly with that other parent, owes about ${usd(sole.monthly)} a month before child care and health coverage. Virginia reads its schedule on gross income, before taxes, and extrapolates between its rows. The step that matters most is custody time: once the paying parent has the children more than ${num(T - 1)} days a year, the shared custody formula replaces the sole custody one, and in this example the order falls from ${usd(at90.monthly)} at ${num(T - 1)} days to ${usd(at91.monthly)} at ${num(T)}. The shared formula inflates the schedule amount by ${num(M, 1)} to reflect two households, but a parent can always show that the sole custody figure is lower, and then the lower figure wins. Above ${usd(S.maxIncome)} of combined income the statute adds a fixed percentage of the excess rather than leaving it to the judge.`,
  body: (h) => `<h2>Counting days, not nights</h2>
<p>Virginia measures custody in days. A day is 24 hours, and when the parent with fewer overnights keeps the child overnight for less than a full day, the statute presumes half a day for each parent. A schedule of alternate weekends from Friday evening to Sunday evening can therefore count for less than its overnights suggest. The year may start on any date the court picks, and the custody share of the parent with fewer days is projected over twelve months.</p>
<h2>Two answers, the smaller one wins</h2>
<p>Subsection G 3 builds the shared amount like this. The schedule amount for the combined income is multiplied by ${num(M, 1)}, giving the shared support need. Each parent owes that need times the share of the year the children spend with the other parent, plus the other parent's child care and health coverage, all multiplied by his or her own share of income. The two figures are netted. Then comes the check that sets Virginia apart: the shared amount is presumptive only if no party shows that the sole custody amount is smaller. If it is, the smaller amount is the support.</p>
<p>In most families the shared amount is the lower one. It is not always so. Take a parent earning ${usd(hiA)} next to a parent earning ${usd(hiB)}, one child, ${num(T)} days with the high earner. The shared formula gives ${usd(hiSharedRaw)} a month, because the ${num(M, 1)} multiplier outweighs the small credit for time; the sole custody amount is ${usd(hiSole.monthly)}. The calculator returns ${usd(hiShared.monthly)}, the lesser. A parent whose share of income is very high gains nothing from crossing the ${num(T - 1)}-day line.</p>
<p>The opposite case has its own rule: if the shared computation sends money to the parent who would pay under sole custody, the shared figure is deemed the lesser and applies.</p>
<h3>Above the table and below it</h3>
<p>The schedule ends at ${usd(S.maxIncome)} of combined monthly gross income. Beyond it, the statute adds ${listOf(pctAbove.map((p, i) => `${pct(p)} for ${i + 1}`))} children of the income above the top row. A family at ${usd(bigA + bigB)} with one child therefore has a basic obligation of ${usd(big.basicMonthly)}, and the parent earning ${usd(bigA)} owes ${usd(big.monthly)}. At the bottom, the first row covers incomes from zero, and a presumptive statutory minimum applies; the current text of § 20-108.2(B) names it without stating the amount, so the calculator does not apply a separate floor. A payer at or under 150% of the federal poverty level can ask the court to go below it.</p>
<p>The schedule now in the Code came from the 2014 amendment, in force from ${day(d.effective!)} under the usual start date for that session's acts; later amendments changed income rules, not the figures. The Child Support Guidelines Review Panel examines it every four years. For a state that switches custody formulas at a night count instead, see ${h.a('child-support:north-carolina', 'North Carolina')}, or run every state on the ${h.a('child-support', 'calculator')}.</p>`,
  faqs: [
    { q: 'How many days do you need for shared custody child support in Virginia?', a: `More than ${num(T - 1)} days a year. A day means 24 hours, and an overnight shorter than that counts as half a day for each parent. Past that line the court computes a shared custody amount with the ${num(M, 1)} multiplier. In our example with ${usd(A)} and ${usd(B)} of gross income and two children, the order drops from ${usd(at90.monthly)} to ${usd(at91.monthly)} a month.` },
    { q: 'Can Virginia shared custody support be higher than sole custody support?', a: `On paper, yes, when one parent earns most of the family income: the ${num(M, 1)} multiplier can outweigh the credit for time. The statute answers it: the shared amount applies unless a party shows the sole custody amount is lower, and then the lower amount is ordered. With ${usd(hiA)} and ${usd(hiB)} and one child, the shared formula gives ${usd(hiSharedRaw)}, the sole one ${usd(hiSole.monthly)}.` },
    { q: 'What happens when Virginia parents earn more than the schedule?', a: `The statute extends the schedule itself. For combined gross income above ${usd(S.maxIncome)} a month, take the amount at the top row and add a percentage of the excess: ${pct(pctAbove[0])} for one child, rising to ${pct(pctAbove[pctAbove.length - 1])} for six. The judge can still deviate with written findings under § 20-108.1, as for any guideline amount.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:north-carolina', 'child-support:new-jersey'],
});
