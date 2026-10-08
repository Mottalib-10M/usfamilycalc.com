import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('arizona');
const max = d.ttd.max as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const from = day(d.ttd.effective);
// The ICA publishes a monthly wage ceiling; both figures are written in the period label of the data.
const caps = [...d.ttd.periodLabel.matchAll(/\$([\d,]+\.\d{2})/g)].map((m) => Number(m[1].replace(/,/g, '')));
const amwCap = caps[0];
const amwNext = caps[1];
const monthlyMax = (amwCap * d.ttd.rate) / 100;
const toWeekly = (m: number) => (m * 12) / 52;

// A Tucson HVAC technician paid $4,200 a month, off 10 days, then 30 days.
const tech = toWeekly(4200);
const t10 = wcCalc('arizona', tech, 10);
const t30 = wcCalc('arizona', tech, 30);
// A Phoenix project manager paid $9,000 a month.
const pm = wcWeekly('arizona', toWeekly(9000));
const pmRaw = (toWeekly(9000) * d.ttd.rate) / 100;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'arizona',
  title: `Arizona Workers Comp Calculator 2026: Monthly Wage Method`,
  description: `Arizona workers comp 2026: two thirds of an average monthly wage capped at ${usdx(amwCap)}, about ${usdx(max)} a week, after a ${wait}-day wait repaid once you are out ${retro} days.`,
  intro: 'Arizona is the state that counts in months: the wage, the ceiling and even the dependents’ allowance are monthly figures.',
  resume: `Arizona computes temporary total disability as ${pct(d.ttd.rate)} of the injured worker's average monthly wage (A.R.S. § 23-1045), and the Industrial Commission of Arizona caps the wage it will count, not the benefit. For injuries in calendar year 2026 the maximum average monthly wage is ${usdx(amwCap)}, so the largest monthly TTD check is about ${usdx(monthlyMax)}, or ${usdx(max)} a week once converted (we multiply by 12 and divide by 52; the ICA publishes only the monthly cap). A claimant with dependents receives a flat $100 more per month. Arizona sets no minimum. Nothing is paid for the first ${wait} days; if the disability lasts one more week, compensation is owed from the date of injury (§ 23-1062(D)). A technician paid ${usd(4200)} a month who misses 30 days receives about ${usd(t30.total)}. TTD has no week cap. For 2027 injuries the ICA has already adopted a ${usdx(amwNext)} monthly cap.`,
  body: (h) => `<h2>A ceiling on the wage, not on the check</h2>
<p>Most states print a weekly maximum benefit. The ${h.ext(d.ttd.url, 'ICA’s statutory maximum page')} prints a maximum average monthly wage instead: ${h.usdx(amwCap)} for injuries from ${from} through the end of 2026. Under A.R.S. § 23-1041(D), any pay above that line is simply left out of the computation, and the two-thirds rate is applied to what remains. The weekly figure this site shows, ${h.usdx(max)}, is our conversion of that monthly cap and is not an official ICA number. ${d.facts[1]?.text ?? ''}</p>
<p>A Phoenix project manager paid ${h.usd(9000)} a month would compute to ${h.usd(pmRaw)} a week, but the wage is cut to the cap first, which leaves ${h.usd(pm)} a week. A Tucson HVAC technician paid ${h.usd(4200)} a month is well under the cap: about ${h.usd(t30.weekly)} a week, or roughly ${h.usd(t30.monthly)} a month.</p>

<h2>A hundred dollars for the household, whatever its size</h2>
<p>Section 23-1045(A)(2) adds an allowance when someone depends on the injured worker for support. It is not per child: one dependent or five, the total monthly increase is exactly $100. The calculator leaves it out, so add it yourself if it applies. There is no statutory floor in Arizona, so a part-time worker's benefit is simply two thirds of a small monthly wage.</p>

<h2>The seven-day wait and the eighth day</h2>
<p>Arizona's waiting period is longer than most. No compensation is paid for the first ${wait} days after the injury; it starts on the eighth day, and if the disability continues one week beyond those seven days, it is computed from the date of injury. Back after 10 days, the technician is paid for ${t10.paidDays} days, about ${h.usd(t10.total)}. Out 30 days, all ${t30.paidDays} days count. The first installment is due no later than the 21st day after the ICA notifies the carrier of the claim, then at least every two weeks.</p>

<h2>Scheduled months at 55%</h2>
<p>Permanent partial disability in Arizona is also measured in months. ${d.ppd.text.replace(/ \(A\.R\.S\..*$/, '.')} Medical care includes reimbursement of travel when treatment is more than 25 miles from home.</p>`,
  faqs: [
    {
      q: 'What is the maximum workers’ comp benefit in Arizona in 2026?',
      a: `Arizona caps the average monthly wage, not the benefit. For 2026 injuries the cap is ${usdx(amwCap)} a month, so temporary total disability tops out near ${usdx(monthlyMax)} a month, which we convert to about ${usdx(max)} a week. Workers with dependents add a flat $100 a month. For injuries in 2027 the Industrial Commission has adopted a cap of ${usdx(amwNext)}.`,
    },
    {
      q: 'Does Arizona workers’ comp pay the first week off?',
      a: `Not unless the disability lasts long enough. Arizona pays nothing for the first ${wait} days after the injury and starts on the eighth day. If the disability continues one week beyond those seven days, the statute computes compensation from the date of injury, so the first week is paid back. Medical benefits are owed from the first day in every case.`,
    },
    {
      q: 'Is there a minimum workers’ comp payment in Arizona?',
      a: 'No. A.R.S. § 23-1045 sets the benefit at two thirds of the average monthly wage without a floor, so a part-time or seasonal worker receives two thirds of a small wage. The only fixed add-on is the $100 monthly allowance for workers who support dependents, which is the same whatever the number of dependents.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:california', 'workers-comp:nevada', 'workers-comp:new-mexico', 'child-support:arizona'],
});
