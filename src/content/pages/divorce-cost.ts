import { definePage } from '../../lib/page-types';
import { dvAll, usdx, listOf } from '../../lib/kit';

const DV = dvAll();
const fees = DV.filter((d) => d.filingFee != null).sort((a, b) => (a.filingFee as number) - (b.filingFee as number));
const lo = fees[0], hi = fees[fees.length - 1];
const statewide = DV.filter((d) => /statewide/i.test(d.feeScope));
const waits = DV.filter((d) => (d.waitingPeriod?.days ?? 0) > 0);
const noWait = DV.filter((d) => d.waitingPeriod?.days === 0);

export default definePage({
  id: 'divorce-cost',
  topic: 'divorce-cost',
  kind: 'pillar',
  order: 1,
  slug: 'divorce-cost',
  nav: 'Divorce cost calculator',
  card: 'Official court fees by state, plus the costs you choose',
  title: 'Divorce Cost Calculator 2026: Court Fees and Total by State',
  description: 'Divorce cost calculator for 2026: each state’s official filing fee, response fee, fee waiver and waiting period, plus the attorney and mediation costs you set.',
  h1: 'How much does a divorce cost? Calculator by state',
  intro: 'The part of the bill set by law, the court’s fees, comes from each state’s fee schedule; the rest depends on whether you agree, and the calculator lets you price it with your own quotes.',
  resume: `A divorce always costs at least the court's filing fee, ${lo && hi ? `which runs from ${usdx(lo.filingFee as number)} in ${lo.name} to ${usdx(hi.filingFee as number)} in ${hi.name} among the states on this site` : 'which every state sets in its fee schedule'}, and in many states the other spouse pays a similar fee to file a response. Everything else depends on how much the spouses agree. An uncontested divorce, where both sign a settlement, can cost little more than the fees if the spouses file the forms themselves, or a few hours of attorney time for drafting and review; a contested divorce with discovery, motions and a trial multiplies the hours, and child custody disputes add evaluators and experts. The calculator keeps the two parts apart: the official fees of your state, then the attorney rate and hours, mediation and service costs you enter from your own quotes. Every state also lets a person with a low income ask the court to waive its fees.`,
  tool: 'divorce-cost',
  toolProps: { state: 'california' },
  body: (h) => `<h2>The fees the court charges</h2>
<p>Filing the petition is the one cost every divorce shares. ${statewide.length ? `${listOf(statewide.map((d) => h.aIf(`divorce-cost:${d.slug}`, d.name)))} set the fee by statute for every county` : 'Some states set the fee by statute for every county'}; elsewhere each county, or each county clerk, sets its own, and the calculator uses the fee of the most populous county with its name. A response or answer fee is charged in several states when the other spouse appears, and motions to change temporary orders carry their own fees. Certified copies of the decree, a parenting class and a mediation program run by the court may add small amounts.</p>
<h2>Fee waivers</h2>
<p>Every state has a procedure to waive or defer court fees for people who cannot afford them, usually for those receiving public benefits or with income below a percentage of the federal poverty guideline. The state pages name the form and link it. A waiver usually covers the filing fee and the service of papers by the sheriff, not private attorneys or mediators.</p>
<h2>Uncontested or contested</h2>
<p>The single largest variable is agreement. Spouses who agree on property, debts, support and parenting can use their state's simplified or summary procedure where it exists, or a joint petition, and finish with one short hearing or none. Spouses who do not agree pay for every step the court requires to decide for them: discovery of finances, temporary orders, depositions, expert valuations of a business or a pension, custody evaluations and, at the end, a trial. Mediation is a middle path that many courts require before a custody hearing. For the self-represented route and what it costs, see the ${h.a('uncontested-divorce-cost', 'uncontested divorce cost guide')}.</p>
<h2>How long it takes</h2>
<p>Many states impose a waiting period between filing or service and the final decree${waits.length ? `: ${listOf(waits.slice(0, 6).map((d) => `${d.name} (${d.waitingPeriod!.days} days)`))}${waits.length > 6 ? ' and others' : ''}` : ''}${noWait.length ? `, while ${listOf(noWait.slice(0, 5).map((d) => d.name))} set none` : ''}. Most also require one spouse to have lived in the state, and sometimes in the county, for a period before filing. Time adds cost only when lawyers are working, so a long waiting period in an uncontested case does not raise the bill.</p>
<h2>Costs that are not fees</h2>
<p>Attorney fees are the largest item in most divorces and the one the law does not set: each lawyer has a rate and bills hours. Ask for the hourly rate, the retainer, and an estimate of hours for your type of case, then enter them in the calculator. Many lawyers offer flat fees for uncontested divorces. Splitting a retirement plan can require a qualified domestic relations order, often prepared by a specialist for a fixed price. Tax advice on selling the home or dividing accounts is another separate cost.</p>
${h.table(['State', 'Filing fee', 'Fee scope', 'Waiting period'], DV.map((d) => [h.aIf(`divorce-cost:${d.slug}`, d.name), d.filingFee != null ? usdx(d.filingFee) : 'by county', d.feeScope, d.waitingPeriod?.days != null ? (d.waitingPeriod.days > 0 ? `${d.waitingPeriod.days} days` : 'none') : 'see state']), 'Divorce petition fees and waiting periods read on official state and county pages', ['l', 'r', 'l', 'r'])}`,
  faqs: [
    { q: 'What is the cheapest way to get divorced?', a: 'An uncontested divorce filed by the spouses themselves, using the court’s own forms or self-help center, costs little more than the filing fee, and a fee waiver can remove even that for people with low incomes. Some states offer a summary or simplified procedure for short marriages without children or significant property, with fewer forms and often no hearing.' },
    { q: 'Who pays the court fees in a divorce?', a: 'The spouse who files pays the filing fee, and the other spouse pays a response fee in states that charge one. The settlement or the judge can then reallocate costs, and some states let a court order the higher-earning spouse to pay part of the other’s attorney fees so that both can be represented. A fee waiver applies to the spouse who qualifies.' },
    { q: 'How much does a contested divorce cost?', a: 'There is no official figure: it depends on attorney rates and the hours the case takes, and contested cases can involve discovery, temporary hearings, experts and a trial. Enter the rate quoted to you and an estimate of hours for each phase in the calculator. The official court fees are a small share of the total in most contested cases.' },
    { q: 'Does it cost more to divorce with children?', a: 'Usually, yes. Many states require a parenting class, charge fees for custody motions, and send contested custody to mediation or evaluation. Child support also has to be calculated and documented with the state worksheet. When parents agree on a parenting plan and the guideline support, the extra cost can stay small.' },
    { q: 'Can I get my divorce filing fee waived?', a: 'Yes, in every state, if your income is low enough or you receive public benefits such as SNAP, SSI or Medicaid. You file a request with your petition, usually on a state form named on each state page, and the judge decides. If granted, you pay nothing to file and the sheriff often serves the papers for free.' },
    { q: 'Is there a waiting period to get divorced?', a: 'In many states, yes: the final decree cannot be entered until a set number of days after filing or service, from a few weeks to six months. Other states set no waiting period, though the court’s calendar still takes time. Most states also require one spouse to have lived there for a period before filing.' },
  ],
  related: ['uncontested-divorce-cost', 'child-support', 'alimony', 'how-is-alimony-calculated', 'probate'],
  sources: ['irs504'],
  extraSources: fees.slice(0, 3).map((d) => ({ name: `${d.name}: court filing fees`, url: d.feeUrl })).filter((s) => s.url),
});
