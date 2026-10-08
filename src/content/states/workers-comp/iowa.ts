import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('iowa');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('iowa') as number;
const from = day(d.ttd.effective);
const money = (s: string) => [...s.matchAll(/\$([\d,]+\.\d{2})/g)].map((m) => Number(m[1].replace(/,/g, '')));
const saww = money(d.ttd.periodLabel)[0];
const ppdMax = money(d.ppd.text)[0];
const priorMax = money(d.facts[0]?.text ?? '')[0];
const shoulderWeeks = Number(d.ppd.text.match(/shoulder (\d+)/)?.[1] ?? 0);

// A Cedar Rapids cereal-plant operator with $1,000 of spendable weekly earnings, out 10 days, then 18 days.
const o10 = wcCalc('iowa', 1000, 10);
const o18 = wcCalc('iowa', 1000, 18);
// A Des Moines insurance actuary with $3,300 of spendable weekly earnings.
const act = wcCalc('iowa', 3300, 42);
// A seasonal grain-elevator hand with $380 of spendable earnings: the lower of the minimum and that wage.
const hand = wcWeekly('iowa', 380);
// A 10% shoulder impairment for the operator: 10% of 400 weeks at the PPD rate.
const ppdRate = Math.min(wcWeekly('iowa', 1000), ppdMax);
const shoulder = (shoulderWeeks * 10) / 100;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'iowa',
  title: `Iowa Workers Comp Calculator 2026: 80% of Spendable Pay`,
  description: `Iowa workers comp from ${from}: ${pct(d.ttd.rate)} of spendable weekly earnings, up to ${usdx(max)} for TTD and ${usdx(ppdMax)} for PPD, after a ${wait}-day wait repaid past day ${retro}.`,
  intro: 'Iowa replaces most of a worker’s take-home pay and treats the shoulder as a scheduled member worth 400 weeks.',
  resume: `Iowa pays temporary total disability, and healing period benefits when the injury leaves a permanent impairment, at ${pct(d.ttd.rate)} of the employee's weekly spendable earnings: gross weekly earnings less the payroll taxes that would apply with the worker's actual exemptions. For injuries from ${from} through June 30, 2027 the Workers' Compensation Division of DIAL caps that benefit at ${usdx(max)} a week and permanent partial disability at ${usdx(ppdMax)}, based on a state average weekly wage of ${usdx(saww)}. The minimum is the lower of ${usdx(min)}, which is 35% of that wage, and the worker's own spendable earnings. TTD starts on the fourth day off; if the worker misses more than ${retro} days, the first ${wait} are paid too. Benefits continue until the worker returns to work or can do similar work. An operator with ${usd(1000)} of spendable weekly pay receives ${usd(o18.weekly)} a week. Since July 1, 2017 a shoulder injury is scheduled at ${shoulderWeeks} weeks.`,
  body: (h) => `<h2>Four-fifths of take-home pay</h2>
<p>Iowa is one of the states that start from net pay, and the share it replaces is ${pct(d.ttd.rate)}. The Division publishes a ratebook spreadsheet each July that gives the weekly rate by gross earnings, marital status and number of exemptions, so the adjuster does not compute taxes by hand. Enter spendable earnings in the calculator. A Cedar Rapids cereal-plant operator with ${h.usd(1000)} of spendable pay receives ${h.usd(o18.weekly)}. A Des Moines actuary with ${h.usd(3300)} of spendable pay computes to ${h.usd(act.raw)} and is held to ${h.usdx(max)}; the ceiling applies from about ${h.usd(atMax)} of spendable pay.</p>
<p>The ${h.ext(d.ttd.url, 'Division’s rate page')} shows how fast the ceiling moves: ${h.usdx(priorMax)} for injuries in 2025-2026, ${h.usdx(max)} from ${from}.</p>

<h2>A floor that never exceeds the paycheck</h2>
<p>For TTD and healing period, the minimum is the lower of ${h.usdx(min)} and the injured employee's spendable earnings. A seasonal grain-elevator hand with ${h.usd(380)} of spendable weekly pay therefore receives ${h.usd(hand)}, the whole spendable wage, not the floor, and the calculator above follows the same rule. For permanent partial, permanent total and death benefits the ${h.usdx(min)} minimum applies as such.</p>

<h2>Day four, and day fifteen</h2>
<p>TTD begins on the fourth day the worker is off because of the injury. If the absence passes ${retro} days, the first ${wait} days are paid as well. The operator back after 10 days receives ${h.usd(o10.total)}; out 18 days, ${h.usd(o18.total)}. Temporary partial disability, for a worker placed in a lower-paying job, carries the same three-day wait.</p>

<h2>The ${shoulderWeeks}-week shoulder</h2>
<p>${d.ppd.text.replace(/ The 2026-2027 PPD maximum.*$/, '')} ${d.facts[2]?.text ?? ''} A 10% shoulder impairment is therefore paid for ${shoulder} weeks; at the operator's rate of ${h.usd(ppdRate)} that is about ${h.usd(ppdRate * shoulder)}. ${d.facts[3]?.text ?? ''}</p>`,
  faqs: [
    {
      q: 'What are the Iowa workers’ comp maximums for injuries after July 1, 2026?',
      a: `For injuries from ${from} through June 30, 2027, Iowa caps TTD, healing period, permanent total and death benefits at ${usdx(max)} a week and permanent partial disability at ${usdx(ppdMax)}. Both come from a state average weekly wage of ${usdx(saww)}. The year before, the TTD cap was ${usdx(priorMax)}.`,
    },
    {
      q: 'What are spendable weekly earnings in Iowa workers’ comp?',
      a: `They are your gross weekly earnings minus the payroll taxes that would apply given your marital status and the exemptions you are entitled to, such as actual dependents. Iowa pays ${pct(d.ttd.rate)} of that amount. The Workers' Compensation Division publishes a ratebook each year that turns gross earnings into the weekly rate.`,
    },
    {
      q: 'How many weeks is a shoulder injury worth in Iowa?',
      a: `For injuries on or after July 1, 2017, Iowa treats the shoulder as a scheduled member worth ${shoulderWeeks} weeks. The impairment percentage is applied to those weeks, so a 10% rating gives ${shoulder} weeks of permanent partial disability at the PPD rate. The rating itself comes from the AMA Guides to the Evaluation of Permanent Impairment, and the weekly PPD rate is capped separately.`,
    },
    {
      q: 'Can I choose my own doctor in Iowa workers’ comp?',
      a: 'In most cases no. Iowa gives the employer the right to choose the medical care, which must treat the work injury reasonably. An injured worker may choose care in an emergency when the employer or its representative cannot be reached. The care must be reasonable, and services and supplies such as crutches or prosthetic devices are payable.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:illinois', 'workers-comp:minnesota', 'workers-comp:nebraska', 'workers-comp:missouri'],
});
