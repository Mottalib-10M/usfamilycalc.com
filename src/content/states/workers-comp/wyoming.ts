import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, usd, usdx } from '../../../lib/kit';

const d = wc('wyoming');
const maxWeekly = d.ttd.max as number;
const minWeekly = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
// The monthly limits as published by DWS, read from the data's own text.
const money = (s: string) => Number((s.match(/\$([0-9,]+\.[0-9]{2})/) as RegExpMatchArray)[1].replace(/,/g, ''));
const samw = money(d.ttd.periodLabel.slice(d.ttd.periodLabel.indexOf('weekly equivalents')));
const floorMonthly = samw * 0.3;
const toWeekly = (monthly: number) => (monthly * 12) / 52;

// A Gillette oil field roustabout earning $7,500 a month: capped.
const rousta = wcWeekly('wyoming', toWeekly(7500));
// A Laramie motel housekeeper earning $2,400 a month.
const maid = wcWeekly('wyoming', toWeekly(2400));
// A Casper electrician earning $4,500 a month, off 6 days, then 10.
const e6 = wcCalc('wyoming', toWeekly(4500), 6);
const e10 = wcCalc('wyoming', toWeekly(4500), 10);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'wyoming',
  title: 'Wyoming Workers Comp Calculator 2026: Quarterly TTD Caps',
  description: `Wyoming workers comp for Q4 2026 injuries: TTD is two thirds of monthly pay, at least ${usdx(floorMonthly)} and at most ${usdx(samw)} a month, for up to 24 months in all.`,
  intro: 'Wyoming pays temporary total disability by the month and changes its limits every quarter.',
  resume: `Wyoming's Department of Workforce Services, Workers' Compensation Division, pays temporary total disability (TTD) monthly, half around the 15th and half around the 30th. The award is two thirds of the injured employee's actual monthly earnings or 30% of the statewide average monthly wage, whichever is greater, but never more than the lesser of 100% of the employee's own monthly earnings or the statewide average monthly wage for the twelve months before the quarter of injury. For injuries in October to December 2026, the department's wage table gives an average monthly wage of ${usdx(samw)}, the maximum, and a 30% floor of ${usdx(floorMonthly)}; in weekly terms, about ${usd(maxWeekly)} and ${usd(minWeekly)}. A worker earning ${usd(4500)} a month receives about ${usd(wcWeekly('wyoming', toWeekly(4500)) * 52 / 12)} a month. The first ${wait} days are unpaid unless the incapacity extends beyond ${retro} days, and TTD for one incident is limited to 24 cumulative months.`,
  body: (h) => `<h2>A limit that moves four times a year</h2>
<p>Wyoming Statute 27-14-403(c) ties both the TTD ceiling and its floor to the statewide average monthly wage for the twelve months before the calendar quarter in which you were hurt. The ${h.ext(d.ttd.url, 'DWS statewide average wage table')} therefore lists a new figure every quarter: ${h.usdx(samw)} for injuries in the fourth quarter of 2026. For the third quarter it was lower, ${h.usdx(money(d.ttd.periodLabel.slice(d.ttd.periodLabel.indexOf('Q3'))))}. Two workers injured a few weeks apart, on either side of October 1, can have different limits. The weekly figures on this page are the monthly ones times twelve, divided by fifty-two.</p>

<h2>The 30% floor, and its own limit</h2>
<p>The floor is 30% of the state average monthly wage, ${h.usdx(floorMonthly)} a month. A motel housekeeper in Laramie earning ${h.usd(2400)} a month would get ${h.usd(1600)} at two thirds; the floor lifts her above that, to about ${h.usd(maid * 52 / 12)}. But the statute also limits TTD to 100% of actual monthly earnings, so a part-time worker earning less than the floor receives his whole wage, not the floor. The calculator applies the floor as a fixed amount; if your monthly pay is below ${h.usdx(floorMonthly)}, your TTD is your pay. At the top, an oil field roustabout in Gillette earning ${h.usd(7500)} a month is held to ${h.usdx(samw)}, about ${h.usd(rousta)} a week.</p>

<h2>Eight days, and 24 months</h2>
<p>Section 27-14-404(d) withholds the first ${wait} days of disability unless the incapacity extends beyond ${retro} days; the day of injury counts unless full wages were paid for it, and no one can be forced to use sick leave first. A Casper electrician earning ${h.usd(4500)} a month who is off six days receives ${h.usd(e6.total)}; off ten days, ${h.usd(e10.total)}. You must apply for TTD, and a claim filed late for a certified period is not paid. The cumulative limit is 24 months per incident, extendable by the Division only in extraordinary circumstances, and TTD stops at a release to work or once a permanent award is paid.</p>

<h2>After TTD</h2>
<p>${d.ppd.text} ${d.facts[2].text} For settlements in other states, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}.</p>`,
  faqs: [
    {
      q: 'What is the most Wyoming workers’ comp pays a month in late 2026?',
      a: `${usdx(samw)} a month for injuries in October, November or December 2026, the statewide average monthly wage that the Department of Workforce Services lists for that quarter. TTD is two thirds of your monthly earnings or 30% of that average, whichever is greater, but never more than your own monthly earnings. The figure changes every quarter.`,
    },
    {
      q: 'How long can I receive TTD in Wyoming?',
      a: 'Up to 24 cumulative months for injuries from any one incident, under Wyoming Statute 27-14-404(a). The Workers’ Compensation Division may award more in extraordinary circumstances, and that decision can be reviewed by a hearing examiner only for abuse of discretion. TTD ends earlier if you return to work or recover your earning power, or once a permanent impairment award starts.',
    },
    {
      q: 'Can I get Wyoming TTD and unemployment benefits at the same time?',
      a: 'No. Section 27-14-404(d) bars TTD for any period in which you receive unemployment compensation. If TTD ends and you are not going straight back to full-time work, the department says you may file for unemployment; to keep wage credits earned before the injury, file within 60 calendar days of the TTD determination and within 36 months of the injury.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:montana', 'workers-comp:south-dakota', 'workers-comp:utah'],
});
