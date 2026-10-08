import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, day } from '../../../lib/kit';

const d = wc('tennessee');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = (d.waiting.retroactiveAfterDays as number) + 1;
const atMax = wcWageAtMax('tennessee') as number;
const from = day(d.ttd.effective);
// Permanent benefits are capped at 100% of the state average weekly wage, temporary ones at 110%.
const permMax = max / 1.1;

// A Nashville warehouse picker at $780 a week, off 9 days, then 15.
const p9 = wcCalc('tennessee', 780, 9);
const p15 = wcCalc('tennessee', 780, 15);
// The Bureau's own light-duty illustration: $600 before, $200 on light duty.
const tpd = (600 - 200) * 2 / 3;
// A Memphis logistics manager at $2,300 a week.
const mgr = wcWeekly('tennessee', 2300);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'tennessee',
  title: `Tennessee Workers Comp Calculator 2026: ${usdx(max)} TTD Cap`,
  description: `Tennessee workers comp: two thirds of the AWW, capped at ${usdx(max)} (110% of the state wage) for injuries from ${from}; the 2026-27 rates are pending.`,
  intro: 'Tennessee lets temporary benefits climb above the state average wage, while permanent benefits stop at the average itself.',
  resume: `The Tennessee Bureau of Workers' Compensation sets temporary total disability (TTD) at two thirds of the average weekly wage, computed from gross earnings, overtime and bonuses included, over the 52 weeks before the injury. The most recent rates we could read are for injuries from ${from} to June 30, 2026: a weekly maximum of ${usdx(max)} for temporary benefits, which is 110% of the state average weekly wage of ${usd(permMax)}, and a minimum of ${usdx(min)}. Permanent benefits stop at 100% of that average. The rates for injuries on or after July 1, 2026 were not readable on tn.gov when we checked on October 8, 2026, so this page and the calculator use the 2025-26 figures. A worker earning ${usd(780)} a week receives ${usd(wcWeekly('tennessee', 780))}. TTD starts on the eighth day of disability and is paid back to the first day if the disability lasts ${retro} days; the first payment is due within 15 days of notice of the injury.`,
  body: (h) => `<h2>The 2026-27 rates we could not read</h2>
<p>Tennessee resets its rates every July 1. The ${h.ext(d.ttd.url, 'Bureau’s compensation rates table')} that we were able to read, through an archived copy dated March 2026, ends with the period July 1, 2025 to June 30, 2026; tn.gov refused our requests for the current version and for the PDF of maximum and minimum rates. We say so plainly: for an injury after June 30, 2026, the real maximum is very likely a little higher than ${h.usdx(max)}, and the Bureau or the adjuster can confirm it. Everything else on this page follows the statute and the Bureau's own explanations, which do not change with the yearly figures.</p>

<h2>110% for healing, 100% for the rating</h2>
<p>Tennessee's rate table carries two ceilings: temporary benefits may reach 110% of the state average weekly wage, ${h.usdx(max)}, while permanent benefits stop at 100%, ${h.usd(permMax)}. A Memphis logistics manager earning ${h.usd(2300)} receives ${h.usd(mgr)} while off work, and less per week once a permanent award is paid. The cap is reached from about ${h.usd(atMax)} of weekly pay. The table also shows a maximum total benefit, 450 weeks at the permanent maximum, and burial expenses up to $10,000.</p>

<h2>Eight days, fourteen days, fifteen days</h2>
<p>Three clocks run at once. Benefits begin on the eighth day of disability. The first seven days are paid if the disability reaches fourteen days. And the first payment is due no later than fifteen calendar days after notice of the injury. A Nashville warehouse picker earning ${h.usd(780)} who is out nine days receives ${h.usd(p9.total)}; out fifteen, ${h.usd(p15.total)}. The Bureau suggests using sick leave or vacation for the unpaid week when the disability is shorter.</p>

<h2>Light duty at lower pay</h2>
<p>When the treating physician allows restricted work and the employer pays less for it, the difference is covered at two thirds as temporary partial disability. The Bureau's own example: a worker who earned ${h.usd(600)} and makes ${h.usd(200)} on light duty receives ${h.usd(tpd)} a week. If the employer cannot meet the restrictions, TTD continues. For settlements, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}; for comp income in a support case, the ${h.aIf('child-support:tennessee', 'Tennessee child support calculator')}.</p>`,
  faqs: [
    {
      q: 'What is the Tennessee workers’ comp maximum for 2026?',
      a: `The latest figure we could read is ${usdx(max)} a week for temporary benefits, for injuries from ${from} to June 30, 2026. Tennessee raises its rates every July 1, and the table for injuries after that date was not readable on tn.gov when we checked in October 2026, so confirm the current maximum with the Bureau of Workers' Compensation or your adjuster.`,
    },
    {
      q: 'Why does Tennessee have two different maximum rates?',
      a: `Because the Bureau's rate table caps temporary benefits at 110% of the state average weekly wage and permanent benefits at 100% of it. For injuries in the year to June 30, 2026, that means ${usdx(max)} a week while you heal and ${usd(permMax)} for a permanent award. The minimum, ${usdx(min)}, is the same for both.`,
    },
    {
      q: 'When does Tennessee pay the first week off work?',
      a: `When the disability lasts at least ${retro} calendar days. Benefits otherwise start on the eighth day, and nothing is due for the first ${wait} calendar days. The Bureau notes that employees may want to use sick leave or vacation for those days if the absence ends sooner. Payments must start no later than 15 calendar days after notice of the injury.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:kentucky', 'workers-comp:north-carolina', 'workers-comp:virginia', 'child-support:tennessee'],
});
