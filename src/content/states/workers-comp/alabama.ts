import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('alabama');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('alabama') as number;
const from = day(d.ttd.effective);

// A poultry-plant line worker at $760 a week, out 18 days, then 25 days.
const p18 = wcCalc('alabama', 760, 18);
const p25 = wcCalc('alabama', 760, 25);
// A part-time stocker at $300 a week, below the floor.
const stock = wcCalc('alabama', 300, 42);
// A shipyard welder in Mobile at $1,950 a week.
const weld = wcCalc('alabama', 1950, 70);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'alabama',
  title: `Alabama Workers Comp Calculator 2026: The 21-Day Rule`,
  description: `Alabama workers comp 2026: two thirds of the AWW, ${usdx(min)} to ${usdx(max)} a week for injuries from ${from}, and three unpaid days that return only at day ${retro}.`,
  intro: 'Alabama settles contested claims in circuit court, not before a state board, and its waiting period is one of the longest to win back.',
  resume: `An Alabama worker who cannot work at all after a job injury receives ${pct(d.ttd.rate)} of the average weekly earnings of the 52 weeks before the accident, never more than ${usdx(max)} a week for injuries on or after ${from} (Code of Ala. § 25-5-57, § 25-5-68). The Department of Workforce sets that ceiling every July at the prior year's state average weekly wage. The floor is ${usdx(min)}, except that a worker who earned less than the floor is paid the full wage instead. The first ${wait} days are unpaid; they are added to the first check due after the disability reaches ${retro} days (§ 25-5-59). A line worker earning ${usd(760)} a week who misses 25 days collects ${usd(p25.weekly)} a week and ${usd(p25.total)} in all. Temporary total benefits have no week limit, but permanent partial and temporary partial benefits stop at 300 weeks, and the law reaches only employers with five or more employees.`,
  body: (h) => `<h2>A three-week line before the first days are repaid</h2>
<p>Most states give the waiting days back after two weeks. Alabama waits for ${retro}. Under § 25-5-59 compensation starts on the fourth day, and the first ${wait} days are paid only if the disability lasts as much as ${retro} days, with the first installment due after that point. The difference is real on a modest wage. A poultry-plant line worker at ${h.usd(760)} a week who returns on day 18 receives ${h.usd(p18.total)} for ${p18.paidDays} paid days; the same worker out 25 days receives ${h.usd(p25.total)} for all ${p25.paidDays}. The ${h.ext(d.waiting.url, 'Workers’ Compensation Division guide')} also reminds employees that nothing is due unless the employer knew of the injury or was told within the statutory period: five days in principle, ninety at the outside.</p>

<h2>The July reset and the wage floor</h2>
<p>Alabama recalculates its band each summer. The ${h.ext(d.ttd.url, 'State’s Average Weekly Wage notice')} signed in May 2026 fixed ${h.usdx(max)} as the ceiling and ${h.usdx(min)} as the floor for accidents from ${from}; an injury in June 2026 still uses the previous year's figures. You reach the ceiling at about ${h.usd(atMax)} of gross weekly pay, so a shipyard welder in Mobile earning ${h.usd(1950)} is held to ${h.usd(weld.weekly)} rather than ${h.usd(weld.raw)}. At the bottom, the floor never pays more than the wage itself: a part-time stocker averaging ${h.usd(300)} a week receives ${h.usd(stock.weekly)}, the whole wage, because the statute replaces 100% of earnings below the minimum.</p>

<h2>Circuit court, a doctor panel of four, and a 15% fee cap</h2>
<p>There is no administrative hearing system for disputed benefits. ${d.facts[3]?.text ?? ''} The Division's ombudsmen try to settle disputes first, but a judge decides the rest. The employer chooses the authorized treating physician; a worker unhappy with that doctor can ask for a panel of four and pick a second one from it. Lawyers are paid out of the award, and the circuit judge must approve the fee, which cannot exceed 15% of the compensation.</p>
<p>Coverage has its own gap. ${d.facts[0]?.text ?? ''} Small businesses with four employees or fewer are outside the act unless they elect in.</p>

<h2>After the healing period</h2>
<p>Temporary total disability runs as long as the disability does. Once the doctor rates a permanent impairment, permanent partial benefits continue at the same ${pct(d.ttd.rate)} rate for scheduled members such as a hand or a leg, or for up to 300 weeks for injuries to the body as a whole. For what a lump-sum settlement may add, read ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}.</p>`,
  faqs: [
    {
      q: 'When does Alabama pay the first three days of a work injury?',
      a: `Only when the disability lasts as much as ${retro} days. Alabama pays nothing for the first ${wait} days, starts compensation on the fourth day, and adds the first ${wait} days to the first installment that falls due after the ${retro}-day mark. A worker back on the job after two weeks never recovers those days, which is a longer threshold than the two weeks used in most states.`,
    },
    {
      q: 'What is the Alabama workers’ comp maximum for injuries after July 1, 2026?',
      a: `For accidents on or after ${from}, the Alabama weekly maximum is ${usdx(max)} and the minimum ${usdx(min)}, figures the Department of Workforce derives from the 2025 state average weekly wage. Accidents between July 1, 2025 and June 30, 2026 keep the lower band of that year. A worker paid less than the minimum receives the full weekly wage instead.`,
    },
    {
      q: 'Who decides a disputed workers’ comp claim in Alabama?',
      a: 'The circuit court of the county where the injury happened or where the employee lives. Alabama has no workers’ compensation board that hears contested cases. A verified complaint must be filed within two years of the accident or of the last compensation payment. The Department of Workforce ombudsman program can help the parties settle before trial, and the judge approves any attorney fee, capped at 15%.',
    },
    {
      q: 'Does every Alabama employer have to carry workers’ comp?',
      a: 'No. The Alabama act generally covers employers with five or more employees, and it excludes domestic servants, casual employees, farm laborers and certain owner-operators of interstate carriers. A smaller employer may elect coverage. An injured worker of a business outside the act has no workers’ compensation claim and must rely on ordinary negligence law or private insurance.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:georgia', 'workers-comp:florida', 'workers-comp:mississippi', 'workers-comp:tennessee'],
});
