import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, day, pct, listOf } from '../../../lib/kit';

const d = cs('connecticut');
const rows = d.schedule!.rows;
const top = rows[rows.length - 1];
const LOW = (d as unknown as { extra: { lowIncomeShadedMaxIncome: { byChildren: number[] } } }).extra.lowIncomeShadedMaxIncome.byChildren;
const F = d.formula as { incomeRoundTo: number; columnsAmount: number[]; columnsPct: number[] };
const m = (w: number) => (w * 52) / 12;
const wk = (x: number) => (x * 12) / 52;
const row = (inc: number) => rows.find((r) => r[0] === inc)!;
const A = 1000, B = 500;
const base = wk(csCalc('connecticut', m(A), m(B), 2).monthly);
const edgeIn = LOW[0], edgeOut = LOW[0] + F.incomeRoundTo, rich = 2000;
const inside = wk(csCalc('connecticut', m(edgeIn), m(rich), 1).monthly);
const outside = wk(csCalc('connecticut', m(edgeOut), m(rich), 1).monthly);
const hiA = 5000, hiB = 2000;
const hi = wk(csCalc('connecticut', m(hiA), m(hiB), 2).monthly);
const hiShare = Math.round((hiA / (hiA + hiB)) * 100);
const hiMax = ((hiA + hiB) * top[F.columnsPct[1]] / 100) * hiShare / 100;
const first = rows[0];
const SSR = d.lowIncome!.selfSupportReserve!;

export default defineStatePage({
  topic: 'child-support',
  slug: 'connecticut',
  title: 'Connecticut Child Support Calculator 2026: New Guidelines',
  description: `Connecticut child support under the guidelines of ${day(d.effective!)}: ${usd(A)} and ${usd(B)} of net weekly income, two children, about ${usd(base)} a week to pay in 2026.`,
  intro: 'The weekly schedule of the Connecticut Child Support and Arrearage Guidelines in force since August 2026, with the low-income area.',
  resume: `Connecticut counts child support by the week, on net income, and since ${day(d.effective!)} it uses a new schedule. A noncustodial parent with ${usd(A)} of net weekly income, facing ${usd(B)}, owes ${usd(base)} a week for two children: the combined ${usd(A + B)} reads ${usd(row(A + B)[2])} in the schedule, and the parent's share is rounded to a whole percent before it is applied. The Commission for Child Support Guidelines extended the schedule from ${usd(4000)} to ${usd(top[0])} of weekly income, raised the income that triggers any obligation to ${usd(first[0])}, and widened the darker shaded low-income area, built on a self-support reserve of ${usd(SSR)} a week. Above ${usd(top[0])} there is a range rather than a number. Shared physical custody is not a formula in Connecticut: the higher earner's presumptive amount stands, and the judge may deviate.`,
  body: (h) => `<h2>Weekly figures, rounded twice</h2>
<p>Everything on the Connecticut worksheet is weekly. Net income is gross pay minus federal, state and local income taxes, Social Security or a mandatory retirement plan, Medicare, the Connecticut paid leave contribution, health premiums for the parent and dependents, mandatory union dues and uniforms, and support already ordered for other children. Hours beyond 45 a week do not count. The combined figure is rounded to the nearest ${usd(F.incomeRoundTo)}, the share of each parent to a whole percent, and the order to the nearest dollar. The calculator above takes monthly incomes and converts them at 52 weeks to the year, then shows the result per month; multiply by 12 and divide by 52 for the weekly figure the court writes.</p>
<h2>The shaded area and its cliff</h2>
<p>A noncustodial parent whose own net weekly income falls in the darker shaded cells is a low-income obligor. For that parent the schedule is read on their own income alone, and the amount in the block is the whole order. The shading stops at ${listOf(LOW.map((v, i) => `${usd(v)} for ${i + 1}`))} children. Every shaded line below ${usd(SSR)} is ${pct(first[F.columnsPct[0]])} of income for one child, the floor the new commission chose.</p>
${h.table(['Paying parent, net weekly', 'Other parent', 'Weekly order, one child'], [[usd(edgeIn), usd(rich), usd(inside)], [usd(edgeOut), usd(rich), usd(outside)]], 'Connecticut, either side of the end of the shaded area', ['l', 'r', 'r'])}
<p>The table shows a quirk of the method. At ${usd(edgeIn)} the parent pays the shaded amount in full; ${usd(F.incomeRoundTo)} more and the parent leaves the shaded area, the other parent's income enters the calculation, and the share of the combined amount can come out lower. Courts see these cases, and a deviation is the usual remedy.</p>
<h3>Above ${usd(top[0])} a week</h3>
<p>Section 46b-215a-2c(a)(2) no longer leaves high incomes to pure discretion. The amount printed at ${usd(top[0])} is the minimum presumptive order and the percentage printed on the same line, times the actual combined income, is the maximum. With ${usd(hiA)} and ${usd(hiB)} a week and two children, the paying parent's ${num(hiShare)}% share gives a range of about ${usd(hi)} to ${usd(hiMax)} a week; the calculator shows the floor.</p>
<p>The full rules are in the ${h.ext('https://www.jud.ct.gov/Publications/ChildSupport/CSguidelines.pdf', 'guidelines booklet of the Judicial Branch')}. Compare the neighbors in ${h.a('child-support:new-york', 'New York')} and ${h.a('child-support:new-jersey', 'New Jersey')}.</p>`,
  faqs: [
    { q: 'When did the new Connecticut child support guidelines take effect?', a: `On ${day(d.effective!)}. The Commission for Child Support Guidelines replaced the 2015 edition with a schedule built on 2013-2019 spending data, extended it to ${usd(top[0])} of combined net weekly income, raised the minimum income that triggers an obligation from ${usd(50)} to ${usd(first[0])}, and adjusted the low-income area around a ${usd(SSR)} weekly self-support reserve. Orders entered before that date change only through a modification.` },
    { q: 'Who is a low-income obligor in Connecticut?', a: `A noncustodial parent whose own net weekly income falls in the darker shaded part of the schedule: up to ${usd(LOW[0])} with one child and up to ${usd(LOW[5])} with six. That parent's support is the block amount at their own income, without adding the other parent's income. Low-income obligors also pay reduced child care contributions, cannot be ordered to contribute to HUSKY, and pay smaller arrearage installments.` },
    { q: 'Does Connecticut reduce child support for 50/50 custody?', a: 'Not by formula. In shared physical custody the presumptive order is the amount owed by the parent with the higher net weekly income, payable to the other parent. A judge or family support magistrate may then deviate if the arrangement substantially changes either home\'s spending or if incomes are close. The commission rejected a time-based formula again in 2026 to keep disputes over nights away from support.' },
    { q: 'How long does child support last in Connecticut?', a: 'Until 18. An unmarried child who is a full-time high school student is supported until finishing twelfth grade or turning 19, whichever comes first, under Conn. Gen. Stat. § 46b-84(b). Support for a child with a disability can run to 21, and a court may separately order help with college costs under the educational support statute, § 46b-56c.' },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:new-york', 'child-support:new-jersey'],
});
