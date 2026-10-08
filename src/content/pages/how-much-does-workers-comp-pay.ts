import { definePage } from '../../lib/page-types';
import { wcAll, wcWeekly, usd, usdx, num } from '../../lib/kit';

const WC = wcAll();
const wage = 1200;
const at = WC.map((d) => ({ d, w: wcWeekly(d.slug, wage) })).sort((a, b) => a.w - b.w);
const median = at.length ? at[Math.floor(at.length / 2)].w : 0;
const capped2000 = WC.filter((d) => d.ttd.max != null && (2000 * d.ttd.rate) / 100 > (d.ttd.max as number)).length;
const arg = WC.map((d) => [d.name, d.ttd.rate, d.ttd.max, d.ttd.min, d.ttd.minRule === 'actual-wage-if-lower' ? 'wage' : d.ttd.minRule === 'none' || d.ttd.min == null ? 'none' : 'fixed']);

export default definePage({
  id: 'how-much-does-workers-comp-pay',
  topic: 'workers-comp',
  kind: 'guide',
  order: 2,
  slug: 'how-much-does-workers-comp-pay',
  nav: 'How much does workers’ comp pay?',
  card: 'Weekly checks, waiting days, permanent disability and settlements',
  title: 'Workers Comp Pay 2026: How Much You Get Each Week by State',
  description: 'How much workers comp pays in 2026: the weekly check for a total disability by state, the waiting days, permanent disability and what a settlement covers.',
  h1: 'How much does workers’ comp pay?',
  intro: 'The weekly check for time off, what happens when you go back to lighter work, and what permanent disability and settlements add.',
  resume: `For a worker who earned ${usd(wage)} a week, workers' compensation pays a median of about ${usd(median)} a week across the ${WC.length} states on this site while the injury keeps the worker completely off the job, tax-free, usually two thirds of the gross wage. The check is limited by a weekly maximum that every state sets for the year of the injury, so higher earners are paid less than two thirds: at ${usd(2000)} a week, the maximum already applies in ${capped2000} states. The first few days are unpaid unless the disability lasts long enough, medical bills are paid in full on top, and once you are back at a lower-paying job or left with a permanent impairment, partial and permanent disability benefits follow under separate rules. A settlement, if you reach one, trades some or all of those future payments for a lump sum.`,
  mini: 'wcWeekly',
  miniArg: arg,
  body: (h) => `<h2>The weekly check while you cannot work</h2>
<p>Temporary total disability is the benefit people mean when they ask how much workers' comp pays. It is a fixed percentage of your average weekly wage, almost always gross pay before taxes, averaged over a period before the injury that each state defines (thirteen weeks, twenty-six, fifty-two). Overtime counts in most states, and many count wages from a second job. Because the benefit is not taxed, two thirds of gross pay replaces a larger share of take-home pay than it sounds, often close to all of it for a modest income.</p>
<p>Three limits can change the figure. The weekly maximum, usually equal to or a percentage of the state's average weekly wage, caps the check for well-paid workers. The weekly minimum protects low earners, but most states pay no more than the actual wage when it is below the minimum. And the waiting period leaves the first days unpaid unless the disability lasts beyond the state's retroactive threshold.</p>
<h2>Going back to lighter work</h2>
<p>When the doctor allows light duty and the employer offers it at a lower wage, temporary partial disability usually pays two thirds of the difference between the old wage and the new one, still under the weekly maximum. Refusing suitable light duty that the employer offers can end temporary benefits in many states, so read any offer carefully and ask the insurer or the state agency what it changes.</p>
<h2>Permanent disability</h2>
<p>When you reach maximum medical improvement, a doctor rates any lasting impairment. States then pay permanent partial disability in one of a few ways: a schedule of weeks for the loss of use of a hand, an arm or an eye; a percentage of the whole body translated into weeks; or wage-loss benefits for the earnings the impairment costs you. The weekly rate for those weeks is often the same two thirds, sometimes with its own lower maximum. Permanent total disability, when no work is possible, can last for life or until retirement age depending on the state.</p>
<h2>Medical care and mileage</h2>
<p>Medical treatment for a work injury is paid by the employer's insurer without a deductible or copay, for as long as it is reasonable and necessary. Many states also reimburse mileage to medical appointments. Rules on choosing a doctor vary: some states let the employer pick the first doctor or a network, others let you choose from the start.</p>
<h2>What a settlement covers</h2>
<p>A settlement is a negotiated amount, not a formula, and the states do not publish one. What it buys is the claim to future benefits: the remaining weeks of permanent disability, sometimes future medical care, sometimes the right to reopen the claim. A useful check is to add up what the rules would pay you, weekly rate times remaining weeks plus expected medical costs, and compare the offer with that total. Most states require a workers' compensation judge or the state board to approve a settlement, and many publish plain-language guides for injured workers. An attorney's fee in a workers' comp case is usually capped by law and approved by the board.</p>
<h2>Reading your first check</h2>
<p>Compare the weekly amount with the rate notice the insurer sends. It should state the average weekly wage it used, the weeks it averaged, the rate applied and the maximum in force on your date of injury. The most common errors are an average that leaves out overtime, a second job or the value of meals and lodging when the state counts them, and a wage period that includes weeks you did not work. If the average looks low, gather your pay stubs for the period the state uses and ask the adjuster in writing to recompute it. State agencies run ombudsman or information offices that explain the calculation for free, and a rate dispute can be taken to the board without a lawyer.</p>
<h2>Two examples</h2>
<p>A warehouse worker earning nine hundred dollars a week in a two-thirds state receives about six hundred a week, tax-free, close to the take-home pay before the injury. A nurse earning two thousand five hundred a week in the same state is limited by the maximum, so the benefit replaces a much smaller share of the wage. Run both wages through the mini calculator above in a few states to see where the cap starts to bite.</p>
<h2>When benefits stop</h2>
<p>Temporary benefits end when you return to work at your old wage, when you are released to work you refuse, when you reach maximum medical improvement, or when you hit a cap on the number of weeks in states that set one. The insurer must usually give written notice before stopping payments, and you can contest the decision before the state workers' compensation board.</p>
<p>To estimate your own check, use the ${h.a('workers-comp', 'workers’ comp calculator')}: pick the state where the injury happened, enter your average weekly wage and the days you expect to miss.</p>`,
  faqs: [
    { q: 'Is workers’ comp 66 percent of pay?', a: `In most states, yes: temporary total disability pays two thirds of the gross average weekly wage, often written 66 2/3 percent. A few states use another rate or pay a share of take-home pay, and every state caps the weekly amount. At ${usd(wage)} a week the median benefit across the states on this site is about ${usd(median)}, close to two thirds because the cap rarely applies at that wage.` },
    { q: 'Does workers’ comp pay full salary?', a: 'Rarely. It pays a percentage of the wage, usually two thirds, up to a weekly maximum. Because the benefit is not taxed, it can come close to normal take-home pay for modest incomes. Workers paid below the state minimum may receive their full wage, and some employers or union contracts top up benefits to full salary for a period.' },
    { q: 'How long does workers’ comp take to start paying?', a: 'The first check is usually due within two or three weeks after the employer or insurer learns of the injury and the disability, depending on the state. The waiting period of a few days is unpaid at first and paid back if the disability lasts long enough. If the claim is disputed, payments may wait for a decision by the state board.' },
    { q: 'Can I get workers’ comp and unemployment at the same time?', a: 'Generally not for the same weeks. Temporary total disability is for weeks you cannot work, while unemployment requires being able and available to work, so most states reduce or deny one when the other is paid. Partial disability can sometimes overlap with part-time work. Check with the state unemployment agency before filing for both.' },
    { q: 'How is a workers’ comp settlement calculated?', a: 'There is no official formula: a settlement is negotiated. The usual starting point is what the law would pay you in the future, the weekly rate times the weeks of permanent disability still due, plus expected medical costs if the settlement closes them. The state board or a judge must usually approve it, and the attorney fee is capped by law in most states.' },
  ],
  related: ['workers-comp', 'workers-comp:california', 'workers-comp:texas', 'workers-comp:new-york', 'workers-comp:florida', 'probate'],
  sources: ['irs525'],
  extraSources: ['california', 'texas'].filter((s) => WC.some((d) => d.slug === s)).map((s) => { const d = WC.find((x) => x.slug === s)!; return { name: `${d.name}: ${d.agency.name}`, url: d.agency.url }; }),
});
