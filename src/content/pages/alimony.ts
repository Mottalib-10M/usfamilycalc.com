import { definePage } from '../../lib/page-types';
import { alAll, alCalc, usd, listOf } from '../../lib/kit';

const AL = alAll();
const amount = AL.filter((d) => { const r = alCalc(d.slug, { payer: 8000, payee: 3000, years: 12 }); return r.monthly > 0 || (r.high ?? 0) > 0; });
const durOnly = AL.filter((d) => !amount.includes(d));
const ex = amount.map((d) => ({ d, r: alCalc(d.slug, { payer: 8000, payee: 3000, years: 12 }) })).map((x) => ({ ...x, m: x.r.high ?? x.r.monthly })).sort((a, b) => a.m - b.m);

export default definePage({
  id: 'alimony',
  topic: 'alimony',
  kind: 'pillar',
  order: 1,
  slug: 'alimony',
  nav: 'Alimony calculator',
  card: 'The formula, cap and duration of the states that publish one',
  title: 'Alimony Calculator 2026: Spousal Support Formulas by State',
  description: 'Alimony and spousal support calculator for 2026: the formula, income cap and duration of each state that publishes one, and what judges weigh elsewhere.',
  h1: 'Alimony and spousal support calculator',
  intro: 'Only some states write spousal support into a formula. Pick one of them and the calculator applies its percentages, caps and duration rule; for the others, the state page explains what the judge weighs.',
  resume: `There is no national alimony formula, and most states have none at all: judges set spousal support, called maintenance in New York, Illinois and Colorado, from a list of factors such as the length of the marriage, each spouse's earning capacity and the standard of living. ${amount.length} states on this site publish a formula that produces an amount (${listOf(amount.map((d) => d.name))}), sometimes only for temporary support while the divorce is pending, and ${durOnly.length ? `${listOf(durOnly.map((d) => d.name))} set rules on how long support may last without fixing the amount` : 'others only limit how long support lasts'}. For a higher earner at ${usd(8000)} a month and a spouse at ${usd(3000)}, married twelve years, the formulas give from ${ex.length ? usd(ex[0].m) : ''} in ${ex[0]?.d.name ?? ''} to ${ex.length ? usd(ex[ex.length - 1].m) : ''} a month in ${ex[ex.length - 1]?.d.name ?? ''}, because they differ in the income they count, the percentages and the caps. Pick your state in the calculator to apply its own rule, and read the scope line: a temporary formula does not bind the final judgment.`,
  tool: 'alimony',
  toolProps: { state: AL.some((d) => d.slug === 'california') ? 'california' : AL[0]?.slug },
  body: (h) => `<h2>Formulas, caps and durations</h2>
<p>State rules on spousal support come in three kinds. A <strong>formula</strong> turns both incomes into an amount, usually a percentage of the higher income minus a percentage of the lower one, with a ceiling so the recipient does not end up with more than a set share of the combined income. A <strong>cap</strong> limits the amount without computing it, as in Texas, where maintenance cannot exceed the lesser of a fixed dollar amount and a fifth of the payer's average monthly gross income. A <strong>duration rule</strong> ties the length of support to the length of the marriage, as a fraction, a table or a maximum number of years.</p>
<p>Many formulas apply only to <strong>temporary support</strong> while the case is pending, and some only when combined income stays under a limit. Above it, or for the final judgment, the judge returns to the statutory factors. The calculator always shows the scope of the rule it applies.</p>
<h2>What every judge looks at</h2>
<p>Where no formula exists, and even where one does, courts weigh a familiar list: the length of the marriage, the age and health of each spouse, each one's earning capacity and the time needed to train or find work, contributions to the home and to the other spouse's career, the standard of living during the marriage, the property each receives in the divorce, and, in some states, fault. The ${h.a('how-is-alimony-calculated', 'guide to how alimony is calculated')} goes through these factors with examples.</p>
<h2>Taxes changed in 2019</h2>
<p>For divorce or separation agreements signed after December 31, 2018, alimony is no longer deductible by the payer and not taxable to the recipient on the federal return (${h.src('irs452', 'IRS Topic 452')}). Older agreements keep the old treatment unless modified to adopt the new one. Several state formulas were written when alimony was deductible, which is why Colorado and some others reduce the guideline amount for post-2018 orders, and why Pennsylvania changed its percentages for orders entered from 2019.</p>
<h2>Alimony and child support together</h2>
<p>When both are ordered, the order of calculation matters. Some states compute spousal support first and then count it as income of the recipient for child support; others compute child support first and apply the spousal formula to what is left. New York uses a lower percentage when child support will also be paid. The calculator asks whether child support is paid and, where the state requires it, how much.</p>
<h2>Ending or changing support</h2>
<p>Support usually ends at the end of its term, at the death of either spouse, or when the recipient remarries; many states also allow ending or reducing it when the recipient lives with a new partner. A substantial change in income can justify a modification unless the agreement says the amount cannot be modified. Several states, Massachusetts among them, end general term alimony when the payer reaches full retirement age.</p>`,
  faqs: [
    { q: 'Which states have an alimony formula?', a: `Only a minority. On this site, ${listOf(amount.map((d) => d.name))} publish a formula or official guideline that produces an amount, sometimes only for temporary support or under an income limit. Most other states leave the amount to the judge, guided by statutory factors such as the length of the marriage and each spouse's earning capacity.` },
    { q: 'How long does alimony last?', a: 'It depends on the state and on the length of the marriage. Some states use a fraction of the marriage, others a table or a maximum number of years, and long marriages may lead to indefinite support. Where no rule exists, the judge sets a term or leaves the duration open. The state pages give the official rule and the calculator applies it to your marriage length.' },
    { q: 'Is alimony taxable in 2026?', a: 'For divorce or separation agreements executed after 2018, alimony is not deductible by the payer and not taxable to the recipient on the federal return, according to IRS Topic 452. Agreements signed before 2019 keep the old rule, deductible and taxable, unless they are modified and the modification expressly adopts the new treatment. State income tax rules may differ.' },
    { q: 'Can a husband get alimony?', a: 'Yes. Alimony laws are gender-neutral in every state: the spouse with the higher income or earning capacity may be ordered to pay the other, whoever that is. The same formulas, caps and factors apply. What matters is the difference in incomes, the length of the marriage and the recipient’s need, not which spouse earns more.' },
    { q: 'Does remarriage end alimony?', a: 'In most states, the recipient’s remarriage ends periodic alimony automatically unless the agreement says otherwise, and the death of either spouse ends it too. Living with a new partner can also justify reducing or ending support in many states. Lump-sum alimony or property division already paid is not affected by a later remarriage.' },
    { q: 'What is the difference between alimony and maintenance?', a: 'They are names for the same thing: money one spouse pays the other after or during a divorce. New York, Illinois, Colorado and some other states call it maintenance; California and several others say spousal support; many statutes still say alimony. Temporary or pendente lite support is paid while the case is pending, and its formula may differ from the final one.' },
  ],
  related: ['how-is-alimony-calculated', 'child-support', 'divorce-cost', 'how-much-is-child-support', 'probate'],
  sources: ['irs452', 'irs504'],
  extraSources: AL.slice(0, 3).map((d) => ({ name: `${d.name}: spousal support rule`, url: (d.sources[0] ?? { url: '' }).url })).filter((s) => s.url),
});
