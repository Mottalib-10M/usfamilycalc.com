import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, day, num } from '../../../lib/kit';

const d = wc('illinois');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('illinois') as number;
const from = day(d.ttd.effective);
const money = (s: string) => [...s.matchAll(/\$([\d,]+\.\d{2})/g)].map((m) => Number(m[1].replace(/,/g, '')));
// Minimums by number of spouse/children (0, 1, 2, 3, 4+), the SAWW and the earlier maximum, as published by the IWCC.
const mins = money(d.ttd.minText);
const [saww, priorMax] = money(d.ttd.periodLabel);
const ratio = (max / saww) * 100;
const ppdMax = money(d.ppd.text)[0];

// A Chicago ICU nurse at $1,800 a week, out 10 days, then 20 days.
const n10 = wcCalc('illinois', 1800, 10);
const n20 = wcCalc('illinois', 1800, 20);
// A Peoria heavy-equipment mechanic at $3,400 a week.
const mech = wcCalc('illinois', 3400, 56);
// A food-service worker at $480 a week, single, then with two children.
const solo = wcWeekly('illinois', 480);
const withKids = Math.min(480, mins[2]);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'illinois',
  title: `Illinois Workers Comp Calculator 2026: Rates Reset Twice`,
  description: `Illinois workers comp: TTD is two thirds of the AWW up to ${usdx(max)} from ${from}, with a minimum of ${usd(mins[0])} to ${usd(mins[4])} that grows with your dependents.`,
  intro: 'Illinois is the state that moves its rates twice a year and scales the minimum benefit to the size of the family.',
  resume: `Illinois pays temporary total disability at ${pct(d.ttd.rate)} of the average weekly wage. The Illinois Workers' Compensation Commission resets the maximum every January 15 and July 15 from the statewide average weekly wage published by the Department of Employment Security; from ${from} through January 14, 2027 the SAWW is ${usdx(saww)} and the TTD maximum ${usdx(max)}, about ${num(ratio, 0)}% of it. The minimum depends on the household: ${usdx(mins[0])} with no spouse or child, rising to ${usdx(mins[4])} with four or more, but never above the worker's own wage. Under Section 8(b) of the Act, the first ${wait} working days are unpaid unless the incapacity lasts more than ${retro} days. TTD has no week limit. A nurse earning ${usd(1800)} a week who misses 20 days receives ${usd(n20.weekly)} a week, ${usd(n20.total)} in all. Permanent partial disability has a separate, lower ceiling.`,
  body: (h) => `<h2>January 15 and July 15</h2>
<p>Most states move their numbers once a year. Section 8(b)6 tells the Commission to post new rates by January 15 and July 15, because the Department of Employment Security publishes the state wage every six months. The ${h.ext(d.ttd.url, 'IWCC benefit rates page')} shows the effect: ${h.usdx(priorMax)} for injuries from January 15 to July 14, 2026, then ${h.usdx(max)} from ${from}. Two coworkers hurt in the same calendar year can therefore have different ceilings. The Commission adds a caution of its own: where its posted figures and the statute disagree, the statute governs, so a disputed rate is argued from the Act, not from the table. A Peoria heavy-equipment mechanic averaging ${h.usd(3400)} a week computes to ${h.usd(mech.raw)} and receives ${h.usd(mech.weekly)}; the ceiling starts at about ${h.usd(atMax)} of weekly pay.</p>

<h2>A minimum sized to the household</h2>
${h.table(['Spouse and children', 'Weekly TTD minimum'], ['None', 'One', 'Two', 'Three', 'Four or more'].map((k, i) => [k, h.usdx(mins[i])]), `Illinois, injuries ${from} to January 14, 2027`, ['l', 'r'])}
<p>The minimum is the worker's average weekly wage or the rate above, whichever is lower. The IWCC ties these amounts to the Illinois minimum wage, and new minimums appear in the July 15 rates. A food-service worker averaging ${h.usd(480)} a week computes to two thirds, ${h.usd(480 * d.ttd.rate / 100)}; single, the floor lifts it to ${h.usd(solo)}; with two children, to ${h.usd(withKids)}, the whole wage, because the two-child minimum is higher than the wage. The calculator applies the minimum for a worker without dependents.</p>

<h2>Three working days</h2>
<p>The Illinois waiting period is counted in working days. Back after 10 calendar days, the nurse is paid ${h.usd(n10.total)} for ${n10.paidDays} days in our estimate, which counts calendar days; out 20 days, the full ${h.usd(n20.total)}. Employers must report to the Commission every accident that causes more than three lost workdays.</p>

<h2>A lower ceiling for permanent partial</h2>
<p>Permanent partial disability that is not an amputation or the loss of an eye has its own maximum, updated each July 1: ${h.usdx(ppdMax)} for July 1, 2025 to June 30, 2026. Amputations and enucleation are paid under the higher death and permanent total maximum. ${d.facts[3]?.text ?? ''} ${d.facts[2]?.text ?? ''}</p>`,
  faqs: [
    {
      q: 'What is the Illinois TTD maximum after July 15, 2026?',
      a: `For injuries from ${from} through January 14, 2027, Illinois caps temporary total disability at ${usdx(max)} a week, based on a statewide average weekly wage of ${usdx(saww)}. For injuries from January 15 to July 14, 2026 the cap was ${usdx(priorMax)}. The Commission posts new rates every January 15 and July 15.`,
    },
    {
      q: 'Why is my Illinois workers’ comp minimum higher than my coworker’s?',
      a: `Because the Illinois minimum depends on the number of spouse and children. For injuries from ${from}, it is ${usdx(mins[0])} with no dependents, ${usdx(mins[1])} with one, ${usdx(mins[2])} with two, ${usdx(mins[3])} with three and ${usdx(mins[4])} with four or more. In every case the minimum cannot exceed the worker's own average weekly wage.`,
    },
    {
      q: 'Can an Illinois comp dispute be decided by binding arbitration?',
      a: 'Yes, if the only issues are TTD, permanent partial disability or medical bills. Under Section 19(p) of the Illinois Workers’ Compensation Act, the parties may agree to voluntary binding arbitration before one of the arbitrators recommended by the Workers’ Compensation Advisory Board, filed on Form IC36. The arbitrator’s decision is then the final decision of the Commission.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:indiana', 'workers-comp:iowa', 'workers-comp:missouri', 'child-support:illinois'],
});
