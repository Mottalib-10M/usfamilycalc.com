import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('new-hampshire');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const day14 = (d.waiting.retroactiveAfterDays as number) + 1;
const atMax = wcWageAtMax('new-hampshire') as number;
const from = day(d.ttd.effective);

// A Manchester software tester at $1,600 a week: 10 days, then 14.
const t10 = wcCalc('new-hampshire', 1600, 10);
const t14 = wcCalc('new-hampshire', 1600, day14);
// A ski-lift operator at $700 a week: 30% of SAWW floor applies.
const lift = wcCalc('new-hampshire', 700, 21);
// A part-timer at $380 a week: full wage, below the floor.
const pt = wcCalc('new-hampshire', 380, 21);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'new-hampshire',
  title: `New Hampshire Workers Comp Calculator 2026: 60% Rate`,
  description: `New Hampshire workers comp: ${pct(d.ttd.rate)} of gross wages, ${usdx(min)} to ${usdx(max)} a week from ${from}, the latest NH DOL table; the 2026 update was not yet posted.`,
  intro: 'New Hampshire combines one of the highest weekly ceilings in the country with a rule that no check may exceed what the worker took home.',
  resume: `New Hampshire pays temporary total disability at ${pct(d.ttd.rate)} of the employee's gross average weekly wage, or 30% of the state average weekly wage if that is more, capped at 150% of the state average weekly wage and at 100% of the worker's own after-tax earnings (RSA 281-A:28). The latest table published by the Department of Labor gives ${usdx(max)} as the maximum and ${usdx(min)} as the minimum for injuries from ${from}; a July 1, 2026 update was not yet posted when we checked on October 8, 2026, so the calculator uses those figures. A worker whose wage is at or below the minimum receives the full wage, limited to 90% of after-tax pay. The cap takes effect near ${usd(atMax)} a week. The first ${wait} days are unpaid unless disability lasts ${day14} days. A tester earning ${usd(1600)} who misses two weeks receives ${usd(t14.total)}. Permanent impairment is paid in a single award: percentage of loss times the weeks for the body part times the weekly rate.`,
  body: (h) => `<h2>The take-home cap</h2>
<p>New Hampshire is generous at the top, with a maximum at 150% of the state average weekly wage, and strict in the middle. RSA 281-A:28 says the weekly rate may never exceed 100% of the employee's after-tax weekly earnings, as defined in RSA 281-A:15. For most workers ${pct(d.ttd.rate)} of gross pay is already below take-home pay, but a worker with large pre-tax deductions, or one lifted to the 30% minimum, can run into it. The calculator applies the percentage and the dollar limits; it cannot see your tax withholding, so compare the result with your net pay.</p>
<p>The minimum works differently from most states. A ski-lift operator earning ${h.usd(700)} a week would get ${h.usd(lift.raw)} at ${pct(d.ttd.rate)}, but the statute pays the greater of that and 30% of the state wage, so the check is ${h.usd(lift.weekly)}. A part-timer earning ${h.usd(380)} is below that floor and receives the whole wage, ${h.usd(pt.weekly)}, as long as it stays under 90% of after-tax pay.</p>

<h2>Why the 2026 figure is missing</h2>
<p>The Department of Labor issues new maximum and minimum rates to carriers each July 1, and the state average weekly wage is set by the Department of Employment Security for the previous calendar year. The ${h.ext(d.ttd.url, 'compensation rate table')} on the department's site, revised June 9, 2025, ends with the July 1, 2025 line. If you were hurt after July 1, 2026, ask the insurer for the rate notice that applies to your date of injury; it may differ from the one shown here.</p>

<h2>Waiting days and the alternative duty shortcut</h2>
<p>RSA 281-A:28 withholds the first ${wait} days of disability unless it continues ${day14} days or longer. A software tester earning ${h.usd(1600)} back after ten days receives ${h.usd(t10.total)}; at ${day14} days, ${h.usd(t14.total)}. New Hampshire adds an exception: if the worker returns to temporary alternative duty within five days of the injury, compensation is paid from the first day, even if the light-duty job pays full wages (RSA 281-A:23-b). Employers with five or more employees must develop such alternative work and must reinstate the worker to the former job within 18 months.</p>
<p>The average weekly wage normally uses the 26 weeks before the injury, but the worker may ask for any period up to 52 weeks if that gives a better result. Permanent impairment awards (RSA 281-A:32) use the AMA Guides, fifth edition, and a whole-person schedule of 350 weeks when more than one body part or the spine is involved. The ${h.aIf('child-support:new-hampshire', 'New Hampshire child support page')} shows how benefits count as income, and ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')} covers settlements.</p>`,
  faqs: [
    {
      q: 'What is the New Hampshire workers’ comp maximum in 2026?',
      a: `The latest rate published by the New Hampshire Department of Labor is ${usdx(max)} a week, with a ${usdx(min)} minimum, for injuries from ${from}. A new pair of rates takes effect every July 1, but the July 1, 2026 figures were not posted on the department's site when we checked in October 2026. Your insurer must use the rate in force on your date of injury.`,
    },
    {
      q: 'Can New Hampshire workers’ comp pay more than my take-home pay?',
      a: `No. RSA 281-A:28 caps the weekly rate at 100% of your after-tax earnings, even when ${pct(d.ttd.rate)} of gross pay or the 30% minimum would be higher. A worker whose average wage is at or below 30% of the state average weekly wage receives the full wage, but no more than 90% of after-tax earnings.`,
    },
    {
      q: 'How is the average weekly wage figured in New Hampshire?',
      a: 'By adding gross earnings for the 26 weeks before the injury and dividing by the number of weeks. The employee may request earnings records for up to 52 weeks and use any period from 26 to 52 weeks that gives the higher result. Workers with two or more New Hampshire covered employers at the time of injury have their earnings combined.',
    },
    {
      q: 'Does light duty affect the waiting period in New Hampshire?',
      a: `Yes. Normally the first ${wait} days are unpaid unless disability lasts ${day14} days or longer. But under RSA 281-A:23-b, a worker who returns to temporary alternative duty within five days of the injury is paid workers’ compensation from the first day, which waives the waiting period even when the light-duty job pays full wages.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:maine', 'workers-comp:vermont', 'workers-comp:massachusetts', 'child-support:new-hampshire'],
});
