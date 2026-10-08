import { definePage } from '../../lib/page-types';
import { csAll, csCalc, usd, listOf, pct } from '../../lib/kit';

const CS = csAll();
const shares = CS.filter((d) => d.model === 'income-shares');
const pctStates = CS.filter((d) => d.model === 'percent-obligor' || d.model === 'percent-combined');
const other = CS.filter((d) => !['income-shares', 'percent-obligor', 'percent-combined'].includes(d.model));
const shared = CS.filter((d) => d.shared?.method === 'cross-credit' && d.shared.thresholdOvernights != null);
const thr = shared.map((d) => d.shared!.thresholdOvernights as number);
const fam = CS.map((d) => ({ d, m: csCalc(d.slug, 6000, 2500, 2).monthly })).filter((x) => x.m > 0).sort((a, b) => a.m - b.m);
const mid = fam[Math.floor(fam.length / 2)];

export default definePage({
  id: 'child-support',
  topic: 'child-support',
  kind: 'pillar',
  order: 1,
  slug: 'child-support',
  nav: 'Child support calculator',
  card: 'Your state’s own guideline: schedule, percentage or formula',
  title: 'Child Support Calculator 2026: Every State’s Own Guideline',
  description: 'Child support calculator for 2026 that applies your state’s official guideline: income shares schedule, percentage or formula, parenting time and add-ons.',
  h1: 'Child support calculator for every state',
  intro: 'Pick your state: the calculator switches to that state’s official schedule, percentage or formula, with its own rule for shared parenting time.',
  resume: `Child support in the United States is computed under the guideline of the state where the order is made, and the guidelines differ in what they measure: ${shares.length} of the ${CS.length} jurisdictions here split a table amount between both parents by income (income shares), ${pctStates.length} take a percentage of income (${listOf(pctStates.map((d) => d.name))}), and ${other.length} use a formula of their own. For two children, a paying parent earning ${usd(6000)} a month and another parent earning ${usd(2500)}, the guideline result ranges from ${fam.length ? usd(fam[0].m) : ''} in ${fam[0]?.d.name ?? ''} to ${fam.length ? usd(fam[fam.length - 1].m) : ''} in ${fam[fam.length - 1]?.d.name ?? ''} a month, with ${mid?.d.name ?? ''} near the middle at ${mid ? usd(mid.m) : ''}. Enter both incomes as your state defines them (the field tells you whether it is gross or net), the number of children and the overnights the paying parent has: the calculator applies the threshold and the formula your state uses for shared parenting, then adds work-related child care and the children’s health insurance in proportion to income.`,
  tool: 'child-support',
  toolProps: { state: 'california' },
  body: (h) => `<h2>Three families of guidelines</h2>
<p>Every state must have a child support guideline that judges apply unless they explain in writing why it would be unjust in a particular case (${h.src('usc667', '42 U.S.C. § 667')}). Federal rules require each state to review its guideline at least once every four years, to consider the economic data on the cost of raising children, and to take the paying parent's ability to pay into account (${h.src('cfr30256', '45 CFR § 302.56')}). Within those limits, states chose their own models.</p>
<p><strong>Income shares.</strong> The guideline assumes children should receive the share of income they would have received if the parents lived together. A table gives the amount for each level of combined income and each number of children; each parent owes a share proportional to his or her income, and the parent with less time pays that share to the other. ${listOf(shares.slice(0, 8).map((d) => h.aIf(`child-support:${d.slug}`, d.name)))} are among the states that use it.</p>
<p><strong>Percentage of income.</strong> A fixed share of the paying parent's income, rising with the number of children, sometimes with a cap on the income counted. ${pctStates.length ? `${listOf(pctStates.map((d) => h.aIf(`child-support:${d.slug}`, d.name)))} work this way, with their own definitions of income.` : ''}</p>
<p><strong>Formulas.</strong> ${other.length ? `${listOf(other.map((d) => h.aIf(`child-support:${d.slug}`, d.name)))} use an equation or a multi-step formula` : 'A few states use an equation or a multi-step formula'}: California's builds parenting time into its K factor, and the Melson formula first protects a minimum for each parent's own needs.</p>
<h2>Parenting time changes the amount</h2>
<p>In most income-shares states, the basic amount is used as is until the paying parent reaches a set number of overnights a year. Past that point a shared-parenting formula applies: the table amount is multiplied (often by 1.5, because two homes cost more than one), each parent's share is computed, and the two obligations are offset according to the time each parent has. ${thr.length ? `The thresholds we apply range from ${Math.min(...thr)} to ${Math.max(...thr)} overnights a year depending on the state.` : ''} Other states reduce the amount by a percentage that grows with parenting time, and a few, such as Texas and New York, have no parenting-time formula at all and leave it to the judge as a reason to deviate.</p>
<h2>What counts as income</h2>
<p>The single most important input is the definition of income, and states disagree. Some start from gross income before taxes, others from net income after federal and state income taxes, Social Security and Medicare, and some from an adjusted figure (gross minus support paid for other children, union dues or health insurance premiums). Under each income field, the calculator states the definition used by the state you picked. Income a court may add, such as overtime, bonuses, rental income or income imputed to a parent who works less than he or she could, is up to you to include.</p>
<h2>What the guideline adds to the basic amount</h2>
<p>Most guidelines add two costs to the basic obligation and share them by income: child care needed so a parent can work or study, and the children's portion of health insurance premiums. Uninsured medical costs, school fees and travel for visits are usually handled separately. A few states treat health insurance differently, as a deduction from income rather than an add-on; the state page tells you which.</p>
<h2>When the court departs from the guideline</h2>
<p>The guideline result is presumed correct, not mandatory. Judges may deviate for reasons listed in each state's law: very high income, a child's special needs, extraordinary travel costs for parenting time, or other children the paying parent supports. Parents can also agree to a different amount, which the court must usually review against the guideline. That is why the calculator shows the guideline figure and the steps behind it rather than a promise of what an order will say.</p>
<p>For the time support lasts, how it is enforced and how to request a review, see ${h.a('how-much-is-child-support', 'how much child support is, case by case')}.</p>`,
  faqs: [
    { q: 'How is child support calculated in most states?', a: 'Most states use the income shares model: both parents’ incomes are added, the support for that combined income is read in the state’s official table for the number of children, and each parent owes a share proportional to his or her income. The parent who has the children less often pays that share, adjusted for child care, health insurance and, above a set number of overnights, shared parenting time.' },
    { q: 'Does the other parent’s income matter for child support?', a: 'In income-shares and formula states, yes: a higher income for the parent receiving support lowers the paying parent’s share. In the percentage states that apply a rate to the paying parent’s income alone, such as Texas or Wisconsin, the other parent’s income does not enter the basic calculation, although a judge may still consider it as a reason to deviate from the guideline.' },
    { q: 'Can parents agree to a different child support amount?', a: 'Parents can propose an agreed amount, but the court usually reviews it against the guideline and approves it only if it serves the children’s interest; many states require the order to state the guideline amount and the reason for any difference. An agreement that waives support entirely is generally not enforceable, because the right to support belongs to the child, not to the parents.' },
    { q: 'Does shared custody mean no child support?', a: 'Not necessarily. Even with equal time, the parent with the higher income usually pays the other, because shared-parenting formulas offset each parent’s share of a larger combined amount. Support disappears only when incomes and time are close enough for the two obligations to cancel out. Enter your overnights in the calculator to see how your state’s formula handles your schedule.' },
    { q: 'Is child support taxable or deductible?', a: 'No, in every state. Child support is not deductible by the parent who pays it and not taxable income for the parent who receives it, under federal tax law (IRS Publication 504). That differs from alimony under agreements signed before 2019. It is one reason a guideline computed on gross income can feel heavier than one computed on net income.' },
    { q: 'How often is the child support schedule updated?', a: 'Federal rules require each state to review its guideline at least every four years, using current data on the cost of raising children. Some states adjust their tables or income caps on a fixed calendar, for instance every two or six years; others update only after a review leads to a new law or court rule. Each state page shows the date the rules it applies took effect.' },
  ],
  related: ['how-much-is-child-support', 'alimony', 'divorce-cost', 'child-support:california', 'child-support:texas', 'child-support:florida'],
  sources: ['usc667', 'cfr30256', 'irs504'],
});
