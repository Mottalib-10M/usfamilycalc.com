import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('louisiana');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('louisiana') as number;
const start = day(d.ttd.effective);

// A roustabout averaging $1,600 a week, off five weeks: capped.
const rig = wcCalc('louisiana', 1600, 35);
// A home health aide at $640 a week, off nine days: first week unpaid.
const aide9 = wcCalc('louisiana', 640, 9);
const aide30 = wcCalc('louisiana', 640, 30);
// A part-time worker paid $210 a week, below the minimum: paid the actual wage.
const pt = wcCalc('louisiana', 210, 21);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'louisiana',
  title: `Louisiana Workers Comp Calculator 2026: Rates From Sept 1`,
  description: `Louisiana workers comp for injuries from ${start}: ${pct(d.ttd.rate)} of wages, capped at ${usdx(max)} a week with a ${usdx(min)} floor, under the OWCA limits for 2026-27.`,
  intro: 'Louisiana is the state whose benefit year turns over on September 1, so two injuries a few days apart in late summer can carry different caps.',
  resume: `Temporary total disability in Louisiana is ${pct(d.ttd.rate)} of the injured worker's wages, within limits the Office of Workers' Compensation Administration sets every September 1 from the statewide average weekly wage. For injuries from ${start} through August 31, 2027 the weekly maximum is ${usdx(max)} and the minimum ${usdx(min)}; a worker who earned less than the minimum is paid the actual wage instead (La. R.S. 23:1202). The cap bites at about ${usd(atMax)} of weekly earnings. Nothing is paid for the first ${wait} days, and that week is paid back once disability lasts two weeks (La. R.S. 23:1224). An aide earning ${usd(640)} who misses thirty days receives ${usd(aide30.weekly)} a week, ${usd(aide30.total)} in total. TTD has no week limit but ends when regular medical treatment is no longer needed, and a worker who is not working must prove total inability to work by clear and convincing evidence. Partial wage loss is paid afterwards as supplemental earnings benefits for up to 520 weeks.`,
  body: (h) => `<h2>A benefit year that starts on September 1</h2>
<p>Most states move their ceiling on January 1 or July 1. Under La. R.S. 23:1202(B), the administrator of the Louisiana Employment Security Law fixes the average weekly wage by August 1, and it governs every injury in the twelve months that begin the following September 1. The ${h.ext(d.ttd.url, 'OWCA notice')} for the current cycle lists ${h.usdx(max)} and ${h.usdx(min)} for injuries from ${h.day(d.ttd.effective)}; the injury date, not the date of the claim or the first check, decides which line applies for the life of the case. ${d.facts[0]?.text ?? ''}</p>
<p>A roustabout averaging ${h.usd(1600)} a week would compute to ${h.usd(rig.raw)} but is limited to ${h.usd(rig.weekly)}. A part-time worker paid ${h.usd(210)} a week falls below the floor, and Louisiana then pays the wage itself: ${h.usd(pt.weekly)} a week, not the minimum.</p>

<h2>Proving you cannot work at all</h2>
<p>Louisiana's TTD definition is unusually strict. Benefits are refused to anyone engaged in any employment or self-employment, including odd-lot or sheltered work and work done in pain (La. R.S. 23:1221(1)(b)). A claimant who is not working must prove by clear and convincing evidence, unaided by any presumption, that he or she is physically unable to do any job at all. TTD stops when the condition has resolved enough to measure the lasting disability and regular treatment by a physician is no longer required.</p>
<p>The first week is the cost of a short injury. An aide earning ${h.usd(640)} back after nine days receives ${h.usd(aide9.total)}, with ${aide9.unpaidDays} unpaid days. Out thirty days, the waiting week is caught up after the second week and the claim totals ${h.usd(aide30.total)}.</p>

<h2>Supplemental earnings benefits instead of a rating</h2>
<p>Louisiana does not pay permanent partial disability on an impairment rating for back or neck injuries. Permanent partial benefits under La. R.S. 23:1221(4) are limited to amputation or anatomical loss of use of listed members, such as fifty weeks for a thumb or two hundred for an arm. Everyone else who returns at lower pay moves to supplemental earnings benefits (SEB): ${pct(d.ttd.rate)} of the gap between pre-injury monthly wages and what the worker earns or could earn, once earnings fall below 90% of the old wage. SEB ends after 520 weeks, and the monthly SEB check can never exceed 4.3 times the weekly TTD amount.</p>
<p>Medical care follows its own rules: the employee may pick one treating physician in each specialty, and a denied choice can be taken to an expedited hearing (La. R.S. 23:1121). For the settlement side of a claim, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}.</p>`,
  faqs: [
    {
      q: 'When do Louisiana workers’ comp maximum rates change?',
      a: `Every September 1. Louisiana's limits follow the statewide average weekly wage set by August 1 and apply to injuries in the twelve months that start the next September 1. For injuries from ${start} through August 31, 2027 the maximum is ${usdx(max)} a week and the minimum ${usdx(min)}. A worker hurt in August 2026 keeps the previous cycle's figures for the whole claim.`,
    },
    {
      q: 'Can I get Louisiana TTD if I am working a light job in pain?',
      a: 'No. Louisiana refuses temporary total disability to anyone engaged in any employment or self-employment, including odd-lot, sheltered or light work and work performed in pain. A worker who earns less on a lighter job may instead qualify for supplemental earnings benefits, which pay two thirds of the wage gap once earnings drop below 90% of what was earned before the injury.',
    },
    {
      q: 'Do I get paid for the first week off in Louisiana?',
      a: `Not at first. La. R.S. 23:1224 withholds compensation for the first ${wait} days after the injury. If the disability continues for two weeks or longer, that first week is paid after the two weeks have passed. A short absence of nine or ten days therefore pays only the days after the first week, while a three-week absence is paid in full from day one.`,
    },
    {
      q: 'How long do supplemental earnings benefits last in Louisiana?',
      a: 'Up to 520 weeks under La. R.S. 23:1221(3), and they can end sooner, for example two years after TTD ends if no SEB was paid during that period. The monthly amount is two thirds of the difference between the old monthly wage and current earnings, and it may never be more than 4.3 times the weekly TTD benefit.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:texas', 'workers-comp:mississippi', 'workers-comp:arkansas'],
});
