import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, day } from '../../../lib/kit';

const d = wc('wisconsin');
const max = d.ttd.max as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('wisconsin') as number;
const from = day(d.ttd.effective);
const daily = max / 6; // the DWD chart prints the daily rate on a six-day week

// A Milwaukee foundry molder at $1,250 a week, off 6 days, then 9.
const m6 = wcCalc('wisconsin', 1250, 6);
const m9 = wcCalc('wisconsin', 1250, 9);
// A Green Bay paper mill technician at $2,400 a week.
const tech = wcWeekly('wisconsin', 2400);
// A Madison student worker at $240 a week.
const student = wcWeekly('wisconsin', 240);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'wisconsin',
  title: `Wisconsin Workers Comp Calculator 2026: ${usdx(max)} TTD Max`,
  description: `Wisconsin workers comp for 2026 injuries: TTD is two thirds of the wage up to ${usdx(max)} a week (${usdx(daily)} a day), with a 3-day wait repaid after 7 days off work.`,
  intro: 'Wisconsin publishes its maximum as a wage, not as a benefit, and keeps a much lower ceiling for permanent partial disability.',
  resume: `Wisconsin's Department of Workforce Development (DWD), Worker's Compensation Division, pays temporary total disability (TTD) at two thirds of the employee's wage, up to a maximum set for the year of injury. For injuries on or after ${from}, its maximum wage and rate chart lists a maximum weekly wage of $2,062.50 for temporary, permanent total and death benefits, which gives a weekly rate of ${usdx(max)}, or ${usdx(daily)} a day. The chart lists no minimum weekly rate. A worker earning ${usd(1250)} a week receives ${usd(wcWeekly('wisconsin', 1250))}; earnings above about ${usd(atMax)} add nothing. The first ${wait} days of lost time are not compensable and payment begins on the fourth day, but if the disability runs beyond ${retro} calendar days, those three days are paid retroactively. Insurers usually send the first check within 14 days of the last day worked. Permanent partial disability uses a separate, far lower ceiling.`,
  body: (h) => `<h2>A maximum written as a wage</h2>
<p>The ${h.ext(d.ttd.url, 'DWD Maximum Wage and Rate Chart (WKC-9572-P)')} starts from the maximum weekly wage, $2,062.50 for 2026, and derives everything else from it: two thirds gives the weekly rate of ${h.usdx(max)}, a sixth of that the daily rate of ${h.usdx(daily)}, fifty weeks of wages the maximum annual wage, four years of it the death benefit cap. A paper mill technician in Green Bay earning ${h.usd(2400)} is treated as earning the maximum wage and receives ${h.usd(tech)}. The chart carries an April 1, 2026 column as well, unchanged for TTD.</p>

<h2>The PPD ceiling is a third of the TTD ceiling</h2>
<p>The same chart gives a maximum weekly wage for permanent partial disability of only $681.00, producing a PPD rate of $454.00 a week from April 1, 2026 ($446.00 for injuries from January 1). So a worker who receives ${h.usdx(max)} while healing may see the weekly amount fall by two thirds once the permanent rating is paid. Scheduled losses are rated as a percentage of loss of use under section 102.52, with the minimum ratings of rule DWD 80.32 for amputations, lost motion and surgeries, and a worker injured before age 27 is presumed to have the maximum PPD rate.</p>

<h2>Four days to get paid, eight to get the first three</h2>
<p>The waiting period includes Saturday, and Sunday when you normally work Sundays. A foundry molder in Milwaukee earning ${h.usd(1250)} who misses six days receives ${h.usd(m6.total)}, for days four to six. Off nine days, the first three are picked up retroactively: ${h.usd(m9.total)}. There is no floor: a student worker in Madison earning ${h.usd(240)} receives ${h.usd(student)}.</p>

<h2>Claims and the Uninsured Employers Fund</h2>
<p>Insured employers report injuries causing more than three days of disability to their carrier within seven days. A claim usually stays open six years from the injury or the last payment. ${d.facts[2].text} For settlements, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}; for comp income in a support case, the ${h.aIf('child-support:wisconsin', 'Wisconsin child support calculator')}.</p>`,
  faqs: [
    {
      q: 'What is the Wisconsin TTD maximum for a 2026 injury?',
      a: `${usdx(max)} a week, or ${usdx(daily)} a day, for injuries on or after ${from}, according to the DWD Maximum Wage and Rate Chart. It corresponds to a maximum weekly wage of $2,062.50. The same figures apply to permanent total disability and death benefits. Permanent partial disability has its own, lower maximum on the chart.`,
    },
    {
      q: 'Why does my Wisconsin PPD check pay less than my TTD check?',
      a: `Because Wisconsin caps permanent partial disability at a separate maximum wage, $681.00 for injuries from April 1, 2026, which gives a PPD rate of $454.00 a week. Temporary benefits use the much higher ${usdx(max)} cap. A worker under 27 at the time of injury is initially paid the maximum PPD rate, a presumption the insurer may challenge at a hearing.`,
    },
    {
      q: 'When are the first three days paid in Wisconsin?',
      a: `When your disability extends beyond ${retro} calendar days. The first ${wait} days of lost time are a waiting period, and compensation is normally payable from your fourth day off. If you are still unable to work after the seventh day, the first three days are paid retroactively. The waiting period counts Saturday, and Sunday if you usually work that day.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:minnesota', 'workers-comp:michigan', 'workers-comp:illinois', 'child-support:wisconsin'],
});
