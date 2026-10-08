import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, day } from '../../../lib/kit';

const d = wc('vermont');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const atMax = wcWageAtMax('vermont') as number;
const from = day(d.ttd.effective);
const child = 20; // dependent child allowance per week until July 1, 2028 (21 V.S.A. § 642(b)(1))

// A Burlington software developer at $2,500 a week.
const dev = wcWeekly('vermont', 2500);
// A Stowe ski lift operator at $680 a week, two children, off 3 days, then 10.
const lift = wcWeekly('vermont', 680);
const liftKids = lift + 2 * child;
const l3 = wcCalc('vermont', 680, 3);
const l10 = wcCalc('vermont', 680, 10);
// A Rutland nursing assistant at $560 a week.
const cna = wcWeekly('vermont', 560);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'vermont',
  title: `Vermont Workers Comp Calculator 2026: Up to ${usd(max)}`,
  description: `Vermont workers comp from ${from}: two thirds of the AWW plus ${usd(child)} per child, between ${usd(min)} and ${usd(max)} a week, with yearly cost-of-living raises every July.`,
  intro: 'Vermont sets its weekly maximum at one and a half times the average wage and raises long-running checks every July.',
  resume: `Vermont pays temporary total disability at two thirds of the average weekly wage, computed from the 26 weeks before the injury, with earnings from concurrent employers combined. For injuries from ${from} to June 30, 2027, the Department of Labor sets the weekly maximum at ${usdx(max)}, which is 150% of the state average compensation, and the minimum at ${usdx(min)}, which is 50% of it. Workers whose average weekly wage is lower than the minimum receive 90% of that wage. On top of the benefit, the employer pays ${usd(child)} a week for each dependent child under 21. A worker earning ${usd(1200)} receives ${usd(wcWeekly('vermont', 1200))}; the maximum binds only above about ${usd(atMax)}. The first ${wait} days are not paid, the day of the accident counting as the first unless full wages were paid for it. After 26 weeks of benefits, the check is adjusted every July 1 to keep pace with the state wage.`,
  body: (h) => `<h2>A ceiling few paychecks reach</h2>
<p>21 V.S.A. § 601(18) fixes the maximum at 150% of the state average compensation, rounded up. The result for 2026-27, ${h.usdx(max)} a week on the ${h.ext(d.ttd.url, 'Department of Labor’s annual rate table')}, means that a software developer in Burlington earning ${h.usd(2500)} receives the full two thirds of her pay, ${h.usd(dev)}. The same table shows how far the cap has moved: injuries before July 1, 1986 are measured against a separate, lower maximum that still appears in its own column.</p>

<h2>Ninety percent at the bottom</h2>
<p>Below the minimum, Vermont does not pay a flat amount. Section 601(19) gives temporary disability recipients 90% of their average weekly wage when that wage is lower than ${h.usdx(min)}. A nursing assistant in Rutland earning ${h.usd(560)} receives ${h.usd(cna)}. For permanent disability, the same worker would receive 100% of her wage instead.</p>

<h2>Children and the 2028 cut</h2>
<p>Each dependent child under 21 adds ${h.usd(child)} a week, if no other injured worker already claims that child. A ski lift operator at Stowe earning ${h.usd(680)} with two children receives ${h.usd(lift)} plus ${h.usd(2 * child)}, ${h.usd(liftKids)} in all. The statute already contains the next version of that rule: from July 1, 2028, the allowance returns to $10 per child. The calculator leaves the allowance out, so add it yourself.</p>

<h2>Three days, and a fourth to qualify</h2>
<p>Section 642 excludes the first ${wait} days of total disability and contains no clause that pays them back later; the Department explains that a worker must be disabled four days or more to receive anything. The lift operator off three days receives ${h.usd(l3.total)}; off ten days, ${h.usd(l10.total)}. Insurers may stop payments only by filing a supported Form 27 with the worker and the Department, for instance on a return to work or at maximum medical improvement.</p>

<h2>The July adjustment</h2>
<p>${d.facts[0].text} Permanent partial impairment is then paid for a number of weeks: ${d.ppd.text} For settlements, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}.</p>`,
  faqs: [
    {
      q: 'What is the Vermont workers’ comp maximum for 2026-27?',
      a: `${usdx(max)} a week for injuries from ${from} through June 30, 2027, set by the Vermont Department of Labor at 150% of the state average compensation. The minimum is ${usdx(min)}. Injuries that occurred before July 1, 1986 use a different, lower maximum column in the same table. Your benefit is two thirds of your average weekly wage between those limits.`,
    },
    {
      q: 'Do Vermont comp benefits go up while I am out of work?',
      a: `Yes. After you have received 26 weeks of benefits, your weekly compensation is adjusted on the first July 1 and on every July 1 after that, so that it keeps the same percentage relationship to the state average weekly wage as on the date of injury. The Department publishes the yearly adjustment factor in its rate table.`,
    },
    {
      q: 'How much extra does Vermont pay for a dependent child?',
      a: `${usd(child)} a week for each dependent child under 21, paid during the disability in addition to the two-thirds benefit, as long as no other injured worker receives the same allowance for that child. The statute already provides that the allowance drops to $10 a week per child on July 1, 2028.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:new-hampshire', 'workers-comp:new-york', 'workers-comp:massachusetts'],
});
