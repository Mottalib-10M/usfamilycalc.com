import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('pennsylvania');
const max = d.ttd.max as number;
const flat = d.ttd.min as number;
const lowPct = d.ttd.minPct as number;
const wait = d.waiting.days as number;
const retro = (d.waiting.retroactiveAfterDays as number) + 1;
const atMax = wcWageAtMax('pennsylvania') as number;
const from = day(d.ttd.effective);
// Band edges derived from the data: flat amount / 90% and flat amount / two thirds.
const lowEdge = (flat * 100) / lowPct;
const flatTop = (flat * 100) / d.ttd.rate;

// Four Pittsburgh-area workers, one per band.
const aide = wcWeekly('pennsylvania', 650);
const welder = wcWeekly('pennsylvania', 900);
const nurse = wcWeekly('pennsylvania', 1500);
const engineer = wcWeekly('pennsylvania', 2600);
// The nurse off 10 days, then 16.
const n10 = wcCalc('pennsylvania', 1500, 10);
const n16 = wcCalc('pennsylvania', 1500, 16);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'pennsylvania',
  title: 'Pennsylvania Workers Comp Calculator 2026: 4 Rate Bands',
  description: `Pennsylvania workers comp for 2026 injuries: ${pct(lowPct)} of a low wage, a flat ${usdx(flat)}, two thirds, or the ${usdx(max)} maximum, set by L&I from your average weekly wage.`,
  intro: 'Pennsylvania does not apply one percentage to everyone: the Act sorts injured workers into four wage bands, each with its own rule.',
  resume: `The Pennsylvania Workers' Compensation Act pays wage-loss benefits through a four-band schedule that the Department of Labor & Industry updates every January 1. For injuries on and after ${from}, a worker whose average weekly wage is about ${usd(lowEdge)} or less receives ${pct(lowPct)} of it; a wage between that point and roughly ${usd(flatTop)} earns a flat ${usdx(flat)}; from there up to about ${usd(atMax)}, the benefit is two thirds of the wage; above it, the check stops at ${usdx(max)}, equal to the statewide average weekly wage. A nurse earning ${usd(1500)} a week therefore receives ${usd(nurse)}. The first ${wait} days of disability are paid only if it lasts ${retro} days or more. Total disability has no week limit, but after 104 weeks the employer may request an impairment rating evaluation that can turn it into partial disability, payable for no more than 500 weeks.`,
  body: (h) => `<h2>Which band are you in?</h2>
<p>The ${h.ext(d.ttd.url, 'L&I statewide average weekly wage notice')} prints the 2026 schedule as four blocks, read down the column for the year of injury. Here is what each block means for a real paycheck in western Pennsylvania.</p>
<ul>
<li>A home health aide earning ${h.usd(650)} falls in the bottom band and receives ${h.pct(lowPct)} of her wage: ${h.usd(aide)}.</li>
<li>A welder earning ${h.usd(900)} sits in the flat band. Two thirds of his wage would be ${h.usd(900 * 2 / 3)}, but the Act pays everyone in this band the same ${h.usdx(flat)}, so he receives ${h.usd(welder)}.</li>
<li>A nurse at ${h.usd(1500)} is in the two-thirds band: ${h.usd(nurse)}.</li>
<li>An engineer at ${h.usd(2600)} hits the ceiling: ${h.usd(engineer)}.</li>
</ul>
<p>The flat middle band is the odd one: inside it, a raise does not change the benefit at all. The bottom band protects low earners twice, first with a percentage well above two thirds, then with the flat amount once 90% of the wage would exceed it.</p>

<h2>Seven days, fourteen days</h2>
<p>Indemnity starts on the eighth day of disability. If the nurse is out ten days, she receives ${h.usd(n10.total)}; if she is out sixteen, the first ${wait} days are added back and she receives ${h.usd(n16.total)}. The days count continuously from the day after the injury, weekends and scheduled days off included. The employer or insurer must pay or deny within 21 days of learning of the injury, and late payments carry interest.</p>

<h2>The 104-week evaluation</h2>
<p>Total disability benefits can run as long as the worker remains unable to work. After 104 weeks of them, the employer may ask the Bureau of Workers' Compensation to designate a physician for an impairment rating evaluation; a whole-body impairment under 50% converts the claim to partial disability, which ends after 500 weeks. Partial disability pays two thirds of the wage loss for workers back at reduced pay. Specific losses, from a finger to an eye, are paid for a scheduled number of weeks. ${d.facts[2].text}</p>
<p>For settlements, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}; for comp income in a support case, the ${h.aIf('child-support:pennsylvania', 'Pennsylvania child support calculator')}.</p>`,
  faqs: [
    {
      q: 'Why does Pennsylvania pay some workers 90% of their wage?',
      a: `Because the Act protects the lowest earners with a separate band. For 2026 injuries, a worker whose average weekly wage is about ${usd(lowEdge)} or less receives ${pct(lowPct)} of it. Above that point the benefit becomes the flat ${usdx(flat)} until two thirds of the wage exceeds that amount, and only then does the familiar two-thirds rule apply, up to ${usdx(max)}.`,
    },
    {
      q: 'What is the Pennsylvania maximum weekly comp rate for 2026?',
      a: `${usdx(max)} for injuries occurring on and after ${from}, equal to the statewide average weekly wage the Department of Labor & Industry determined under section 105.1 of the Act. You reach it when two thirds of your average weekly wage exceeds that amount, at about ${usd(atMax)} a week. The rate stays fixed for the life of the claim.`,
    },
    {
      q: 'How does the impairment rating evaluation work in Pennsylvania?',
      a: `After an injured worker has received 104 weeks of total disability benefits, the employer can request, within 60 days, that the Bureau designate a physician to rate the impairment. If the whole-body impairment is below 50%, the benefits become partial disability, which can be paid for at most 500 weeks. The Bureau, not the employer, designates the licensed physician who performs the evaluation.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:ohio', 'workers-comp:new-jersey', 'workers-comp:new-york', 'child-support:pennsylvania'],
});
