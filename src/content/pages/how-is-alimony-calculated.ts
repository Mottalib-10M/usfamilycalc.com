import { definePage } from '../../lib/page-types';
import { alAll, alCalc, usd } from '../../lib/kit';

const AL = alAll();
const withAmount = AL.filter((d) => { const r = alCalc(d.slug, { payer: 8000, payee: 3000, years: 12 }); return r.monthly > 0 || (r.high ?? 0) > 0; });
const ex = withAmount.map((d) => ({ d, r: alCalc(d.slug, { payer: 8000, payee: 3000, years: 12 }) }));
const vals = ex.map((x) => x.r.high ?? x.r.monthly).sort((a, b) => a - b);
const med = vals.length ? vals[Math.floor(vals.length / 2)] : 0;

export default definePage({
  id: 'how-is-alimony-calculated',
  topic: 'alimony',
  kind: 'guide',
  order: 2,
  slug: 'how-is-alimony-calculated',
  nav: 'How is alimony calculated?',
  card: 'Formulas, factors and the length of the marriage, with examples',
  title: 'Alimony Calculation 2026: How Spousal Support Is Worked Out',
  description: 'How alimony is calculated in 2026: the percentage formulas some states use, the factors judges weigh elsewhere, how long support lasts and how taxes changed.',
  h1: 'How is alimony calculated?',
  intro: 'Two methods coexist: a formula in a few states, and a judge weighing factors everywhere. Here is how each one turns two incomes into a monthly amount.',
  resume: `Alimony is calculated in one of two ways. In the states that publish a formula, the amount is a percentage of the higher earner's income minus a percentage of the lower earner's income, capped so that the recipient does not end up with more than a set share, often 40 percent, of the couple's combined income; for a higher earner at ${usd(8000)} a month and a spouse at ${usd(3000)}, the formulas on this site give a median of about ${usd(med)} a month. Everywhere else, and for final judgments in many formula states, the judge weighs statutory factors: the length of the marriage, each spouse's earning capacity and health, the standard of living, contributions to the household and the property each receives. Duration follows the length of the marriage in most states, through a fraction, a table or a maximum. Since 2019, new agreements are neither deductible nor taxable on federal returns.`,
  mini: 'alimonyFormula',
  miniArg: withAmount,
  body: (h) => `<h2>The formula method, step by step</h2>
<p>Formula states start from each spouse's income, gross in some states and net in others. They take a percentage of the payer's income, subtract a percentage of the recipient's income, and compare the result with a ceiling. Illinois, for instance, takes a third of the payer's net income minus a quarter of the recipient's, then checks that the recipient's income plus maintenance does not exceed 40 percent of the couple's combined net income; the lower of the two figures is the guideline amount. New York uses 20 and 25 percent when child support is also paid, 30 and 20 percent when it is not, with the same 40 percent check and a cap on the payer income it applies to.</p>
<p>Three conditions often limit these formulas. Some apply only to temporary support while the divorce is pending. Some apply only below a combined income limit, above which the court decides freely. And some are advisory: the judge must compute them but may depart from them with written reasons.</p>
<h2>The factor method</h2>
<p>Most state statutes list what the court must consider rather than how to compute. The common factors are the length of the marriage; the age, health and earning capacity of each spouse; the time and cost of education or training to become self-supporting; the standard of living established during the marriage; contributions as a homemaker or to the other spouse's education and career; the property division; and the tax consequences. Some states add marital misconduct. A judge applying factors often starts from the recipient's reasonable needs and the payer's ability to pay, which is why budgets and financial affidavits matter so much in those states.</p>
<h2>How long support lasts</h2>
<p>Duration rules tie support to the length of the marriage, measured from the wedding to the filing or the separation depending on the state. Some use a fraction (half of the marriage as a guide in California for marriages under ten years), some a table of factors (Illinois multiplies the length of the marriage by a factor that rises with each year), some a maximum (Texas allows five, seven or ten years depending on the length of the marriage). Long marriages, often twenty years or more, may justify support for an indefinite period. Rehabilitative support, meant to pay for training or education, has a shorter, defined term.</p>
<h2>Temporary, rehabilitative, permanent</h2>
<p>Temporary or pendente lite support covers the period of the case itself. Rehabilitative support helps a spouse become self-supporting. Durational or general term support follows the marriage-length rules. Permanent alimony has been abolished or restricted in several states, Florida among them since 2023. Reimbursement alimony repays a spouse who supported the other through school.</p>
<h2>Taxes and the order of calculation</h2>
<p>Agreements executed after 2018 are tax-neutral at the federal level: the payer cannot deduct alimony and the recipient does not report it (${h.src('irs452', 'IRS Topic 452')}). Older agreements keep their deductible treatment unless modified to adopt the new rule. When child support is also ordered, states differ on which comes first; the result can move the alimony figure by hundreds of dollars a month, which is why the full ${h.a('alimony', 'alimony calculator')} asks whether child support is paid.</p>
<h2>A worked comparison</h2>
<p>Take spouses married twelve years, one earning eight thousand dollars a month and the other three thousand, with no children. Under an Illinois-style formula, a third of the payer's net minus a quarter of the recipient's net gives the first figure, then the 40 percent ceiling on combined net income is checked. Under a Massachusetts-style rule, the amount falls in a range of 30 to 35 percent of the difference in gross incomes. Under a Texas-style rule, the court first decides whether the spouse is eligible at all, then cannot exceed the cap. Run the mini calculator above with the same incomes in different states and the results move by hundreds of dollars a month, before duration rules make the gap larger still. That spread is why spouses in formula states often settle near the guideline, while spouses elsewhere negotiate from budgets.</p>
<h2>Imputed income and earning capacity</h2>
<p>Formulas use income, but courts may substitute earning capacity. A spouse who quits a job or works far below his or her qualifications can be assigned the income he or she could reasonably earn, based on work history, education and the local job market. The same applies to a payer who reduces income to lower support. Expect to document job searches and offers if earning capacity is disputed.</p>
<h2>Modifying or ending it</h2>
<p>Periodic alimony usually ends at the recipient's remarriage or either spouse's death, and may be reduced when the recipient cohabits or when the payer's income falls substantially. Agreements can make support non-modifiable. Retirement can end or reduce support in states that tie it to full retirement age.</p>`,
  faqs: [
    { q: 'What percentage of income is alimony?', a: 'There is no single percentage. In formula states it is typically 20 to 40 percent of the payer’s income minus 20 to 50 percent of the recipient’s, capped so the recipient gets no more than about 40 percent of combined income. In other states the judge sets the amount from factors and the recipient’s needs, so the share varies case by case.' },
    { q: 'How is alimony calculated when one spouse doesn’t work?', a: 'The formula or the judge starts from the non-working spouse’s income, which may be zero, or from income the court imputes if that spouse could reasonably work. With no income on one side, formulas often hit their cap, for example 40 percent of combined income. Courts also look at how long the spouse has been out of the workforce and the cost of retraining.' },
    { q: 'How many years do you have to be married to get alimony?', a: 'Few states set a minimum, but the length of the marriage drives both eligibility and duration. Texas requires ten years of marriage for most maintenance, except in cases of family violence; Maine presumes no general support under ten years; Colorado’s guideline starts at three years. Short marriages usually lead to short or rehabilitative support, if any.' },
    { q: 'Is alimony based on gross or net income?', a: 'It depends on the state. Illinois, Florida and Pennsylvania formulas use net income in different ways, while New York, Colorado, Massachusetts, Virginia and Texas start from gross or adjusted gross income. Using the wrong definition is the most common source of error in estimates, so check the income label for your state in the calculator.' },
    { q: 'Does adultery affect alimony?', a: 'In some states it can. Several statutes let the court consider marital misconduct, and a few bar or reduce alimony for a spouse who committed adultery. Most states with no-fault divorce give little or no weight to fault in the amount. The state pages note when a formula ignores conduct and when the statute lists it as a factor.' },
  ],
  related: ['alimony', 'child-support', 'how-much-is-child-support', 'divorce-cost'],
  sources: ['irs452', 'irs504'],
});
