import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('connecticut');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('connecticut') as number;
const from = day(d.ttd.effective);
// The partial-incapacity ceiling is written in the WCC memo, carried in the facts.
const partialMax = Number(([...(d.facts[1]?.text ?? '').matchAll(/\$([\d,]+\.\d{2})/g)][1]?.[1] ?? '0').replace(/,/g, ''));

// A New Haven hospital orderly with $950 of after-tax weekly earnings, out 5 days, then 9 days.
const o5 = wcCalc('connecticut', 950, 5);
const o9 = wcCalc('connecticut', 950, 9);
// A Groton submarine pipefitter with $2,600 of after-tax weekly earnings.
const pipe = wcCalc('connecticut', 2600, 60);
// A part-time dishwasher with $320 of after-tax weekly earnings.
const dish = wcWeekly('connecticut', 320);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'connecticut',
  title: `Connecticut Workers Comp Calculator 2026: 75% After Tax`,
  description: `Connecticut workers comp from October 2026: ${pct(d.ttd.rate)} of after-tax average weekly pay, capped at ${usdx(max)}, with the day of injury paid in full and a ${retro}-day rule.`,
  intro: 'Connecticut works from take-home pay, starts its benefit year on October 1, and pays the whole day of the injury as wages.',
  resume: `Connecticut pays total incapacity at ${pct(d.ttd.rate)} of the injured employee's average weekly earnings after federal and state income tax and FICA are deducted (C.G.S. § 31-307). For injuries on or after ${from} the maximum is ${usdx(max)} a week, equal to the average weekly earnings of all Connecticut employees as determined by the Labor Commissioner and published by the Workers' Compensation Commission. The minimum is 20% of the maximum, ${usdx(min)} by our arithmetic, but never more than ${pct(d.ttd.rate)} of the worker's own wage. The day of injury is paid as a full day of wages; after that, nothing is due unless the incapacity lasts more than ${wait} days, and if it lasts ${retro} days compensation runs from the date of injury (§ 31-295). An orderly with ${usd(950)} of after-tax weekly pay receives ${usd(o9.weekly)} a week. Total incapacity has no week limit; partial incapacity ends after 520 weeks.`,
  body: (h) => `<h2>October, not January</h2>
<p>Connecticut's benefit year runs from October 1 to September 30. The ${h.ext(d.ttd.url, 'Commission chair’s memo of September 4, 2026')} set ${h.usdx(max)} for total disability from ${from}; an injury in the summer of 2026 keeps the ceiling of the year that began October 1, 2025. The same memo sets a separate, lower ceiling for partial incapacity under § 31-308, tied to production-worker earnings in manufacturing: ${h.usdx(partialMax)}. The Commission also publishes benefit rate tables each year, the latest for October 1, 2026 to September 30, 2027.</p>

<h2>Seventy-five percent of take-home pay</h2>
<p>Under § 31-307(a) the adjuster first removes income taxes and FICA from the wages of the weeks used to compute the average under § 31-310, then pays ${pct(d.ttd.rate)} of the result. Enter after-tax weekly earnings in the calculator. A Groton pipefitter with ${h.usd(2600)} of after-tax pay computes to ${h.usd(pipe.raw)} and is limited to ${h.usd(pipe.weekly)}; the ceiling is reached at about ${h.usd(atMax)} of take-home pay. A part-time dishwasher with ${h.usd(320)} of after-tax pay receives ${h.usd(dish)}, because the minimum may not exceed ${pct(d.ttd.rate)} of the employee's own wage. The 20% floor, ${h.usdx(min)}, is our computation from the statute; the memo prints only the maximum.</p>

<h2>The day of injury and the seventh day</h2>
<p>Section 31-295(b) gives the worker full wages for the entire day of the injury, and that day is not counted as a day of incapacity. Then: no compensation if the incapacity lasts ${wait} days or fewer; compensation from the fourth day if it lasts more than ${wait} but fewer than ${retro} days; and from the date of injury if it reaches ${retro} days. An orderly back after five days is paid ${h.usd(o5.total)}; out nine days, ${h.usd(o9.total)}.</p>

<h2>Specific awards and the OSHA rule</h2>
<p>Permanent partial disability, called a specific award, is paid at the same ${pct(d.ttd.rate)} after-tax rate for the number of weeks listed in § 31-308(b) for each body part, and it must start within 30 days of maximum improvement or carry 10% annual interest. ${d.facts[2]?.text ?? ''} Long-term total disability benefits also receive yearly cost-of-living adjustments under § 31-307a.</p>`,
  faqs: [
    {
      q: 'What is the Connecticut workers’ comp maximum from October 1, 2026?',
      a: `For injuries on or after ${from}, Connecticut caps total disability at ${usdx(max)} a week, the average weekly earnings of all employees in the state. Partial incapacity has a lower cap of ${usdx(partialMax)}, based on manufacturing production workers. Injuries before October 1, 2026 keep the maximum of the benefit year in which they occurred.`,
    },
    {
      q: 'Is Connecticut workers’ comp based on gross or net pay?',
      a: `On net pay. Connecticut pays ${pct(d.ttd.rate)} of average weekly earnings after deducting federal and state income taxes and FICA under C.G.S. § 31-307. Two workers with the same gross wage can therefore receive different benefits if their withholding differs. The Workers' Compensation Commission publishes benefit rate tables each year, and the claims adjuster computes the after-tax base from your wage records.`,
    },
    {
      q: 'Does Connecticut pay for the day I got hurt?',
      a: `Yes. Connecticut entitles the injured employee to full wages for the entire day of the injury, and that day is not counted toward the waiting period. Compensation itself starts after ${wait} days of incapacity, and if the incapacity lasts ${retro} days it is paid from the date of injury, so short absences of a few days remain unpaid apart from that first day.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:new-york', 'workers-comp:massachusetts', 'workers-comp:rhode-island'],
});
