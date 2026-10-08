import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day } from '../../../lib/kit';

const d = cs('massachusetts');
type Band = { basis: 'payor' | 'combined'; min: number; max: number; base: number; pct: number; above: number };
const F = d.formula as unknown as {
  weeklyCap: number; annualCap: number; tableA: Band[]; tableB_numberOfChildrenFactor: Record<string, number>;
  tableC_age18PlusReductionPct: { rowsChildrenUnder18_colsChildren18plus_1to5: Record<string, number[]> };
  childCareCapPerChildPerWeek: number; incomeDisparityThresholdPct: number; hardshipPresumptionPct: number;
};
const combined = F.tableA.filter((b) => b.basis === 'combined');
const payorBands = F.tableA.filter((b) => b.basis === 'payor');
const TB = F.tableB_numberOfChildrenFactor;
const TC = F.tableC_age18PlusReductionPct.rowsChildrenUnder18_colsChildren18plus_1to5;
const mo = (weekly: number) => (weekly * 52) / 12;
const wk = (monthly: number) => (monthly * 12) / 52;
const pA = 1500, pB = 500;
const one = csCalc('massachusetts', mo(pA), mo(pB), 1);
const two = csCalc('massachusetts', mo(pA), mo(pB), 2);
const box1 = csCalc('massachusetts', mo(pA), mo(pB), 2, { payerOvernights: 182 });
const lowW = 280;
const low = csCalc('massachusetts', mo(lowW), mo(900), 1);
const rich = csCalc('massachusetts', mo(9000), mo(3000), 1);
const care = csCalc('massachusetts', mo(pA), mo(pB), 1, { childcare: mo(600) });

export default defineStatePage({
  topic: 'child-support',
  slug: 'massachusetts',
  title: `Massachusetts Child Support 2026: Weekly Bands, 2025 Rules`,
  description: `Massachusetts child support 2026 under the guidelines of ${day(d.effective!)}: weekly bands from ${pct(combined[0].pct)} to ${pct(combined[combined.length - 1].pct)}, a ${usd(F.annualCap)} income cap, ${usd(wk(one.monthly))} a week for one child.`,
  intro: 'The Massachusetts worksheet works in weeks and in marginal bands, not in a schedule of rows.',
  resume: `Massachusetts sets child support with a weekly formula, not a table of rows. Under the guidelines in force since ${day(d.effective!)}, a parent with ${usd(pA)} of weekly gross income, next to a co-parent at ${usd(pB)}, owes about ${usd(wk(one.monthly))} a week for one child, ${usd(one.monthly)} a month, before child care. The worksheet adds both parents' available income, applies marginal percentages band by band (${pct(combined[0].pct)} on the first ${usd(combined[0].max)} a week, falling to ${pct(combined[combined.length - 1].pct)} near the top), multiplies the one-child amount by a factor for more children (${num(TB['2'], 2)} for two, ${num(TB['3'], 2)} for three), then splits it by income. Combined income counts up to ${usd(F.weeklyCap)} a week, ${usd(F.annualCap)} a year. A payer earning ${usd(payorBands[0].max)} a week or less owes no more than ${usd(payorBands[0].base)} a week unless the court deviates. Orders reaching ${pct(F.hardshipPresumptionPct)} of the payer's available income are presumed to be a hardship.`,
  body: (h) => `<h2>Marginal bands instead of a grid</h2>
<p>Where most states print hundreds of income rows, Massachusetts prints one short schedule, Table A of worksheet CJD 304, and lets the arithmetic do the rest. Each band adds its own percentage only to the dollars inside it, like an income tax bracket. The official chart that the Trial Court also publishes is simply this formula rounded to the dollar.</p>
${h.table(['Weekly income', 'Support for one child'], F.tableA.map((b) => [`${b.basis === 'payor' ? 'Payer' : 'Combined'}: ${usd(b.min)} to ${usd(b.max)}`, b.pct === 0 ? `${usd(b.base)}` : b.base === 0 ? `${pct(b.pct)}` : `${usd(b.base)} + ${pct(b.pct)} above ${usd(b.above)}`]), 'Table A of the 2025 Massachusetts guidelines worksheet (weekly amounts)', ['left', 'right'])}
<p>The first two lines read the paying parent's own gross income; every other line reads combined available income. For two children the one-child amount is multiplied by ${num(TB['2'], 2)}, so the parent above owes about ${usd(wk(two.monthly))} a week (${usd(two.monthly)} a month). Available income here means gross income minus the children's health premium the parent pays and support already paid for other children.</p>
<h2>Three boxes for parenting time</h2>
<p>The worksheet does not count overnights. It asks which of three boxes fits: children living mainly with one parent about two thirds of the time, time shared approximately equally, or a split where each parent has at least one child. In the shared box both parents' amounts are computed and the higher one pays the difference. With equal time, the same family's support drops to about ${usd(wk(box1.monthly))} a week. This calculator uses the shared box only from half the year; for anything in between, the guidelines treat a schedule well above or below one third as a ground for deviation.</p>
<p>In the two-thirds box, a guard protects a recipient with much more income than the payer: if support would be under ${pct(F.incomeDisparityThresholdPct)} of the recipient's available income, line 7b limits it. Child care counts up to ${usd(F.childCareCapPerChildPerWeek)} per child per week: with ${usd(600)} a week of care for one child, the payer's total rises to ${usd(wk(care.monthly))} a week.</p>
<h3>Low and high incomes</h3>
<p>A payer at ${usd(lowW)} a week falls in the first band and owes ${usd(wk(low.monthly))} a week here, unless the court deviates. Above ${usd(F.weeklyCap)} of combined weekly income, the formula stops and the judge decides any extra at a lower percentage: a family at ${usd(12000)} a week with one child gets ${usd(wk(rich.monthly))} from the formula. Support for children aged 18 to 23 is discretionary and reduced, for instance by ${pct(TC['0'][0])} when every child covered is 18 or older; the calculator assumes all children are minors. For alimony, Massachusetts has its own statute, covered on the ${h.a('alimony:massachusetts', 'Massachusetts alimony page')}.</p>`,
  faqs: [
    { q: 'Why is Massachusetts child support calculated weekly?', a: `Because the Trial Court's guidelines, worksheet and chart are all written in weekly dollars, from the income lines to the child care cap. To compare with a monthly figure, multiply by 52 and divide by 12: ${usd(wk(one.monthly))} a week for one child, in our example with ${usd(pA)} and ${usd(pB)} of weekly income, is ${usd(one.monthly)} a month.` },
    { q: 'Does Massachusetts reduce child support for a child over 18?', a: `Yes, when the court chooses to order support for a child aged 18 to 23. Table C of the worksheet cuts the combined amount, by ${pct(TC['0'][0])} when every child on the order is 18 or older and by smaller percentages in mixed families, such as ${pct(TC['1'][0])} with one younger and one older child. A child of 18 still in high school counts as under 18.` },
    { q: 'What is the smallest child support order in Massachusetts?', a: `${usd(payorBands[0].base)} a week when the paying parent's gross income is ${usd(payorBands[0].max)} a week or less, and no more than about ${usd(payorBands[1].base + (payorBands[1].pct / 100) * (payorBands[1].max - payorBands[1].above))} a week between ${usd(payorBands[1].min)} and ${usd(payorBands[1].max)}. The 2025 task force set those lines at 100% and 130% of the federal poverty guideline for one person. A judge may still go higher, lower or to zero as a deviation.` },
    { q: 'How does Massachusetts treat income above the guideline cap?', a: `The worksheet applies the formula to combined available income up to ${usd(F.weeklyCap)} a week, ${usd(F.annualCap)} a year, and treats that amount as the minimum presumptive order. Support on income above it is left to the judge, at a percentage below the ${pct(combined[combined.length - 1].pct)} of the top band, adjusted for the number and ages of the children.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:new-hampshire', 'child-support:new-york', 'alimony:massachusetts'],
});
