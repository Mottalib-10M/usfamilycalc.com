import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('hawaii');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const atMax = wcWageAtMax('hawaii') as number;
const year = day(d.ttd.effective);
const money = (s: string) => [...s.matchAll(/\$([\d,]+\.\d{2})/g)].map((m) => Number(m[1].replace(/,/g, '')));
const annual = money(d.ttd.periodLabel)[0];
const tdiMax = money(d.facts[1]?.text ?? '')[0];

// A Waikiki hotel housekeeper at $900 a week, out 6 days and out 30 days.
const h6 = wcCalc('hawaii', 900, 6);
const h30 = wcCalc('hawaii', 900, 30);
// A Maui construction foreman at $2,200 a week.
const fore = wcCalc('hawaii', 2200, 49);
// A part-time lei maker at $240 a week.
const lei = wcWeekly('hawaii', 240);
// Two jobs: $600 at a resort plus $400 at a store, combined.
const both = wcWeekly('hawaii', 1000);
const one = wcWeekly('hawaii', 600);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'hawaii',
  title: `Hawaii Workers Comp Calculator 2026: Day Four, No Payback`,
  description: `Hawaii workers comp 2026: two thirds of the average weekly wage up to ${usdx(max)}, a floor of ${usdx(min)}, and three waiting days never paid back, however long the absence.`,
  intro: 'Hawaii keeps its three waiting days unpaid for good, and pays TTD on the wages of every covered job a worker held.',
  resume: `Hawaii pays temporary total disability at ${pct(d.ttd.rate)} of the employee's average weekly wages, up to ${usdx(max)} a week for injuries in calendar year ${d.ttd.effective.slice(0, 4)} (HRS § 386-31). The Disability Compensation Division computes that maximum as 100% of the state average weekly wage: an average annual wage of ${usdx(annual)} divided by 52. The statute sets the minimum at 25% of the maximum, which we compute as ${usdx(min)}; a worker who earned less receives 100% of the wage. Benefits are paid from the fourth day of disability, and unlike most states, Hawaii's statute never pays back the first ${wait} days. The first check is due by the tenth day after the employer learns of the disability. TTD continues until the director orders otherwise or the worker can resume work, with two weeks' written notice before termination. A housekeeper earning ${usd(900)} a week who is out 30 days receives ${usd(h30.total)}.`,
  body: (h) => `<h2>Three days that stay unpaid</h2>
<p>Most workers' compensation acts give back the waiting days once an absence runs long. HRS § 386-31(b) does not: the employer pays TTD for the duration of the disability, but not including the first ${wait} calendar days. A Waikiki housekeeper earning ${h.usd(900)} who is out 6 days receives ${h.usd(h6.total)}; out 30 days, ${h.usd(h30.total)}, still for ${h30.paidDays} days only. On the other hand, a worker who cannot finish a regular shift because of the injury is treated as totally disabled for that day, so a half-day accident can start the count.</p>

<h2>Wages from every covered job</h2>
<p>${d.facts[3]?.text ?? ''} The notice does not spell out the arithmetic, and the Division can confirm it for a given claim. If both wages are counted together, a worker holding a ${h.usd(600)} resort job and a ${h.usd(400)} retail job would be paid on ${h.usd(1000)}: ${h.usd(both)} a week, instead of ${h.usd(one)} on the resort wage alone. In a state where many households stack two or three jobs, the difference is large.</p>

<h2>The ceiling and the quarter floor</h2>
<p>The ${h.ext(d.ttd.url, 'DCD notice of December 10, 2025')} sets ${h.usdx(max)} for 2026 and reminds employers that the WC wage base is the maximum divided by 0.6667. A Maui construction foreman at ${h.usd(2200)} computes to ${h.usd(fore.raw)} and is paid ${h.usd(fore.weekly)}; the ceiling applies from about ${h.usd(atMax)}. The floor is 25% of the maximum, or $38 if that were higher; the notice does not print it, so ${h.usdx(min)} is our arithmetic. A part-time lei maker earning ${h.usd(240)} a week is below it and receives the full ${h.usd(lei)}.</p>

<h2>Prompt payment, and the other disability program</h2>
<p>The first payment is due within ten days of notice, and stopping TTD because the employee can work requires written notice to the employee and the director two weeks ahead, with the right to a hearing. ${d.facts[4]?.text ?? ''}</p>
<p>The same Division runs Temporary Disability Insurance for injuries and illnesses that are not work-related, paying 58% of wages up to ${h.usdx(tdiMax)} a week in 2026. A claim belongs to one program or the other; a worker unsure whether an injury is job-related can ask the Division which form to file.</p>`,
  faqs: [
    {
      q: 'Does Hawaii pay the first three days of a work injury?',
      a: `No. Under HRS § 386-31(b) Hawaii pays temporary total disability for the duration of the disability but not including the first ${wait} calendar days, and the statute contains no rule that pays them back after a longer absence. Medical care is covered from the first day. A worker who cannot complete a shift because of the injury is considered totally disabled for that day.`,
    },
    {
      q: 'What is the Hawaii workers’ comp maximum for 2026?',
      a: `${usdx(max)} a week, equal to 100% of the Hawaii state average weekly wage, computed by the Disability Compensation Division as an average annual wage of ${usdx(annual)} divided by 52. The minimum is 25% of the maximum, ${usdx(min)} by our calculation, and a worker whose wage is below it receives the full wage.`,
    },
    {
      q: 'If I have two jobs in Hawaii, is my workers’ comp based on both?',
      a: 'Yes, when both employers are covered. Hawaii’s notice to employees says an injured worker employed by two covered employers at the time of injury receives concurrent temporary total disability benefits. The second job’s lost wages are therefore compensated too, within the same weekly maximum; the Disability Compensation Division can confirm how the two wages are combined in a given claim.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:california', 'workers-comp:alaska', 'child-support:hawaii'],
});
