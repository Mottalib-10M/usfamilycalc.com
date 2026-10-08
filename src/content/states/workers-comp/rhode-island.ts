import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, pct, day } from '../../../lib/kit';

const d = wc('rhode-island');
const max = d.ttd.max as number;
const rate = d.ttd.rate;
const wait = d.waiting.days as number;
const atMax = wcWageAtMax('rhode-island') as number;
const from = day(d.ttd.effective);

// A Providence line cook at $900 a week, married with two children, off 3 days then 3 weeks.
const cook3 = wcCalc('rhode-island', 900, 3);
const cook21 = wcCalc('rhode-island', 900, 21);
const cookWeekly = wcWeekly('rhode-island', 900);
const dependents = 3;
// Dependency allowance from January 1, 2025, capped at 80% of the AWW (statute text in the data).
const allowance = 25;
const cookWithKids = Math.min(cookWeekly + dependents * allowance, 900 * 0.8);
// A Newport marine engineer at $3,000 a week.
const eng = wcWeekly('rhode-island', 3000);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'rhode-island',
  title: `Rhode Island Workers Comp Calculator 2026: ${pct(rate)} of Wages`,
  description: `Rhode Island workers comp: ${pct(rate)} of gross weekly wages since 2022, a maximum of ${usd(max)} a week for injuries from ${from}, plus a dependency allowance.`,
  intro: 'Rhode Island stopped computing benefits from after-tax pay in 2022 and now uses a single percentage of gross wages.',
  resume: `For injuries on or after January 1, 2022, Rhode Island pays total incapacity at ${pct(rate)} of the average weekly base wage, earnings or salary, before taxes. Injuries through December 31, 2021 are still paid at 75% of spendable earnings, the gross wage minus income tax and FICA. The maximum rate changes every October 1: for injuries from ${from}, the Department of Labor and Training set it at ${usd(max)} a week, 125% of the state average weekly wage, reached at a wage of about ${usd(atMax)}. There is no statutory minimum. A worker earning ${usd(900)} receives ${usd(cookWeekly)} a week, and each wholly dependent spouse or child adds a dependency allowance, though the total may not exceed 80% of the worker's own wage. Indemnity begins on the fourth day of incapacity; the first ${wait} days are not paid back. The state average wage in force on the injury date applies for the full period of compensation.`,
  body: (h) => `<h2>From take-home pay to gross pay</h2>
<p>Until the end of 2021, a Rhode Island claim started with a conversion table: the director published, every May, the 75% of spendable earnings that matched each gross wage, after federal and state income tax and Social Security and Medicare withholding. The current text of ${h.ext('https://webserver.rilegislature.gov/Statutes/TITLE28/28-33/28-33-17.htm', 'R.I. Gen. Laws § 28-33-17')} replaces that with a plain ${h.pct(rate)} of the gross average weekly wage for injuries from January 1, 2022. Older claims keep the old method for as long as they are paid, so two coworkers hurt a few weeks apart can receive very different checks on the same wage.</p>

<h2>The dependency allowance changes the result</h2>
<p>In Rhode Island, family size moves the weekly figure. Each person wholly dependent on the injured worker, a spouse not working for wages or a child under 18, adds ${h.usd(allowance)} a week from January 1, 2025. A Providence line cook earning ${h.usd(900)} receives ${h.usd(cookWeekly)} on his wage alone; with a spouse at home and two children, ${h.usd(cookWithKids)}, because the total cannot pass 80% of his wage. The calculator shows only the wage part, so add the allowance yourself.</p>

<h2>October, not January</h2>
<p>The ${h.ext(d.ttd.url, 'DLT table of maximum compensation rates')} moves each October 1, on a scale that has climbed from 100% of the state average in 1975 to 115% in 2007, 120% in 2016 and 125% since October 1, 2017. A marine engineer in Newport earning ${h.usd(3000)} receives the ${h.usd(eng)} maximum. The rate that applies is the one in force on the date of injury, for the whole claim.</p>

<h2>Three days, never refunded</h2>
<p>Section 28-33-4 starts compensation on the fourth day of incapacity and has no clause that pays the first three back later. The cook out three days receives ${h.usd(cook3.total)}; out three weeks, ${h.usd(cook21.total)}, eighteen days of benefits. ${d.facts[3].text} For permanent losses, ${d.ppd.text}</p>
<p>See ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')} for settlements and lump sums.</p>`,
  faqs: [
    {
      q: 'Is Rhode Island workers’ comp still based on spendable earnings?',
      a: `Only for injuries on or before December 31, 2021, which keep 75% of spendable earnings, the gross wage minus income tax and FICA. For injuries from January 1, 2022, the rate is ${pct(rate)} of the gross average weekly wage, with the maximum set by the Department of Labor and Training. The date of injury decides which method applies for the whole claim.`,
    },
    {
      q: 'What is the Rhode Island maximum comp rate from October 2026?',
      a: `${usd(max)} a week for injuries on or after ${from}, according to the Department of Labor and Training. It equals 125% of the state average weekly wage and rises every October 1. The previous maximum, for injuries from October 1, 2025 to September 30, 2026, was $1,622. Two thirds of your wage is not the test here; ${pct(rate)} of it is.`,
    },
    {
      q: 'How much does a dependent add to a Rhode Island comp check?',
      a: `$25 a week for each person wholly dependent on you, from January 1, 2025: a spouse living with you who does not work for wages during your disability, or a child under 18, or older if incapacitated or enrolled in school. The allowance plus the weekly benefit cannot exceed 80% of your average weekly wage, except for permanent total disability, where the allowance is $40.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:massachusetts', 'workers-comp:connecticut'],
});
