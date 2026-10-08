import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, num, day } from '../../../lib/kit';

const d = wc('nevada');
const max = d.ttd.max as number;
const wait = d.waiting.days as number;
const atMax = wcWageAtMax('nevada') as number;
const from = day(d.ttd.effective);

// A Las Vegas casino dealer at $1,150 a week: four days, then five.
const deal4 = wcCalc('nevada', 1150, wait - 1);
const deal5 = wcCalc('nevada', 1150, wait);
// A Reno warehouse manager at $2,600 a week: capped, six weeks.
const mgr = wcCalc('nevada', 2600, 42);
// PPD: 0.6% of the average monthly wage per 1% of whole-person impairment (NRS 616C.490(8)).
const amw = 5200;
const ppdRating = 12;
const ppdMonthly = amw * 0.006 * ppdRating;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'nevada',
  title: `Nevada Workers Comp Calculator 2026: Monthly Wage Basis`,
  description: `Nevada workers comp from ${from}: TTD is ${pct(d.ttd.rate)} of the average monthly wage, at most ${usdx(max)} a week by DIR's daily rate, and starts once you miss ${wait} days.`,
  intro: 'Nevada computes workers’ compensation on a monthly wage, then pays it every two weeks at a daily rate.',
  resume: `Nevada pays temporary total disability at ${pct(d.ttd.rate)} of the injured employee's average monthly wage (NRS 616C.475), and caps that wage at 150% of the state average weekly wage multiplied by 4.33 (NRS 616A.065). For fiscal year 2027, which covers injuries from ${from} to June 30, 2027, the Division of Industrial Relations computes a maximum of $5,691.79 a month, $186.98 a day, which it states as ${usdx(max)} a week. A gross weekly wage of about ${usd(atMax)} reaches it. Nevada has no minimum benefit. No temporary compensation is paid unless the injury keeps the employee from full wages for at least ${wait} consecutive days, or ${wait} days within a 20-day period; once that happens, benefits are computed from the date of injury (NRS 616C.400). A casino dealer earning ${usd(1150)} a week who misses ${wait} days receives ${usd(deal5.total)}. TTD has no week limit; it ends when a doctor finds the worker able to do suitable work or the employer offers light duty. Permanent partial disability is paid monthly for at least five years.`,
  body: (h) => `<h2>A monthly wage behind the weekly figure</h2>
<p>Nevada's benefit statutes are written in months. The wage is an average monthly wage, the rate is ${pct(d.ttd.rate)} of it, and the cap is written in months. ${d.facts[0]?.text ?? ''} The ${h.ext(d.ttd.url, 'DIR maximum compensation memo')} converts the monthly maximum into a daily amount by dividing by 30.44, and the usual payment covers 14 days. The weekly figure used by the calculator above is the Division's own daily rate times seven, so expect a few cents of difference from the insurer's biweekly check.</p>
<p>A Reno warehouse manager earning ${h.usd(2600)} a week computes to ${h.usd(mgr.raw)} and is held to ${h.usdx(mgr.weekly)}; six weeks off pays ${h.usd(mgr.total)}.</p>

<h2>Five days, consecutive or scattered</h2>
<p>NRS 616C.400 sets the threshold as five consecutive days, or five cumulative days within a 20-day period, of being unable to earn full wages. Below that line nothing is paid; at or above it, compensation runs from the date of injury. A dealer earning ${h.usd(1150)} who misses ${wait - 1} days receives ${h.usd(deal4.total)}; one more day off turns it into ${h.usd(deal5.total)}. The cumulative rule protects workers who go back for a few shifts and then have to stop again. The first check must be issued within 14 working days after the insurer receives the initial certification of disability, and no TTD accrues during incarceration.</p>

<h2>Five years or age seventy</h2>
<p>Permanent partial disability starts with a rating by a physician or chiropractic physician picked from the Administrator's list, using the AMA Guides; the insurer must schedule the rating within 30 days of a report that the worker is stable and ratable. Each 1% of whole-person impairment is worth a monthly payment of 0.6% of the average monthly wage for injuries since 2000, paid for five years or until age 70, whichever is later (NRS 616C.490(8)). A worker with an average monthly wage of ${h.usd(amw)} and a ${num(ppdRating)}% rating would receive ${h.usd(ppdMonthly)} a month; a 64-year-old would be paid for six years, a 40-year-old for five.</p>
<p>TTD stops when a physician finds the worker capable of any gainful employment suited to education, training and experience, or when the employer offers light-duty or modified work within the restrictions. For how lump sums and settlements work, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}.</p>`,
  faqs: [
    {
      q: 'What is the maximum workers’ comp payment in Nevada for 2026?',
      a: `For injuries from ${from} through June 30, 2027, the Division of Industrial Relations sets the maximum at $5,691.79 a month, $186.98 a day, or ${usdx(max)} a week, which is ${pct(d.ttd.rate)} of the capped average monthly wage of $8,537.68. Workers earning less receive ${pct(d.ttd.rate)} of their actual monthly wage. Nevada has no minimum benefit.`,
    },
    {
      q: 'How many days do I have to miss before Nevada workers’ comp pays?',
      a: `At least ${wait} consecutive days, or ${wait} days in total within a 20-day period, of being unable to earn full wages, under NRS 616C.400. Once you reach that threshold, compensation is computed from the date of injury, so the first days are not lost. Medical treatment is covered from the start whatever the length of the absence.`,
    },
    {
      q: 'How long is a Nevada permanent partial disability paid?',
      a: 'Monthly for five years, or until you turn 70 if that comes later, under NRS 616C.490(8). Each 1% of whole-person impairment pays 0.6% of your average monthly wage every month for injuries since January 1, 2000. Lump sums are governed by NRS 616C.495, and small awards under $100 a month may be paid once a year instead.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:california', 'workers-comp:arizona', 'workers-comp:utah', 'workers-comp:oregon'],
});
