import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('indiana');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('indiana') as number;
const from = day(d.ttd.effective);
const money = (s: string) => [...s.matchAll(/\$([\d,]+(?:\.\d{2})?)/g)].map((m) => Number(m[1].replace(/,/g, '')));
// Values per degree of impairment for 1-10, 11-35, 36-50 and 51-100 degrees (WCB table).
const perDegree = money(d.ppd.text);
const totalCap = money(d.ttdDuration.text)[0];
const minWage = money(d.ttd.minText)[0];
const frozen = money(d.facts[1]?.text ?? '');

// A Fort Wayne RV-assembly worker at $1,050 a week, out 12 days, then 23 days.
const a12 = wcCalc('indiana', 1050, 12);
const a23 = wcCalc('indiana', 1050, 23);
// A Gary steelworker at $1,900 a week.
const steel = wcCalc('indiana', 1900, 70);
// An 8-degree impairment, all in the first band.
const ppi8 = 8 * perDegree[0];

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'indiana',
  title: `Indiana Workers Comp Calculator 2026: PPI Paid by Degree`,
  description: `Indiana workers comp from ${from}: two thirds of the AWW, up to ${usdx(max)} a week on a ${usd(frozen[4])} wage cap, and impairment paid at ${usd(perDegree[0])} to ${usd(perDegree[3])} a degree.`,
  intro: 'Indiana prices a permanent impairment in degrees, with each band of degrees worth more than the one before.',
  resume: `Indiana pays temporary total disability at ${pct(d.ttd.rate)} of the average weekly wage of the 52 weeks before the injury. For injuries from ${from} to June 30, 2027, the Worker's Compensation Board counts wages up to ${usdx(frozen[4])} a week, so the largest TTD check is ${usdx(max)}; the board's table also sets a ${usdx(minWage)} minimum wage for the computation, which gives a floor of ${usdx(min)} by our arithmetic. Income benefits are owed after more than ${wait} days off; the first week is paid only once the worker has been out ${retro} days. Every kind of benefit together, TTD, impairment, permanent total and death, is capped at ${usdx(totalCap)} for the same injuries. Permanent partial impairment is not a number of weeks but a number of degrees, each worth ${usd(perDegree[0])} in the lowest band and ${usd(perDegree[3])} in the highest. An RV-assembly worker earning ${usd(1050)} a week who is out 23 days receives ${usd(a23.total)}.`,
  body: (h) => `<h2>Degrees, not weeks</h2>
<p>When an Indiana worker reaches maximum medical improvement with a lasting impairment, the doctor's percentage is turned into degrees: 12 for a thumb, 40 for a hand, 45 for a knee and leg, 50 for an arm, 100 for the whole body. Each degree then carries a dollar value from the ${h.ext(d.ttd.url, 'Board’s PPI and weekly benefits table')}, and the value per degree climbs with severity. For injuries from ${from}:</p>
${h.table(['Degrees of impairment', 'Value per degree'], [['1 to 10', usd(perDegree[0])], ['11 to 35', usd(perDegree[1])], ['36 to 50', usd(perDegree[2])], ['51 to 100', usd(perDegree[3])]], `Indiana permanent partial impairment, injuries ${from} to June 30, 2027`, ['l', 'r'])}
<p>An 8-degree rating stays within the first band and is worth ${h.usd(ppi8)}. Ratings above 10 degrees move into more valuable bands, which is why the exact degree count from the physician matters so much in Indiana settlements. The award does not depend on the worker's wage at all, unlike TTD.</p>

<h2>Seven years at ${usd(frozen[0])}, then four raises</h2>
<p>${d.facts[1]?.text ?? ''} At two thirds, the 2026-2027 wage cap gives the ${h.usdx(max)} TTD maximum. A Gary steelworker averaging ${h.usd(1900)} a week computes to ${h.usd(steel.raw)} but is paid ${h.usd(steel.weekly)}; the cap applies from about ${h.usd(atMax)} of weekly pay. The Board's table already lists the figures through June 30, 2027.</p>

<h2>Day eight, and the first week at day twenty-one</h2>
<p>The ${h.ext(d.waiting.url, 'Board’s employee FAQ')} puts it simply: a worker unable to return for more than ${wait} days is entitled to weekly benefits; the first installment should be mailed 15 days after the injury, and the first week of lost time is paid only after ${retro} days out. A Fort Wayne RV-assembly worker earning ${h.usd(1050)} who returns after 12 days receives ${h.usd(a12.total)}; out 23 days, ${h.usd(a23.total)}. Report the accident at once: waiting more than 30 days can cost the claim.</p>

<h2>One ceiling for everything</h2>
<p>Indiana adds the benefits of one injury together and stops them at ${h.usdx(totalCap)} for 2026-2027 injuries, whatever their type. A long TTD period therefore reduces what remains for impairment or permanent total disability. Medical care is not part of that total. The minimum is the one figure the Board does not print as a benefit: its table gives a ${h.usdx(minWage)} minimum wage, and two thirds of it, ${h.usdx(min)}, is our computation.</p>`,
  faqs: [
    {
      q: 'How is a permanent impairment paid in Indiana?',
      a: `Indiana converts the physician's rating into degrees and pays a dollar value for each degree. For injuries from ${from} to June 30, 2027, a degree is worth ${usd(perDegree[0])} from 1 to 10 degrees, ${usd(perDegree[1])} from 11 to 35, ${usd(perDegree[2])} from 36 to 50 and ${usd(perDegree[3])} from 51 to 100. A hand is 40 degrees and the whole body 100.`,
    },
    {
      q: 'What is the Indiana workers’ comp maximum for 2026-2027?',
      a: `For injuries from ${from} to June 30, 2027, Indiana counts wages up to ${usdx(frozen[4])} a week, so temporary total disability is capped at ${usdx(max)}. All benefits for one injury combined, including impairment, permanent total and death benefits, may not exceed ${usdx(totalCap)}. Medical treatment is paid on top of that limit.`,
    },
    {
      q: 'When does Indiana pay the first week of a work injury?',
      a: `Indiana owes weekly income benefits when the worker cannot return for more than ${wait} days, and the first installment should be mailed 15 days after the injury. The first week of lost time itself is paid only once the worker has been out ${retro} days. A shorter absence leaves that first week unpaid, although medical care is covered.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:illinois', 'workers-comp:ohio', 'workers-comp:michigan', 'workers-comp:kentucky'],
});
