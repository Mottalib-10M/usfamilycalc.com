import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('washington');
const base = d.ttd.rate;
const maxWeekly = d.ttd.max as number;
const minWeekly = d.ttd.min as number;
// The monthly limits as L&I publishes them, read from the data's own text (the weekly figures are derived from them).
const money = (s: string) => Number((s.match(/\$([0-9,]+\.[0-9]{2})/) as RegExpMatchArray)[1].replace(/,/g, ''));
const maxMonthly = money(d.ttd.periodLabel.slice(d.ttd.periodLabel.indexOf('weekly equivalents')));
const minMonthly = money((d.ttd as { minText?: string }).minText ?? '');
const wait = d.waiting.days as number;
const retro = (d.waiting.retroactiveAfterDays as number) + 1;
const from = day(d.ttd.effective);
// Steps of the RCW 51.32.060(1) schedule for injuries on or after July 1, 2026.
const steps: Array<[string, number]> = [
  ['unmarried, no children', 60], ['unmarried with one child, or married with none', 65], ['unmarried with two children, or married with one', 67],
  ['unmarried with three, or married with two', 69], ['unmarried with four, or married with three', 71], ['unmarried with five, or married with four', 73],
  ['unmarried with six or more, or married with five or more', 75],
];

// A Spokane carpenter earning $6,000 a month ($1,384.62 a week), single, no children.
const monthlyPay = 6000;
const weeklyPay = (monthlyPay * 12) / 52;
const single = wcWeekly('washington', weeklyPay);
const married2 = Math.min((weeklyPay * 69) / 100, maxWeekly);
// The same carpenter off 5 days, then 8.
const c5 = wcCalc('washington', weeklyPay, 5);
const c8 = wcCalc('washington', weeklyPay, 8);
// A Seattle tower crane operator at $16,000 a month.
const crane = wcWeekly('washington', (16000 * 12) / 52);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'washington',
  title: 'Washington Workers Comp Calculator 2026: L&I Time Loss',
  description: `Washington workers comp from ${from}: L&I time loss is ${pct(base)} to 75% of monthly wages by family status, up to ${usd(maxMonthly)} a month in 2026, after a 3-day wait.`,
  intro: 'Washington pays time loss by the month, at a percentage that depends on whether you are married and how many children you support.',
  resume: `The Washington State Department of Labor & Industries (L&I) pays time-loss compensation as a monthly percentage of wages that varies with family status. For injuries on or after ${from}, the rate starts at ${pct(base)} for an unmarried worker with no children and climbs in steps to 75% for a married worker with five or more children, under a schedule rewritten by the 2025 Legislature. The maximum is 120% of the state's average monthly wage, ${usdx(maxMonthly)} a month, about ${usd(maxWeekly)} a week; the minimum is 15% of that average, ${usdx(minMonthly)} a month, plus $10 for a spouse and each child. The calculator applies the ${pct(base)} rate of a single worker without children. The first ${wait} days after the injury are a waiting period, paid only if you are still off work on day ${retro}. No taxes are withheld from time loss. Workers injured before July 1, 2025 received a 4.9% increase on July 1, 2026.`,
  body: (h) => `<h2>Your household sets your rate</h2>
<p>The replacement rate follows family size. The RCW 51.32.060 schedule that L&I applies to injuries from ${from}:</p>
${h.table(['Household at the time of injury', 'Share of wages'], steps.map(([who, p]) => [who, h.pct(p)]), 'Time loss for injuries on or after July 1, 2026 (RCW 51.32.060(1), applied by RCW 51.32.090(1))', ['l', 'r'])}
<p>The calculator above uses the first line, ${h.pct(base)}, so it understates the check for anyone married or supporting a child. A Spokane carpenter earning ${h.usd(monthlyPay)} a month, single with no children, is shown ${h.usd(single)} a week. Married with two children, he would receive 69%, about ${h.usd(married2)} a week. Injuries before July 1, 2026 use an older schedule: 65% for a married worker plus 2 points per child up to 75%, 60% for an unmarried worker plus 2 points per child up to 70%.</p>

<h2>Monthly figures, weekly view</h2>
<p>L&I publishes its limits by the month and by the day, not by the week. The ${h.ext(d.ttd.url, 'Self-Insurance benefits schedule')} for July 1, 2026 to June 30, 2027 gives a monthly maximum of ${h.usdx(maxMonthly)}, derived from an annual state average wage of $99,810; the weekly figures here are those amounts times 12 and divided by 52. A tower crane operator in Seattle earning ${h.usd(16000)} a month receives the cap, ${h.usd(crane)} a week. The minimum of ${h.usdx(minMonthly)} a month gains ${h.usd(10)} for a spouse or registered domestic partner and for each child.</p>

<h2>Day seven since 2024</h2>
<p>The carpenter off five days receives ${h.usd(c5.total)}. Off eight days, all of them are paid: ${h.usd(c8.total)}. Before June 6, 2024, the first ${wait} days were paid only after fourteen days off. The first check should arrive within 14 days of L&I learning from the doctor that you cannot work; checks come twice a month after that.</p>

<h2>A state fund and a no-fault bargain</h2>
<p>Time loss is paid either by L&I or, for a self-insured employer, by the employer itself under the same law. ${d.facts[3].text} Partial wage loss on light duty is covered as loss of earning power, and permanent partial disability is paid as a fixed award: ${d.ppd.text}</p>
<p>See ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')} for settlements, and the ${h.aIf('child-support:washington', 'Washington child support page')} for time loss counted as income.</p>`,
  faqs: [
    {
      q: 'Why is my Washington time-loss rate higher than 60%?',
      a: `Because Washington adds percentage points for a spouse or registered domestic partner and for children. For injuries from ${from}, a single worker with no children receives ${pct(base)} of wages, a married worker with no children or a single parent of one 65%, and the scale reaches 75%. The percentage is fixed by your status at the time of injury.`,
    },
    {
      q: 'What is the Washington L&I maximum time-loss payment for 2026?',
      a: `${usdx(maxMonthly)} a month for injuries on or after ${from}, which is 120% of the state's average monthly wage. L&I also states it as a daily figure. In weekly terms that is about ${usd(maxWeekly)}. Claims with earlier injury dates have their own, lower maximum, raised each July 1 by the cost-of-living adjustment.`,
    },
    {
      q: 'Does Washington pay the first three days of a work injury?',
      a: `Yes, if you are still off work on the seventh day after the injury. RCW 51.32.090(7) withholds compensation for the day of injury and the three days after it unless the disability lasts seven consecutive days. For injuries before June 6, 2024, the rule required fourteen days. Trying to return to work during the first week does not break the count.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:oregon', 'child-support:washington'],
});
