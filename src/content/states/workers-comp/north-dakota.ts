import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, day } from '../../../lib/kit';

const d = wc('north-dakota');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const atMax = wcWageAtMax('north-dakota') as number;
const from = day(d.ttd.effective);
const threshold = (d.waiting.days as number) + 1;

// A Williston pipefitter at $2,600 a week, off five weeks after a fall from a pump jack.
const fitter = wcCalc('north-dakota', 2600, 35);
// A Fargo grain elevator hand at $1,000 a week, off four days, then six.
const hand4 = wcCalc('north-dakota', 1000, 4);
const hand6 = wcCalc('north-dakota', 1000, 6);
// A part-time school custodian at $500 a week.
const custodian = wcWeekly('north-dakota', 500);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'north-dakota',
  title: 'North Dakota Workers Comp Calculator 2026: WSI Wage Loss',
  description: `North Dakota workers comp from ${from}: WSI pays two thirds of gross wages, ${usd(min)} to ${usd(max)} a week in 2026, once you lose ${threshold} days or more of work in a row.`,
  intro: 'In North Dakota there is no private insurer to deal with: Workforce Safety & Insurance writes every policy and pays every wage-loss check.',
  resume: `Workforce Safety & Insurance (WSI), the state agency that is the only workers' compensation carrier in North Dakota, pays temporary total disability at two thirds of the gross average weekly wage. For a disability that begins on or after ${from}, the weekly check cannot exceed ${usd(max)} nor fall below ${usd(min)}, the floor being replaced by net wages when those are lower. Those limits are 125% and 60% of the state average weekly wage, reset every July 1, and the rates in force on the first day of disability follow the claim. A worker earning ${usd(1000)} a week receives ${usd(wcWeekly('north-dakota', 1000))}, and the ceiling is reached at roughly ${usd(atMax)} of weekly pay. Nothing is paid for a disability shorter than ${threshold} consecutive days. WSI adds a dependency allowance for each child, cannot be bypassed by an employer who prefers sick leave, and offsets half of any Social Security disability benefit.`,
  body: (h) => `<h2>One payer for the whole state</h2>
<p>Most Americans file a claim with their employer's insurance company. North Dakotans file with ${h.ext(d.agency.url, d.agency.name)}, which describes itself as the sole provider and administrator of the system: it collects the premiums and decides the claims. The rules below are therefore applied by one claims staff, under Century Code chapter 65-05, with no carrier-by-carrier variation in how a wage is averaged or when a check goes out. When you disagree with a decision, the decision you contest is always a WSI decision.</p>

<h2>A ceiling set at 125% of the state wage</h2>
<p>The weekly maximum here is not tied to the state average weekly wage one for one, as in many states, but to five quarters of it: ${h.usd(max)} for disabilities from ${from}. The consequence is that high earners keep two thirds of their pay much longer than elsewhere. A Williston pipefitter earning ${h.usd(2600)} a week computes to ${h.usd(fitter.raw)}, and only then hits the cap, so he receives ${h.usd(fitter.weekly)}; after five weeks off, that is ${h.usd(fitter.total)}. The floor works in the other direction: it guarantees ${h.usd(min)} a week, 60% of the state average, unless the worker's net take-home pay was smaller. A part-time custodian earning ${h.usd(500)} gross therefore receives ${h.usd(custodian)} in the calculator, and less in reality if her net wages after federal tax and Social Security are under that floor. WSI also caps any weekly benefit at net wages, a limit the calculator does not reproduce.</p>

<h2>The five-day test</h2>
<p>Section 65-05-08 refuses wage loss for a disability shorter than ${threshold} consecutive calendar days, and says nothing about a further waiting week. A grain elevator hand earning ${h.usd(1000)} who misses four days receives ${h.usd(hand4.total)}; at six days he receives ${h.usd(hand6.total)}. Your employer cannot make you burn sick leave or vacation before WSI pays, though it may let you top up the difference.</p>

<h2>What gets added and what gets taken</h2>
<p>${d.facts[2].text} On the other side of the ledger, each child under 18 in the household, or supported under a court order, adds a dependency allowance to the check, and a worker who retires or starts Social Security retirement is presumed out of the labor market, which ends wage loss. Permanent impairment is a separate lump sum: ${d.ppd.text}</p>
<p>For settlements and impairment awards in general, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}.</p>`,
  faqs: [
    {
      q: 'Can I file a North Dakota workers’ comp claim with a private insurer?',
      a: `No. Workforce Safety & Insurance describes itself as the sole provider and administrator of workers' compensation in North Dakota, so your claim, your wage-loss checks and any denial all come from WSI. The same agency sets the rates each July 1, decides the claims and sends the checks, so one set of procedures applies to every employer in the state.`,
    },
    {
      q: 'What is the most WSI pays per week in North Dakota for 2026?',
      a: `${usd(max)} a week for a disability that starts on or after ${from}, which is 125% of the state average weekly wage. Two thirds of your gross average weekly wage reaches that ceiling at about ${usd(atMax)}. The figure in force on your first day of disability stays with the claim, so a later July 1 increase does not raise it.`,
    },
    {
      q: 'Does North Dakota pay for the first days I miss work?',
      a: `Only if the disability lasts ${threshold} consecutive calendar days or more; shorter absences receive no wage loss at all. The statute does not create an extra unpaid week beyond that, so a disability of six days is paid for the whole period in this calculator. Your employer cannot require you to use sick leave or vacation before WSI benefits begin.`,
    },
    {
      q: 'How much does WSI add for children on a North Dakota claim?',
      a: `A dependency allowance is added to wage loss for each child under 18 who lives with you or whom you must support under a court order, as WSI explains on its wage-loss page. The allowance comes on top of the two-thirds benefit, so it is the one case where the check can exceed what the calculator shows for your wage alone.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:south-dakota', 'workers-comp:minnesota', 'workers-comp:montana'],
});
