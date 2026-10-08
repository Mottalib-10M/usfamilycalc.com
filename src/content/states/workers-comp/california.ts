import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('california');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const weeks = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('california') as number;
const from = day(d.ttd.effective);

// An Inland Empire warehouse picker at $1,100 a week, out six weeks.
const pick = wcCalc('california', 1100, 42);
// A Bay Area software technician at $3,400 a week.
const tech = wcCalc('california', 3400, 84);
// A part-time farmworker at $300 a week.
const farm = wcCalc('california', 300, 28);
// The 104-week clock, reached by a worker out two and a half years.
const long = wcCalc('california', 1100, 913);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'california',
  title: `California Workers Comp Calculator 2026: TD up to ${usd(max)}`,
  description: `California workers comp 2026: TD is two thirds of gross weekly pay, ${usdx(min)} to ${usdx(max)} a week from ${from}, for at most ${weeks} weeks in five years.`,
  intro: 'California raises a minimum that it pays even to workers who earned less, and counts temporary disability against a 104-week clock.',
  resume: `In California, temporary total disability pays ${pct(d.ttd.rate)} of the gross wages you lose, including overtime, tips, bonuses and earnings from a second job (Labor Code § 4653). For injuries on or after ${from}, the ${d.agency.name} set the weekly maximum at ${usdx(max)} and the minimum at ${usdx(min)}, both raised by the change in the state average weekly wage (Labor Code § 4453(a)(10)). Unlike most states, California pays the minimum even to a worker whose two-thirds figure is lower. Benefits start when the doctor says you cannot do your usual work for more than ${wait} days or you are hospitalized overnight, and they are paid every two weeks. For injuries since January 1, 2008, TD is limited to ${weeks} weeks of payments within five years of the injury, or 240 weeks for a short list of severe conditions. A warehouse picker earning ${usd(1100)} a week receives ${usd(pick.weekly)} a week, tax-free.`,
  body: (h) => `<h2>A floor paid to everyone</h2>
<p>California's minimum is a true floor. The DWC fact sheet says any employee with earnings is entitled to TTD at two thirds of wages, within the minimum and maximum, and the minimum is recalculated each January 1. A part-time farmworker averaging ${h.usd(300)} a week computes to ${h.usd(farm.raw)} but receives ${h.usd(farm.weekly)}, more than two thirds of the wage. At the top, a Bay Area software technician at ${h.usd(3400)} a week computes to ${h.usd(tech.raw)} and is held to ${h.usdx(max)}; the cap starts to bite at about ${h.usd(atMax)} a week. ${d.facts[0]?.text ?? ''}</p>
<p>The ${h.ext(d.ttd.url, 'DWC announcement')} gives the 2026 band. An injury in December 2025 is paid on the 2025 band, so the date on the DWC 1 claim form matters as much as the size of the paycheck.</p>

<h2>The ${weeks}-week clock and the 240-week exceptions</h2>
<p>For injuries since 2008, TD stops after ${weeks} weeks of payments within five years of the date of injury, even if the worker is still off. A picker out two and a half years would be paid for ${long.paidDays} days at most, about ${h.usd(long.total)}. A few long-term conditions, such as severe burns or chronic lung disease, can be paid for up to 240 weeks within five years. The ${h.ext(d.ttdDuration.url, 'DWC fact sheet on temporary disability')} suggests filing a State Disability Insurance claim with the EDD in parallel, so that SDI can continue once TD runs out.</p>

<h2>Delay, presumption and penalty</h2>
<p>The first TD payment is due within 14 days after the employer learns of the injury and the disability. ${d.facts[1]?.text ?? ''} ${d.facts[2]?.text ?? ''}</p>

<h2>From rating to voucher</h2>
<p>When the doctor finds permanent effects, the impairment number is converted into a percentage under the Permanent Disability Rating Schedule, adjusted for occupation and age and, for injuries since 2013, multiplied by 1.4. A rating from 1% to 99% is permanent partial disability, paid over a fixed number of weeks starting within 14 days after TD ends. ${d.facts[3]?.text ?? ''}</p>`,
  faqs: [
    {
      q: 'What is the California TD maximum and minimum for 2026?',
      a: `For injuries on or after ${from}, California temporary total disability cannot exceed ${usdx(max)} a week or fall below ${usdx(min)}. Both figures rose with the state average weekly wage, from ${d.facts[0]?.text.match(/from (\$[\d,]+)/)?.[1] ?? 'the prior level'} to ${d.facts[0]?.text.match(/to (\$[\d,]+)/)?.[1] ?? 'the new level'}. Between those limits the benefit is two thirds of gross weekly wages, including overtime, tips and second-job earnings, and it is not taxed.`,
    },
    {
      q: 'How long can I receive temporary disability in California?',
      a: `For injuries on or after January 1, 2008, California limits temporary disability to ${weeks} weeks of payments within five years of the date of injury. Certain long-term injuries, such as severe burns or chronic lung disease, can be paid up to 240 weeks within five years. The DWC recommends also filing for State Disability Insurance, which can pay after TD ends.`,
    },
    {
      q: 'What happens if a California TD check is late?',
      a: 'If the claims administrator pays temporary disability late, it must add 10 percent to that payment on its own, without an order, even when it had a reasonable excuse, provided the claim form was filed at least 14 days before the payment was due. Repeated or unreasonable delays can lead to larger penalties ordered by a workers’ compensation judge.',
    },
    {
      q: 'Can a California employer delay my first workers’ comp payment?',
      a: 'Yes, while it investigates, but it must send a delay letter explaining why, what it needs and when it will decide. If the claim is neither accepted nor denied within 90 days of the claim form, it is presumed compensable. During that time the employer must still authorize up to $10,000 of medical treatment under the treatment guidelines.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:oregon', 'workers-comp:nevada', 'workers-comp:arizona', 'child-support:california'],
});
