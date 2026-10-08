import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('florida');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const weeks = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('florida') as number;
const from = day(d.ttd.effective);
const prevMax = Number((d.facts[1]?.text.match(/from \$([\d,]+)/)?.[1] ?? '0').replace(/,/g, ''));

// An Orlando theme-park ride operator at $780 a week, out 18 days, then 24 days.
const r18 = wcCalc('florida', 780, 18);
const r24 = wcCalc('florida', 780, 24);
// A Tampa roofer at $1,900 a week, hurt badly enough to stay out past the cap.
const roof = wcCalc('florida', 1900, 800);
// A roofer who loses a hand: 80% of the wage, still under the same ceiling.
const roofAt80 = Math.min((1900 * 80) / 100, max);
// Impairment income: 75% of the TTD rate, three weeks per point, for a 10% rating at $780 a week.
const iib = wcWeekly('florida', 780) * 0.75;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'florida',
  title: `Florida Workers Comp Calculator 2026: ${weeks} Weeks, 80% Rule`,
  description: `Florida workers comp 2026: two thirds of the AWW up to ${usd(max)} a week from ${from}, no pay for ${wait} days unless out over ${retro}, TTD capped at ${weeks} weeks.`,
  intro: 'Florida pays more than two thirds of wages after the most severe injuries, and stops temporary benefits after two years.',
  resume: `Florida pays temporary total disability at ${pct(d.ttd.rate)} of the injured worker's average weekly wage, up to ${usdx(max)} a week for injuries and illnesses on or after ${from} and never less than ${usdx(min)} (Fla. Stat. §§ 440.12, 440.15(2)). The maximum equals 100% of the statewide average weekly wage that FloridaCommerce measured for the year ending June 30, 2025. A worker who loses an arm, leg, hand or foot, becomes paraplegic or quadriplegic, or loses the sight of both eyes receives 80% instead of two thirds, for a limited time. No compensation is paid for the first ${wait} days unless the disability lasts more than ${retro} days. TTD stops at maximum medical improvement or after ${weeks} weeks, whichever comes first, and impairment income benefits then pay 75% of the TTD rate per point of impairment. A ride operator earning ${usd(780)} a week who misses 24 days receives ${usd(r24.total)}.`,
  body: (h) => `<h2>The eighty percent exception</h2>
<p>Section 440.15(2)(b) lifts the rate to 80% of the average weekly wage for the most catastrophic losses: an arm, a leg, a hand or a foot; paraplegia, paraparesis, quadriplegia or quadriparesis; or the sight of both eyes. The higher rate is still subject to the same ceiling, which is why it matters mostly to mid-range earners. A Tampa roofer earning ${h.usd(1900)} who loses a hand would receive ${h.usd(roof.weekly)} at two thirds, but ${h.usd(roofAt80)} at 80%. The calculator applies the ordinary two-thirds rate.</p>

<h2>Seven days unpaid, twenty-one to recover them</h2>
<p>Under § 440.12(1) compensation is not allowed for the first ${wait} days, except medical care; if the injury causes more than ${retro} days of disability, compensation runs from the start. An Orlando ride operator earning ${h.usd(780)} a week who returns after 18 days receives ${h.usd(r18.total)} for ${r18.paidDays} days; out 24 days, ${h.usd(r24.total)} for all of them.</p>

<h2>Where ${weeks} weeks end</h2>
<p>TTD is paid during the disability but not beyond ${weeks} weeks, and it ends earlier if the worker reaches maximum medical improvement. The roofer who never improves enough to return is paid for ${roof.paidDays} days at most, ${h.usd(roof.total)}. At that point the doctor assigns an impairment rating under the uniform schedule, and permanent total disability is available only for catastrophic injuries or workers incapable of any employment.</p>

<h2>Impairment income at 75%</h2>
<p>${d.ppd.text.replace(/ as printed in the 2026 statute/, '')} The ${h.ext(d.ppd.url, '2026 text of § 440.15')} reads three weeks per percentage point; the statute has been amended often, so check the version in force on the date of injury. On that reading, the ride operator with a 10% rating would receive about ${h.usd(iib)} a week for ${10 * 3} weeks. ${d.facts[3]?.text ?? ''}</p>
<p>The ${h.ext(d.ttd.url, 'Division of Workers’ Compensation bulletin')} sets each year's maximum; it rose from ${h.usd(prevMax)} in 2025 to ${h.usd(max)} in 2026, while the floor stayed at ${h.usdx(min)}. A worker earning below ${h.usdx(min)} a week receives the full wage. The ceiling begins at about ${h.usd(atMax)} of weekly pay.</p>`,
  faqs: [
    {
      q: 'What is the Florida workers’ comp maximum for 2026?',
      a: `${usdx(max)} a week for injuries and illnesses occurring on or after ${from}, which is 100% of the statewide average weekly wage rounded to the nearest dollar. The Florida minimum stays at ${usdx(min)}, and a worker paid less than that receives the full weekly wage. The 2025 maximum was ${usdx(prevMax)}.`,
    },
    {
      q: 'How long can I get temporary total disability in Florida?',
      a: `Florida pays TTD during the disability for no more than ${weeks} weeks under § 440.15(2)(a), and it ends sooner if you reach maximum medical improvement. When either limit is reached, temporary benefits stop and your permanent impairment is rated. Impairment income benefits, and in catastrophic cases permanent total disability, may follow.`,
    },
    {
      q: 'Does Florida pay more for losing a hand or a leg on the job?',
      a: 'Yes, during the temporary period. A Florida worker who loses an arm, leg, hand or foot, is rendered paraplegic, paraparetic, quadriplegic or quadriparetic, or loses the sight of both eyes is paid temporary total disability at 80% of the average weekly wage instead of 66 2/3%, still subject to the weekly maximum set for the year of injury.',
    },
    {
      q: 'Why didn’t Florida workers’ comp pay my first week?',
      a: `Florida does not pay compensation for the first ${wait} days of disability. Those days are paid only if the injury causes more than ${retro} days of disability, in which case compensation is allowed from the beginning. Medical treatment is covered from the first day. If you returned within three weeks, the first week stays unpaid.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:georgia', 'workers-comp:alabama', 'child-support:florida'],
});
