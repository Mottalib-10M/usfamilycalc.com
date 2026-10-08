import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, day } from '../../../lib/kit';

const d = wc('south-dakota');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const atMax = wcWageAtMax('south-dakota') as number;
const from = day(d.ttd.effective);

// A Sioux Falls meatpacking line worker at $950 a week, off 6 days, then 7.
const m6 = wcCalc('south-dakota', 950, 6);
const m7 = wcCalc('south-dakota', 950, 7);
// A Rapid City ranch hand at $700: lifted to the floor.
const ranch = wcWeekly('south-dakota', 700);
// A Pierre engineer at $2,000: capped.
const eng = wcWeekly('south-dakota', 2000);
// Back injury rated 10% of the body as a whole: 10% of 312 weeks at the TTD rate.
const backWeeks = 312 * 0.1;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'south-dakota',
  title: 'South Dakota Workers Comp Calculator 2026: Floor and Cap',
  description: `South Dakota workers comp from ${from}: two thirds of earnings, never under ${usd(min)} or over ${usd(max)} a week in 2026, paid from day one after a 7-day disability.`,
  intro: 'South Dakota pairs a high weekly floor with a ceiling exactly twice its size, and pays the first week back as soon as it is served.',
  resume: `In South Dakota, temporary total disability equals 66 2/3% of the employee's earnings, between a minimum of ${usd(min)} and a maximum of ${usd(max)} a week for injuries from ${from} through June 30, 2027, according to the Department of Labor and Regulation. The maximum is the state average weekly wage rounded up to the next dollar, and the minimum is half of it. A worker earning ${usd(950)} receives ${usd(wcWeekly('south-dakota', 950))}; the cap applies from about ${usd(atMax)} of weekly earnings. Low earners have a guard against being paid more than they took home: anyone who earned under half of the maximum cannot receive more than 100% of net pay after income taxes and FICA. No temporary disability is paid unless the injury keeps you off work ${wait} consecutive days; once that is met, benefits run from the date of injury. Employees choose their own doctor.`,
  body: (h) => `<h2>A minimum worth half the state wage</h2>
<p>The ${h.ext(d.ttd.url, 'DLR compensation rates page')} sets the 2026 floor at ${h.usd(min)} and the ceiling at ${h.usd(max)}. That ratio is written into SDCL 62-4-3: the minimum is one half of the maximum, and the maximum is the state average weekly wage computed each spring from unemployment insurance wage reports. A ranch hand near Rapid City earning ${h.usd(700)} would compute to ${h.usd(700 * 2 / 3)} at two thirds; the floor lifts him to ${h.usd(ranch)}. An engineer in Pierre earning ${h.usd(2000)} stops at ${h.usd(eng)}.</p>
<p>The floor has its own limit. If you earned less than half of the maximum per week, compensation may not exceed 100% of your earnings after federal and state income tax and FICA withholding. The calculator does not compute withholding, so for weekly pay under ${h.usd(max / 2)}, compare its result with your take-home pay and keep the lower number.</p>

<h2>The seventh day settles it</h2>
<p>SDCL 62-4-2 pays nothing for an injury that does not keep you off ${wait} consecutive days, and pays everything once it does. A meatpacking line worker in Sioux Falls earning ${h.usd(950)} who misses six days receives ${h.usd(m6.total)}; one more day and the total is ${h.usd(m7.total)}, counted from the date of injury. There is no second threshold to wait for.</p>

<h2>Your choice of doctor</h2>
<p>South Dakota lets the employee make the initial selection of a physician or surgeon from any licensed practitioner in the state, as long as the employer is told before treatment or as soon as reasonably possible. Treatment from a provider picked in disregard of that rule is not the employer's responsibility. ${d.facts[3].text}</p>

<h2>Back injuries and the 312-week scale</h2>
<p>Scheduled losses are paid at the TTD rate for a fixed number of weeks; a thumb is worth fifty. Injuries to the back, and to body parts not listed, use a proportion of 312 weeks: a back injury rated at 10% of the body as a whole is paid ${h.num(backWeeks, 1)} weeks at the worker's rate. ${d.facts[1].text} The department also offers a permanent partial disability payment calculator on its rates page.</p>
<p>See ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')} for lump sums and settlements.</p>`,
  faqs: [
    {
      q: 'What is the minimum South Dakota workers’ comp check in 2026?',
      a: `${usd(min)} a week for injuries from ${from}, half of the ${usd(max)} maximum. If you earned less than half of the maximum, your compensation cannot exceed 100% of your earnings after income taxes and FICA, so a very low earner may receive less than the minimum. Both figures change every July 1 with the state average weekly wage.`,
    },
    {
      q: 'Does South Dakota pay the first week of a work injury?',
      a: `Yes, once the injury has kept you off work ${wait} consecutive days. If you return before that, no temporary disability benefit is paid at all. If you reach the seventh day, SDCL 62-4-2 computes benefits from the date of the injury, so the first week is never lost. The same rule governs temporary partial disability benefits.`,
    },
    {
      q: 'Can I pick my own doctor for a South Dakota comp claim?',
      a: 'Yes. Under SDCL 62-4-43 the employee makes the initial selection of a medical practitioner or surgeon from all licensed practitioners in South Dakota. You must notify your employer of the choice before treatment or as soon as reasonably possible afterward. The doctor you choose may arrange referrals and specialized care the injury requires.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:north-dakota', 'workers-comp:nebraska', 'workers-comp:wyoming'],
});
