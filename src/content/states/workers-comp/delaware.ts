import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('delaware');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('delaware') as number;
const from = day(d.ttd.effective);
// The state average weekly wage is written in the rate memo, carried in the period label.
const saww = Number((d.ttd.periodLabel.match(/\$([\d,]+\.\d{2})/)?.[1] ?? '0').replace(/,/g, ''));

// A Dover poultry-processing sanitation worker at $640 a week, out 5 days, then 7 days.
const s5 = wcCalc('delaware', 640, 5);
const s7 = wcCalc('delaware', 640, 7);
// A Wilmington bank analyst at $2,100 a week.
const bank = wcCalc('delaware', 2100, 35);
// A beach-season server at $280 a week.
const server = wcWeekly('delaware', 280);
// Scheduled loss of a thumb: 75 weeks at the employee's rate, here $640 a week.
const thumb = wcWeekly('delaware', 640) * 75;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'delaware',
  title: `Delaware Workers Comp Calculator 2026: ${retro} Days Pays Day 1`,
  description: `Delaware workers comp from ${from}: two thirds of wages, ${usdx(min)} to ${usdx(max)} a week, paid from day four, or from day one once the absence reaches ${retro} days.`,
  intro: 'Delaware counts the day of injury toward its seven-day line and publishes a daily rate for every partial week.',
  resume: `Delaware pays total disability at ${pct(d.ttd.rate)} of the injured employee's wages, never more than two thirds of the state average weekly wage announced by the Secretary of Labor for the last calendar year and never less than 22 2/9% of it (19 Del. C. § 2324). From ${from} the state average weekly wage is ${usdx(saww)}, so the maximum is ${usdx(max)} and the minimum ${usdx(min)}. A worker who earned less than the minimum receives the full wage. Compensation is paid from the fourth day of incapacity, and from the first day once incapacity reaches ${retro} days, the day of injury included (§ 2321). A sanitation worker earning ${usd(640)} a week who is out ${retro} days receives ${usd(s7.total)}. Total disability has no week limit; partial disability stops at 300 weeks, and permanent injuries are paid for scheduled weeks, such as 220 for a hand.`,
  body: (h) => `<h2>The day of injury counts</h2>
<p>Delaware's waiting rule is short and generous. Under § 2321 compensation begins with the fourth day of incapacity, and if the incapacity extends to ${retro} days or more, including the day of injury, everything is paid from the first day. Medical care, funeral benefits and permanent hearing or vision loss are owed from day one in every case. A Dover poultry sanitation worker earning ${h.usd(640)} a week who goes back after 5 days receives ${h.usd(s5.total)}; one week off, counting the day of the accident, brings ${h.usd(s7.total)}, the full week.</p>
<p>The ${h.ext(d.ttd.url, 'Office of Workers’ Compensation rate memo')} makes partial weeks easy: it lists a daily amount for each day from one to seven at the maximum rate, ${h.usdx(max)} for a full week.</p>

<h2>A July 1 ceiling built from unemployment-insurance payrolls</h2>
<p>The Secretary of Labor computes the state average weekly wage from wages reported by employers in the unemployment insurance system, and the new rates take effect each July 1. For 2026 that average is ${h.usdx(saww)}. Two thirds of it is the ceiling, reached at about ${h.usd(atMax)} of weekly pay: a Wilmington bank analyst at ${h.usd(2100)} computes to ${h.usd(bank.raw)} and receives ${h.usdx(max)}. The floor of 22 2/9% gives ${h.usdx(min)}, but § 2324 replaces it with the full wage when the wage is lower, so a beach-season server averaging ${h.usd(280)} a week receives ${h.usd(server)}.</p>

<h2>Schedules for permanent injury</h2>
<p>${h.ext(d.statute.url, 'Section 2326')} pays permanent injuries at ${pct(d.ttd.rate)} of wages for a fixed number of weeks, regardless of later earnings: 220 weeks for a hand, 250 for an arm or a leg, 160 for a foot, 75 for a thumb, down to 20 for a little finger. Losing part of a finger counts as a fraction of it. The sanitation worker who loses a thumb would receive roughly ${h.usd(thumb)} over 75 weeks, on top of the time already paid as total disability.</p>
<p>Partial disability, when the worker earns less after returning, is two thirds of the lost earning power, under the same ceiling, for up to 300 weeks (§ 2325). ${d.facts[3]?.text ?? ''}</p>`,
  faqs: [
    {
      q: 'How much is Delaware workers’ comp from July 1, 2026?',
      a: `From ${from}, Delaware pays two thirds of the injured worker's wages, with a maximum of ${usdx(max)} and a minimum of ${usdx(min)} a week, based on a state average weekly wage of ${usdx(saww)}. A worker whose own wage is below the minimum receives the full wage instead. The rates change every July 1.`,
    },
    {
      q: 'Does Delaware pay workers’ comp for the first three days?',
      a: `Only if the incapacity lasts at least ${retro} days, counting the day of injury. Delaware pays from the fourth day of incapacity, and once the absence reaches ${retro} days it pays everything back to the first day. Medical treatment, funeral benefits and permanent hearing or vision loss are paid from the first day regardless.`,
    },
    {
      q: 'How many weeks does Delaware pay for losing a hand or an arm?',
      a: 'Under 19 Del. C. § 2326, the loss of a hand is paid at two thirds of wages for 220 weeks, an arm or a leg for 250 weeks, a foot for 160 weeks and a thumb for 75 weeks. These amounts are owed regardless of what the employee earns after the injury, and partial loss of use is paid in proportion.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:maryland', 'workers-comp:pennsylvania', 'workers-comp:new-jersey'],
});
