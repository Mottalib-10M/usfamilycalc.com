import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, day, listOf } from '../../../lib/kit';

const d = cs('minnesota');
const S = d.schedule!;
const F = d.formula as unknown as { parentingExpenseExponent: number; minimumBasicSupport: number[]; selfSupportReservePctOfPovertyGuideline: number };
const e = F.parentingExpenseExponent;
const A = 5000, B = 3000;
const at = (n: number) => csCalc('minnesota', A, B, 2, { payerOvernights: n });
const none = at(0), q = at(73), mid = at(110), wide = at(146), even = at(182);
const top = S.rows[S.rows.length - 1];
const flipA = 3000, flipB = 5000;
const flip = csCalc('minnesota', flipA, flipB, 2, { payerOvernights: 182 });
const step = S.rows[2][0] - S.rows[1][0];
const br = S.rows.find((r) => r[0] >= 6000)!;

export default defineStatePage({
  topic: 'child-support',
  slug: 'minnesota',
  title: `Minnesota Child Support 2026: Overnights Cubed, Not Counted`,
  description: `Minnesota child support 2026 under § 518A.35: PICS brackets to ${usd(top[0])}, a parenting expense formula with overnights cubed, and ${usd(none.monthly)} a month for two children.`,
  intro: 'Minn. Stat. §§ 518A.34 to 518A.36: the PICS schedule, then a parenting expense adjustment that has no threshold.',
  resume: `Minnesota has no overnight threshold for shared parenting. Its parenting expense adjustment, § 518A.36, raises each parent's yearly overnights to the power of ${num(e)} and weighs the two income shares with them, so every night counts but the effect grows fast near equal time. A parent with ${usd(A)} of monthly gross income, beside a co-parent at ${usd(B)}, owes ${usd(none.monthly)} a month for two children without a parenting time order, ${usd(q.monthly)} with ${num(73)} overnights, ${usd(mid.monthly)} with ${num(110)}, ${usd(wide.monthly)} with ${num(146)} and ${usd(even.monthly)} with ${num(182)}. The basic support figure comes from a schedule in ${usd(step)} brackets of combined parental income for determining child support (PICS), which is gross income minus a credit for other children. The schedule in force since ${day(d.effective!)} stops at ${usd(top[0])} a month: above it, the top row applies unless a child's needs justify more.`,
  body: (h) => `<h2>Why the cube matters</h2>
<p>A cubic weight is a deliberate choice. With ${num(73)} nights out of 365, a parent has about a fifth of the time but less than 2% of the cubed total, so the adjustment barely moves the order. At ${num(146)} nights the parent has 40% of the time and under a quarter of the cubed total, and at equal time the two weights match exactly. The curve is flat for ordinary every-other-weekend schedules and steep for near-equal ones.</p>
${h.table(['Overnights with the paying parent', 'Monthly basic support owed'], [0, 36, 73, 110, 146, 165, 182].map((n) => [num(n), usd(at(n).monthly)]), `Minnesota parenting expense adjustment, ${usd(A)} and ${usd(B)} of PICS, two children`, ['left', 'right'])}
<p>The formula decides who is the obligor. Parent A, the one with fewer overnights, owes the result when it is negative; parent B owes it when it is positive. Swap the incomes in our example, ${usd(flipA)} for the parent with fewer nights and ${usd(flipB)} for the other, and at ${num(182)} nights the calculator shows the flow reversing: the parent with more nights owes ${usd(flip.reverse)} a month. The adjustment only applies when a court order sets parenting time; with no order, basic support is simply the income share.</p>
<h2>PICS, brackets and the floor</h2>
<p>Minnesota reads income gross, before taxes, and does not let a parent deduct 401(k) or IRA contributions. The court then subtracts a credit for children from other relationships to reach PICS. The schedule is printed in brackets such as ${num(br[0])} to ${num(br[0] + step - 1)}, so there is no interpolation: every income inside a bracket gets the same figure. The first bracket, up to the second row's ${usd(S.rows[1][0])}, holds ${listOf(F.minimumBasicSupport.map((x) => usd(x)))} for one to six children, the same figures as the statutory minimum basic support of § 518A.42.</p>
<p>That minimum applies after an ability-to-pay test: the obligor keeps a self-support reserve of ${num(F.selfSupportReservePctOfPovertyGuideline)}% of the federal poverty guideline for one person, and child care and medical support are cut before basic support. The reserve is not stored in dollars in our data, so the calculator does not run that test; a low-income obligor should expect the official result to be lower. Orders also carry a cost-of-living adjustment every two years. Next door, ${h.a('child-support:wisconsin', 'Wisconsin')} uses percentages of the payer's income instead of a shared table.</p>`,
  faqs: [
    { q: 'Is there a minimum number of overnights for the Minnesota parenting expense adjustment?', a: `No. Any court-ordered parenting time enters the formula, because each parent's overnights are raised to the power of ${num(e)} and compared. The effect is small at first: in our example with ${usd(A)} and ${usd(B)} of income and two children, ${num(73)} overnights lower the order from ${usd(none.monthly)} to ${usd(q.monthly)} a month, while ${num(146)} overnights bring it to ${usd(wide.monthly)}.` },
    { q: 'What income does Minnesota use for child support?', a: `Gross income, before taxes, from almost any periodic source: wages, self-employment, unemployment, pensions, disability and spousal maintenance received. Pretax benefit plans do not reduce it and retirement contributions are not deducted. From gross income the court subtracts a credit for nonjoint children to reach PICS, the figure read in the schedule.` },
    { q: 'Does Minnesota child support go up with inflation?', a: `Yes, in principle every two years. Section 518A.75 requires orders to provide for a biennial cost-of-living adjustment, based on a Minneapolis-St. Paul consumer price index unless the court picks another one. When payments go through the public authority, the increase takes effect on May 1 of the adjustment year.` },
    { q: 'Until what age does Minnesota child support last?', a: `Until 18, or until 20 for a child still attending secondary school, under the definition of child in § 518A.26. Support can continue without an age limit for a child who cannot support himself or herself because of a physical or mental condition. Graduation or turning 20, whichever comes first, ends it for a student.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:wisconsin', 'child-support:illinois', 'child-support:michigan'],
});
