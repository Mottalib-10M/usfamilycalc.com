import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, day } from '../../../lib/kit';

const d = wc('ohio');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const early = d.ttd.rate;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('ohio') as number;
const from = day(d.ttd.effective);

// A Toledo machine operator: full weekly wage $1,100, 52-week average $1,050, off 20 weeks.
const fww = 1100, aww = 1050;
const first = wcWeekly('ohio', fww);
const later = Math.min(aww * 2 / 3, max);
const op20 = wcCalc('ohio', fww, 140);
// The same operator off ten days, then fifteen.
const op10 = wcCalc('ohio', fww, 10);
const op15 = wcCalc('ohio', fww, 15);
// A Columbus delivery driver at $500 a week.
const driver = wcWeekly('ohio', 500);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'ohio',
  title: `Ohio Workers Comp Calculator 2026: ${early}% for 12 Weeks`,
  description: `Ohio workers comp for 2026 injuries: the BWC pays ${early}% of the full weekly wage for 12 weeks, then two thirds of the AWW, capped at ${usd(max)} a week in 2026.`,
  intro: 'Ohio pays a higher percentage during the first twelve weeks of a claim than afterward, and measures the wage differently in each stage.',
  resume: `The Ohio Bureau of Workers' Compensation (BWC) pays temporary total (TT) compensation in two stages. For the first 12 weeks after the injury, the rate is ${early}% of the full weekly wage, the average of what you earned in the six weeks or seven days before you were hurt. After that, it drops to 66 2/3% of the average weekly wage over the prior 52 weeks. Either way, the weekly check for a 2026 injury cannot exceed ${usd(max)}, the statewide average weekly wage, and the minimum is ${usd(min)}, unless your wage itself is lower, in which case BWC pays the wage. A worker earning ${usd(1100)} a week receives ${usd(first)} during the first stage. The first ${wait} days are paid only after ${retro + 1} consecutive days off, and TT stops at maximum medical improvement, a return to work or a suitable job offer.`,
  body: (h) => `<h2>Two rates, two wage averages</h2>
<p>Ohio changes the percentage partway through the same disability. For twelve weeks, the BWC applies ${h.pct(early)} to the full weekly wage (FWW), built from the six weeks or seven days before the injury, which usually captures current pay and recent overtime. From week thirteen, it applies two thirds to the average weekly wage (AWW), built from the 52 weeks before the injury. A Toledo machine operator with an FWW of ${h.usd(fww)} and an AWW of ${h.usd(aww)} receives ${h.usd(first)} a week at first, then ${h.usd(later)}. Both figures are checked against the same ceiling of ${h.usd(max)}, the statewide average weekly wage for 2026, which an FWW reaches at about ${h.usd(atMax)}.</p>
<p>The calculator above keeps the ${h.pct(early)} rate for the whole period you enter, so beyond twelve weeks it overstates the check. For the operator off twenty weeks, it shows ${h.usd(op20.total)}; the real figure is lower, because the last eight weeks are paid at ${h.usd(later)}. Enter only the first twelve weeks, then price the rest at two thirds of your AWW.</p>

<h2>Paperwork the BWC asks for</h2>
<p>The ${h.ext(d.ttd.url, 'BWC compensation rate chart')} is the reference for every figure here, and the bureau itself pays TT on the claims it insures. Payment depends on medical evidence: the physician of record, a BWC-certified provider, must send a Physician's Report of Work Ability (MEDCO-14) after every visit, and you file a Request for Temporary Total Compensation (C-84) for the first period and for each extension. Wage proof covers the 52 weeks before the injury, from every employer you had, through pay stubs, W-2s or the Wages-IW earnings statement.</p>

<h2>The second week decides the first</h2>
<p>The operator out ten days is paid only from the eighth day: ${h.usd(op10.total)}. At fifteen days the first week is paid back and the total becomes ${h.usd(op15.total)}. A delivery driver earning ${h.usd(500)} receives ${h.usd(driver)}, more than two thirds of his pay because of the floor; a worker whose wage is under the floor receives the wage itself. ${d.facts[1].text}</p>

<h2>When TT ends</h2>
<p>Payments stop at maximum medical improvement, on a return to work or a release to the former job, when the employer offers work within the restrictions, or on incarceration or voluntary abandonment of employment. ${d.ppd.text} For what a settlement adds, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}; for comp income in a support case, the ${h.aIf('child-support:ohio', 'Ohio child support calculator')}.</p>`,
  faqs: [
    {
      q: 'Why did my Ohio TT check go down after 12 weeks?',
      a: `Because Ohio changes both the rate and the wage. For the first 12 weeks, the BWC pays ${early}% of your full weekly wage from the weeks just before the injury. From the thirteenth week, it pays 66 2/3% of the average weekly wage from the prior 52 weeks. If your recent pay was higher than your yearly average, the drop can be larger than the change in percentage alone.`,
    },
    {
      q: 'What is the Ohio temporary total maximum for a 2026 injury?',
      a: `${usd(max)} a week, the 2026 statewide average weekly wage, for injuries from ${from} through the end of the year. The minimum is ${usd(min)}, but when your full or average weekly wage is lower than that, BWC pays your actual wage. Workers who also receive Social Security retirement have a lower TT maximum on the BWC chart.`,
    },
    {
      q: 'Does Ohio pay the first week of a work injury?',
      a: `Not right away. The BWC does not pay TT for the first ${wait} days until you have been unable to work for ${retro + 1} or more consecutive calendar days; then every day missed is paid. TT also requires that the injury keep you off work for more than seven calendar days, so a one-week absence produces no wage benefit.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:pennsylvania', 'workers-comp:michigan', 'workers-comp:indiana', 'child-support:ohio'],
});
