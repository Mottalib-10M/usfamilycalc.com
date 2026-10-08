import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('new-york');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('new-york') as number;
const from = day(d.ttd.effective);

// A Bronx home attendant at $720 a week, totally disabled: 12 days, then 16.
const a12 = wcCalc('new-york', 720, 12);
const a16 = wcCalc('new-york', 720, 16);
// The same attendant rated 50% (moderate partial) by her doctor.
const partial50 = wcWeekly('new-york', 720) * 0.5;
// A Manhattan electrician at $2,500 a week: capped.
const elec = wcCalc('new-york', 2500, 49);
// A part-time stock clerk at $300 a week: below the minimum, paid the wage.
const clerk = wcCalc('new-york', 300, 21);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'new-york',
  title: `New York Workers Comp Calculator 2026: ${usdx(max)} Max`,
  description: `New York workers comp for accidents from ${from}: 2/3 of the average weekly wage times your degree of disability, ${usdx(min)} to ${usdx(max)} a week, per the WCB.`,
  intro: 'New York multiplies the weekly rate by the degree of disability in the medical reports, so a partial disability pays a fraction of the full check.',
  resume: `The New York State Workers' Compensation Board computes lost wage benefits as two thirds of the average weekly wage, multiplied by the percentage of disability shown by the medical evidence. For accidents between ${from} and June 30, 2027, the weekly maximum is ${usdx(max)}, two thirds of the New York State average weekly wage, and the minimum is ${usdx(min)}, one fifth of it, or the actual wage if that is lower. A totally disabled worker reaches the maximum at a wage of about ${usd(atMax)} a week. Benefits are not paid for the first ${wait} days of disability unless it extends beyond ${retro} days; then they are paid from the first day missed. A home attendant earning ${usd(720)} who is totally disabled for sixteen days receives ${usd(a16.total)}; rated 50% disabled, she would receive ${usd(partial50)} a week. On an accepted claim, payments should start within 18 days of the injury or 10 days after the employer learns of it, whichever is later. Permanent injuries are paid as schedule loss of use awards or, for the spine and organs, by loss of wage-earning capacity.`,
  body: (h) => `<h2>Degree of disability as a multiplier</h2>
<p>New York does not stop at "able" or "unable" to work. The weekly benefit is 2/3 × average weekly wage × percentage of disability, and that percentage comes from the medical reports, from the treating doctor or from an independent medical examiner the insurer sends. A home attendant earning ${h.usd(720)} receives ${h.usd(a16.weekly)} while totally disabled; if her doctor reports a 50% disability, the check falls to ${h.usd(partial50)}. When the two doctors disagree, the worker can settle on a compromise with the insurer or ask for a hearing. The calculator above assumes total disability, so scale its result by your own percentage.</p>

<h2>A minimum indexed from July 2026</h2>
<p>For a decade New York's floor was a flat amount: $150 a week for injuries from May 2013 through 2023, then $275 for 2024 and $325 for 2025. Since July 1, 2026, the minimum is one fifth of the state average weekly wage, ${h.usdx(min)} on the ${h.ext(d.ttd.url, 'Board’s schedule of maximum weekly benefits')}, or the actual wage when that is lower. A part-time stock clerk earning ${h.usd(300)} is paid ${h.usd(clerk.weekly)}. At the other end, an electrician earning ${h.usd(2500)} would compute to ${h.usd(elec.raw)} and receives ${h.usdx(elec.weekly)}. Both figures are locked to the date of the accident and do not rise when the Board adopts new ones; compensation combined with reduced earnings can never exceed the wage at the time of injury.</p>

<h2>The fifteenth day</h2>
<p>Lost wage benefits are withheld for the first ${wait} days unless the disability extends beyond ${retro} days. The attendant out twelve days receives ${h.usd(a12.total)}; at sixteen days she receives ${h.usd(a16.total)}, every day paid. If the insurer disputes the claim, payments wait for a judge's decision, though New York's separate disability benefits program may pay in the meantime.</p>

<h2>Schedule loss of use and the capped weeks</h2>
<p>${d.ppd.text} For the non-schedule injuries, the cap in weeks depends on the loss of wage-earning capacity a judge finds. Facial disfigurement can add up to $20,000. See ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')} for settlements, and the ${h.aIf('child-support:new-york', 'New York child support page')} for benefits in a CSSA calculation.</p>`,
  faqs: [
    {
      q: 'What is the New York workers’ comp maximum for injuries after July 1, 2026?',
      a: `${usdx(max)} a week for accidents from ${from} through June 30, 2027, two thirds of the New York State average weekly wage. The minimum for the same period is ${usdx(min)}, or your actual wage if it is lower. Accidents between July 1, 2025 and June 30, 2026 keep a ${usdx(1222.42)} maximum. The rate is fixed by the date of the accident.`,
    },
    {
      q: 'How does the degree of disability change my New York workers’ comp check?',
      a: `The Board multiplies two thirds of your average weekly wage by the percentage of disability in the medical evidence. A worker earning ${usd(900)} a week who is totally disabled receives ${usd(wcWeekly('new-york', 900))}; at a 50% partial disability, ${usd(wcWeekly('new-york', 900) / 2)}. The percentage comes from your doctor or the insurer’s independent medical examiner, and a hearing decides it when they disagree.`,
    },
    {
      q: 'Why was the New York minimum benefit raised in 2026?',
      a: `The law moved the minimum from fixed amounts to an index. It was $150 a week for injuries from May 1, 2013 to December 31, 2023, $275 in 2024 and $325 in 2025. From July 1, 2026 it equals one fifth of the state average weekly wage, ${usdx(min)} for the year to June 30, 2027, or the worker's actual wage if lower.`,
    },
    {
      q: 'How long are New York non-schedule permanent partial benefits paid?',
      a: 'For accidents on or after March 13, 2007, for a maximum number of weeks set by the loss of wage-earning capacity: 225 weeks at 15% or less, rising in steps to 525 weeks above 95%. Injuries before that date are paid as long as the partial disability causes wage loss. Schedule losses of an arm, leg, hand, foot, eye or hearing are paid separately as SLU awards.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:new-jersey', 'workers-comp:pennsylvania', 'workers-comp:connecticut', 'child-support:new-york'],
});
