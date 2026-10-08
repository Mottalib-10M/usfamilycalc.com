import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct } from '../../../lib/kit';

const d = wc('michigan');
const max = d.ttd.max as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('michigan') as number;
const year = d.ttd.effective.slice(0, 4);

// Inputs are AFTER-TAX weekly wages, the figure Michigan's tables convert gross pay into.
// An assembler whose after-tax wage is $950, off seven weeks.
const asm = wcCalc('michigan', 950, 49);
// A tool-and-die maker netting $1,700 a week: capped.
const tool = wcCalc('michigan', 1700, 49);
// A cook netting $420 a week, back after nine days vs. after sixteen.
const c9 = wcCalc('michigan', 420, 9);
const c16 = wcCalc('michigan', 420, 16);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'michigan',
  title: `Michigan Workers Comp Calculator 2026: 80% After Tax`,
  description: `Michigan workers comp ${year}: wage loss is ${pct(d.ttd.rate)} of your after-tax average weekly wage from the WDCA tables, capped at ${usdx(max)} a week, with no weekly floor at all.`,
  intro: 'Michigan is one of the few states that starts from take-home pay, so two workers with the same gross wage can receive different checks.',
  resume: `Michigan pays weekly wage-loss benefits of ${pct(d.ttd.rate)} of the injured employee's after-tax average weekly wage (MCL 418.351). The after-tax figure is not your pay stub: it is read from the Workers' Disability Compensation Agency's ${year} benefit tables, which start from gross weekly wage and subtract federal tax, state tax and FICA according to your filing status and number of dependents on the date of injury. For ${year} injuries the weekly maximum is ${usdx(max)}, 90% of the state average weekly wage rounded up to the next dollar (MCL 418.355); there is no general minimum. An after-tax wage above about ${usd(atMax)} reaches the cap. No compensation is paid for an injury that keeps you out less than a week; benefits begin on the eighth day, and an incapacity of two weeks or more is paid from the date of injury (MCL 418.311). A worker whose after-tax wage is ${usd(950)} receives ${usd(asm.weekly)} a week, ${usd(asm.total)} over seven weeks. Benefits last as long as the disability does.`,
  body: (h) => `<h2>Filing status and dependents change the check</h2>
<p>Michigan's tables are the reason this state's calculator asks for an after-tax wage. Under MCL 418.313(2) the director publishes, each year, the average weekly wage converted to 80% of after-tax wage, and those ${h.ext(d.ttd.url, `${year} weekly benefit tables`)} are conclusive. A single filer with no dependents and a married worker with three children who both earn the same gross pay land on different lines, because the married worker's taxes are lower and the after-tax wage higher. The agency recommends that carriers apply only the single and married-filing-jointly statuses on their own, and use married-filing-separately only with evidence or the worker's agreement.</p>
<p>Once you have the after-tax wage, the arithmetic is simple. An assembler netting ${h.usd(950)} a week receives ${h.usd(asm.weekly)}. A tool-and-die maker netting ${h.usd(1700)} would compute to ${h.usd(tool.raw)} but is held to ${h.usd(tool.weekly)}. ${d.facts[0]?.text ?? ''}</p>

<h2>The first week and the second</h2>
<p>MCL 418.311 sets two thresholds. An injury that does not keep you from full wages for at least a week pays nothing; past a week, payments begin on the eighth day; and if incapacity reaches two weeks, the first week is added back. A cook netting ${h.usd(420)} who is back after nine days receives ${h.usd(c9.total)}; at sixteen days, ${h.usd(c16.total)}, with no day left unpaid.</p>

<h2>No floor, but a door after two years</h2>
<p>There is no minimum weekly benefit in Michigan's general wage-loss rules, which matters for part-time and low-wage workers. The statute offers a different remedy: a worker whose rate is below 50% of the state average weekly wage may petition after two years of continuous disability for a one-time increase, up to that 50% mark, if age, education, training or experience show that earnings would have grown (MCL 418.356). The increase is reimbursed to the carrier by the second injury fund.</p>
<p>Michigan pays wage loss, not impairment ratings. Specific losses of a limb or digit are paid for a fixed number of weeks from MCL 418.361 (a hand 215 weeks, an arm 269), and partial wage loss after a return to work is 80% of the difference in after-tax wages. No benefits accrue for periods of imprisonment. The ${h.aIf('child-support:michigan', 'Michigan child support page')} covers how these benefits enter a support order.</p>`,
  faqs: [
    {
      q: 'How do I find my after-tax wage for Michigan workers’ comp?',
      a: `Use the Workers' Disability Compensation Agency's annual tables. Find your gross average weekly wage, your federal filing status on the date of injury and your number of dependents; the table gives the weekly rate directly, already at 80% of after-tax wage and subject to the ${usdx(max)} maximum for ${year} injuries. The agency also offers a calculation program for coordinated benefits.`,
    },
    {
      q: 'Is there a minimum workers’ comp payment in Michigan?',
      a: 'Not for ordinary weekly wage-loss benefits. A low after-tax wage produces a proportionally low check. Michigan instead lets a worker paid less than 50% of the state average weekly wage ask a magistrate, after two years of continuous disability, for a single adjustment up to that level if the evidence shows earnings would have risen. Death benefits have their own minimum.',
    },
    {
      q: 'When does Michigan workers’ comp start paying after an injury?',
      a: `On the eighth day of incapacity. MCL 418.311 pays nothing if the injury keeps you from full wages for less than ${wait} days. If the incapacity continues for two weeks or longer, the first week is also paid and compensation is computed from the date of injury. Medical treatment is covered from the first day regardless.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:ohio', 'workers-comp:indiana', 'workers-comp:minnesota', 'child-support:michigan'],
});
