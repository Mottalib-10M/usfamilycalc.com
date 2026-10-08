import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('new-jersey');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const atMax = wcWageAtMax('new-jersey') as number;
const year = d.ttd.effective.slice(0, 4);

// A Newark port checker at $1,100 a week: seven days, then eight.
const p7 = wcCalc('new-jersey', 1100, wait);
const p8 = wcCalc('new-jersey', 1100, wait + 1);
// A pharmaceutical chemist at $2,300 a week, ten weeks out: capped.
const chem = wcCalc('new-jersey', 2300, 70);
// A part-time aide at $350 a week: lifted to the minimum.
const aide = wcCalc('new-jersey', 350, 28);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'new-jersey',
  title: `New Jersey Workers Comp Calculator 2026: 70% of Wages`,
  description: `New Jersey workers comp ${year}: temporary disability pays ${pct(d.ttd.rate)} of the average weekly wage, ${usdx(min)} to ${usdx(max)} a week, once you have been out of work more than ${wait} days.`,
  intro: 'New Jersey replaces a larger share of the paycheck than most states, while letting the employer choose the doctor.',
  resume: `New Jersey pays temporary total disability at ${pct(d.ttd.rate)} of the injured worker's average weekly wage, not more than 75% and not less than 20% of the Statewide Average Weekly Wage (N.J.S.A. 34:15-12). For ${year} injuries the Division of Workers' Compensation sets the range at ${usdx(min)} to ${usdx(max)} a week; the same ${usdx(max)} caps permanent partial, permanent total and dependency benefits. A wage of about ${usd(atMax)} reaches the maximum. A worker must be unable to work for more than ${wait} days, counting weekends and holidays, before benefits are owed; once that happens they are paid back to the first day. A port checker earning ${usd(1100)} who is out eight days receives ${usd(p8.total)}, but nothing for an absence of exactly ${wait} days. Benefits continue while the worker is under active medical care and unable to work, usually until a return to work or maximum medical improvement. Permanent partial disability follows a schedule of weeks for named body parts and a 600-week scale for the rest of the body.`,
  body: (h) => `<h2>Seventy percent, and the employer picks the doctor</h2>
<p>New Jersey's ${pct(d.ttd.rate)} rate is above the two thirds most states pay, and the floor of ${h.usdx(min)} is high, so a part-time aide earning ${h.usd(350)} a week receives ${h.usd(aide.weekly)}, more than ${pct(d.ttd.rate)} of her wage. In exchange, the law gives the employer and its insurer the right to select the physicians who treat the injury (N.J.S.A. 34:15-15). A worker unhappy with that care cannot simply switch at the insurer's expense; the remedy is a Motion for Medical and/or Temporary Disability Benefits before a judge of compensation.</p>
<p>The ${h.ext(d.ttd.url, 'Division’s rate table')} sets one maximum, ${h.usdx(max)} in ${year}, for temporary disability, permanent partial, permanent total and death benefits. ${d.facts[0]?.text ?? ''} A chemist earning ${h.usd(2300)} a week computes to ${h.usd(chem.raw)} and receives ${h.usd(chem.weekly)}, or ${h.usd(chem.total)} over ten weeks.</p>

<h2>The eighth day</h2>
<p>New Jersey's waiting period is all or nothing. Medical care and permanent disability benefits are owed regardless of lost time, but temporary disability starts only when the worker has been out more than ${wait} days, and the days do not have to be consecutive. Our port checker earning ${h.usd(1100)} receives ${h.usd(p7.total)} for a ${wait}-day absence and ${h.usd(p8.total)} for an eight-day one, because the waiting days are then paid retroactively.</p>

<h2>Scheduled and non-scheduled losses</h2>
<p>When a lasting impairment remains, New Jersey pays permanent partial disability weekly, starting after temporary disability ends. ${d.ppd.text} The weekly PPD rate itself depends on the size of the award, which is why the official chart lists a separate dollar total for each percentage.</p>
<p>Two other rules shape claims here. If the injury was caused by a third party, the employer or carrier generally recovers two thirds of its payments, less $750, from any settlement (N.J.S.A. 34:15-40). And a formal claim petition must be filed within two years of the injury or the last payment of compensation, whichever is later. The ${h.aIf('child-support:new-jersey', 'New Jersey child support page')} explains how benefits count as income, and ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')} covers settlements.</p>`,
  faqs: [
    {
      q: 'What percentage of my wage does New Jersey workers’ comp pay?',
      a: `${pct(d.ttd.rate)} of your average weekly wage, within limits of 20% and 75% of the Statewide Average Weekly Wage. For ${year} injuries that means at least ${usdx(min)} and at most ${usdx(max)} a week. Benefits are not taxed. The ${year} maximum reflects the $1,598.66 statewide average weekly wage for 2024, which New Jersey uses two years later.`,
    },
    {
      q: 'Can I choose my own doctor for a New Jersey work injury?',
      a: 'Not at the insurer’s expense. N.J.S.A. 34:15-15 lets the employer and its insurance carrier select the doctors who treat a work injury. If they refuse or neglect to provide reasonable and necessary treatment, the worker can file a Motion for Medical and/or Temporary Disability Benefits with the Division of Workers’ Compensation and ask a judge of compensation to order the treatment.',
    },
    {
      q: 'Is there a waiting period for New Jersey temporary disability benefits?',
      a: `Yes. You must be unable to work for more than ${wait} days, weekends and holidays included, before temporary disability is payable. The days need not be consecutive. Once you pass that point, benefits are retroactive to the first day. There is no waiting period for medical treatment or for permanent disability benefits.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:new-york', 'workers-comp:pennsylvania', 'workers-comp:delaware', 'child-support:new-jersey'],
});
