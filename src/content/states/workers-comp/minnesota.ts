import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, num, day } from '../../../lib/kit';

const d = wc('minnesota');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const tenth = (d.waiting.retroactiveAfterDays as number) + 1;
const weeks = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('minnesota') as number;
const from = day(d.ttd.effective);

// A Duluth ironworker at $1,350 a week: nine days off, then ten.
const i9 = wcCalc('minnesota', 1350, 9);
const i10 = wcCalc('minnesota', 1350, 10);
// The same worker, never released: three years of TTD hits the week limit.
const long = wcCalc('minnesota', 1350, 3 * 365);
// A surgeon-level wage at $3,000 a week is capped.
const high = wcCalc('minnesota', 3000, 70);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'minnesota',
  title: `Minnesota Workers Comp Calculator 2026: 130-Week TTD Cap`,
  description: `Minnesota workers comp from ${from}: TTD is ${pct(d.ttd.rate)} of the gross weekly wage, ${usdx(min)} to ${usdx(max)}, and stops for good after ${weeks} weeks of payments.`,
  intro: 'Minnesota counts TTD in weeks paid, not weeks elapsed, and stops it for good at a fixed total no matter how the case unfolds.',
  resume: `Minnesota pays temporary total disability at ${pct(d.ttd.rate)} of the weekly wage at the time of injury (Minn. Stat. § 176.101, subd. 1). Since October 1, 2024 the maximum is 108% of the statewide average weekly wage; for injuries on or after ${from} the Department of Labor and Industry lists ${usdx(max)} a week, and the minimum is ${usdx(min)} or the actual weekly wage if that is lower. A gross wage near ${usd(atMax)} reaches the maximum. The first ${wait} calendar days are unpaid, but if disability lasts ${tenth} days or longer compensation is computed from the first day (§ 176.121). TTD ceases on return to work, release without restrictions, or 90 days after maximum medical improvement, and it ends completely once ${weeks} weeks have been paid. An ironworker earning ${usd(1350)} who never returns collects ${usd(long.total)} before that wall. Permanent partial disability is paid on a separate dollar schedule, multiplying the whole-body rating by an amount set in the statute.`,
  body: (h) => `<h2>${num(weeks)} weeks, counted in payments</h2>
<p>Minnesota's limit is written in weeks of TTD actually paid. Initial and recommenced benefits are added together, and once the total reaches ${num(weeks)} weeks, TTD stops regardless of how much calendar time has passed (§ 176.101, subd. 1(k)). An approved retraining plan is the main exception. An ironworker earning ${h.usd(1350)} a week who stays off work receives ${h.usd(long.weekly)} a week and ${h.usd(long.total)} in all; after that, any further wage replacement has to come from permanent total or partial benefits. To make sure nobody is surprised, the insurer must warn the employee in writing after 52 weeks of TTD.</p>
<p>The ${num(weeks)}-week wall is rarely reached, because other events end TTD sooner: a return to work, a release with no restrictions, a refused job offer consistent with a rehabilitation plan, a failure to search diligently for work, or the passage of 90 days after maximum medical improvement. TTD can be restarted only in narrow cases, such as a layoff within 90 days after MMI or a medical inability to keep working.</p>

<h2>Day ten decides the first three</h2>
<p>Minnesota's waiting period is short but has a sharp edge. The first ${wait} calendar days are unpaid unless the disability continues ${tenth} calendar days or longer. Our ironworker back after nine days receives ${h.usd(i9.total)}; one more day and the whole period is paid, ${h.usd(i10.total)}. Disability starts on the first calendar day or part of a day the employee cannot work.</p>

<h2>A rate table that moves every October</h2>
<p>The ${h.ext(d.ttd.url, 'DLI compensation rate table')} lists the ceiling for each injury date since 1975. The jump to 108% of the statewide average weekly wage in 2024 raised the cap well above what 102% gave; a ${h.usd(3000)} weekly wage now pays ${h.usdx(high.weekly)}. ${d.facts[0]?.text ?? ''} The minimum is set at 20% of the maximum, so it rises with it.</p>
<p>Permanent partial disability does not use weeks of wages at all. ${d.ppd.text} The Workers' Compensation Advisory Council reviews that table in every even-year legislative session. For settlements and lump sums, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}.</p>`,
  faqs: [
    {
      q: 'How long can I receive TTD in Minnesota?',
      a: `No more than ${weeks} weeks of payments in total, under Minn. Stat. § 176.101, subd. 1(k), except while you are in an approved retraining plan. Initial and restarted periods count together. TTD usually ends earlier: when you return to work, are released without restrictions, or 90 days after you reach maximum medical improvement, and the insurer must remind you of the limit after 52 weeks.`,
    },
    {
      q: 'What is the Minnesota workers’ comp maximum for injuries after October 1, 2026?',
      a: `${usdx(max)} a week, which is 108% of the statewide average weekly wage that the Department of Labor and Industry uses for injuries on or after ${from}. The minimum is ${usdx(min)}, or your actual weekly wage if it is lower. Injuries between October 1, 2025 and September 30, 2026 keep the previous year's figures for the life of the claim.`,
    },
    {
      q: 'How is permanent partial disability paid in Minnesota?',
      a: 'As a dollar amount, not a number of weeks. The whole-body impairment rating set under the department’s rules is multiplied by an amount from a statutory table that rises with severity, from $114,260 for ratings under 5.5% to $567,840 for ratings of 95.5% to 100%. It becomes payable when TTD ends, and the employee can ask for a lump sum paid within 30 days.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:michigan', 'workers-comp:iowa', 'workers-comp:north-dakota', 'workers-comp:south-dakota'],
});
