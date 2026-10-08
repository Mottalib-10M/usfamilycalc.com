import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('arkansas');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('arkansas') as number;
const from = day(d.ttd.effective);
// PPD ceiling and the state wage are written in the data texts (AWCC Advisory 2000-1).
const ppdMax = Number((d.ppd.text.match(/up to \$([\d,]+\.\d{2})/)?.[1] ?? '0').replace(/,/g, ''));
const saww = Number((d.ttd.periodLabel.match(/\$([\d,]+\.\d{2})/)?.[1] ?? '0').replace(/,/g, ''));

// A Bentonville distribution-center loader at $880 a week, out 12 days, then 16 days.
const l12 = wcCalc('arkansas', 880, 12);
const l16 = wcCalc('arkansas', 880, 16);
// A timber-mill saw filer at $1,600 a week.
const saw = wcCalc('arkansas', 1600, 49);
const sawPpd = Math.min(Math.round(saw.weekly * 0.75), ppdMax);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'arkansas',
  title: `Arkansas Workers Comp Calculator 2026: ${usd(max)} TD, ${usd(ppdMax)} PPD`,
  description: `Arkansas workers comp 2026: two thirds of the AWW, rounded to the dollar, up to ${usdx(max)} for total disability and ${usdx(ppdMax)} for permanent partial, from ${from}.`,
  intro: 'Arkansas runs two weekly ceilings side by side, one for total disability and a lower one for permanent partial disability.',
  resume: `For a 2026 injury, the Arkansas Workers' Compensation Commission pays temporary total disability at ${pct(d.ttd.rate)} of the worker's average weekly wage, rounded to the nearest whole dollar, up to ${usdx(max)} a week (Ark. Code Ann. § 11-9-501(b)). That maximum is 85% of the state average weekly wage of ${usdx(saww)} and applies to injuries from ${from} through December 31, 2026. Permanent partial disability has its own, lower ceiling of ${usdx(ppdMax)}, because it is paid at 75% of the TD rate. The weekly minimum for both is ${usdx(min)}. No benefit is paid for the first ${wait} days of disability if it ends before ${retro} calendar days; once it reaches ${retro} days, benefits run from the day after the injury. A distribution-center loader earning ${usd(880)} a week who is out 16 days receives ${usd(l16.weekly)} a week and ${usd(l16.total)} in all. Disputed claims go to a Commission administrative law judge, and the Commission must approve every attorney fee.`,
  body: (h) => `<h2>Two ceilings for one injury</h2>
<p>Every year the Commission reissues ${h.ext(d.ttd.url, 'Advisory 2000-1')}, first published in August 2000, with the maximums for the next calendar year. For 2026 it lists ${h.usdx(max)} for total disability and ${h.usdx(ppdMax)} for permanent partial disability. The second figure is not a separate wage cap; it is 75% of the first, rounded. So a timber-mill saw filer averaging ${h.usd(1600)} a week, who computes to ${h.usd(saw.raw)}, receives ${h.usd(saw.weekly)} while healing and about ${h.usd(sawPpd)} a week once the doctor assigns a permanent rating. Amputation and total loss of use of a member are the exception: they are paid at the full TD rate. You reach the TD ceiling at roughly ${h.usd(atMax)} of gross weekly pay.</p>
<p>Arkansas also rounds each rate to the nearest dollar, which the calculator on this page does not do; expect a difference of less than a dollar a week. The ${h.usdx(min)} weekly minimum has not moved since July 1, 1986, according to the Advisory's history table.</p>

<h2>Fourteen calendar days, counted from the day after</h2>
<p>The Commission's ${h.ext(d.waiting.url, 'Legal Advisor brochure')} explains the waiting rule in plain terms: disability benefits are not paid for the first ${wait} days, counting from the day after the injury, if the disability does not last ${retro} calendar days; if it does, benefits are payable from the day following the injury. A loader at ${h.usd(880)} a week who comes back after 12 days is paid ${h.usd(l12.total)}; the same loader out 16 days is paid ${h.usd(l16.total)}. Checks come every other week, and the payments are tax-free.</p>

<h2>Major cause and the 26-week mental injury limit</h2>
<p>Arkansas sets a high bar for compensability. ${d.facts[4]?.text ?? ''} The same brochure limits disability benefits for a mental injury to 26 weeks, and a heart attack is covered only if the work exertion was extraordinary compared with the regular job. Once healed, a worker whose impairment cut pre-injury wages can claim wage-loss benefits on top of the impairment rating.</p>
<p>Fees are split. In a contested case, half of the approved attorney fee is paid by the employer or carrier and half by the worker out of the award, and no fee is valid without Commission approval. ${d.facts[3]?.text ?? ''}</p>`,
  faqs: [
    {
      q: 'What are the Arkansas workers’ comp maximums for 2026?',
      a: `For injuries from ${from} through December 31, 2026, Arkansas pays at most ${usdx(max)} a week for total disability and ${usdx(ppdMax)} a week for permanent partial disability. The first is 85% of the state average weekly wage of ${usdx(saww)}; the second is 75% of the first, rounded. The weekly minimum for both is ${usdx(min)}.`,
    },
    {
      q: 'How long is the waiting period for Arkansas workers’ comp?',
      a: `${wait} days, counted from the day after the injury. If the disability lasts fewer than ${retro} calendar days, those days are never paid. If it lasts ${retro} calendar days or more, benefits are owed from the day following the injury, so the first week is paid back. Medical treatment is covered from the start and has no deductible.`,
    },
    {
      q: 'How are attorney fees paid in an Arkansas comp case?',
      a: 'Every fee must be approved by the Arkansas Workers’ Compensation Commission, or it is not valid. In a contested case, half of the approved fee is paid by the employer or its insurance carrier and half by the injured worker out of the compensation awarded.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:missouri', 'workers-comp:oklahoma', 'workers-comp:louisiana', 'workers-comp:tennessee'],
});
