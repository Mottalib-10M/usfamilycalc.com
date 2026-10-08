import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, num } from '../../../lib/kit';

const d = wc('north-carolina');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const weeks = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('north-carolina') as number;
const year = d.ttd.effective.slice(0, 4);

// A Charlotte furniture finisher at $880 a week: 20 days, then 22.
const f20 = wcCalc('north-carolina', 880, 20);
const f22 = wcCalc('north-carolina', 880, 22);
// A Research Triangle lab manager at $2,400 a week: capped.
const lab = wcCalc('north-carolina', 2400, 84);
// The finisher, never able to return: the 500-week line.
const life = wcCalc('north-carolina', 880, 12 * 365);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'north-carolina',
  title: `North Carolina Workers Comp Calculator 2026: TTD ${usdx(max)}`,
  description: `North Carolina workers comp ${year}: TTD is ${pct(d.ttd.rate)} of the average weekly wage, ${usdx(min)} to ${usdx(max)} a week, for up to ${weeks} weeks; days 1 to ${wait} are paid only past day ${retro}.`,
  intro: 'North Carolina caps total disability at a fixed number of weeks but lets the most seriously hurt workers apply to go beyond it.',
  resume: `North Carolina pays total disability at ${pct(d.ttd.rate)} of the employee's average weekly wage, no more than the maximum the Industrial Commission sets each January 1 and no less than ${usdx(min)} a week (N.C. Gen. Stat. § 97-29(a)). For ${year} injuries the maximum is ${usdx(max)}, reached at a wage of about ${usd(atMax)} a week, and that cap stays with the claim for its whole life. No compensation is due for the first ${wait} days of lost time unless the disability exceeds ${retro} days, in which case days 1 to ${wait} are paid (§ 97-28). A furniture finisher earning ${usd(880)} who is out twenty-two days receives ${usd(f22.total)}. Temporary total disability may not run past ${num(weeks)} weeks from the first date of disability, unless the employee later proves a total loss of wage-earning capacity and wins extended compensation. Scheduled injuries such as the loss of a thumb, an arm or the use of the back are paid for a fixed number of weeks at the same rate, on top of the healing period.`,
  body: (h) => `<h2>Past ${num(weeks)} weeks: extended compensation</h2>
<p>Under § 97-29(b), TTD stops ${h.num(weeks)} weeks after the first date of disability, and the insurer needs no permission from the Industrial Commission to end it then. The finisher earning ${h.usd(880)} who never returns to work receives ${h.usd(life.weekly)} a week and ${h.usd(life.total)} before that line. The way past it is § 97-29(c): once 425 weeks have passed, the employee may apply for extended compensation, and must prove by a preponderance of the evidence a total loss of wage-earning capacity, meaning the complete elimination of the capacity to earn any wages. The Commission may weigh pre-existing and injury-related limitations, vocational skills, education and experience.</p>

<h2>The insured-wage formula and the January reset</h2>
<p>North Carolina does not use the state average weekly wage directly. Section 97-29(i) takes the average weekly insured wage under G.S. 96-1, multiplies it by 1.10 and rounds to the nearest two dollars, which is why every figure on the ${h.ext(d.ttd.url, 'Industrial Commission’s rate table')} is an even number. The ${year} figure, ${h.usdx(max)}, applies to all injuries and claims arising on or after January 1. A lab manager earning ${h.usd(2400)} a week computes to ${h.usd(lab.raw)} and receives ${h.usd(lab.weekly)}. The ${h.usdx(min)} floor dates from the statute and is not indexed.</p>

<h2>Day twenty-two</h2>
<p>The seven-day wait in § 97-28 is repaid only after three weeks. The Commission's own explanation is blunt: the first check will not include days 1 to ${wait}, and those days become due only if the disability continues beyond ${retro} days. Out twenty days, the finisher receives ${h.usd(f20.total)}; out twenty-two days, ${h.usd(f22.total)}.</p>
<p>When checks stop, the worker can ask the Executive Secretary's Office for an order compelling payment plus a 10% late-payment penalty under § 97-18(e) and (g). An insurer that wants to stop paying on its own must file a Form 24 application, and the worker has 17 days from its mailing to respond. ${d.ppd.text} See ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')} for settlements, and the ${h.aIf('child-support:north-carolina', 'North Carolina child support page')} for benefits treated as income.</p>`,
  faqs: [
    {
      q: 'What is the North Carolina workers’ comp maximum for 2026?',
      a: `${usdx(max)} a week for injuries in ${year}, up from $1,380 in 2025. The Industrial Commission computes it as 110% of the average weekly insured wage, rounded to the nearest two dollars, effective each January 1. The minimum is ${usdx(min)} a week. The cap in force in the year of your injury applies for the entire claim, even if benefits last many years.`,
    },
    {
      q: 'Can North Carolina TTD last longer than 500 weeks?',
      a: `Only through extended compensation under N.C. Gen. Stat. § 97-29(c). You can apply once 425 weeks have passed since the first date of disability, and you must prove a total loss of wage-earning capacity, meaning you cannot earn any wages at all. Otherwise temporary total disability ends ${num(weeks)} weeks after the first date of disability.`,
    },
    {
      q: 'Why didn’t my first North Carolina workers’ comp check cover my first week?',
      a: `Because § 97-28 makes the first ${wait} days of lost time unpaid unless the disability lasts more than ${retro} days. If you are still out after day ${retro}, the insurer owes you days 1 to ${wait} as well. If checks stop or arrive late, you can ask the Industrial Commission for an order compelling payment with a 10% late penalty.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:georgia', 'workers-comp:south-carolina', 'workers-comp:tennessee', 'child-support:north-carolina'],
});
