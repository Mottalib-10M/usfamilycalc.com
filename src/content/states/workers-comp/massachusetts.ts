import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, num, day } from '../../../lib/kit';

const d = wc('massachusetts');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const weeks = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('massachusetts') as number;
const from = day(d.ttd.effective);

// A Worcester nurse at $1,900 a week: 18 days, then 25 days.
const n18 = wcCalc('massachusetts', 1900, 18);
const n25 = wcCalc('massachusetts', 1900, 25);
// A carpenter at $1,400 a week out for four years: the 156-week ceiling.
const carp = wcCalc('massachusetts', 1400, 4 * 365);
// Partial: 75% of what the § 34 rate would be.
const partialCap = wcCalc('massachusetts', 1400, 7).weekly * 0.75;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'massachusetts',
  title: `Massachusetts Workers Comp Calculator 2026: 60% Rate`,
  description: `Massachusetts workers comp from ${from}: § 34 pays ${pct(d.ttd.rate)} of gross wages, ${usdx(min)} to ${usdx(max)} a week, for at most ${weeks} weeks, after a ${wait}-day wait.`,
  intro: 'Massachusetts replaces a smaller share of pay than almost any state, then lets the check climb higher than almost any other.',
  resume: `Massachusetts pays temporary total incapacity benefits under M.G.L. c. 152, § 34 at ${pct(d.ttd.rate)} of the employee's gross average weekly wage, not the two thirds most states use. The Department of Industrial Accidents (DIA) resets the band every October 1 at 100% and 20% of the state average weekly wage: for injuries on or after ${from} the maximum is ${usdx(max)} and the minimum ${usdx(min)} a week. Only a wage above about ${usd(atMax)} a week reaches the cap. Compensation starts on the sixth day; the first ${wait} days are paid only if the incapacity reaches ${retro + 1} calendar days. Section 34 benefits stop after ${weeks} weeks. A nurse earning ${usd(1900)} who misses twenty-five days receives ${usd(n25.weekly)} a week and ${usd(n25.total)} in all. When the worker can return at lower pay, § 35 partial benefits pay up to 75% of the § 34 rate for as long as 260 weeks, and permanent and total incapacity under § 34A comes with yearly cost-of-living adjustments.`,
  body: (h) => `<h2>Sixty percent, with a ceiling near the top of the country</h2>
<p>The lower rate and the higher ceiling pull in opposite directions. A worker earning ${h.usd(1900)} a week receives ${h.usd(n25.weekly)} in Massachusetts, less than two thirds would give. Yet the ${h.usdx(max)} maximum leaves almost every wage uncapped: the ceiling is reached only at a gross weekly wage near ${h.usd(atMax)}. The ${h.ext(d.ttd.url, 'DIA table of minimum and maximum rates')} also shows that the figure moved from ${h.usdx(1922.48)} for injuries between October 1, 2025 and September 30, 2026 to ${h.usdx(max)} from ${from}; the date of injury fixes which one applies.</p>

<h2>Day six and day twenty-one</h2>
<p>The waiting period is five days, longer than in most of New England, and it is only made up if the incapacity lasts 21 calendar days, which need not be consecutive. That gap shows clearly with the nurse: out eighteen days, she is paid for ${n18.paidDays} days, ${h.usd(n18.total)}; out twenty-five days, she is paid for all of them, ${h.usd(n25.total)}. The difference, ${h.usd(n25.total - n18.total)}, is far more than a week of wages would suggest.</p>

<h2>The ${num(weeks)}-week limit and what comes after</h2>
<p>Section 34 runs out after ${num(weeks)} weeks of payments, about three years. A carpenter earning ${h.usd(1400)} who never recovers enough to work collects ${h.usd(carp.weekly)} a week and ${h.usd(carp.total)} before § 34 ends. Three paths follow. If he can do some work, § 35 partial incapacity pays ${pct(d.ttd.rate)} of the difference between the old wage and what he can earn, capped at 75% of the § 34 rate, ${h.usd(partialCap)} a week in his case, for up to 260 weeks. If he cannot work at all, § 34A permanent and total benefits pay two thirds of the wage with annual cost-of-living adjustments. Separately, § 36 adds a one-time payment for permanent loss of function or for scarring on the face, neck or hands.</p>
<p>Before December 24, 1991, § 34 ran for 260 weeks, so old claims still follow the earlier limits. Surviving spouses receive two thirds of the deceased worker's wage, and each eligible child receives $60 a week if the spouse remarries. For an overview of settlements and lump sums, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}.</p>`,
  faqs: [
    {
      q: 'Why does Massachusetts workers’ comp pay only 60% of my wage?',
      a: `Section 34 of chapter 152 sets temporary total incapacity at ${pct(d.ttd.rate)} of the gross average weekly wage, below the two thirds common elsewhere. Benefits are not taxed, so the net difference from a paycheck is smaller than it looks. The weekly amount is still limited to ${usdx(max)} and raised to at least ${usdx(min)} for injuries on or after ${from}.`,
    },
    {
      q: 'How many weeks of temporary total benefits can I get in Massachusetts?',
      a: `Up to ${weeks} weeks under § 34 for injuries since December 24, 1991. After that, a worker who can do some work may receive § 35 partial benefits for up to 260 weeks, and one who cannot work at all may claim § 34A permanent and total benefits, which have no fixed end and receive cost-of-living increases each year.`,
    },
    {
      q: 'When does the Massachusetts workers’ comp maximum change?',
      a: `Each October 1. The Commissioner of the Division of Unemployment Assistance computes the state average weekly wage, and the DIA publishes the new maximum (100% of it) and minimum (20%). For injuries on or after ${from} the band is ${usdx(min)} to ${usdx(max)}. Your rate is fixed by your date of injury and does not change when a new band is published.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:new-hampshire', 'workers-comp:connecticut', 'workers-comp:rhode-island', 'workers-comp:new-york'],
});
