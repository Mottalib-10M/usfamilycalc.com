import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day } from '../../../lib/kit';

const d = cs('new-mexico');
const S = d.schedule!;
const SH = d.shared!;
const F = d.formula as { roundCombinedIncomeTo: number };
const step = F.roundCombinedIncomeTo;
const T = SH.thresholdOvernights!;
const M = SH.multiplier!;
const top = S.rows[S.rows.length - 1];
const first = S.rows[0];
const A = 6000, B = 3000;
const sole = csCalc('new-mexico', A, B, 2);
const below = csCalc('new-mexico', A, B, 2, { payerOvernights: T - 1 });
const shared = csCalc('new-mexico', A, B, 2, { payerOvernights: T });
const lowA = 5974, highA = 5976;
const lowR = csCalc('new-mexico', lowA, B, 2), highR = csCalc('new-mexico', highA, B, 2);
const bigA = 40000, bigB = 10000;
const big = csCalc('new-mexico', bigA, bigB, 1);
const pctTop = S.aboveMax.pct!;

export default defineStatePage({
  topic: 'child-support',
  slug: 'new-mexico',
  title: `New Mexico Child Support 2026: Rule Schedule in $${num(step)} Bands`,
  description: `New Mexico child support 2026: the 8.50.108 NMAC schedule read in $${num(step)} bands, Worksheet B at ${num(T)} days, and ${usd(sole.monthly)} a month for two children in our example.`,
  intro: 'How New Mexico turns two gross incomes into a monthly order since the schedule left the statute and moved into an agency rule.',
  resume: `A New Mexico parent earning ${usd(A)} a month gross, with the other parent at ${usd(B)} and two children living mainly with that other parent, owes about ${usd(sole.monthly)} a month under Worksheet A, before health insurance and child care. The figure comes from the basic child support schedule that the Health Care Authority adopted by rule, 8.50.108 NMAC Appendix 1, in force since ${day(d.effective!)}: the combined income of ${usd(A + B)} sits in a band worth ${usd(sole.basicMonthly)} for two children, and the higher earner carries two thirds of it. New Mexico reads gross income, not net, and its bands are ${usd(step)} wide, so the worksheet tells you to round the combined figure to the nearest ${usd(step)} before looking it up. When each parent has the children at least 35 percent of the year, Worksheet B raises the schedule amount by ${num(M, 1)} and credits the time spent in each home; in this example that moves the order to ${usd(shared.monthly)}.`,
  body: (h) => `<h2>A schedule that now lives in the Administrative Code</h2>
<p>From 1988 to 2023 the New Mexico table sat inside NMSA 1978 § 40-4-11.1, and changing a single dollar meant a bill in Santa Fe. Laws 2023, chapter 106 took it out. The statute now keeps the definitions, the worksheets and the deviation rules, while the Health Care Authority (the former Human Services Department) sets the figures by rule after each quadrennial review. The current version took effect on ${day(d.effective!)} and added a self-support reserve: in the shaded low-income cells of the table, only the paying parent's income is used. The published text does not show which cells are shaded, so our calculator does not apply that reserve, and a parent near the bottom of the table should check the official appendix.</p>
<h2>Rounding first, then the band</h2>
<p>Each line of the appendix covers ${usd(step)} of combined monthly gross income, from the first band, 0 to ${usd(first[0])}, up to ${usd(top[0])}. Worksheet A, line 4 asks for the combined income rounded to the nearest ${usd(step)}. Two families a few dollars apart can land in different bands: with the other parent at ${usd(B)}, a payer at ${usd(lowA)} owes ${usd(lowR.monthly)}, a payer at ${usd(highA)} owes ${usd(highR.monthly)}. A spreadsheet that simply floors the income would get the second family wrong.</p>
<h3>Thirty-five percent and the ${num(M, 1)} factor</h3>
<p>The statute calls it shared responsibility: each home is suitable and the children spend at least 35 percent of the year in each. Time is counted in 24-hour days, not overnights. Below the line, Worksheet A applies; at ${num(T)} days the calculator switches to Worksheet B, which multiplies the schedule figure by ${num(M, 1)}, lets each parent retain the percentage of days spent with him or her, and nets the rest. In our example the order goes from ${usd(below.monthly)} at ${num(T - 1)} days to ${usd(shared.monthly)} at ${num(T)}.</p>
<h3>Past the last band</h3>
<p>Above ${usd(top[0])} of combined income the appendix adds a percentage of the excess to the top amount, ${pct(pctTop[0])} for one child up to ${pct(pctTop[pctTop.length - 1])} for six. Parents at ${usd(bigA)} and ${usd(bigB)} with one child reach a basic obligation of ${usd(big.basicMonthly)}; the higher earner's part is ${usd(big.monthly)}. A single obligation above 40 percent of the payer's gross income is presumed a substantial hardship. To compare with the neighbor to the east, open the ${h.a('child-support:texas', 'Texas page')}.</p>`,
  faqs: [
    { q: 'Where is the New Mexico child support schedule now?', a: `In the New Mexico Administrative Code, not in the statute. Laws 2023, chapter 106 removed the table from NMSA § 40-4-11.1 and told the Health Care Authority to adopt it by rule. The rule, 8.50.108 NMAC Appendix 1, applies to orders made on or after ${day(d.effective!)}. The worksheets and the deviation rules stay in the statute, and the agency updates the figures after each four-year review.` },
    { q: 'How does New Mexico round income on the child support worksheet?', a: `Worksheet A and Worksheet B both say to round the parents' combined gross monthly income to the nearest ${usd(step)} and read the matching band of the schedule. In our example, with the other parent at ${usd(B)} and two children, a payer at ${usd(lowA)} owes ${usd(lowR.monthly)} while a payer at ${usd(highA)} owes ${usd(highR.monthly)}, because the two combined incomes round to different bands.` },
    { q: 'When does Worksheet B apply in New Mexico?', a: `When each parent provides a suitable home and the children spend at least 35 percent of the year in each, counted in 24-hour days. The schedule amount is multiplied by ${num(M, 1)}, each parent keeps the share matching his or her days, and the difference is paid. For ${usd(A)} and ${usd(B)} of income and two children, the order moves from ${usd(below.monthly)} to ${usd(shared.monthly)}.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:texas', 'child-support:california'],
});
