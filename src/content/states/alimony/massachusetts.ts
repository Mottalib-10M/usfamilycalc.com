import { defineStatePage } from '../../../lib/page-types';
import { al, alCalc, usd, pct, num } from '../../../lib/kit';

const d = al('massachusetts');
const P = d.params;
const T = d.durationTable as unknown as Array<{ marriageYearsMin: number; marriageYearsMax: number | null; maxPctOfMonthsMarried: number | null }>;
const lo = P.pctOfGrossIncomeDifferenceMin, hi = P.pctOfGrossIncomeDifferenceMax;
const ex = alCalc('massachusetts', { payer: 10500, payee: 4000, years: 13 });
const ex2 = alCalc('massachusetts', { payer: 10500, payee: 4000, years: 22 });
const lastCap = T.filter((r) => r.maxPctOfMonthsMarried != null).pop()!;

export default defineStatePage({
  topic: 'alimony',
  slug: 'massachusetts',
  title: `Massachusetts Alimony Calculator 2026: ${lo} to ${hi}% of the Gap`,
  description: `Massachusetts general term alimony 2026: generally no more than ${pct(lo)} to ${pct(hi)} of the gross income gap, for at most ${pct(T[0].maxPctOfMonthsMarried!)} to ${pct(lastCap.maxPctOfMonthsMarried!)} of the months spouses were married.`,
  intro: 'The 2011 Alimony Reform Act gave Massachusetts a ceiling on the amount and a fixed scale for the length of general term alimony.',
  resume: `In Massachusetts, general term alimony should generally not exceed the recipient's need or ${pct(lo)} to ${pct(hi)} of the difference between the spouses' gross incomes when the order is made, according to the Probate and Family Court's summary of the Alimony Reform Act (M.G.L. c. 208, § 53(b)). On ${usd(10500)} and ${usd(4000)} of monthly gross income, that ceiling runs from ${usd(ex.low ?? 0)} to ${usd(ex.high ?? 0)} a month; the calculator shows the top of the range as its headline figure, because the statute sets a limit, not a target. Duration is capped by the length of the marriage: ${pct(T[0].maxPctOfMonthsMarried!)} of the months married for marriages of ${T[0].marriageYearsMax} years or less, rising by bands to ${pct(lastCap.maxPctOfMonthsMarried!)} for marriages of ${lastCap.marriageYearsMax} years or less, so a 13-year marriage allows ${num(ex.durationMonths ?? 0, 1)} months. After more than ${lastCap.marriageYearsMax} years, the judge may order alimony for as long as is fair. General term alimony normally ends when the payer reaches full retirement age.`,
  body: (h) => `<h2>Why the headline is the ${h.pct(hi)} figure</h2>
<p>Massachusetts does not tell the judge what to order. It tells the judge what not to exceed, except in unusual cases: the lesser of the recipient's need and ${h.pct(lo)} to ${h.pct(hi)} of the gross income difference. A recipient whose documented budget gap is small receives less, whatever the percentage. We display the ${h.pct(hi)} end because it answers the question people ask first, how high can it go, and we show the ${h.pct(lo)} end next to it. In our example of ${h.usd(10500)} and ${h.usd(4000)}, the difference is ${h.usd(10500 - 4000)} and the ceiling lies between ${h.usd(ex.low ?? 0)} and ${h.usd(ex.high ?? 0)}.</p>
<p>Gross income is borrowed from the Child Support Guidelines. Two kinds of income are left out: capital gains, dividends and interest from assets already divided in the divorce, and income already used to set a child support order. If the payer remarries, the new spouse's income cannot be used to justify an increase.</p>

<h2>The duration scale</h2>
${h.table(['Marriage length', 'General term alimony, at most'], T.map((r) => [r.marriageYearsMax == null ? `more than ${h.num(r.marriageYearsMin)} years` : `${h.num(r.marriageYearsMax)} years or less`, r.maxPctOfMonthsMarried == null ? 'as long as the judge finds fair' : `${h.pct(r.maxPctOfMonthsMarried)} of the months married`]), 'M.G.L. c. 208, § 49(b), as summarized by the Probate and Family Court.', ['l', 'r'])}
<p>The scale counts months, so a 13-year marriage of ${h.num(13 * 12)} months caps general term alimony at ${h.num(ex.durationMonths ?? 0, 1)} months, while a 22-year marriage leaves the term to the judge, which our calculator reports as no fixed limit (${ex2.durationMonths == null ? 'open-ended' : h.num(ex2.durationMonths)}). Judges can exceed these limits for good reason, and a recipient can ask for an extension through a complaint for modification on clear and convincing evidence of a material change.</p>

<h2>Retirement, cohabitation and the other three types</h2>
<p>General term alimony normally ends when the payer reaches full retirement age as defined for Social Security, unless the judge orders otherwise at the start. Living with a partner for at least three months can reduce, suspend or end it. Rehabilitative alimony targets a recipient expected to become self-supporting by a predictable date, while reimbursement and transitional alimony are limited to marriages of five years or less: the first repays the cost of helping the other spouse through school or training, the second eases a move into a new life or place.</p>`,
  faqs: [
    {
      q: 'How much alimony is typical in Massachusetts?',
      a: `There is no typical figure, only a ceiling. Massachusetts general term alimony should generally be no more than the recipient's need or ${pct(lo)} to ${pct(hi)} of the difference in gross incomes at the time of the order. A recipient whose need is lower than that receives less. Judges may depart from the limit in unusual cases, such as illness, tax issues or a long period of cohabitation before marriage.`,
    },
    {
      q: 'Does alimony stop at retirement in Massachusetts?',
      a: 'Usually, yes. Under the Alimony Reform Act, Massachusetts general term alimony ends when the paying spouse reaches full retirement age as defined for Social Security benefits, unless the judge set a different rule in the original judgment for good reason. A recipient who needs support beyond that date must show why at the time of the order or through a modification.',
    },
    {
      q: 'Can living with a new partner end alimony in Massachusetts?',
      a: 'It can. If the Massachusetts recipient of general term alimony has maintained a common household with another person for at least three months, the court may reduce, suspend or terminate the alimony. Remarriage of the recipient ends general term alimony, and the death of either spouse ends it too, as in most states.',
    },
  ],
  related: ['alimony', 'how-is-alimony-calculated', 'divorce-cost', 'alimony:new-york', 'alimony:maine'],
});
