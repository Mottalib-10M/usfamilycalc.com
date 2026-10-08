import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('district-of-columbia');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('district-of-columbia') as number;
const from = day(d.ttd.effective);
const money = (s: string) => [...s.matchAll(/\$([\d,]+\.\d{2})/g)].map((m) => Number(m[1].replace(/,/g, '')));
const [, prevMax, firstMax] = money(d.facts[0]?.text ?? '');
const weeksOf = (part: string) => Number(d.ppd.text.match(new RegExp(`${part} (\\d+)`))?.[1] ?? 0);
const arm = weeksOf('arm'), leg = weeksOf('leg'), hand = weeksOf('hand');

// A Capitol Hill legislative aide at $1,500 a week, out 10 days, then 20 days.
const a10 = wcCalc('district-of-columbia', 1500, 10);
const a20 = wcCalc('district-of-columbia', 1500, 20);
// A K Street partner-track associate at $4,000 a week.
const assoc = wcCalc('district-of-columbia', 4000, 42);
// A part-time museum guard at $520 a week.
const guard = wcWeekly('district-of-columbia', 520);
// Loss of an arm for a worker at $1,500 a week.
const armAward = wcWeekly('district-of-columbia', 1500) * arm;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'district-of-columbia',
  title: `District of Columbia Workers Comp Calculator 2026: ${usd(max)}`,
  description: `DC workers comp 2026: two thirds of the average weekly wage, between ${usdx(min)} and ${usdx(max)} a week from ${from}, with a ${wait}-day wait repaid after ${retro} days.`,
  intro: 'The District runs its own private-sector workers’ compensation act, separate from the federal program that covers federal employees working in the same buildings.',
  resume: `A private-sector employee hurt in the District of Columbia in 2026 receives temporary total disability of ${pct(d.ttd.rate)} of the average weekly wage, between ${usdx(min)} and ${usdx(max)} a week, under the District of Columbia Workers' Compensation Act of 1979 (D.C. Code § 32-1508(2)). The Office of Workers' Compensation in the Department of Employment Services publishes the band each January; for 2026 the maximum rose 2.40% over ${usdx(prevMax)}. The minimum is one quarter of the maximum. No compensation is paid for the first ${wait} days unless the disability lasts more than ${retro} days, in which case it runs from the start (§ 32-1505). An aide earning ${usd(1500)} a week who is out 20 days receives ${usd(a20.total)}. TTD has no week cap, temporary partial disability ends after five years, and scheduled losses pay for long periods: ${arm} weeks for an arm, ${leg} for a leg.`,
  body: (h) => `<h2>Two systems in one city</h2>
<p>In Washington, the worker next to you may be under a different law. Federal civilian employees are covered by the federal program run by the U.S. Department of Labor; everyone else, from a hotel housekeeper to a law-firm associate, falls under the District's own Act, administered by the ${d.agency.name}. This page and its calculator apply the District Act only.</p>

<h2>The band DOES has published since 1982</h2>
<p>The ${h.ext(d.ttd.url, 'DOES compensation rate table')} lists every maximum and minimum since 1982, when the ceiling was ${h.usdx(firstMax)}. For calendar year 2026 it prints ${h.usdx(max)} and ${h.usdx(min)}; the minimum has been exactly a quarter of the maximum in every year of the table. ${d.facts[2]?.text ?? ''}</p>
<p>The ceiling applies from about ${h.usd(atMax)} of weekly pay. A K Street associate earning ${h.usd(4000)} computes to ${h.usd(assoc.raw)} and is paid ${h.usd(assoc.weekly)}. At the other end, a part-time museum guard at ${h.usd(520)} a week computes below the floor and is raised to ${h.usd(guard)} by the calculator, which applies the DOES minimum as printed; whether a worker paid less than the minimum receives the full wage instead is a rule of the Act that we could not confirm on the Council's code site when we checked in October 2026.</p>

<h2>Three days, then fourteen</h2>
<p>Section 32-1505 allows no compensation for the first ${wait} days of disability, apart from medical care under § 32-1507; when the disability lasts more than ${retro} days, compensation is allowed from the date of disability. A legislative aide on Capitol Hill earning ${h.usd(1500)} who is back after 10 days is paid ${h.usd(a10.total)} for ${a10.paidDays} days; out 20 days, the full ${h.usd(a20.total)}.</p>

<h2>Long schedules for lost limbs</h2>
<p>The District's schedule in § 32-1508(3) is generous in weeks: ${arm} for an arm, ${leg} for a leg, ${hand} for a hand, each at two thirds of the average weekly wage, and proportionally less for a partial loss of use. The aide earning ${h.usd(1500)} who lost an arm would be owed about ${h.usd(armAward)} over ${arm} weeks. ${d.facts[3]?.text ?? ''}</p>`,
  faqs: [
    {
      q: 'What is the DC workers’ comp maximum for 2026?',
      a: `For calendar year 2026, the District of Columbia caps temporary total disability at ${usdx(max)} a week and sets the minimum at ${usdx(min)}, according to the Department of Employment Services. The maximum rose 2.40% from ${usdx(prevMax)} in 2025. Between the two limits, the benefit is two thirds of the employee's average weekly wage, and it is not taxed.`,
    },
    {
      q: 'Does the DC workers’ comp act cover federal employees?',
      a: 'No. Federal civilian employees who work in the District are covered by the federal workers’ compensation program run by the U.S. Department of Labor. The District of Columbia Workers’ Compensation Act of 1979, administered by the Office of Workers’ Compensation within the Department of Employment Services, covers private-sector employees working in DC.',
    },
    {
      q: 'How many weeks does DC pay for the loss of an arm or a leg?',
      a: `Under D.C. Code § 32-1508(3), the loss of an arm is compensated for ${arm} weeks, a leg for ${leg} weeks and a hand for ${hand} weeks, each at two thirds of the average weekly wage within the weekly maximum. Partial loss of use is paid as the same proportion of those weeks, based on the medical rating of the member.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:maryland', 'workers-comp:pennsylvania', 'workers-comp:delaware'],
});
