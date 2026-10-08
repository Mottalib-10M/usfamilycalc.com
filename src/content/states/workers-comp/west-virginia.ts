import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, day } from '../../../lib/kit';

const d = wc('west-virginia');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const cap = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('west-virginia') as number;
const from = day(d.ttd.effective);
// One third of the state average weekly wage, the statutory minimum before the federal-minimum-wage limit.
const thirdOfSaww = max / 3;
// Permanent partial disability ceiling: 70% of the state average weekly wage.
const ppdMax = max * 0.7;

// A Charleston chemical plant operator at $1,300 a week, off 6 days, then 9.
const op6 = wcCalc('west-virginia', 1300, 6);
const op9 = wcCalc('west-virginia', 1300, 9);
// A Morgantown home care aide at $260 a week.
const aide = wcWeekly('west-virginia', 260);
// A coal mine electrician at $2,100 a week, off for two and a half years.
const elec = wcCalc('west-virginia', 2100, 130 * 7);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'west-virginia',
  title: `West Virginia Workers Comp Calculator 2026: ${cap} Weeks`,
  description: `West Virginia workers comp for injuries from ${from}: two thirds of the AWW, ${usdx(min)} to ${usdx(max)} a week, and no more than ${cap} weeks of TTD for one injury.`,
  intro: 'West Virginia ties its minimum to the federal minimum wage and stops temporary benefits after two years.',
  resume: `The West Virginia Offices of the Insurance Commissioner (OIC) publishes the benefit rates for each fiscal year. For dates of injury from ${from} through June 30, 2027, temporary total disability is 66 2/3% of the average weekly wage earnings, wherever earned, capped at ${usdx(max)}, 100% of the state average weekly wage. The minimum is ${usdx(min)} a week: the statute sets it at one third of the state average, but no higher than a benefit computed from the federal minimum hourly wage, which is the lower of the two. A worker earning ${usd(1300)} receives ${usd(wcWeekly('west-virginia', 1300))}. The rate is locked for the life of the award, with no yearly increases. Disability of ${wait} days or less is not paid; beyond ${retro} days, the first ${wait} are added. The aggregate TTD award for one injury cannot exceed ${cap} weeks.`,
  body: (h) => `<h2>A minimum indexed to the federal wage, not the state's</h2>
<p>One third of the state average weekly wage would be ${h.usd(thirdOfSaww)} for 2026-27. The OIC does not pay that. Section 23-4-6(b) adds that the minimum may never exceed the benefit determined by the federal minimum hourly wage, and the ${h.ext(d.ttd.url, 'OIC benefit rate sheet for fiscal year 2027')} computes it as $7.25 times 8 hours times 5 days, divided by 7 days, times two thirds: $27.62 a day, or ${h.usdx(min)} a week. The sheet applies that federal computation to injuries from July 24, 2009 onward. A home care aide in Morgantown earning ${h.usd(260)} receives ${h.usd(aide)}, the floor.</p>

<h2>Locked in at the date of the award</h2>
<p>West Virginia stopped escalating awards in 2003. A temporary total, permanent total or death award made since then keeps the same weekly rate for its whole span, whether that rate is the maximum, the minimum or anything between. A chemical plant operator in Charleston earning ${h.usd(1300)} receives ${h.usd(op9.weekly)} a week, and that is what he will still receive a year later; the cap of ${h.usdx(max)} is reached from about ${h.usd(atMax)} of weekly earnings.</p>

<h2>Three days and a seventh</h2>
<p>Section 23-4-5 refuses any award when the disability lasts three days or less from the day the employee leaves work; if it lasts longer than seven days, the first three are paid. The operator off six days receives ${h.usd(op6.total)}; off nine days, ${h.usd(op9.total)}.</p>

<h2>104 weeks, then a rating</h2>
<p>Section 23-4-6(c) caps the aggregate TTD award for a single injury at ${cap} weeks. A coal mine electrician earning ${h.usd(2100)} who is off two and a half years receives ${h.usd(elec.total)} in TTD, the calculator stopping at the cap. Permanent partial disability then pays four weeks for each percent of disability at two thirds of the wage, capped at 70% of the state average weekly wage, ${h.usd(ppdMax)} a week. ${d.facts[2].text}</p>
<p>For settlements, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}; for comp income in a support case, the ${h.aIf('child-support:west-virginia', 'West Virginia child support calculator')}.</p>`,
  faqs: [
    {
      q: `Why is the West Virginia comp minimum only ${usdx(min)} a week?`,
      a: `Because section 23-4-6 caps the minimum at the benefit computed from the federal minimum hourly wage. The OIC multiplies $7.25 by 8 hours and 5 days, divides by 7 and takes two thirds, giving $27.62 a day or ${usdx(min)} a week. One third of the state average weekly wage would be higher, ${usd(thirdOfSaww)}, so the federal-wage figure applies.`,
    },
    {
      q: 'How long can I receive TTD in West Virginia?',
      a: `No more than ${cap} weeks in aggregate for a single injury, for awards made since the 2003 amendment of section 23-4-6. Earlier awards could run up to 208 weeks. After the temporary period, a permanent partial disability award may follow, computed at four weeks of compensation for each percent of disability the evaluation finds.`,
    },
    {
      q: 'Will my West Virginia comp check increase each year?',
      a: `No. Awards of temporary total, permanent partial, permanent total and fatal benefits made on or after July 1, 2003 are not entitled to escalation. You keep the weekly rate set at the time of your award for the entire span of the benefits, even if the state average weekly wage, and with it the maximum for new injuries, goes up.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:virginia', 'workers-comp:ohio', 'workers-comp:pennsylvania', 'child-support:west-virginia'],
});
