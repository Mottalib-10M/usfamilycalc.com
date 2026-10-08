import { definePage } from '../../lib/page-types';
import { wcAll, usdx, usd, listOf, num } from '../../lib/kit';

const WC = wcAll();
const withMax = WC.filter((d) => d.ttd.max != null).sort((a, b) => (a.ttd.max as number) - (b.ttd.max as number));
const lo = withMax[0], hi = withMax[withMax.length - 1];
const twoThirds = WC.filter((d) => Math.abs(d.ttd.rate - 66.67) < 0.01 && d.ttd.basis === 'gross');
const netStates = WC.filter((d) => d.ttd.basis === 'spendable' || d.ttd.basis === 'after-tax');
const otherRate = WC.filter((d) => !twoThirds.includes(d) && !netStates.includes(d));
const waits = WC.map((d) => d.waiting.days).filter((x): x is number => x != null);
const capped = WC.filter((d) => d.ttdDuration.maxWeeks != null);

export default definePage({
  id: 'workers-comp',
  topic: 'workers-comp',
  kind: 'pillar',
  order: 1,
  slug: 'workers-comp',
  nav: 'Workers’ comp calculator',
  card: 'Weekly benefit with each state’s 2026 maximum and minimum',
  title: 'Workers Comp Calculator 2026: Weekly Benefit in Every State',
  description: 'Workers comp calculator for 2026: the weekly temporary disability benefit in your state, with its official maximum and minimum and the waiting period.',
  h1: 'Workers’ comp calculator: your weekly benefit by state',
  intro: 'Choose the state where you were hurt, enter your average weekly wage and the days off: the calculator applies that state’s rate, its 2026 ceiling and floor, and its waiting period.',
  resume: `Workers' compensation pays a tax-free weekly benefit while a work injury keeps you completely off the job, and in ${twoThirds.length} of the ${WC.length} jurisdictions covered here it equals two thirds of your gross average weekly wage, up to a maximum set by the state each year. ${netStates.length ? `${listOf(netStates.map((d) => d.name))} instead pay a share of take-home or spendable earnings. ` : ''}The weekly maximum for 2026 injuries ranges from ${lo ? usdx(lo.ttd.max as number) : ''} in ${lo?.name ?? ''} to ${hi ? usdx(hi.ttd.max as number) : ''} in ${hi?.name ?? ''}, so a worker earning ${usd(2000)} a week is capped in most states. The first days of disability are usually unpaid (${waits.length ? `${Math.min(...waits)} to ${Math.max(...waits)} days` : 'a few days'}), then paid back if the disability lasts long enough. Medical care is paid separately and in full by the insurer. The calculator gives the weekly check, the monthly equivalent and the total for the days you expect to miss, under the rules of the state where the injury happened.`,
  tool: 'workers-comp',
  toolProps: { state: 'california' },
  body: (h) => `<h2>How the weekly benefit is computed</h2>
<p>Temporary total disability (TTD) is the benefit for the period when a doctor says you cannot work at all while you heal. It starts from your average weekly wage (AWW), usually the gross earnings of the weeks before the injury, overtime and second jobs included in many states, divided by the number of weeks. The state's rate is applied to it, then the result is compared with the weekly maximum and minimum in force on the date of injury. ${otherRate.length ? `Rates other than two thirds apply in ${listOf(otherRate.map((d) => h.aIf(`workers-comp:${d.slug}`, d.name)))}.` : ''}</p>
<p>Most maximums are tied to the state average weekly wage and change every January 1 or July 1. The figure that applies to you is the one in force when you were hurt, even if your disability runs into the next year; a few states adjust benefits for long disabilities, and the state pages say so.</p>
<h2>The waiting period</h2>
<p>No state pays the first days of a short disability. The waiting period is written in each workers' compensation act, and most acts pay it back retroactively once the disability lasts beyond a second threshold, often two weeks. The calculator leaves the waiting days unpaid unless the time off you enter passes that threshold.</p>
<h2>How long temporary benefits last</h2>
<p>TTD stops when you return to work, when the doctor releases you to light duty that the employer offers, or when you reach maximum medical improvement. ${capped.length ? `${listOf(capped.map((d) => d.name))} also cap the number of weeks.` : 'Some states also cap the number of weeks.'} After that, permanent disability benefits take over if an impairment remains, computed from a rating and a schedule of weeks in each state.</p>
<h2>Partial disability and light duty</h2>
<p>If you can work part time or at a lighter job for less pay, most states pay temporary partial disability, usually two thirds of the difference between your old and new wage, under the same maximum. The calculator covers total disability; for partial disability, apply the state's rate to the wage you lost.</p>
<h2>Benefits are not taxed</h2>
<p>Workers' compensation paid under a state act is not taxable income for federal purposes (${h.src('irs525', 'IRS Publication 525')}), which is why two thirds of gross pay often comes close to normal take-home pay for middle incomes. Social Security disability benefits can be reduced when they overlap with workers' compensation.</p>
<h2>Every state's figures</h2>
${h.table(['State', 'Rate', 'Weekly maximum', 'Weekly minimum', 'From'], WC.map((d) => [h.aIf(`workers-comp:${d.slug}`, d.name), `${num(d.ttd.rate, d.ttd.rate % 1 ? 2 : 0)}%${d.ttd.basis === 'gross' ? '' : ' (net)'}`, d.ttd.max != null ? usdx(d.ttd.max) : 'none', d.ttd.min != null ? usdx(d.ttd.min) : 'none', h.day(d.ttd.effective)]), 'Temporary total disability, read on each state’s workers’ compensation agency or code', ['l', 'r', 'r', 'r', 'l'])}
<p>For what a settlement or a permanent rating may add, and how to read an offer, see ${h.a('how-much-does-workers-comp-pay', 'how much workers’ comp pays')}.</p>`,
  faqs: [
    { q: 'What is the maximum weekly workers’ comp benefit in 2026?', a: `In most states, two thirds of your gross average weekly wage, tax-free, between the state's weekly minimum and maximum. For 2026 injuries, the maximum runs from ${lo ? usdx(lo.ttd.max as number) : ''} to ${hi ? usdx(hi.ttd.max as number) : ''} depending on the state. A few states pay a share of take-home pay instead, so the same gross wage gives a different benefit there.` },
    { q: 'Does workers’ comp pay for the first days off work?', a: 'Not at first. Every state has a waiting period of a few days that is unpaid for short disabilities. Most states pay those days retroactively if the disability lasts longer than a second threshold, often fourteen to twenty-one days. The state pages give both numbers from the statute, and the calculator applies them to the days off you enter.' },
    { q: 'Is the average weekly wage gross or net?', a: 'In most states it is gross pay before taxes, usually averaged over the weeks before the injury and including overtime and, in many states, earnings from other jobs. A minority of states compute benefits from spendable or after-tax earnings. The calculator labels the wage field with the definition your state uses, so check that you enter the right figure.' },
    { q: 'Can workers’ comp pay more than my wage?', a: 'No. The weekly benefit is a percentage of the wage below the maximum, and the states with a minimum benefit usually limit it to your actual wage, or to a percentage of it, when you earned less than the minimum. That is why part-time workers can receive their full wage while most full-time workers receive two thirds of it.' },
    { q: 'Are workers’ comp benefits taxable?', a: 'No. Benefits paid under a state workers’ compensation act for an occupational injury or illness are not taxable income on the federal return, according to IRS Publication 525, and states do not tax them either. Wages you earn on light duty are taxable as usual, and Social Security disability may be offset when the two overlap.' },
    { q: 'How long can I receive temporary disability benefits?', a: 'Until you return to work, the doctor releases you, or you reach maximum medical improvement, and no longer than the number of weeks your state allows where it sets a cap. Permanent disability benefits may then follow if an impairment remains, paid for a number of weeks set by the state’s schedule and rating rules.' },
  ],
  related: ['how-much-does-workers-comp-pay', 'workers-comp:california', 'workers-comp:texas', 'workers-comp:florida', 'workers-comp:new-york', 'child-support'],
  sources: ['irs525'],
  extraSources: ['california', 'texas', 'florida', 'new-york'].filter((s) => WC.some((d) => d.slug === s)).map((s) => { const d = WC.find((x) => x.slug === s)!; return { name: `${d.name}: ${d.agency.name}, weekly benefit rates`, url: d.ttd.url }; }),
});
