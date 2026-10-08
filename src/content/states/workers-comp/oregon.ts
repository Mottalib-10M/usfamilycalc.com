import { defineStatePage } from '../../../lib/page-types';
import { wc, wcCalc, wcWeekly, wcWageAtMax, usd, usdx, day } from '../../../lib/kit';

const d = wc('oregon');
const max = d.ttd.max as number;
const min = d.ttd.min as number;
const wait = d.waiting.days as number;
const retro = (d.waiting.retroactiveAfterDays as number) + 1;
const atMax = wcWageAtMax('oregon') as number;
const from = day(d.ttd.effective);

// A Portland software tester at $2,400 a week: still under the cap.
const tester = wcWeekly('oregon', 2400);
// A Bend brewery worker holding two jobs, $700 + $500 a week, off 10 days then 15.
const twoJobs = 700 + 500;
const b10 = wcCalc('oregon', twoJobs, 10);
const b15 = wcCalc('oregon', twoJobs, 15);
const firstJobOnly = wcWeekly('oregon', 700);
// A seasonal worker at $60 a week.
const seasonal = wcWeekly('oregon', 60);

export default defineStatePage({
  topic: 'workers-comp',
  slug: 'oregon',
  title: `Oregon Workers Comp Calculator 2026: ${usdx(max)} Max`,
  description: `Oregon workers comp from ${from}: time loss is two thirds of wages up to ${usdx(max)} a week, 133% of the 2026 state average, with every job you hold counted.`,
  intro: 'Oregon’s weekly ceiling sits above the state average wage, and wages from a second job can count toward your time-loss check.',
  resume: `Oregon pays temporary total disability, which the Workers' Compensation Division calls time loss, at 66 2/3% of wages, with a weekly maximum of 133% of the state average weekly wage. For injuries from ${from} through June 30, 2027, that maximum is ${usdx(max)}, reached only at a wage of about ${usd(atMax)} a week, and the minimum is ${usd(min)} or 90% of wages, whichever is less. A worker earning ${usd(1500)} a week receives ${usd(wcWeekly('oregon', 1500))}. The first ${wait} calendar days are unpaid unless total disability lasts ${retro} consecutive days or the worker is admitted to a hospital within that window. Workers who hold more than one job may have all their wages counted if they tell the insurer within 30 days. Time-loss rates rise each July 1 with the state wage for workers not otherwise adjusted, and Bulletin 111 is to be revised before the end of 2026 for Senate Bill 1519.`,
  body: (h) => `<h2>A cap a third above the average wage</h2>
<p>Most ceilings stop at the state average weekly wage. ORS 656.210 sets Oregon's at 133% of it, which is why a Portland software tester earning ${h.usd(2400)} still receives two full thirds of her pay, ${h.usd(tester)}, with room to spare under the ${h.usdx(max)} limit published in ${h.ext(d.ttd.url, 'WCD Bulletin 111')}. The bulletin also lists older maximums by date of injury; a claim keeps the bracket of its injury date, adjusted by the yearly factors for workers who are not otherwise getting an increase.</p>

<h2>Two paychecks, one claim</h2>
<p>A Bend brewery worker earns ${h.usd(700)} at the brewery and ${h.usd(500)} on weekends at a hardware store. If only the job of injury counted, his time loss would be ${h.usd(firstJobOnly)}. Under ORS 656.210(2), the wages from all subject employment are added, ${h.usd(twoJobs)} in all, giving ${h.usd(b15.weekly)}, provided the insurer learns of the second job within 30 days of the claim and receives wage proof within 60 days of asking. Miss either deadline and only the brewery wage is used, which is the figure the calculator gives if you enter that wage alone.</p>

<h2>The hospital exception to the waiting days</h2>
<p>Off ten days with no hospital stay, the brewery worker receives ${h.usd(b10.total)}, the first ${wait} days withheld. At fifteen days, the ${retro}-day rule pays them back, for ${h.usd(b15.total)}. An overnight hospital admission within the first two weeks also restores those days, a detail the calculator cannot know, so add them yourself if it applies. Insurers must issue the first payment within 14 days of knowing about the claim and the disability.</p>

<h2>The floor for very small wages</h2>
<p>The minimum is the lesser of ${h.usd(min)} and 90% of wages. A seasonal worker earning ${h.usd(60)} a week is paid ${h.usd(seasonal)}. Time off to attend medical appointments for an accepted disabling claim is paid as temporary disability too. ${d.ppd.text}</p>
<p>See ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')} for settlements, and the ${h.aIf('child-support:oregon', 'Oregon child support page')} for benefits counted as income.</p>`,
  faqs: [
    {
      q: 'What is the Oregon time-loss maximum for injuries after July 1, 2026?',
      a: `${usdx(max)} a week, which is 133% of the state average weekly wage of $1,461.21 set for July 1, 2026 through June 30, 2027. Two thirds of wages reach that cap only at about ${usd(atMax)} a week. Injuries from earlier years keep their own maximum, listed by date bracket in WCD Bulletin 111 and adjusted each July 1.`,
    },
    {
      q: 'Does Oregon count my second job in workers’ comp?',
      a: `Yes, if you were employed in more than one job with subject employers when you were hurt. Notify the insurer within 30 days of the initial claim and send verifiable wage documents within 60 days of its request, and the wages from all jobs are added together. Missing those deadlines means only the job where you were injured is counted.`,
    },
    {
      q: 'When are the first three days paid on an Oregon claim?',
      a: `When total disability continues for ${retro} consecutive days, or when you are admitted as a hospital inpatient within ${retro} days of the onset of total disability. Otherwise the first ${wait} calendar days after you leave work are not paid. If your doctor releases you to any kind of work during the first two weeks, those days stay unpaid.`,
    },
  ],
  related: ['workers-comp', 'how-much-does-workers-comp-pay', 'workers-comp:washington', 'workers-comp:california', 'workers-comp:nevada', 'child-support:oregon'],
});
