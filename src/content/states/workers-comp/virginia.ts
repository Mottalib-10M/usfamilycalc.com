import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, day } from '../../../lib/kit';

const d = wc('virginia');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const cap = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('virginia') as number;
const from = day(d.ttd.effective);

// A Norfolk shipyard pipefitter at $1,400 a week, off 15 days, then 22.
const s15 = wcCalc('virginia', 1400, 15);
const s22 = wcCalc('virginia', 1400, 22);
// A Richmond retail associate at $480: lifted to the minimum.
const retail = wcWeekly('virginia', 480);
// A part-timer at $300: paid the wage.
const pt = wcWeekly('virginia', 300);
// A Fairfax consultant at $3,000: capped.
const cons = wcWeekly('virginia', 3000);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'virginia',
  title: `Virginia Workers Comp Calculator 2026: ${usdx(max)} a Week`,
  description: `Virginia workers comp from ${from}: two thirds of the AWW, ${usdx(min)} to ${usdx(max)} a week, the first week back pay only after three weeks out, 500 weeks max.`,
  intro: 'In Virginia the unpaid first week comes back only after three full weeks of incapacity.',
  resume: `The Virginia Workers' Compensation Commission (VWC) applies Code section 65.2-500: weekly compensation for total incapacity equals 66 2/3% of the average weekly wage, between 25% and 100% of the average weekly wage of the Commonwealth. For injuries from ${from} through June 30, 2027, the Commission set the maximum at ${usdx(max)} and the minimum at ${usdx(min)}; no benefit may exceed the worker's own average weekly wage. A worker earning ${usd(1400)} receives ${usd(wcWeekly('virginia', 1400))}. No compensation is allowed for the first ${wait} calendar days; it starts on the eighth day, and the first week is paid only if the incapacity continues more than three weeks. Total compensation under the Act is limited to ${cap} weeks, except for permanent and total incapacity, which is paid for life. Cost-of-living supplements apply to long-term total incapacity awards each October 1.`,
  body: (h) => `<h2>The 22nd day</h2>
<p>Section 65.2-509 has two thresholds, and the second is unusually far out. Benefits start on the eighth day of incapacity, but the first seven days are paid only once the incapacity has lasted more than three weeks. A shipyard pipefitter in Norfolk earning ${h.usd(1400)} who is out fifteen days receives ${h.usd(s15.total)}, eight days of benefits. If he is out twenty-two days, the waiting week is restored and he receives ${h.usd(s22.total)}. A worker who returns between those two dates never sees the first week paid.</p>

<h2>A floor that gives way to the actual wage</h2>
<p>The minimum is a quarter of the Commonwealth's average weekly wage: ${h.usdx(min)} a week, per the ${h.ext(d.ttd.url, 'VWC rates page')}. It lifts a Richmond retail associate earning ${h.usd(480)} to ${h.usd(retail)}, far above two thirds of her pay. But section 65.2-500 also says income benefits shall not exceed the employee's average weekly wage, so a part-timer earning ${h.usd(300)} receives exactly ${h.usd(pt)}. At the top, a Fairfax consultant earning ${h.usd(3000)} stops at ${h.usd(cons)}; the cap binds from about ${h.usd(atMax)} a week.</p>

<h2>500 weeks, with one exception</h2>
<p>Section 65.2-518 limits the total compensation payable under the Act to ${cap} weeks, and to ${cap} times the Commonwealth's average weekly wage. Permanent and total incapacity, as defined in section 65.2-503(C), is the exception: under section 65.2-500(D), it is paid for the employee's lifetime without limit. Scheduled losses are paid separately at two thirds of the wage for a fixed number of weeks, from a thumb to a leg.</p>

<h2>Cost-of-living supplements</h2>
<p>${d.facts[0].text} Supplements are owed when combined workers' compensation and Social Security disability benefits fall below 80% of pre-injury monthly earnings, or when no Social Security disability is received. AmeriCorps members are excluded from total incapacity benefits altogether.</p>
<p>For settlements, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}; for comp income in a support case, the ${h.aIf('child-support:virginia', 'Virginia child support calculator')}.</p>`,
  faqs: [
    {
      q: 'When does Virginia pay the first week of a work injury?',
      a: `Only when the incapacity continues for more than three weeks. Under Code section 65.2-509, no compensation is allowed for the first ${wait} calendar days; benefits begin on the eighth day. If you are still unable to work after twenty-one days, compensation is allowed from the first day of incapacity, so the waiting week is paid back at your weekly rate.`,
    },
    {
      q: 'What are the Virginia workers’ comp rates from July 1, 2026?',
      a: `For injuries from ${from} through June 30, 2027, the Virginia Workers' Compensation Commission set the maximum weekly compensation at ${usdx(max)} and the minimum at ${usdx(min)}. The cost-of-living adjustment effective October 1, 2026 is 2.65%, and medical mileage is reimbursed at $.76 a mile from July 1, 2026. The rates in force on your injury date apply to the claim.`,
    },
    {
      q: 'Is there a limit on how long Virginia pays workers’ comp?',
      a: `Yes. Total compensation is capped at ${cap} weeks, and at ${cap} times the Commonwealth's average weekly wage for the applicable year, under section 65.2-518. The cap does not apply to permanent and total incapacity under section 65.2-503(C), which is paid for the worker's lifetime, nor to certain other permanent disability and death cases listed in the statute.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:west-virginia', 'workers-comp:north-carolina', 'workers-comp:maryland', 'child-support:virginia'],
});
