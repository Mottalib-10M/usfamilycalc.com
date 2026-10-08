import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, usd, usdx, pct, day } from '../../../lib/kit';

const d = wc('colorado');
const max = d.ttd.max as number;
const wait = d.waiting.days as number;
const retro = d.waiting.retroactiveAfterDays as number;
const from = day(d.ttd.effective);
const money = (s: string) => [...s.matchAll(/\$([\d,]+\.\d{2})/g)].map((m) => Number(m[1].replace(/,/g, '')));
// Figures written in the Maximum Benefits Order, as carried in the data texts.
const wageForMax = money(d.ttd.minText)[0];
const [schedRate, nsFloor, nsCeil] = money(d.ppd.text);
const [capLow, capHigh] = money(d.ttdDuration.text);

// A Denver ski-resort lift mechanic at $1,250 a week, off 12 days, then 3 weeks.
const m12 = wcCalc('colorado', 1250, 12);
const m21 = wcCalc('colorado', 1250, 21);
// An oil-field operator in Weld County at $2,600 a week.
const oil = wcCalc('colorado', 2600, 56);
const weeksToCapLow = capLow / max;

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'colorado',
  title: `Colorado Workers Comp Calculator 2026: 91% SAWW Cap`,
  description: `Colorado workers comp 2026: two thirds of the average weekly wage up to ${usdx(max)} from ${from}, with no minimum and combined caps of ${usd(capLow)} or ${usd(capHigh)}.`,
  intro: 'Colorado counts the waiting period in missed shifts and caps the total of temporary and partial benefits in dollars rather than weeks.',
  resume: `Colorado pays temporary total disability at ${pct(d.ttd.rate)} of the average weekly wage, every two weeks, up to ${usdx(max)} a week for injuries on or after ${from} (C.R.S. § 8-42-105). That figure is 91% of the state average weekly wage set by the Division of Workers' Compensation in its 2026-2027 Maximum Benefits Order, and it is reached at a weekly wage of ${usdx(wageForMax)}. There is no general minimum. Benefits begin once the worker has missed three shifts, and those shifts are reimbursed if the absence exceeds two weeks. A lift mechanic earning ${usd(1250)} a week receives ${usd(m21.weekly)} a week. TTD has no week limit, but temporary and permanent partial benefits together stop at ${usdx(capLow)} when whole-person impairment is 19% or less, and at ${usdx(capHigh)} from 20%. Benefits can be cut by half for a safety-rule violation or a positive drug test.`,
  body: (h) => `<h2>Dollar caps instead of a week limit</h2>
<p>Colorado lets TTD run until the worker returns to work, is released, misses a rescheduled appointment knowingly, or reaches maximum medical improvement. What ends a long claim is the combined cap in C.R.S. § 8-42-107.5, a dollar ceiling on TTD plus permanent partial benefits, raised each July with the state wage. Under the ${h.ext(d.ttd.url, '2026-2027 Maximum Benefits Order')} it is ${h.usdx(capLow)} for whole-person impairment of 19% or less and ${h.usdx(capHigh)} for 20% or more. A worker paid at the maximum would exhaust the lower cap after roughly ${Math.round(weeksToCapLow)} weeks of TTD alone. Medical benefits are outside these caps.</p>
<p>The order is reissued every July 1 at 12:01 a.m. An injury in May 2026 belongs to the previous order, so two coworkers hurt eight weeks apart can have different ceilings.</p>

<h2>Three shifts, not three days</h2>
<p>The ${h.ext(d.waiting.url, 'DOWC benefits page')} says respondents pay no lost wages until three shifts have been missed, and that this waiting period is reimbursed if the worker misses more than two weeks. The calculator approximates shifts with calendar days. A ski-resort lift mechanic at ${h.usd(1250)} a week, back after 12 days, receives ${h.usd(m12.total)}; out 21 days, ${h.usd(m21.total)}. The doctor, not the worker, takes someone off work: an employee who stops without the authorized physician's approval may not be paid for that time.</p>

<h2>Where the 91% ceiling bites</h2>
<p>An oil-field operator in Weld County averaging ${h.usd(2600)} a week computes to ${h.usd(oil.raw)} but is paid ${h.usdx(max)}. Because Colorado has no floor for TTD, a low wage gives a proportionally low benefit; the only floor in the order, ${h.usdx(nsFloor)}, applies to non-scheduled permanent impairment.</p>

<h2>Scheduled or whole person</h2>
<p>At maximum medical improvement the doctor sorts the impairment into one of two tracks. Losses to toes, feet, legs, fingers, hands, arms, eyes or hearing are scheduled and paid at a flat ${h.usdx(schedRate)} a week for the statutory number of weeks. Spine, lung or mental-function impairment is non-scheduled and paid at the TTD rate, between ${h.usdx(nsFloor)} and ${h.usdx(nsCeil)} a week. ${d.facts[3]?.text ?? ''}</p>`,
  faqs: [
    {
      q: 'What is the Colorado workers’ comp maximum for injuries after July 1, 2026?',
      a: `${usdx(max)} a week, which is 91% of the Colorado state average weekly wage under the Division's 2026-2027 Maximum Benefits Order. The same maximum applies to temporary partial, permanent total and death benefits. A worker must earn at least ${usdx(wageForMax)} a week to reach it. Injuries before July 1, 2026 use the earlier order.`,
    },
    {
      q: 'Is there a minimum TTD payment in Colorado?',
      a: `No. Colorado's Maximum Benefits Order sets no minimum for temporary total disability, so the benefit is always two thirds of the average weekly wage up to the cap. The only floor in the order is ${usdx(nsFloor)} a week for non-scheduled, whole-person permanent impairment, which is paid at the TTD rate but not below that amount.`,
    },
    {
      q: 'Can Colorado reduce my workers’ comp for breaking a safety rule?',
      a: 'Yes. If the injury happened because you violated a safety rule, such as not wearing a required hard hat or harness, Colorado allows your non-medical benefits to be reduced by 50%. A positive test for unauthorized drugs or alcohol can lead to the same reduction. Medical treatment for the injury is still covered in full.',
    },
    {
      q: 'How much can Colorado pay in total for a temporary and partial disability?',
      a: `Under the July 2026 order, temporary disability and permanent partial benefits combined stop at ${usdx(capLow)} when the whole-person impairment is 19% or less, and at ${usdx(capHigh)} when it is 20% or more. The caps are adjusted every July with the Colorado state average weekly wage, and medical care is not counted against them.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:utah', 'workers-comp:new-mexico', 'workers-comp:nebraska', 'child-support:colorado'],
});
