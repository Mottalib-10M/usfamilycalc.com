import { defineStatePage } from '../../../lib/page-types';
import { wc, wcWeekly, wcWageAtMax, usd, usdx, pct, num, day } from '../../../lib/kit';

const d = wc('mississippi');
const max = d.ttd.max as number;
const weeks = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('mississippi') as number;
const from = day(d.ttd.effective);
const lifetime = max * weeks;

// A Gulf Coast shipyard welder at $1,250 a week: well above the cap.
const weld = wcWeekly('mississippi', 1250);
// A poultry plant worker at $640 a week: under the cap.
const plant = wcWeekly('mississippi', 640);
const plantWeeksToLimit = lifetime / plant;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'mississippi',
  title: `Mississippi Workers Comp Calculator 2026: ${weeks}-Week Limit`,
  description: `Mississippi workers comp ${from.slice(-4)}: ${pct(d.ttd.rate)} of your average weekly wage, capped at ${usdx(max)} a week by the MWCC table, and a ${usdx(lifetime)} lifetime disability total.`,
  intro: 'Mississippi has one of the lowest weekly ceilings in the country, and it also limits disability to a total sum, not only a number of weeks.',
  resume: `A Mississippi worker hurt on the job receives wage-loss benefits of up to ${pct(d.ttd.rate)} of the average weekly wage at the time of injury, subject to a weekly maximum the Mississippi Workers' Compensation Commission (MWCC) computes each year under Miss. Code Ann. § 71-3-13. The MWCC rate table we could read lists ${usdx(max)} a week for injuries on or after ${from}, with a lifetime disability maximum of ${usdx(lifetime)}, which is ${num(weeks)} times that weekly figure. Any wage above about ${usd(atMax)} a week is capped, so a shipyard welder earning ${usd(1250)} receives ${usdx(weld)}. The MWCC site blocks automated reading, and two versions of its own table disagree on recent years, so confirm the 2026 figure with the Commission or the insurer before relying on it. Payments must be made at least every 14 days while the disability lasts. Employers with five or more regular employees must carry coverage, and the worker picks the treating physician.`,
  body: (h) => `<h2>A total in dollars, not just a count of weeks</h2>
<p>Most states cap temporary disability by weeks or by medical events. Mississippi's table instead carries a lifetime disability maximum next to each weekly maximum: ${h.usdx(lifetime)} for ${from.slice(-4)} injuries, or ${num(weeks)} weeks at the top rate. A worker paid below the cap uses that total up more slowly. A poultry plant worker earning ${h.usd(640)} a week receives ${h.usd(plant)}, and at that pace the ${h.usdx(lifetime)} total would represent roughly ${h.num(Math.round(plantWeeksToLimit))} weeks of benefits. The calculator above applies the ${num(weeks)}-week limit.</p>
<p>The weekly ceiling itself is low by national standards. A welder earning ${h.usd(1250)} would compute to far more than ${h.usdx(weld)}, but the cap stops him there, so a skilled tradesperson in Mississippi replaces a much smaller share of pay than the headline percentage suggests.</p>

<h2>What we could and could not verify</h2>
<p>The Commission's website refuses automated access, so the figures on this page come from the rate table embedded in the MWCC site's own page code, as archived on June 4, 2026. That copy lists ${h.usdx(max)} for ${from.slice(-4)}. An older copy of the same table, archived in February 2025, gave higher figures for 2023 through 2025 than the 2026 copy does for the same years. Until the Commission's ${h.ext(d.ttd.url, 'maximum benefit and mileage rates page')} can be checked directly, treat the weekly maximum as an estimate. We also could not read the statute's waiting period or minimum benefit on an official site, so the calculator pays from the first day and applies no floor; the Commission or an attorney can confirm both for a specific claim.</p>

<h2>Who is covered and who chooses the doctor</h2>
<p>${d.facts[0]?.text ?? ''} Independent contractors, federal employees and some transportation and maritime jobs fall under other systems. The injured worker has the right to select one physician or provider, a chiropractor included, and that provider may make one referral to a specialist without the carrier's approval; further changes need approval in advance.</p>
<p>Deadlines are strict. If no disability benefits have been paid, the claim is barred unless filed with the Commission within two years of the injury. When the doctor finds maximum medical improvement, permanent disability payments may follow if a lasting impairment or loss of earning capacity remains. For how these add up, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}, and the ${h.aIf('child-support:mississippi', 'Mississippi child support page')} for benefits counted in a support case.</p>`,
  faqs: [
    {
      q: 'What is the maximum weekly workers’ comp benefit in Mississippi for 2026?',
      a: `The MWCC rate table we could read lists ${usdx(max)} a week for injuries on or after ${from}, with a lifetime disability maximum of ${usdx(lifetime)}. The Commission computes the maximum each year under Miss. Code Ann. § 71-3-13. Because its website blocks automated access and two archived versions of the table disagree on earlier years, confirm the figure with the Commission before relying on it.`,
    },
    {
      q: 'Does my Mississippi employer have to carry workers’ comp?',
      a: 'Yes if it regularly employs five or more people. Below five employees coverage is voluntary. Domestic and farm workers and employees of nonprofit fraternal, charitable, religious or cultural organizations are excluded unless the employer covers them voluntarily, and federal employees and some maritime and transportation workers are covered by federal laws instead of the Mississippi act.',
    },
    {
      q: 'Can I pick my own doctor for a Mississippi work injury?',
      a: 'Yes. The Mississippi Workers’ Compensation Law lets the injured worker select one physician or medical provider, and that provider may refer the worker once to another specialist without approval from the employer or carrier. Any further selections or referrals need advance approval. The provider does not have to be a medical doctor; a chiropractor is allowed, and mileage to appointments is reimbursed.',
    },
    {
      q: 'How long do I have to file a workers’ comp claim in Mississippi?',
      a: 'Two years from the date of injury if no disability benefits have been paid; after that the right to all benefits is barred. The worker should also tell the employer about the injury within 30 days. Once benefits start, they must be paid at least every 14 days for as long as the covered disability continues, within the time limits set by the legislature.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:louisiana', 'workers-comp:alabama', 'workers-comp:tennessee', 'child-support:mississippi'],
});
