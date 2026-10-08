import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, num, day } from '../../../lib/kit';

const d = wc('nebraska');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const sixWeeks = (d.waiting.retroactiveAfterDays as number) + 1;
const atMax = wcWageAtMax('nebraska') as number;
const from = day(d.ttd.effective);

// A meatpacking line worker at $980 a week: 30 days, then 42.
const m30 = wcCalc('nebraska', 980, 30);
const m42 = wcCalc('nebraska', 980, sixWeeks);
// A rail conductor at $2,000 a week: capped.
const rail = wcCalc('nebraska', 2000, 56);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'nebraska',
  title: `Nebraska Workers Comp Calculator 2026: Six-Week Rule`,
  description: `Nebraska workers comp ${from.slice(-4)}: TTD pays ${pct(d.ttd.rate)} of gross wages, ${usdx(min)} to ${usdx(max)} a week, and the ${wait}-day waiting week is repaid only if disability lasts ${num(sixWeeks / 7)} weeks or more.`,
  intro: 'In Nebraska the unpaid first week of a work injury is made up only after six weeks of disability.',
  resume: `The Nebraska Workers' Compensation Act pays total disability at ${pct(d.ttd.rate)} of the wages received at the time of injury, no more than the maximum weekly income benefit and no less than the minimum (Neb. Rev. Stat. § 48-121). The Workers' Compensation Court lists the maximum as ${usdx(max)} for injuries from ${from}, equal to the state average weekly wage rounded up to the next dollar; the minimum is fixed by statute at ${usdx(min)}, and anyone earning less is paid the full wage. A wage of about ${usd(atMax)} reaches the cap. Benefits begin on the eighth calendar day of disability, and the seven-day waiting period is paid only if disability continues ${num(sixWeeks / 7)} weeks or longer (§ 48-119). A meatpacking worker earning ${usd(980)} who misses thirty days receives ${usd(m30.total)}; at six weeks, ${usd(m42.total)}. Partial disability is paid for at most 300 weeks, and the employee may choose a doctor who has treated the worker or the family.`,
  body: (h) => `<h2>The waiting week that takes six weeks to recover</h2>
<p>Many states repay the waiting period once a disability passes two or three weeks. Nebraska's threshold under § 48-119 is ${num(sixWeeks / 7)} weeks, and the waiting week is then paid only after those six weeks have elapsed. The difference is real money for mid-length injuries. A line worker earning ${h.usd(980)} who is off thirty days receives ${h.usd(m30.weekly)} a week but only for ${m30.paidDays} days, ${h.usd(m30.total)}; if the same injury keeps him home for ${sixWeeks} days, the first week is restored and the claim reaches ${h.usd(m42.total)}. The rule applies to temporary and permanent disability alike.</p>

<h2>A cap the Governor can freeze</h2>
<p>Under § 48-121.01, the maximum weekly income benefit is 100% of the state average weekly wage, computed to the next higher whole dollar and reset each January 1. The statute also lets the Governor hold a public hearing by November 15 and suspend the coming year's increase after weighing wage trends, benefit levels and premiums, an unusual power for a governor. The ${h.ext(d.ttd.url, 'Court’s benefit rates page')} lists ${h.usdx(max)} for ${from.slice(-4)}. A rail conductor earning ${h.usd(2000)} computes to ${h.usd(rail.raw)} and receives ${h.usd(rail.weekly)}. The ${h.usdx(min)} minimum, by contrast, is a fixed sum in the statute and does not follow wages.</p>

<h2>Scheduled members and loss of earning power</h2>
<p>Nebraska splits permanent disability in two. Loss or loss of use of a scheduled member is paid at ${pct(d.ttd.rate)} of wages for a fixed period, sixty weeks for a thumb and thirty-five for an index finger, in addition to temporary benefits, which stop once the permanent extent is known (§ 48-121(3)). Injuries to the body as a whole, such as the back, neck or head, are paid on the loss of earning capacity, usually after a loss of earning power evaluation, at ${pct(d.ttd.rate)} of the wage difference for up to 300 weeks. Losing two scheduled members in one accident counts as permanent total disability.</p>
<p>The employer must tell the employee about the right to name as treating physician a doctor who has treated the worker or a family member; otherwise the employer chooses. ${d.facts[3]?.text ?? ''} The ${h.aIf('child-support:nebraska', 'Nebraska child support page')} explains how benefits count in a support case, and ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')} covers settlements.</p>`,
  faqs: [
    {
      q: 'When does Nebraska pay the first week of a work injury?',
      a: `Only when the disability lasts ${num(sixWeeks / 7)} weeks or longer. Indemnity benefits start on the eighth calendar day; the seven-day waiting period is paid afterwards, once six weeks have passed since the accident, under Neb. Rev. Stat. § 48-119. Medical benefits start on the day of injury, and return-to-work services can begin once a permanent impairment keeps you from your old job.`,
    },
    {
      q: 'What is the Nebraska workers’ comp maximum for 2026?',
      a: `${usdx(max)} a week for injuries on or after ${from}, as published by the Nebraska Workers' Compensation Court. It equals the state average weekly wage rounded up to the next dollar. The minimum weekly income benefit is ${usdx(min)}, and a worker who earned less than that receives the full wage instead.`,
    },
    {
      q: 'Can the Nebraska Governor stop the workers’ comp maximum from rising?',
      a: 'Yes. Neb. Rev. Stat. § 48-121.01 allows the Governor, after a public hearing held by November 15 with thirty days’ notice, to order that the next year’s increase in the maximum weekly income benefit be suspended. The decision weighs economic conditions, general wage levels, benefit levels and premium levels in the state, and must be made by November 30.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:iowa', 'workers-comp:colorado', 'workers-comp:south-dakota', 'child-support:nebraska'],
});
