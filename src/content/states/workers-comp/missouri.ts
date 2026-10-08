import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, num, day } from '../../../lib/kit';

const d = wc('missouri');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const weeks = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('missouri') as number;
const from = day(d.ttd.effective);

// A St. Louis delivery driver at $1,000 a week: 12 days, then 20.
const dr12 = wcCalc('missouri', 1000, 12);
const dr20 = wcCalc('missouri', 1000, 20);
// A Kansas City engineer at $2,400 a week, off three months: capped.
const eng = wcCalc('missouri', 2400, 91);
// A teenager bagging groceries at $54 a week: the $40 statutory floor.
const teen = wcCalc('missouri', 54, 21);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'missouri',
  title: `Missouri Workers Comp Calculator 2026: FY2027 Max Rates`,
  description: `Missouri workers comp for injuries from ${from}: TTD is ${pct(d.ttd.rate)} of average weekly earnings, up to ${usdx(max)} a week for ${weeks} weeks, never under ${usd(min)}.`,
  intro: 'Missouri’s Division of Workers’ Compensation moves its maximums every July 1, at the start of the state fiscal year.',
  resume: `Missouri pays temporary total disability at ${pct(d.ttd.rate)} of the injured employee's average weekly earnings, capped at 105% of the state average weekly wage and never less than ${usd(min)} a week (RSMo 287.170). For injuries from ${from} through June 30, 2027, the Division of Workers' Compensation memo sets the TTD maximum at ${usdx(max)}; it takes a weekly wage of about ${usd(atMax)} to reach it. TTD lasts no more than ${num(weeks)} weeks while the disability continues. The first ${wait} days of disability on which the employer is open for business are unpaid unless the disability lasts longer than ${retro} days (RSMo 287.160). A delivery driver earning ${usd(1000)} who misses twenty days receives ${usd(dr20.weekly)} a week, ${usd(dr20.total)} in all. Permanent partial disability is paid from a statutory schedule of weeks, with its own lower weekly cap, and a worker who collects unemployment benefits cannot draw TTD for the same period.`,
  body: (h) => `<h2>Unemployment and misconduct shut off TTD</h2>
<p>Missouri writes two disqualifications directly into RSMo 287.170. An employee who applies for and receives unemployment compensation gets no TTD for that period, so a worker laid off while still hurt has to choose. And if the employee is fired from post-injury employment for post-injury misconduct, neither temporary total nor temporary partial benefits are payable; the statute specifies that absence caused by the injury does not count as misconduct.</p>

<h2>The fiscal-year maximum</h2>
<p>The ${h.ext(d.ttd.url, 'Division’s state average weekly wage memo')} for the fiscal year that began ${h.day(d.ttd.effective)} sets the TTD, permanent total and death maximum at ${h.usdx(max)}. ${d.facts[0]?.text ?? ''} An engineer earning ${h.usd(2400)} a week is held to ${h.usdx(eng.weekly)}; three months off pays ${h.usd(eng.total)}. At the bottom, the floor has been a flat ${h.usd(min)} since 1981, so a teenager earning ${h.usd(54)} a week still receives ${h.usd(teen.weekly)}.</p>

<h2>Three days that count only on business days</h2>
<p>RSMo 287.160 withholds the first three days or less of disability during which the employer is open for business, and repays them when the disability lasts longer than fourteen days. For a typical weekday job, our driver earning ${h.usd(1000)} back after twelve days gets ${h.usd(dr12.total)}; at twenty days, ${h.usd(dr20.total)}. Because closed days do not count, a worker hurt on a Friday at a weekday business may wait into the next week before the three days run out. Payments must arrive as wages did, at least every two weeks.</p>

<h2>The schedule of losses</h2>
<p>${d.ppd.text} The chart the Division publishes (form WC-110) shows each member's weeks, from 232 for an arm at the shoulder to 400 for the body as a whole. A 10% rating to the body as a whole is worth 40 weeks at the PPD rate. Employers also pay a 3.0% Second Injury Fund surcharge in 2026, which funds benefits when a work injury combines with an earlier disability. For settlements, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}.</p>`,
  faqs: [
    {
      q: 'Can I get unemployment and workers’ comp at the same time in Missouri?',
      a: 'Not temporary total disability. RSMo 287.170.3 disqualifies an employee from TTD for any period in which he or she applies for and receives unemployment compensation. Medical benefits and any permanent partial disability award are not affected by this rule. If you were laid off while still under work restrictions, ask the Division or an attorney which benefit fits your situation before you file.',
    },
    {
      q: 'What is the Missouri workers’ comp maximum for injuries after July 1, 2026?',
      a: `${usdx(max)} a week for temporary total disability, permanent total disability and death, based on the fiscal-year 2027 state average weekly wage. Permanent partial disability has a lower cap of $678.18. The minimum for TTD is ${usd(min)} a week. The rates are fixed by the date of injury and stay with the claim, even when it extends past June 30, 2027.`,
    },
    {
      q: 'How many weeks of TTD does Missouri pay?',
      a: `At most ${num(weeks)} weeks, and only while the temporary total disability continues, under RSMo 287.170.1. TTD normally ends sooner, when the worker returns to work or reaches maximum medical improvement. Any permanent partial disability is paid in addition, from the schedule of losses in RSMo 287.190, which runs up to 400 weeks for the body as a whole.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:kentucky', 'workers-comp:illinois', 'workers-comp:arkansas', 'workers-comp:iowa'],
});
