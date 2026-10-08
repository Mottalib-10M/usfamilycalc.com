import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWageAtMax, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('georgia');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const weeks = d.ttdDuration.maxWeeks as number;
const atMax = wcWageAtMax('georgia') as number;
const since = day(d.ttd.effective);
const tpdMax = Number((d.facts[1]?.text.match(/\$([\d,]+\.\d{2})/)?.[1] ?? '0').replace(/,/g, ''));

// A Savannah port crane operator at $1,700 a week, out 15 weeks.
const crane = wcCalc('georgia', 1700, 105);
// A Dalton carpet-mill worker at $720 a week, back after 16 days, then after 25 days.
const c16 = wcCalc('georgia', 720, 16);
const c25 = wcCalc('georgia', 720, 25);
// The 400-week ceiling, reached by a worker who never returns.
const cap = wcCalc('georgia', 720, weeks * 7 + 100);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'georgia',
  title: `Georgia Workers Comp Calculator 2026: ${usd(max)} Cap, ${weeks} Weeks`,
  description: `Georgia workers comp 2026: two thirds of the average weekly wage, ${usdx(min)} to ${usdx(max)} a week, for at most ${weeks} weeks, and the first week paid only after ${retro} days out.`,
  intro: 'Georgia’s ceiling is written into the statute itself, so it moves only when the General Assembly amends the Code.',
  resume: `Georgia pays a worker who cannot work at all two thirds of the average weekly wage, but not more than ${usdx(max)} or less than ${usdx(min)} a week for an accident on or after ${since} (O.C.G.A. § 34-9-261). Unlike most states, Georgia does not index that maximum to a state wage each year: it is a dollar figure in the Code, and the State Board of Workers' Compensation still lists ${usdx(max)} in 2026. Income benefits start if you are unable to work for more than ${wait} days; the first week is paid only once you miss more than ${retro} consecutive days. For accidents since July 1, 1992, income benefits last at most ${weeks} weeks unless the injury is catastrophic. A crane operator earning ${usd(1700)} a week is held to ${usd(crane.weekly)}, which the ceiling reaches at about ${usd(atMax)} of weekly pay. A worker paid less than ${usdx(min)} a week receives the full wage.`,
  body: (h) => `<h2>A ceiling the legislature sets by hand</h2>
<p>Georgia's maximum does not float with wages. The General Assembly raises it by amending § 34-9-261, most recently to ${h.usdx(max)} for accidents from ${since}, along with ${h.usdx(tpdMax)} for temporary partial benefits. Between amendments the figure stays put, which is why a 2026 injury is paid on the same ceiling as a 2023 one. Several law-firm websites announced an increase to $850 from July 1, 2026. We found no such amendment: the ${h.ext('https://www.legis.ga.gov/api/document/docs/default-source/legislative-counsel-document-library/sumdoc2026-edit.pdf?sfvrsn=6257533e_2', 'official summary of 2026 general statutes')} lists no change to § 34-9-261, and the ${h.ext(d.ttd.url, 'State Board’s FAQ')} still gives ${h.usdx(max)}. This page uses ${h.usdx(max)} until the Board publishes otherwise.</p>
<p>The fixed cap bites hard on skilled trades. A Savannah port crane operator averaging ${h.usd(1700)} a week computes to ${h.usd(crane.raw)} but receives ${h.usd(crane.weekly)}, about ${h.usd(crane.total)} over fifteen weeks.</p>

<h2>Day eight and day twenty-two</h2>
<p>Weekly benefits are owed when the worker is unable to work for more than ${wait} days, and the first check should be mailed within 21 days after the first missed day. The first week itself is paid only if the worker misses more than ${retro} consecutive days. A Dalton carpet-mill worker earning ${h.usd(720)} who returns after 16 days receives ${h.usd(c16.total)}; out 25 days, ${h.usd(c25.total)}.</p>

<h2>Four hundred weeks, then the end of the road</h2>
<p>For accidents since July 1, 1992, income benefits stop after ${weeks} weeks unless the injury is designated catastrophic, in which case they can be lifetime. The mill worker who never returns would be paid for ${cap.paidDays} days, ${h.usd(cap.total)} in all. ${d.facts[2]?.text ?? ''} Benefits may be reduced once the doctor releases the worker with restrictions, or suspended on a full release.</p>

<h2>Picking from the posted panel</h2>
<p>${d.facts[0]?.text ?? ''} ${d.facts[3]?.text ?? ''} Permanent partial disability is paid according to the loss of use of the body part rated by the authorized treating physician, under the schedule in § 34-9-263.</p>`,
  faqs: [
    {
      q: 'Did the Georgia workers’ comp maximum go up in 2026?',
      a: `Not according to official sources checked in October 2026. Georgia's maximum is written in O.C.G.A. § 34-9-261 as ${usdx(max)} a week for accidents since ${since}. The official summary of laws enacted in the 2026 session lists no change to that section, and the State Board of Workers' Compensation still publishes ${usdx(max)}. Claims of a higher figure on law-firm sites are not reflected in the Code.`,
    },
    {
      q: 'How long can I receive weekly benefits in Georgia?',
      a: `For accidents on or after July 1, 1992, Georgia pays income benefits for up to ${weeks} weeks. An injury the State Board treats as catastrophic may qualify for lifetime income benefits and lifetime medical care, along with help returning to work. Reduced-wage benefits after returning to lighter work are limited to 350 weeks from the date of injury.`,
    },
    {
      q: 'Can I choose my own doctor for a Georgia work injury?',
      a: 'Generally you choose from the employer’s posted panel. A traditional panel lists at least six physicians, including an orthopedist and no more than two industrial clinics, and you may make one change to another doctor on the list without permission. The Board’s FAQ describes the other ways an employer may satisfy the posting rule.',
    },
    {
      q: 'What is the minimum workers’ comp check in Georgia?',
      a: `${usdx(min)} a week. Georgia's statute sets the floor at that amount for temporary total disability, except that a worker whose average weekly wage was below ${usdx(min)} is paid the full weekly wage instead. In practice the minimum matters only to very part-time workers, since two thirds of a full-time wage is almost always above it.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:florida', 'workers-comp:alabama', 'workers-comp:south-carolina', 'child-support:georgia'],
});
