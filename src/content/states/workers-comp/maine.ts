import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('maine');
const max = d.ttd.max as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const atMax = wcWageAtMax('maine') as number;
const from = day(d.ttd.effective);

// A lobster-processing supervisor at $1,800 a week, eight weeks out.
const sup = wcCalc('maine', 1800, 56);
// A paper-mill electrician at $2,700 a week: above the cap.
const mill = wcCalc('maine', 2700, 56);
// A retail clerk at $520 a week, back after twelve days, then after sixteen.
const c12 = wcCalc('maine', 520, 12);
const c16 = wcCalc('maine', 520, 16);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'maine',
  title: `Maine Workers Comp Calculator 2026: 125% SAWW Ceiling`,
  description: `Maine workers comp 2026: total incapacity pays ${pct(d.ttd.rate)} of gross weekly wages up to ${usdx(max)} from ${from}, the 125% SAWW cap for injuries since 2020.`,
  intro: 'Maine ties the weekly ceiling to the injury year, so a 2019 back injury and a 2021 one are capped at different multiples of the same state wage.',
  resume: `Maine pays an employee who is totally incapacitated by a work injury ${pct(d.ttd.rate)} of gross average weekly wages, for as long as the total incapacity lasts (39-A M.R.S. § 212(1-A)). For injuries on or after January 1, 2020 the weekly ceiling is 125% of the state average weekly wage, which gives ${usdx(max)} for the payment year that began ${from}; the Workers' Compensation Board publishes the figure each summer. You hit that ceiling at about ${usd(atMax)} a week of gross pay. Maine has no minimum weekly benefit. The first ${wait} days of incapacity are not paid unless it lasts more than ${retro} days, and firefighters are paid from the first day (§ 204). A supervisor earning ${usd(1800)} who is out eight weeks receives ${usd(sup.weekly)} a week, ${usd(sup.total)} in all. When the worker can do some work, partial benefits replace two thirds of the lost earnings, for up to 624 combined weeks of total and partial benefits.`,
  body: (h) => `<h2>Three ceilings, one state wage</h2>
<p>Maine has rewritten its maximum twice in a decade, and each version still governs the injuries of its era. Under 39-A M.R.S. § 211, the cap is 90% of the state average weekly wage for injuries before 2013, 100% for injuries from 2013 through 2019, and 125% for injuries from January 1, 2020 on. The ${h.ext(d.ttd.url, 'Board’s state average weekly wage notice')} prints one table per era. That is why a paper-mill electrician earning ${h.usd(2700)} a week and hurt in 2026 is held to ${h.usdx(mill.weekly)}, while a worker with the same pay hurt in 2018 would be capped at the full state wage itself. ${d.facts[0]?.text ?? ''}</p>
<p>The rate has also changed. Since 2013 Maine pays two thirds of gross wages; injuries before 2013 are still paid at 80% of after-tax wages under § 212(1). Older guides and some employer handbooks still describe the after-tax method, so check the date of injury before trusting a number.</p>

<h2>No floor, and a fourteen-day line</h2>
<p>Maine sets no minimum benefit for total incapacity, so a low wage produces a low check: a retail clerk at ${h.usd(520)} a week receives ${h.usd(c12.weekly)}. The seven-day waiting rule in § 204 makes the length of the absence decisive. Back after twelve days, that clerk is paid for ${c12.paidDays} days, ${h.usd(c12.total)}; out sixteen days, the whole period is paid, ${h.usd(c16.total)}. Firefighters skip the waiting period entirely.</p>

<h2>Partial incapacity and the 624-week clock</h2>
<p>When the doctor clears limited work, benefits shift to § 213: two thirds of the difference between gross pre-injury wages and what the employee is able to earn afterwards, under the same ceiling. For injuries since 2020 the combined total and partial benefits stop after 624 weeks, about twelve years, unless the Board extends them for extreme financial hardship. Total incapacity itself has no week limit, and loss of both eyes, both hands or both feet is presumed permanent and total for 800 weeks.</p>
<p>Medical treatment starts with a provider the employer chooses, but after 10 days the employee may switch to a provider of his or her own, subject to an objection the Board can mediate (§ 206). Annual adjustments to ongoing benefits use the multiplier in the same notice. The ${h.aIf('child-support:maine', 'Maine child support page')} explains how a weekly benefit counts as income in a support case.</p>`,
  faqs: [
    {
      q: 'What is the maximum workers’ comp benefit in Maine for 2026?',
      a: `For injuries on or after January 1, 2020, the Maine ceiling is 125% of the state average weekly wage: ${usdx(max)} a week for the payment period that began ${from}. Injuries from 2013 through 2019 are capped at 100% of the state wage and older injuries at 90%. Maine has no weekly minimum, so a low wage simply produces a proportionally lower benefit.`,
    },
    {
      q: 'Is Maine workers’ comp based on gross or after-tax pay?',
      a: 'On gross pay for injuries on or after January 1, 2013: two thirds of the gross average weekly wage, earnings or salary under 39-A M.R.S. § 212(1-A). Injuries before 2013 still use 80% of after-tax wages. Fringe benefits can count toward the wage, but the Board limits their inclusion when the total passes two thirds of the state average weekly wage.',
    },
    {
      q: 'How long can partial benefits last in Maine?',
      a: 'For injuries since January 1, 2020, partial incapacity benefits stop once the employee has received 624 weeks of total and partial benefits combined, roughly twelve years. The Board, an administrative law judge or a panel may extend them in cases of extreme financial hardship caused by the inability to return to gainful work. Total incapacity benefits themselves continue for the duration of the incapacity.',
    },
    {
      q: 'Can I choose my own doctor for a Maine work injury?',
      a: 'At first the employer selects the health care provider. After 10 days of care, the employee may switch by giving the employer the new provider’s name and a statement of intent to treat there. The employer can object by petition; the dispute goes to mediation and, if unresolved, to an administrative law judge who decides who pays for the treatment.',
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:new-hampshire', 'workers-comp:massachusetts', 'workers-comp:vermont', 'child-support:maine'],
});
