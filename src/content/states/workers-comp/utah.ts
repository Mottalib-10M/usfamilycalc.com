import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, day } from '../../../lib/kit';

const d = wc('utah');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const cap = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('utah') as number;
const from = day(d.ttd.effective);
// Dependent allowance per dependent (spouse, and each child under 18 up to four), from the 2026 Quick Reference Guide.
const dep = 20;

// An Ogden aerospace technician at $1,350 a week, married with three children.
const tech = wcWeekly('utah', 1350);
const techFamily = Math.min(tech + dep * 4, max, 1350);
// A Provo barista at $420 a week, single parent of one child.
const barista = wcWeekly('utah', 420);
const baristaFamily = Math.min(barista + dep, 420);
// A St. George landscaper at $1,000, off 12 days, then 16.
const l12 = wcCalc('utah', 1000, 12);
const l16 = wcCalc('utah', 1000, 16);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'utah',
  title: `Utah Workers Comp Calculator 2026: ${usd(max)} Max + Dependents`,
  description: `Utah workers comp from ${from}: TTD is two thirds of the AWW plus ${usd(dep)} per dependent, capped at ${usdx(max)} a week, for at most ${cap} weeks within twelve years.`,
  intro: 'Utah adds a fixed amount for a spouse and each young child, and counts the 312-week limit across twelve years.',
  resume: `The Utah Labor Commission's Division of Industrial Accidents publishes the rates each July. For injuries from ${from} through June 30, 2027, the state average weekly wage is ${usdx(max)}, and temporary total disability is 66 2/3% of the employee's average weekly wage, plus $20 for a dependent spouse and $20 for each dependent child under 18, up to four children. The total may not exceed the employee's own wage nor the state average weekly wage, so the cap is reached at about ${usd(atMax)} of pay before allowances. The minimum is ${usdx(min)} a week plus the same allowances. A single worker earning ${usd(1000)} receives ${usd(wcWeekly('utah', 1000))}. TTD may not exceed ${cap} weeks over a period of twelve years from the injury. The first ${wait} calendar days after the injury are unpaid unless the disability extends beyond ${retro} days; the waiting period is established once, and its days need not be consecutive.`,
  body: (h) => `<h2>Family size on the check</h2>
<p>Utah adds a dependent allowance to temporary disability itself. The ${h.ext(d.ttd.url, '2026 Quick Reference Guide')} sets it at ${h.usd(dep)} a week for a dependent spouse and ${h.usd(dep)} for each child under 18, with a maximum of four children; before July 1, 2018 it was $5. An aerospace technician in Ogden earning ${h.usd(1350)}, married with three children, receives ${h.usd(tech)} on his wage alone and ${h.usd(techFamily)} with the allowances. The calculator shows only the wage part: add ${h.usd(dep)} per eligible dependent, then cut the total back to your own weekly wage or ${h.usdx(max)}, whichever is lower.</p>
<p>At the bottom of the scale, the allowances matter more. A barista in Provo earning ${h.usd(420)}, raising one child, receives ${h.usd(barista)} plus ${h.usd(dep)}, which is ${h.usd(baristaFamily)}. The statutory minimum of ${h.usdx(min)} plus allowances rarely binds for full-time work.</p>

<h2>Twelve years to use 312 weeks</h2>
<p>Utah's limit has two parts: no more than ${cap} weeks of compensation at up to the state average weekly wage, and no payments more than twelve years after the date of injury. A long claim with interruptions is therefore measured both in weeks paid and in calendar years. Temporary partial disability shares the same limits. TTD also ends on a return to regular work, an offer of suitable light duty, or medical stability.</p>

<h2>Three days, counted once</h2>
<p>A landscaper in St. George earning ${h.usd(1000)} who is off twelve days receives ${h.usd(l12.total)}: the first ${wait} calendar days after the injury are not paid. Off sixteen days, he receives ${h.usd(l16.total)}, the three days included. The waiting period is established only once per claim, its days need not be consecutive, and it does not apply when the worker is placed on light duty at a lower wage.</p>

<h2>After stability</h2>
<p>Permanent partial disability uses a lower ceiling, two thirds of the state average weekly wage. ${d.facts[2].text} For settlements, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}; for comp income in a support case, the ${h.aIf('child-support:utah', 'Utah child support calculator')}.</p>`,
  faqs: [
    {
      q: 'How much does Utah workers’ comp add for my children?',
      a: `$20 a week for each dependent child under 18, up to four children, and $20 for a dependent spouse, added to temporary total, temporary partial and permanent partial benefits. The total weekly check still cannot exceed your own average weekly wage, nor ${usdx(max)} for 2026-27 injuries. Before July 1, 2018, the allowance was only $5 per dependent.`,
    },
    {
      q: 'How long can I get temporary disability in Utah?',
      a: `Up to ${cap} weeks of temporary total disability within twelve years of the date of injury, under Utah Code section 34A-2-410. Payments stop earlier when you return to regular work, when your employer offers suitable light duty, or when you reach medical stability. Temporary partial disability has the same ${cap}-week and twelve-year limits.`,
    },
    {
      q: 'Does Utah pay the first three days of a work injury?',
      a: `Only if the temporary total disability extends beyond ${retro} calendar days. Otherwise, no compensation is payable for the first ${wait} calendar days after the day of injury. The waiting period is established once per claim, its days do not need to be consecutive, and it does not apply when you are placed on light duty at lower pay.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:nevada', 'workers-comp:colorado', 'workers-comp:wyoming', 'child-support:utah'],
});
