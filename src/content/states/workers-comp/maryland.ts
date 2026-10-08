import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('maryland');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('maryland') as number;
const year = d.ttd.effective.slice(0, 4);

// A Baltimore port crane operator at $2,600 a week, ten weeks out.
const crane = wcCalc('maryland', 2600, 70);
// A school bus driver at $780 a week: twelve days, then fifteen.
const bus12 = wcCalc('maryland', 780, 12);
const bus15 = wcCalc('maryland', 780, 15);
// Minor PPD illustration: 50 weeks at one third of a $900 wage vs. the cap written in the PPD text.
const ppdWage = 900;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'maryland',
  title: `Maryland Workers Comp Calculator 2026: TTD Max ${usdx(max)}`,
  description: `Maryland workers comp ${year}: TTD is ${pct(d.ttd.rate)} of the gross average weekly wage, at most ${usdx(max)} and at least ${usdx(min)}, and the 3-day wait is repaid after ${retro} days.`,
  intro: 'In Maryland the weekly ceiling for temporary total disability equals the state average weekly wage itself, reset each January 1 by the Workers’ Compensation Commission.',
  resume: `Maryland pays temporary total disability at ${pct(d.ttd.rate)} of the covered employee's average weekly wage, capped at the State average weekly wage and never below ${usdx(min)} (Lab. & Empl. § 9-621). For injuries in calendar year ${year}, the Workers' Compensation Commission lists that cap as ${usdx(max)}, so a gross wage of about ${usd(atMax)} reaches the maximum. An employee earning under ${usdx(min)} a week is paid the full wage. If the disability lasts ${retro} days or less, the first ${wait} calendar days are unpaid; longer disabilities are paid from the start (§ 9-620). A bus driver earning ${usd(780)} who misses fifteen days receives ${usd(bus15.total)}. TTD runs for as long as the worker is temporarily totally disabled, with no week limit. Permanent partial disability is where Maryland is unusual: the weekly rate depends on how many weeks the award covers, from one third of the wage for minor awards to two thirds, with an extra third of weeks once an award reaches 250 weeks.`,
  body: (h) => `<h2>Permanent awards priced by their length</h2>
<p>Maryland grades permanent partial disability (PPD) in tiers. The Commission first fixes a number of weeks, from the schedule in § 9-627 (a thumb is 100 weeks, an index finger 40) or as a percentage of the body. The length of that award then decides the weekly rate. ${d.ppd.text}</p>
<p>The effect is steep. A worker earning ${h.usd(ppdWage)} a week with a 50-week award falls in the minor category and receives one third of the wage, ${h.usd(ppdWage / 3)}, but only up to the cap written for the event year. The same worker with a 260-week award gets two thirds of the wage, and the award grows by a third, to about ${h.num(Math.round((260 * 4) / 3))} weeks. Certain public safety employees, such as police officers and firefighters, are excluded from the minor tier (§ 9-628).</p>

<h2>Where the weekly cap comes from</h2>
<p>Under § 9-603, the Maryland Department of Labor reports the State average weekly wage by December 15, and the Commission applies it to injuries from the next January 1. ${d.facts[0]?.text ?? ''} The ${h.ext(d.ttd.url, 'Commission’s rate page')} lists the ${year} cap of ${h.usdx(max)} for temporary and permanent total disability. A port crane operator averaging ${h.usd(2600)} a week computes to ${h.usd(crane.raw)} and receives ${h.usd(crane.weekly)}; over ten weeks off that is ${h.usd(crane.total)}.</p>

<h2>The three-day rule in practice</h2>
<p>Section 9-620 withholds the first ${wait} calendar days only when the disability lasts ${retro} days or less, and a day of injury for which the employee was not paid counts as one of them. A bus driver earning ${h.usd(780)} who is back after twelve days receives ${h.usd(bus12.total)}; at fifteen days the waiting days are paid too and the total is ${h.usd(bus15.total)}. Temporary partial disability pays half of the drop in earning capacity, not two thirds (§ 9-615).</p>
<p>Long claims bring paperwork duties for the insurer: after six months of continuous TTD it must file a vocational rehabilitation progress report, then one every 120 days, under penalty of a fine (§ 9-675). For how permanent awards and settlements add to the weekly checks, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}.</p>`,
  faqs: [
    {
      q: 'What is the maximum weekly workers’ comp rate in Maryland for 2026?',
      a: `For injuries in ${year}, temporary total disability in Maryland is capped at ${usdx(max)} a week, the State average weekly wage the Department of Labor reported for the fiscal year that ended June 30, 2025. The same cap applies to permanent total disability. The minimum is ${usdx(min)}, or the full wage when an employee earned less than that.`,
    },
    {
      q: 'Why is my Maryland permanent partial award paid at only one third of my wage?',
      a: 'Because the award is under 75 weeks. Maryland pays these minor awards at one third of the average weekly wage, capped at 16.7% of the State average weekly wage. Awards from 75 to under 250 weeks are paid at two thirds of the wage, capped at one third of the State wage, and awards of 250 weeks or more get two thirds, a higher cap and one third more weeks.',
    },
    {
      q: 'Are the first three days of a Maryland work injury paid?',
      a: `Only if the temporary total disability lasts more than ${retro} days. For shorter disabilities, § 9-620 withholds compensation for the first ${wait} calendar days, though medical, hospital and funeral costs are still paid. If you were not paid for the day you were hurt, the Commission counts that day as one of the three.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:pennsylvania', 'workers-comp:delaware', 'workers-comp:district-of-columbia'],
});
