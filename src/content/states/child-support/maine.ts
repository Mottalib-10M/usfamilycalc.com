import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, usdx, num, day } from '../../../lib/kit';

const d = cs('maine');
const S = d.schedule!;
const F = d.formula as { enhancedMultiplier: number; substantiallyEqualCareMinOvernights: number; maxCombinedAnnualIncome: number };
const wk = (m: number) => (m * 12) / 52;
const A = 5000, B = 2500; // monthly gross
const annual = (A + B) * 12;
const row = S.rows.reduce((best, r) => (Math.abs(r[0] - annual) < Math.abs(best[0] - annual) ? r : best));
const one = csCalc('maine', A, B, 1);
const two = csCalc('maine', A, B, 2);
const equal = csCalc('maine', A, B, 2, { payerOvernights: F.substantiallyEqualCareMinOvernights });
const top = S.rows[S.rows.length - 1];
const bot = S.rows[0];
const steps = [S.rows[1][0] - bot[0], top[0] - S.rows[S.rows.length - 2][0]];

export default defineStatePage({
  topic: 'child-support',
  slug: 'maine',
  title: `Maine Child Support 2026: Weekly Amounts per Child Table`,
  description: `Maine child support 2026: annual gross income, a weekly amount per child times the children, and ${num(F.enhancedMultiplier, 1)} for equal care; ${usd(two.monthly)} a month for two in our case.`,
  intro: 'The DHHS Child Support Table and 19-A M.R.S. § 2006, read the way a Maine court reads them.',
  resume: `Maine's child support table is unlike most: you enter the parents' combined annual gross income, and the cell you read is a weekly amount for each child, which you then multiply by the number of children. Parents earning ${usd(A * 12)} and ${usd(B * 12)} a year have a combined ${usd(annual)}; the closest row of the table gives ${usd(row[2])} a week per child when there are two children, so ${usd(row[2] * 2)} a week in all. The higher earner's two thirds come to about ${usd(wk(two.monthly))} a week, or ${usd(two.monthly)} a month, before child care and health insurance. The per-child figure shrinks as children are added, which is why one child alone costs ${usd(row[1])} a week here. The table in force was adopted by the Department of Health and Human Services effective ${day(d.effective!)}. When parents provide substantially equal care, the entitlement is multiplied by ${num(F.enhancedMultiplier, 1)} and the higher earner pays the lower of two figures, ${usd(equal.monthly)} a month in this example.`,
  body: (h) => `<h2>A year of income, a week of support, one child at a time</h2>
<p>Section 2006(1) gives the order of operations: add the two annual gross incomes, find the figure in the left-hand column closest to that total, read the dollar figure for the total number of children, and multiply it by the number of children. The rows climb by ${usd(steps[0])} of annual income from ${usd(bot[0])} and by ${usd(steps[1])} near the top, which ends at ${usd(top[0])}. Because the rule says closest, a family halfway between two rows takes the nearer one rather than the lower one. Orders are written per week, so the monthly figure in our calculator is the weekly amount times 52 divided by 12.</p>
<p>The age columns that older Maine tables carried, one for younger children and one for teenagers, are gone: the Legislature repealed the age categories in 2017, and today's table has one column per family size. Child care still has an age rule of its own, since it is added to the basic entitlement only for children under 12.</p>
<h2>Substantially equal care, measured by care and not by nights</h2>
<p>Maine has no overnight threshold. Section 2001(8-A) defines substantially equal care as both parents taking part substantially equally in the child's total care: home, school, activities, child care, medical and dental needs. If incomes are equal as well, nobody pays. If they are not, § 2006(5)(D-1) applies: the basic entitlement times ${num(F.enhancedMultiplier, 1)}, split by income, and the higher earner pays the lower of the difference between the two shares and what he or she would pay under primary residential care. Our calculator needs a number, so it treats ${num(F.substantiallyEqualCareMinOvernights)} nights or more with the paying parent as substantially equal care; that is our convention, not the statute's. In our example the order goes from ${usd(two.monthly)} to ${usd(equal.monthly)} a month.</p>
<h3>Top row and low incomes</h3>
<p>Above ${usd(F.maxCombinedAnnualIncome)} of combined income the table no longer binds, but each child's weekly entitlement may not fall below the top row, ${usdx(top[1])} for an only child. At the other end, a nonprimary care provider whose income is under the federal poverty guideline pays no more than 10 percent of weekly gross income, and the table builds a self-support reserve into its lowest rows. For a state with a monthly table, compare ${h.a('child-support:new-hampshire', 'New Hampshire')}.</p>`,
  faqs: [
    { q: 'Why is the Maine child support table weekly and per child?', a: `Because 19-A M.R.S. § 2006(1) tells the court to read the figure for the total number of children and multiply it by the number of children, and Maine orders are stated per week. With ${usd(annual)} of combined annual income, the table gives ${usd(row[1])} a week for an only child and ${usd(row[2])} per child for two, so ${usd(row[2] * 2)} a week before the parents' shares.` },
    { q: 'Does Maine still use separate columns for teenagers?', a: `No. The age categories that split younger children from teenagers were repealed by Public Law 2017, chapter 30, and the current DHHS table, effective ${day(d.effective!)}, has one column per number of children. Age still matters for child care, which is added to the basic entitlement only for children under 12.` },
    { q: 'How is child support calculated with equal care in Maine?', a: `The basic entitlement is multiplied by ${num(F.enhancedMultiplier, 1)} and divided by income, and the higher earner pays the lower of the difference and the sole-care amount; with equal incomes nobody pays. Maine defines equal care by participation, not overnights, so our calculator uses ${num(F.substantiallyEqualCareMinOvernights)} nights as a stand-in. With ${usd(A * 12)} and ${usd(B * 12)} a year and two children, that gives ${usd(equal.monthly)} a month.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:new-hampshire', 'child-support:hawaii'],
});
