import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('montana');
const max = d.ttd.max as number;
const wait = d.waiting.days as number;
const day21 = (d.waiting.retroactiveAfterDays as number) + 1;
const atMax = wcWageAtMax('montana') as number;
const from = day(d.ttd.effective);
const ppdMax = max / 2;

// A Bakken-area oilfield hand at $2,100 a week: capped.
const oil = wcCalc('montana', 2100, 60);
// A ranch hand at $760 a week: 15 days, then 21.
const r15 = wcCalc('montana', 760, 15);
const r21 = wcCalc('montana', 760, day21);

// PPD illustration under MCA 39-71-703: 8% whole person, over 40 (+1%), no high school (+1%), wage loss over $2/hr (+20%).
const rating = 8 + 1 + 1 + 20;
const ppdWeeks = (rating / 100) * 400;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'montana',
  title: `Montana Workers Comp Calculator 2026: FY27 Max ${usdx(max)}`,
  description: `Montana workers comp from ${from}: TTD pays ${pct(d.ttd.rate)} of gross wages up to ${usdx(max)} a week, PPD up to ${usdx(ppdMax)}, after a ${wait}-day wait that is repaid at ${day21} days off.`,
  intro: 'Montana sets its ceiling to the state’s average weekly wage each July and halves it for permanent partial disability.',
  resume: `Montana pays temporary total disability at ${pct(d.ttd.rate)} of the wages received at the time of injury, never more than the state's average weekly wage (MCA 39-71-701). For injuries from ${from} through June 30, 2027, the Department of Labor & Industry adopted ${usdx(max)} as the weekly maximum, reached at a gross wage of about ${usd(atMax)}; permanent partial disability is capped at half that, ${usdx(ppdMax)}. There is no minimum TTD rate. Compensation is not paid for the first 32 hours or ${wait} days of wage loss, whichever is less, and is paid back to the first day once a worker is totally disabled ${day21} days or longer (MCA 39-71-736). A ranch hand earning ${usd(760)} who misses three weeks receives ${usd(r21.total)}. TTD lasts until maximum healing or release to the time-of-injury job, with no cost-of-living increase. Permanent partial disability needs both a wage loss and an AMA rating, which the statute converts into weeks out of a 400-week base.`,
  body: (h) => `<h2>Hours, not days, for the waiting period</h2>
<p>Montana measures its waiting period in hours as well as days. Under MCA 39-71-736, nothing is paid for the first 32 hours or ${wait} days of lost wages, whichever is less, so a worker on ten-hour shifts clears it after three and a fraction shifts. Benefits start with the 33rd hour or the fifth day. A ranch hand earning ${h.usd(760)} who returns after fifteen days receives ${h.usd(r15.total)}; at ${day21} days of total disability, the waiting period is repaid and the claim totals ${h.usd(r21.total)}. Each day of sick leave a worker chooses to take counts toward the waiting period, and the worker can later repay the sick leave or waive the matching retroactive benefits.</p>

<h2>A ceiling equal to the state wage</h2>
<p>The ${h.ext(d.ttd.url, 'department’s fiscal year 2027 memo')} certified a state average weekly wage just above the adopted figure and rounded down to ${h.usdx(max)}, which applies to TTD, permanent total, temporary partial, rehabilitation and death benefits. An oilfield hand earning ${h.usd(2100)} a week is held to ${h.usd(oil.weekly)}. Permanent total disability uses the same rate, is adjusted for cost of living, and runs until the worker qualifies for Social Security retirement; temporary total disability is never adjusted.</p>

<h2>Building a permanent partial rating</h2>
<p>MCA 39-71-703 builds a PPD percentage by adding points to the whole-person impairment rating from the AMA Guides, sixth edition: 1% for a worker over 40 at injury, 1% for less than twelve years of school, 10% or 20% for an actual wage loss (up to or over two dollars an hour), and up to 5% when the worker drops from heavy to lighter labor. Take a 52-year-old without a diploma who has an 8% impairment and now earns more than two dollars an hour less: ${rating}% times 400 weeks gives ${h.num(ppdWeeks)} weeks, paid at ${pct(d.ttd.rate)} of the wage but no more than ${h.usdx(ppdMax)} a week. Without a wage loss, only workers with a Class 2 or higher impairment receive an impairment-only award.</p>
<p>${d.facts[3]?.text ?? ''} Rehabilitation benefits are available for workers who cannot return to their job and have a wage loss, or a 15% rating without one. For what all this adds up to, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}.</p>`,
  faqs: [
    {
      q: 'What is the maximum Montana workers’ comp benefit for 2026 injuries?',
      a: `It depends on the fiscal year of the injury. From ${from} through June 30, 2027, TTD is capped at ${usdx(max)} a week and permanent partial disability at ${usdx(ppdMax)}. Injuries between July 1, 2025 and June 30, 2026 keep that year's lower figures. The cap equals the state's average weekly wage as adopted each June by the Department of Labor & Industry.`,
    },
    {
      q: 'How long is the waiting period for Montana workers’ comp?',
      a: `The first 32 hours or ${wait} days of wage loss, whichever is less, under MCA 39-71-736. Compensation starts with the 33rd hour or fifth day. If you are totally disabled and unable to work for ${day21} days or longer, you are paid back to the first day of wage loss, unless you used sick leave for those days and chose to waive that part.`,
    },
    {
      q: 'Do I need a wage loss to get a permanent partial award in Montana?',
      a: 'Generally yes. MCA 39-71-703 requires both an actual wage loss and an impairment rating above zero based on objective medical findings, not on pain alone. A worker with no wage loss can still receive an impairment-only award if the rating reaches Class 2 or higher under the sixth edition of the AMA Guides, converted to the whole person.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:north-dakota', 'workers-comp:utah', 'workers-comp:south-dakota'],
});
