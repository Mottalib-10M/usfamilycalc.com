import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, num, day } from '../../../lib/kit';

const d = wc('new-mexico');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const weeks = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('new-mexico') as number;
const year = d.ttd.effective.slice(0, 4);

// A Permian Basin pumper at $1,950 a week: capped, eight weeks.
const pump = wcCalc('new-mexico', 1950, 56);
// An Albuquerque hotel housekeeper at $560 a week: 25 days, then 30.
const h25 = wcCalc('new-mexico', 560, 25);
const h30 = wcCalc('new-mexico', 560, 30);
// Whole-body PPD with modifiers, the WCA's own pattern: rating 12% + (6 modifier points x RPC 3) = 30%.
const rate560 = wcWeekly('new-mexico', 560);
const ppdPct = 12 + 6 * 3;
const ppdWeekly = (rate560 * ppdPct) / 100;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'new-mexico',
  title: `New Mexico Workers Comp Calculator 2026: ${weeks}-Week Limit`,
  description: `New Mexico workers comp ${year}: TTD is ${pct(d.ttd.rate)} of the average weekly wage, up to ${usdx(max)} a week, and the first ${wait} days are paid only after ${num(retro / 7)} weeks off work.`,
  intro: 'New Mexico counts temporary and permanent benefits against one shared limit of weeks for a body injury.',
  resume: `The New Mexico Workers' Compensation Administration (WCA) describes temporary total disability as the full compensation rate: ${pct(d.ttd.rate)} of the worker's average weekly wage, based on the 26 weeks before the accident. For injuries in ${year}, the WCA rate table sets the weekly maximum at ${usdx(max)}, which is 100% of the state average weekly wage, and the minimum at ${usdx(min)}. Earnings above about ${usd(atMax)} a week are capped. Benefits begin on the eighth day of non-work status; the first ${wait} days are paid only if the worker is off more than ${num(retro / 7)} weeks. A housekeeper earning ${usd(560)} who misses thirty days receives ${usd(h30.total)}. TTD ends at maximum medical improvement or when the worker is offered or takes a job at the pre-injury wage. For a whole-body injury, temporary and permanent partial benefits together are limited to ${num(weeks)} weeks when the permanent rating is below 80%, and to 700 weeks at 80% or more. Permanent ratings add points for age, education, skills and physical capacity.`,
  body: (h) => `<h2>One clock for temporary and permanent benefits</h2>
<p>In many states, the weeks of temporary disability and the weeks of a permanent award run on separate meters. New Mexico puts them on one. If the total permanent partial rating is under 80%, the WCA says the maximum duration of indemnity for a whole-body injury is ${h.num(weeks)} weeks, TTD included; at 80% or more, it is 700 weeks. A long TTD period therefore shortens what remains for the permanent award. The ${h.ext(d.ttd.url, 'WCA disability rates table')} prints the dollar value of both limits at the top rate. A pumper in the Permian Basin earning ${h.usd(1950)} a week computes to ${h.usd(pump.raw)} and is paid ${h.usdx(pump.weekly)}, ${h.usd(pump.total)} for eight weeks off.</p>

<h2>Four weeks to recover the first week</h2>
<p>New Mexico's threshold for repaying the waiting period is long. The first ${wait} days of non-work status, which do not have to be consecutive, are paid only when the worker is off more than ${h.num(retro / 7)} weeks. A housekeeper earning ${h.usd(560)} who is back after twenty-five days receives ${h.usd(h25.total)}; at thirty days she receives ${h.usd(h30.total)}, the waiting days included. Her weekly rate is ${h.usd(h30.weekly)}.</p>

<h2>Modifiers on a whole-body rating</h2>
<p>When a worker reaches maximum medical improvement and returns at the old wage, permanent partial disability is simply the weekly rate times the impairment rating. When the worker does not return at that wage, New Mexico adds modifier points for age, education and the specific vocational preparation (SVP) of the job in the Dictionary of Occupational Titles, then multiplies them by a residual physical capacity score. Using the WCA's own pattern, a 12% impairment with six modifier points and a capacity score of three becomes a ${ppdPct}% rating; for the housekeeper that would be ${h.usd(ppdWeekly)} a week instead of ${h.usd((rate560 * 12) / 100)}. Scheduled injuries to specific members follow a separate statutory schedule.</p>
<p>${d.facts[1]?.text ?? ''} ${d.facts[2]?.text ?? ''} For what a settlement adds, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}, and the ${h.aIf('child-support:new-mexico', 'New Mexico child support page')} for benefits counted as income.</p>`,
  faqs: [
    {
      q: 'What is the maximum weekly workers’ comp benefit in New Mexico for 2026?',
      a: `${usdx(max)} a week for injuries in ${year}, equal to 100% of the state average weekly wage computed by the New Mexico Department of Labor. The weekly minimum on the WCA table is ${usdx(min)}. The table also lists the maximum total for ${num(weeks)} weeks and for 700 weeks at the top rate, which caps what a whole-body claim can pay in all.`,
    },
    {
      q: 'Are the first seven days paid in New Mexico workers’ comp?',
      a: `Only if you are off work more than ${num(retro / 7)} weeks. TTD starts on the eighth day of non-work status, and the days do not need to be consecutive. The first ${wait} days are added back once the absence passes four weeks. Medical care is paid from the first visit regardless of how long you are out.`,
    },
    {
      q: 'How long can I receive benefits for a back injury in New Mexico?',
      a: `For a whole-body injury such as the back, temporary and permanent partial benefits together stop after ${num(weeks)} weeks if the permanent rating is under 80%, and after 700 weeks if it is 80% or more. Permanent total disability can last for the rest of the worker's life. Every week of TTD counts toward the same limit as the later permanent award.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:texas', 'workers-comp:arizona', 'workers-comp:colorado', 'child-support:new-mexico'],
});
