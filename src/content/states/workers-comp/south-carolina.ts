import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, day } from '../../../lib/kit';

const d = wc('south-carolina');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const cap = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('south-carolina') as number;
const from = day(d.ttd.effective);
// The figure in the Commission's December 19, 2025 advisory notice, later superseded on its rates page.
const advisory = 1178.3;

// A Greenville tire plant worker at $1,050 a week, off 12 days, then 17.
const t12 = wcCalc('south-carolina', 1050, 12);
const t17 = wcCalc('south-carolina', 1050, 17);
// A Charleston port crane operator at $2,000 a week.
const crane = wcWeekly('south-carolina', 2000);
// A part-time worker at $90 a week, and another at $60.
const pt90 = wcWeekly('south-carolina', 90);
const pt60 = wcWeekly('south-carolina', 60);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'south-carolina',
  title: `South Carolina Workers Comp Calculator 2026: ${usdx(max)}`,
  description: `South Carolina workers comp from ${from}: two thirds of the AWW, ${usdx(max)} a week at most, ${usd(min)} at least, for up to ${cap} weeks of total disability.`,
  intro: 'South Carolina caps total disability at a number of weeks and keeps a flat minimum written in dollars into the statute.',
  resume: `The South Carolina Workers' Compensation Commission pays total disability at 66 2/3% of the average weekly wage, capped at the average weekly wage in the state for the preceding fiscal year. For accidents on or after ${from}, its rates page gives a maximum of ${usdx(max)} a week, reached at a wage of about ${usd(atMax)}. The minimum is ${usd(min)} a week, but a worker who earned less than that receives his full average weekly salary instead. Total disability compensation cannot be paid for more than ${cap} weeks, except for some permanently and totally disabled workers. No compensation is allowed for the first ${wait} calendar days; if the disability lasts more than ${retro} days, it is paid from the first day. A worker earning ${usd(1050)} a week receives ${usd(wcWeekly('south-carolina', 1050))}. One caution: the Commission's December 2025 advisory notice announced ${usdx(advisory)} before the rates page settled on the higher figure.`,
  body: (h) => `<h2>Two published maximums for the same year</h2>
<p>On December 19, 2025, the Commission issued an ${h.ext('https://www.wcc.sc.gov/sites/wcc/files/Documents/Update.News/Advisory%20Notice/Advisory%20Notice%202026%20Maximum%20Weekly%20Compensation%20Rate_2.pdf', 'advisory notice')} approving a 2026 maximum of ${h.usdx(advisory)}, computed from a state average wage for April 2024 through March 2025. The ${h.ext(d.ttd.url, 'Commission’s compensation rates page')} now shows ${h.usdx(max)} for accidents from ${from}, based on the wage certified for the fiscal year July 2024 through June 2025, which is the period the statute names. We use the later figure. If your claim was set up in early 2026 at the lower rate, the difference is ${h.usdx(max - advisory)} a week for workers at the cap, worth asking the adjuster about.</p>

<h2>A floor in dollars, not a percentage</h2>
<p>Section 42-9-10 still guarantees ${h.usd(min)} a week, a figure that has not moved with wages. It works only if that amount does not exceed what the employee earned: a part-time worker at ${h.usd(90)} a week receives ${h.usd(pt90)}, and one at ${h.usd(60)} receives his whole ${h.usd(pt60)}. The calculator applies the dollar floor; for wages under it, read the result as your full wage.</p>

<h2>The fifteenth day and the ${cap}-week limit</h2>
<p>A tire plant worker in Greenville earning ${h.usd(1050)} who misses twelve days receives ${h.usd(t12.total)}, for five days. At seventeen days, section 42-9-200 reaches back to the first day and the total becomes ${h.usd(t17.total)}. At the top of the scale, a port crane operator in Charleston earning ${h.usd(2000)} receives ${h.usd(crane)}. However long the disability, total disability benefits stop at ${cap} weeks, unless the worker qualifies for the lifetime exception in subsection (C).</p>

<h2>Scheduled members and partial disability</h2>
<p>${d.ppd.text} ${d.facts[0].text} For settlements, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}; for comp income in a support case, the ${h.aIf('child-support:south-carolina', 'South Carolina child support calculator')}.</p>`,
  faqs: [
    {
      q: 'Is the South Carolina 2026 comp maximum $1,178.30 or higher?',
      a: `The Commission's rates page gives ${usdx(max)} for accidents on or after ${from}, based on the state average weekly wage for July 2024 through June 2025. A December 19, 2025 advisory notice had announced ${usdx(advisory)}, using a different wage period. The rates page is the later publication, and this calculator uses it. Ask the insurer which figure it used if your weekly check is at the cap.`,
    },
    {
      q: 'How long does South Carolina pay total disability benefits?',
      a: `No more than ${cap} weeks for one injury, under section 42-9-10 of the South Carolina Code, except for certain permanently and totally disabled workers covered by subsection (C). Partial disability not on the schedule is limited to 340 weeks from the date of injury. When partial disability follows total disability, the total period is not deducted from those 340 weeks.`,
    },
    {
      q: 'When does South Carolina pay the first week of a work injury?',
      a: `Only if the disability lasts more than ${retro} days. Section 42-9-200 allows no compensation for the first ${wait} calendar days, medical benefits excepted, and then pays from the date of disability once the fourteen-day mark is passed. A worker out ten days is paid for three; a worker out three weeks is paid for all twenty-one.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:north-carolina', 'workers-comp:georgia', 'child-support:south-carolina'],
});
