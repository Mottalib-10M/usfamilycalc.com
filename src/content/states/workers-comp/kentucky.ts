import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('kentucky');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('kentucky') as number;

// Example 1: a warehouse worker averaging $1,050 a week, off six weeks after a back strain.
const W1 = 1050;
const six = wcCalc('kentucky', W1, 42);
// Example 2: the same worker back after ten days: the first week stays unpaid.
const ten = wcCalc('kentucky', W1, 10);
// Example 3: a part-timer at $280 a week is lifted to the floor.
const part = wcCalc('kentucky', 280, 30);
// Example 4: a lineman at $2,300 a week hits the ceiling.
const high = wcCalc('kentucky', 2300, 28);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'kentucky',
  title: `Kentucky Workers Comp Calculator 2026: TTD up to ${usdx(max)}`,
  description: `Kentucky workers comp 2026: TTD pays ${pct(d.ttd.rate)} of your gross wage, from ${usdx(min)} to ${usdx(max)} a week, after a ${wait}-day wait that is repaid once you pass ${retro} days off.`,
  intro: 'Kentucky pays income benefits from a statewide schedule the Department of Workers’ Claims publishes each September for the next calendar year.',
  resume: `A Kentucky worker hurt in 2026 who cannot work at all receives temporary total disability (TTD) of ${pct(d.ttd.rate)} of the gross average weekly wage, never more than ${usdx(max)} and never less than ${usdx(min)} a week (KRS 342.730(1)(a), schedule for injuries from ${day(d.ttd.effective)}). Those limits equal 110% and 20% of the state average weekly wage certified for 2024. The first ${wait} days of disability are unpaid unless the disability lasts more than ${retro} days, in which case benefits run from day one (KRS 342.040). A worker averaging ${usd(W1)} a week who misses six weeks collects ${usd(six.weekly)} a week, ${usd(six.total)} in all; one earning above ${usd(atMax)} a week is held to the cap. There is no week limit on TTD itself, but every Kentucky income benefit stops at age 70 or four years after the injury, whichever comes later. Permanent partial disability is then computed from an AMA impairment rating multiplied by a statutory factor.`,
  body: (h) => `<h2>Benefits that end at seventy</h2>
<p>Kentucky writes an age limit into the income benefit itself. Under KRS 342.730(4), all income benefits terminate on the date the employee reaches age 70, or four years after the injury or last exposure, whichever occurs last. A 68-year-old hurt in 2026 can therefore be paid for four years; a 45-year-old faces no age cutoff for decades. The same date governs benefits paid to a surviving spouse and dependents.</p>
<p>The ${h.ext(d.ttd.url, '2026 benefit schedule')} from the ${d.agency.name} sets the weekly band for injuries between ${h.day(d.ttd.effective)} and the end of the year. The ceiling of ${h.usdx(max)} is reached at a gross weekly wage of about ${h.usd(atMax)}. A lineman averaging ${h.usd(2300)} a week would compute to ${h.usd(high.raw)} but receives ${h.usdx(high.weekly)}. At the other end, a part-time cashier averaging ${h.usd(280)} computes to ${h.usd(part.raw)} and is raised to the ${h.usdx(min)} floor, because Kentucky's minimum is a flat percentage of the state wage rather than the worker's own pay.</p>

<h2>The seven-day rule and the fifteenth day</h2>
<p>KRS 342.040 says no income benefit is due for the first ${wait} days unless disability continues more than two weeks. Payments must begin by the first regular payday after the seventh day, and in no event later than the fifteenth day after the employer knows of the disability. Our worker earning ${h.usd(W1)} who returns after ten days receives ${h.usd(ten.total)} for ${ten.paidDays} paid days; had the absence stretched to six weeks, those first days would have been repaid and the total would be ${h.usd(six.total)}.</p>
<p>Late checks carry interest at 6% a year, and at 12% when an administrative law judge finds the delay or termination had no reasonable foundation.</p>

<h2>How the permanent award grows with age and schooling</h2>
<p>Once maximum medical improvement is reached, Kentucky converts the AMA impairment rating into a weekly benefit: ${pct(d.ttd.rate)} of the wage, times the rating, times a factor from a table in KRS 342.730(1)(b). ${d.ppd.text.replace(/^PPD = /, 'In the statute’s terms, PPD = ')}</p>
<p>The multiplier then rises for workers who cannot return to their former type of work, and the statute adds age and education points: plus 0.6 at 60 or older, plus 0.4 at 55, plus 0.2 at 50, and up to plus 0.4 for less than eight years of school. A 61-year-old laborer with little formal education and a 10% rating can end up with a much larger weekly PPD check than a 35-year-old with the same rating, which is why the age on the date of injury matters so much in Kentucky claims.</p>
<p>The lump-sum death benefit and the dependents' maximums are listed on the same schedule. For a broader view of what each kind of benefit adds up to, read ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}.</p>`,
  faqs: [
    {
      q: 'Do Kentucky workers’ comp benefits stop when I turn 70?',
      a: `Yes, under KRS 342.730(4) all income benefits end when the injured worker reaches age 70 or four years after the injury or last exposure, whichever comes later. A worker injured at 68 can still be paid until 72. Medical benefits are not cut off by this rule, and the same end date applies to benefits paid to a spouse or dependents after a work death.`,
    },
    {
      q: 'What is the most Kentucky workers’ comp pays per week in 2026?',
      a: `For injuries during calendar year 2026, temporary or permanent total disability is capped at ${usdx(max)} a week, and the minimum is ${usdx(min)}. You reach the cap with a gross average weekly wage of roughly ${usd(atMax)}. The figures come from the Department of Workers’ Claims schedule issued in September 2025 and stay attached to your claim even if it runs into later years.`,
    },
    {
      q: 'Does Kentucky pay interest on late workers’ comp checks?',
      a: 'Yes. Each overdue installment earns interest at 6% a year from its due date under KRS 342.040. If an administrative law judge decides the denial, delay or termination had no reasonable foundation, the rate rises to 12%. No interest is owed when the employee caused the delay. Benefits must start no later than fifteen days after the employer learns of the disability.',
    },
    {
      q: 'How does age change a permanent partial disability award in Kentucky?',
      a: 'When the multiplier for not returning to the same type of work applies, Kentucky adds 0.6 for workers 60 or older at the date of injury, 0.4 for 55 or older and 0.2 for 50 or older, plus education points for less than twelve years of schooling. These additions raise the weekly PPD benefit, not the number of weeks, which stays at 425 or 520.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:tennessee', 'workers-comp:ohio', 'workers-comp:indiana', 'workers-comp:illinois'],
});
