/** Home page text (pillar). Every figure comes from the data through the kit (RECETTE §17.4). */
import type { FAQ, Helpers } from '../lib/page-types';
import { csAll, csCalc, wcAll, alAll, dvAll, pbAll, usd, usdx, num, listOf, cs } from '../lib/kit';

const CS = csAll();
const byModel = (m: string) => CS.filter((d) => d.model === m);
const shares = byModel('income-shares').length;
const pctStates = CS.filter((d) => d.model === 'percent-obligor' || d.model === 'percent-combined');
const formulaStates = CS.filter((d) => !['income-shares', 'percent-obligor', 'percent-combined'].includes(d.model));
// The same family everywhere: paying parent $5,000 a month, other parent $3,000, one child, no parenting time.
const fam = CS.map((d) => ({ name: d.name, slug: d.slug, m: csCalc(d.slug, 5000, 3000, 1).monthly })).filter((x) => x.m > 0).sort((a, b) => a.m - b.m);
const lo = fam[0], hi = fam[fam.length - 1];
const WC = wcAll().filter((d) => d.ttd.max != null);
const wcSorted = [...WC].sort((a, b) => (a.ttd.max as number) - (b.ttd.max as number));
const wcLo = wcSorted[0], wcHi = wcSorted[wcSorted.length - 1];
const spendable = wcAll().filter((d) => d.ttd.basis !== 'gross' && d.ttd.basis !== 'monthly').map((d) => d.name);
const AL = alAll();
const DV = dvAll().filter((d) => d.filingFee != null);
const dvSorted = [...DV].sort((a, b) => (a.filingFee as number) - (b.filingFee as number));
const PB = pbAll();
const claims = PB.filter((d) => d.creditorClaims.months != null).map((d) => d.creditorClaims.months as number);
const tx = CS.some((d) => d.slug === 'texas') ? cs('texas') : null;

export const HOME = {
  title: 'Child Support Calculator 2026 by State, Alimony and Divorce',
  description: "Child support calculator for every state in 2026, with alimony formulas, divorce court fees, probate fees and workers comp rates from each state's own rules.",
  h1: 'Child support, alimony, divorce, probate and workers’ comp calculators by state',
  intro: 'Five calculators that apply the rules of the state you live in, not a national average: the guideline your judge must start from, the fee the clerk will charge, the benefit the insurer owes.',
  resume: `Child support is not set by a national formula: each state adopts its own guideline, and ${shares} of the ${CS.length} jurisdictions modeled here use an income-shares schedule, ${pctStates.length} take a flat percentage of income, and ${formulaStates.length} apply a formula of their own, such as California's K-factor equation. For the same family, a parent earning ${usd(5000)} a month while the other earns ${usd(3000)}, with one child and no shared parenting time, the guideline gives about ${lo ? usd(lo.m) : ''} a month in ${lo?.name ?? ''} and ${hi ? usd(hi.m) : ''} in ${hi?.name ?? ''}, partly because states count income differently (gross, net or adjusted). The calculator above applies the schedule or formula of the state you pick, with its shared-parenting rule, child care and health insurance. The other four calculators work the same way: alimony formulas in the ${AL.length} states that publish one, divorce court fees, probate deadlines and statutory fees, and the ${WC.length ? 'workers’ comp weekly maximum of each state' : 'workers’ comp benefit rates'}.`,
  pillarsTitle: 'Five calculators, fifty-one sets of rules',
  tableTitle: 'Every state at a glance',
  tableIntro: (h: Helpers) => `<p>One row per state and the District of Columbia. Each cell opens the page that applies that state's rule in a calculator, with the statute or court rule it comes from. A blank or “varies” cell is not a gap in our reading: it means the state sets no single figure (a filing fee that each county fixes, an alimony amount left to the judge). For child support, the ${h.a('child-support', 'child support calculator')} lists every guideline we model; for injuries at work, the ${h.a('workers-comp', 'workers’ comp calculator')} carries the 2026 maximum and minimum of each state.</p>`,
  foldTitle: 'How family law money works, state by state',
  sections: (h: Helpers): Array<{ title: string; html: string }> => [
    {
      title: 'Child support: one federal duty, three ways to compute it',
      html: `<p>Federal law makes every state write a child support guideline, apply it as a rebuttable presumption in every case and review it at least every four years (${h.src('usc667', '42 U.S.C. § 667')}; ${h.src('cfr30256', '45 CFR § 302.56')}). It does not say what the guideline must contain, so the states went three ways.</p>
<p><strong>Income shares</strong> is the most common model, used in ${shares} of the jurisdictions on this site. The court adds both parents' incomes, reads the amount that parents at that combined income are presumed to spend on their children in a published table, and splits it in proportion to income. A parent who earns two thirds of the combined income owes two thirds of the table amount, then the parent with less time pays that share to the other.</p>
<p><strong>Percentage of income</strong> states (${listOf(pctStates.map((d) => d.name))}) take a fixed share of the paying parent's income${tx ? `: in Texas, ${tx.percent!.byChildren.map((p) => `${p}%`).slice(0, 3).join(', ')} and so on of monthly net resources for one, two and three children, up to a cap of ${usd(tx.percent!.cap!.amount)} of net resources a month` : ''}. New York uses a variant that applies the percentage to both parents' combined income before sharing it.</p>
<p><strong>Formulas</strong> cover the rest: California's statewide equation, which builds parenting time into a K factor${CS.some((d) => d.model === 'melson') ? `, and the Melson formula used in ${listOf(CS.filter((d) => d.model === 'melson').map((d) => d.name))}, which first reserves a minimum for each parent's own needs before computing what the child receives` : ''}.</p>`,
    },
    {
      title: 'Why the same family pays a different amount in each state',
      html: `<p>Run one family through every guideline and the answers spread widely: ${lo ? `${usd(lo.m)} a month in ${lo.name}` : ''}${hi ? ` against ${usd(hi.m)} in ${hi.name}` : ''}, for a paying parent at ${usd(5000)} a month, the other at ${usd(3000)}, one child, no shared time. Three things explain most of the gap. First, the income definition: a gross-income state applies its table to pay before taxes, a net-income state to pay after them, so the same ${usd(5000)} is a bigger number in one than in the other. Second, the cost data behind each table: states update their schedules from different economic studies and in different years. Third, the shape of the formula: a flat percentage ignores the other parent's income altogether, while income shares give it full weight.</p>
<p>Parenting time adds another layer. Most income-shares states switch to a shared-parenting formula once the paying parent has the children for a set number of overnights a year, and that number differs from one state to the next. Enter the overnights in the calculator and it applies the threshold and the multiplier of the state you selected.</p>`,
    },
    {
      title: 'Alimony: formulas in a few states, discretion everywhere else',
      html: `<p>Spousal support is the opposite of child support: most states have no formula at all, and the judge weighs a list of factors (the length of the marriage, each spouse's earning capacity, the standard of living). The ${h.a('alimony', 'alimony calculator')} covers the ${AL.length} states where a statute, a court rule or an official guideline does set a number, a cap or a duration: ${listOf(AL.map((d) => d.name))}. Some apply only to temporary support while the case is pending, others to the final judgment; each state page says which.</p>
<p>Federal taxes changed in 2019: for divorce or separation agreements signed after 2018, alimony is no longer deductible by the payer nor taxable to the recipient (${h.src('irs452', 'IRS Topic 452')}). Older agreements keep the old treatment unless they are modified to adopt the new one.</p>`,
    },
    {
      title: 'What a divorce costs before anyone hires a lawyer',
      html: `<p>The only cost every divorce shares is the court's filing fee, and even that varies: ${dvSorted.length ? `${usdx(dvSorted[0].filingFee as number)} in ${dvSorted[0].name} against ${usdx(dvSorted[dvSorted.length - 1].filingFee as number)} in ${dvSorted[dvSorted.length - 1].name}, among the states that set one fee statewide or in their largest county` : 'from about a hundred dollars to several hundred'}. Every state lets a person with a low income ask the court to waive its fees. The rest of the bill depends on the spouses: an uncontested case where both sign a settlement may cost little more than the fee, while a case that goes through discovery, motions and a trial can cost far more. The ${h.a('divorce-cost', 'divorce cost calculator')} keeps the two apart: the official fees of your state, then the attorney rate and hours you enter.</p>
<p>Timing is set by statute too. Many states impose a waiting period between filing and the final decree, and most require a period of residence before you can file at all; the state pages give both, with the section of the code.</p>`,
    },
    {
      title: 'Probate: the calendar is written in the statute',
      html: `<p>“How long does probate take” has a legal floor in every state: the period creditors have to file their claims after the estate is opened or notice is published. ${claims.length ? `Among the states on this site it runs from ${num(Math.min(...claims))} to ${num(Math.max(...claims))} months` : 'It runs from a few months to a year'}, and an estate rarely closes before it ends. Selling a house, filing the final tax returns and a will contest come on top. Small estates can skip most of it: each state sets a value below which heirs collect assets by affidavit or through a summary procedure.</p>
<p>A handful of states also write the price of probate into law, as a percentage of the estate for the executor and the attorney. California and Florida are the best known; in most others the fee must simply be “reasonable” and is approved by the court. The ${h.a('probate', 'probate calculator')} applies the statutory schedules where they exist.</p>`,
    },
    {
      title: 'Workers’ comp: a share of the wage, under a ceiling that varies widely',
      html: `<p>When an injury at work keeps you off the job, temporary total disability benefits replace part of the wage, tax-free (${h.src('irs525', 'IRS Publication 525')}). Most states pay two thirds of the average weekly wage; ${spendable.length ? `${listOf(spendable)} use a share of take-home pay instead` : 'a few use a share of take-home pay instead'}. Every state caps the weekly check${wcLo && wcHi ? `, from ${usdx(wcLo.ttd.max as number)} in ${wcLo.name} to ${usdx(wcHi.ttd.max as number)} in ${wcHi.name}` : ''}, and the cap is usually indexed to the state's average wage each year. A waiting period of a few days goes unpaid unless the disability lasts long enough. The ${h.a('workers-comp', 'workers’ comp calculator')} applies the 2026 figures of each state.</p>`,
    },
    {
      title: 'What these calculators do not do',
      html: `<p>They apply published rules to the numbers you type. They do not decide which income a court will count (bonuses, overtime, income imputed to a parent who could earn more), they do not apply deviations a judge may grant, and they do not handle children from several relationships unless the state page says so. A probate estimate leaves out bond, appraisal and extraordinary services; a workers' comp estimate leaves out permanent disability ratings and settlements. For anything you will sign or file, use the court's own worksheet, the agency's calculator where one exists, or a licensed attorney in your state. Every state page links its official sources, and the ${h.a('method', 'method page')} lists what each engine does and the tests it passes.</p>`,
    },
  ],
  faqs: [
    { q: 'Which states use the income shares model for child support?', a: `On this site, ${shares} of the ${CS.length} jurisdictions we model use income shares: the court adds both parents' incomes, reads the support for that combined income in the state's official table, and splits it by income. The child support calculator page lists every state with its model, so you can open your own state's page and see its table, its shared-parenting threshold and the date the schedule took effect.` },
    { q: 'Is child support based on gross or net income?', a: 'It depends on the state. Some guidelines start from gross income before taxes, others from net income after taxes and mandatory deductions, and some from an adjusted figure in between. The calculator tells you, under the income field, which definition your state uses, so that you enter the right number; using the wrong one is the most common reason an estimate differs from a court worksheet.' },
    { q: 'Do all states have an alimony formula?', a: `No. Most states leave spousal support to the judge, who weighs factors such as the length of the marriage and each spouse's earning capacity. A minority publish a formula, a cap or a duration rule, sometimes only for temporary support during the case. The alimony calculator covers the ${AL.length} states where such a rule exists and says, state by state, whether it binds the judge or only guides.` },
    { q: 'How much does it cost to file for divorce?', a: 'The court filing fee is the one cost every divorce shares. Some states set it by statute for every county, others let each county set it, and every state allows a fee waiver for people with low incomes. The divorce cost calculator shows the official fee of your state or of its largest county, then adds the attorney time, mediation and service costs you enter.' },
    { q: 'How long does probate take in most states?', a: `At least as long as the creditor claim period the state sets, which usually runs from a few months to a year after the estate opens${claims.length ? ` (${num(Math.min(...claims))} to ${num(Math.max(...claims))} months among the states on this site)` : ''}. Simple estates often close within a year; selling real estate, a will contest or a tax return can stretch it to two years or more. Estates under the small-estate limit can often avoid full probate.` },
    { q: 'How much does workers’ comp pay a week?', a: `Most states pay two thirds of your average weekly wage while you cannot work at all, tax-free, but never more than the state's weekly maximum${wcLo && wcHi ? `, which ranges from ${usdx(wcLo.ttd.max as number)} to ${usdx(wcHi.ttd.max as number)} for 2026` : ''}. A few states pay a share of take-home pay instead. The first days are usually unpaid unless the disability lasts longer than the state's retroactive period.` },
    { q: 'Are these calculators legal advice?', a: 'No. They apply the guidelines, statutes and benefit rates that each state publishes to the numbers you enter, and every result is an estimate. A judge can deviate from a guideline, an agency may count income differently and an insurer decides a claim. Use the result to prepare questions for your attorney, mediator or caseworker, and rely on the official worksheet or calculator for anything you file.' },
  ] as FAQ[],
  sources: ['usc667', 'cfr30256', 'irs452', 'irs504', 'irs525'],
};
