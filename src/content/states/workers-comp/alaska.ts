import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('alaska');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('alaska') as number;
const year = day(d.ttd.effective);
// The PPI multiplier is written in the statute text of the data (AS 23.30.190).
const ppiBase = Number((d.ppd.text.match(/\$([\d,]+)/)?.[1] ?? '0').replace(/,/g, ''));

// A Prudhoe Bay camp cook with $1,150 of spendable weekly earnings, out 20 days, then 30 days.
const c20 = wcCalc('alaska', 1150, 20);
const c30 = wcCalc('alaska', 1150, 30);
// A deckhand with $2,600 of spendable weekly earnings.
const deck = wcCalc('alaska', 2600, 63);
// A seasonal clerk with $400 of spendable weekly earnings.
const clerk = wcWeekly('alaska', 400);
const ppi8 = (ppiBase * 8) / 100;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'alaska',
  title: `Alaska Workers Comp Calculator 2026: 80% of Spendable Pay`,
  description: `Alaska workers comp 2026: TTD is ${pct(d.ttd.rate)} of spendable weekly wages, capped at ${usdx(max)} and floored at ${usdx(min)}, with a 28-day line before the first ${wait} days are paid.`,
  intro: 'Alaska starts from take-home pay, not gross pay, and pays permanent impairment as a single lump sum.',
  resume: `Alaska pays temporary total disability at ${pct(d.ttd.rate)} of the injured worker's spendable weekly wage, which AS 23.30.220 defines as gross weekly earnings minus payroll tax deductions. For calendar year 2026 the ${d.agency.name} set the weekly maximum at ${usdx(max)}, 120% of the Alaska average weekly wage, and the minimum at ${usdx(min)}, 22% of that maximum (Bulletin 25-06, effective ${year}). A worker whose spendable wage is below the minimum receives the spendable wage itself. The first ${wait} days are unpaid unless the disability lasts more than ${retro} days (AS 23.30.150). A camp cook with ${usd(1150)} of spendable weekly pay who is off 30 days receives ${usd(c30.weekly)} a week, ${usd(c30.total)} for the period. TTD ends at medical stability, with no week cap, and any permanent partial impairment is then paid as one lump sum of ${usd(ppiBase)} times the whole-person rating.`,
  body: (h) => `<h2>Starting from the paycheck after taxes</h2>
<p>Alaska is one of a handful of states where the benefit is not a share of gross wages. The adjuster takes gross weekly earnings, computed under one of the methods in AS 23.30.220 (weekly, monthly × 12 ÷ 52, or one fiftieth of the better of the two prior calendar years for hourly and piece workers), then subtracts federal income tax and payroll taxes to reach the spendable weekly wage. The ${pct(d.ttd.rate)} rate applies to that net figure. In practice, a worker with a family and a moderate income often receives a check close to normal take-home pay, which is the design. The calculator on this page therefore asks for spendable earnings, not gross pay.</p>
<p>A Prudhoe Bay camp cook with ${h.usd(1150)} of spendable weekly pay receives ${h.usd(c30.weekly)}. A deckhand whose spendable earnings reach ${h.usd(2600)} computes to ${h.usd(deck.raw)} and is held to the ${h.usdx(max)} ceiling, which applies once spendable pay passes about ${h.usd(atMax)}. A seasonal clerk with ${h.usd(400)} of spendable pay is below the ${h.usdx(min)} floor and is paid ${h.usd(clerk)}, the full spendable wage, as § 23.30.175(a) requires.</p>

<h2>Four weeks before day one counts</h2>
<p>The waiting rule in AS 23.30.150 is written with a long tail: nothing for the first ${wait} days unless the disability lasts more than ${retro} days. Back after 20 days, the cook is paid for ${c20.paidDays} days, ${h.usd(c20.total)}; out 30 days, every day is paid, ${h.usd(c30.total)}. The first check is due on the fourteenth day after the employer knows of the injury, and later checks every fourteen days unless the Board orders otherwise (§ 23.30.155).</p>

<h2>Medical stability ends TTD, then a lump sum</h2>
<p>There is no week limit on TTD; it stops at the date of medical stability (§ 23.30.185). Permanent partial impairment is not a weekly benefit in Alaska. It is a single payment of ${h.usd(ppiBase)} multiplied by the whole-person impairment percentage, paid without any discount for early payment and rated under the AMA Guides, which the ${h.ext(d.facts[4]?.url ?? d.agency.url, 'Division’s bulletins')} updated to the Sixth Edition, 2025, in Bulletin 26-01. An 8% rating is worth ${h.usd(ppi8)}. Ratings are not rounded up to the next five percent.</p>

<h2>Leaving the state after an injury</h2>
<p>${d.facts[2]?.text ?? ''} A worker who retires to Arizona or Washington while drawing benefits may therefore see the weekly amount move with the cost-of-living ratio of the new home.</p>`,
  faqs: [
    {
      q: 'How is spendable weekly wage calculated for Alaska workers’ comp?',
      a: `Alaska takes gross weekly earnings, computed under AS 23.30.220, and subtracts payroll tax deductions: federal income tax withholding and FICA. Temporary total disability is ${pct(d.ttd.rate)} of the remainder. Because the tax depends on filing status and dependents, two workers with the same gross pay can receive different Alaska benefits. The Division publishes a benefit calculator for the computation.`,
    },
    {
      q: 'What are the Alaska workers’ comp maximum and minimum for 2026?',
      a: `For injuries in calendar year 2026, Alaska Bulletin 25-06 sets the weekly maximum at ${usdx(max)}, which is 120% of the Alaska average weekly wage, and the minimum at ${usdx(min)}, which is 22% of the maximum. A worker whose spendable weekly wage is lower than the minimum receives the spendable wage instead, and the reemployment benefit maximum is set separately.`,
    },
    {
      q: 'How much is a permanent impairment worth in Alaska?',
      a: `Alaska multiplies ${usd(ppiBase)} by the whole-person impairment percentage under AS 23.30.190 and pays the result as one lump sum, with no present-value discount. A 10% whole-person rating is therefore worth ${usd((ppiBase * 10) / 100)}. The rating comes from the AMA Guides adopted by the Division, and it is not rounded up to the next five percent.`,
    },
    {
      q: 'When are the first days of an Alaska work injury paid?',
      a: `Alaska withholds compensation for the first ${wait} days of disability, though medical care is covered from the start. If the disability lasts more than ${retro} days, compensation is owed from the date of disability, so the waiting days are paid back. The first installment is due on the fourteenth day after the employer learns of the injury.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:washington', 'workers-comp:hawaii', 'workers-comp:oregon', 'child-support:alaska'],
});
