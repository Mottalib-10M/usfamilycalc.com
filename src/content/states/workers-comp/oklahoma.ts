import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('oklahoma');
const max = d.ttd.max as number;
const rate = d.ttd.rate;
const wait = d.waiting.days as number;
const cap = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('oklahoma') as number;
const from = day(d.ttd.effective);

// A Tulsa roofer at $1,000 a week, off two days, then ten.
const r2 = wcCalc('oklahoma', 1000, 2);
const r10 = wcCalc('oklahoma', 1000, 10);
// An Oklahoma City crane operator at $1,900 a week, off the full statutory period.
const crane = wcCalc('oklahoma', 1900, cap * 7 + 30);
// A part-time cashier at $300 a week: no floor.
const cashier = wcWeekly('oklahoma', 300);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'oklahoma',
  title: `Oklahoma Workers Comp Calculator 2026: ${pct(rate)} of Your AWW`,
  description: `Oklahoma workers comp for 2026 injuries: TTD is ${pct(rate)} of your average weekly wage up to ${usdx(max)} a week, for at most ${cap} weeks, under the 85A Administrative Act.`,
  intro: 'Oklahoma pays seventy cents on the dollar instead of two thirds, but limits temporary disability to three years and sets no minimum.',
  resume: `Under the Administrative Workers' Compensation Act (Title 85A), an Oklahoma worker who cannot do his job or any alternative work the employer offers receives temporary total disability (TTD) equal to ${pct(rate)} of the average weekly wage. For injuries from ${from} to December 31, 2026, the weekly check is capped at ${usdx(max)}, 100% of the state average weekly wage, so the cap binds once pay passes about ${usd(atMax)} a week. There is no minimum weekly amount. The first ${wait} days of the initial TTD period are never paid, however long the disability lasts, and TTD runs for no more than ${cap} weeks, with up to 52 more weeks if an administrative law judge finds a consequential injury that needs time to heal. A worker earning ${usd(1000)} a week receives ${usd(wcWeekly('oklahoma', 1000))}. The Oklahoma Workers' Compensation Commission publishes the yearly rates.`,
  body: (h) => `<h2>Seventy percent, and three days that never come back</h2>
<p>Oklahoma is one of the states that replaces ${h.pct(rate)} of wages rather than two thirds. A Tulsa roofer earning ${h.usd(1000)} a week gets ${h.usd(r10.weekly)}, about ${h.usd(r10.weekly - 1000 * 2 / 3)} more than a two-thirds state would pay on the same wage. The trade-off is in the calendar. Section 45 of Title 85A says there is no payment for the first ${wait} days of the initial period of TTD, and unlike most acts it does not pay them back later. Off two days, the roofer receives ${h.usd(r2.total)}; off ten days, ${h.usd(r10.total)}, which covers seven days, not ten.</p>

<h2>The 2019 ceiling change</h2>
<p>The ${h.ext(d.ttd.url, 'Commission’s weekly compensation chart')} shows how HB2367 reshaped the maximum. Before May 29, 2019, TTD was capped at 70% of the state average weekly wage; since then the cap is the full state average. The rate is fixed on January 1 of the year after the Oklahoma Employment Security Commission determines it, so a 2026 injury uses ${h.usdx(max)} for the whole claim. A crane operator earning ${h.usd(1900)} reaches it.</p>

<h2>${cap} weeks, then the rating</h2>
<p>TTD stops at ${cap} weeks even if the worker has not recovered, unless a judge extends it for a consequential injury on clear and convincing medical evidence. The crane operator who stays off longer than that collects ${h.usd(crane.total)} in TTD, and the calculator stops counting at the cap. The employer can also end TTD when the worker is released from active treatment, or misses three consecutive appointments without excuse; an objection filed within ten days brings a hearing within twenty days. ${d.facts[2].text}</p>

<h2>No floor for part-time pay</h2>
<p>Without a minimum, a part-time cashier earning ${h.usd(300)} a week receives ${h.usd(cashier)}, exactly ${h.pct(rate)} of her wage. Permanent partial disability is paid under a separate, much lower weekly cap: ${d.ppd.text}</p>
<p>For settlements and ratings, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}; for TTD in a support order, the ${h.aIf('child-support:oklahoma', 'Oklahoma child support calculator')}.</p>`,
  faqs: [
    {
      q: 'What percentage of my wage does Oklahoma workers’ comp pay?',
      a: `${pct(rate)} of your average weekly wage for temporary total disability, permanent partial and permanent total disability, which is more than the two thirds used in most states. For 2026 injuries the TTD check cannot exceed ${usdx(max)} a week. Oklahoma sets no minimum weekly benefit, so a low-wage or part-time worker receives exactly ${pct(rate)} of what he earned.`,
    },
    {
      q: 'How long can I receive TTD in Oklahoma?',
      a: `Up to ${cap} weeks for injuries from any one accident. An administrative law judge may add up to 52 weeks when a consequential injury needs more time to reach maximum medical improvement, but only on clear and convincing medical evidence. TTD ends sooner on release from active treatment, and noncompliance with treatment for sixty days ends it permanently.`,
    },
    {
      q: 'Are the first three days of an Oklahoma work injury ever paid?',
      a: `No. Title 85A says there is no payment for the first ${wait} days of the initial period of temporary total disability, and it does not add a rule that pays them back after a longer absence, as many states do. A worker off for a month therefore receives benefits for the month minus those ${wait} days. The rule applies to the initial period only, not to later periods of TTD.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:texas', 'workers-comp:arkansas', 'workers-comp:missouri', 'child-support:oklahoma'],
});
