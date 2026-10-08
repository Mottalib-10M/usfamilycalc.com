import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('texas');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const rate = d.ttd.rate;
const wait = d.waiting.days as number;
const retro = (d.waiting.retroactiveAfterDays as number) + 1;
const cap = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('texas') as number;
const from = day(d.ttd.effective);

// A Houston refinery operator at $2,200 a week: capped.
const op = wcWeekly('texas', 2200);
// A San Antonio dishwasher at $9 an hour, 40 hours: the 75% rate for 26 weeks.
const dishWage = 9 * 40;
const dish70 = wcWeekly('texas', dishWage);
const dish75 = Math.max(Math.min(dishWage * 0.75, max), min);
// A Dallas framer at $1,150 a week, off 10 days, then 15.
const f10 = wcCalc('texas', 1150, 10);
const f15 = wcCalc('texas', 1150, 15);
// The same framer still off when maximum medical improvement is presumed.
const fLong = wcCalc('texas', 1150, cap * 7 + 60);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'texas',
  title: `Texas Workers Comp Calculator 2026: TIBs Up to ${usd(max)}`,
  description: `Texas workers comp from ${from}: TIBs pay ${pct(rate)} of lost wages, ${usd(min)} to ${usd(max)} a week in fiscal 2027, if your employer carries the coverage at all.`,
  intro: 'In Texas, a private employer may choose not to carry workers’ compensation at all, so the first question is whether yours did.',
  resume: `In Texas, temporary income benefits (TIBs) equal ${pct(rate)} of the difference between your average weekly wage and what you can earn after the injury, or 75% for the first 26 weeks if you earned less than $10 an hour. The Texas Department of Insurance, Division of Workers' Compensation, sets the limits by state fiscal year: for injuries from ${from} through September 30, 2027, TIBs range from ${usd(min)} to ${usd(max)} a week, the maximum being the state average weekly wage rounded to the dollar. A worker who earned ${usd(1150)} a week and earns nothing now receives ${usd(wcWeekly('texas', 1150))}. Nothing is paid for a disability shorter than a week; benefits accrue from the eighth day, and the first week is added back if the disability lasts ${retro} days or more. TIBs end at maximum medical improvement, which the law presumes at ${cap} weeks. All of this applies only if your employer elected coverage: Texas lets private employers opt out.`,
  body: (h) => `<h2>First question: is your employer a subscriber?</h2>
<p>Under Labor Code section 406.002, coverage is elective for private employers. Companies that buy a policy or self-insure are "subscribers"; those that do not are "non-subscribers," and their injured employees are outside the state system described on this page. Public employers have no such choice. Before using the calculator, ask your employer whether it subscribes; the figures below, set by the ${h.ext(d.agency.url, 'Texas Department of Insurance, Division of Workers’ Compensation')}, assume it does.</p>

<h2>Seventy percent of what you lost, not of what you earned</h2>
<p>TIBs are computed on the wage loss: ${h.pct(rate)} of your pre-injury average weekly wage minus your post-injury earnings. With no earnings at all, a Dallas framer who made ${h.usd(1150)} receives ${h.usd(f15.weekly)} a week; if he goes back part-time, subtract the new pay first. Low-wage workers get a better rate for half a year. A dishwasher in San Antonio paid ${h.usd(9)} an hour for forty hours, ${h.usd(dishWage)} a week, receives ${h.usd(dish75)} for the first 26 weeks instead of ${h.usd(dish70)}, as long as that does not exceed her actual earnings of the previous year. The calculator applies the ${h.pct(rate)} rate only.</p>

<h2>A ceiling that moves in October</h2>
<p>The ${h.ext(d.ttd.url, 'DWC table of maximum and minimum weekly benefits')} changes on October 1, with the state fiscal year. Injuries on or after ${from} use ${h.usd(max)}; injuries in the year before used the fiscal 2026 figure. A Houston refinery operator earning ${h.usd(2200)} receives ${h.usd(op)}; the ceiling binds at about ${h.usd(atMax)} a week. The minimum in effect on the injury date applies for as long as income benefits are paid.</p>

<h2>The eighth day and the 104th week</h2>
<p>The framer off ten days receives ${h.usd(f10.total)} for the days from the eighth on; at fifteen days, ${h.usd(f15.total)}, the first week included. If his recovery drags on, maximum medical improvement is reached by law ${cap} weeks after benefits begin to accrue, which ends TIBs: the calculator stops at ${h.usd(fLong.total)}. Impairment income benefits follow, three weeks per percentage point of impairment at ${h.pct(rate)} of the wage with a lower cap. ${d.facts[1].text}</p>
<p>For settlements and impairment ratings, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}; for TIBs in a support order, the ${h.aIf('child-support:texas', 'Texas child support calculator')}.</p>`,
  faqs: [
    {
      q: 'What happens if my Texas employer does not have workers’ comp?',
      a: `Then your employer is a non-subscriber, which Texas allows for most private employers under Labor Code section 406.002. You cannot claim TIBs from the state system, because the employer never elected to be subject to it. Public employers in Texas must provide coverage, so this question concerns private jobs only.`,
    },
    {
      q: 'What is the Texas TIBs maximum for injuries after October 1, 2026?',
      a: `${usd(max)} a week for injuries from ${from} through September 30, 2027, which is the Texas state average weekly wage for fiscal 2027 rounded to the nearest dollar. The minimum for the same period is ${usd(min)}. Impairment income benefits, which follow TIBs, are capped at 70% of the state average weekly wage instead.`,
    },
    {
      q: 'Do low-wage workers get more than 70% in Texas?',
      a: `Yes, for 26 weeks. If you earned less than $10 an hour, TIBs equal 75% of the difference between your average weekly wage and your post-injury earnings for the first 26 weeks, then ${pct(rate)}. The higher rate cannot exceed your actual earnings for the previous year. For injuries before September 1, 2015, the threshold was $8.50 an hour.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:oklahoma', 'workers-comp:louisiana', 'workers-comp:new-mexico', 'child-support:texas'],
});
