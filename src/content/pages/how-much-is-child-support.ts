import { definePage } from '../../lib/page-types';
import { csAll, csCalc, usd, num } from '../../lib/kit';

const CS = csAll();
const A = 5000, B = 3000;
const rows = CS.map((d) => [d.name, [1, 2, 3].map((n) => Math.round(csCalc(d.slug, A, B, n).monthly))] as [string, number[]]);
const one = rows.map((r) => r[1][0]).filter((x) => x > 0).sort((a, b) => a - b);
const median = one.length ? one[Math.floor(one.length / 2)] : 0;
const pctOfPay = A > 0 ? (median / A) * 100 : 0;
const two = rows.map((r) => r[1][1]).filter((x) => x > 0).sort((a, b) => a - b);
const m2 = two.length ? two[Math.floor(two.length / 2)] : 0;

export default definePage({
  id: 'how-much-is-child-support',
  topic: 'child-support',
  kind: 'guide',
  order: 2,
  slug: 'how-much-is-child-support',
  nav: 'How much is child support?',
  card: 'Typical amounts by income and children, and why they differ',
  title: 'Child Support Amounts 2026: How Much Parents Pay by State',
  description: 'How much child support is in 2026: typical monthly amounts for one, two and three children across the states, what moves the figure and how long support lasts.',
  h1: 'How much is child support?',
  intro: 'A number for your situation, the range across states, and the handful of inputs that move it most.',
  resume: `For one child, a parent who earns ${usd(A)} a month while the other parent earns ${usd(B)} pays a median of about ${usd(median)} a month across the ${CS.length} state guidelines on this site, roughly ${num(pctOfPay)}% of that parent's income; for two children the median rises to about ${usd(m2)}. Those medians hide a wide spread, because each state counts income differently (gross, net or adjusted), uses its own table or percentage, and treats parenting time its own way. The amount you will actually see in an order depends on five inputs above all: the definition of income your state uses, both parents' incomes, the number of children, the overnights the children spend with the paying parent, and the child care and health insurance costs added to the basic amount. The mini calculator below compares states for the same family; the full calculator takes your own figures.`,
  mini: 'csCompare',
  miniArg: { a: A, b: B, rows },
  body: (h) => `<h2>The five inputs that move the amount</h2>
<p><strong>The definition of income.</strong> It sounds technical, and it is the source of most surprises. A guideline built on gross income applies its table to pay before taxes; one built on net income starts after taxes and mandatory deductions. A parent who reads a net-income table with a gross figure will overestimate what he or she owes, and the reverse is just as common. Each state page on this site says which definition applies and what can be deducted.</p>
<p><strong>Both incomes, not one.</strong> In income-shares states, the other parent's income lowers the paying parent's share. Suppose the receiving parent's income doubles: the table amount for the combined income goes up a little, but the paying parent's share of it falls, so the payment usually drops. In percentage states that look only at the payer's income, it does not move at all.</p>
<p><strong>The number of children.</strong> Support rises with each child, but not in proportion: the second child adds less than the first because housing and many household costs are shared. Across the guidelines on this site, the median for two children is about ${usd(m2)} against ${usd(median)} for one, for the same incomes.</p>
<p><strong>Overnights.</strong> Once the paying parent has the children often enough, most states switch to a shared-parenting computation that can cut the payment sharply. The threshold is a number of overnights a year written in each guideline, so a schedule of alternate weekends plus one weeknight can land on either side of it depending on the state.</p>
<p><strong>Add-ons.</strong> Work-related child care and the children's health insurance premium are usually added to the basic amount and shared by income. For a family with young children in paid care, the add-on can be larger than the basic support itself.</p>
<h2>Low and high incomes</h2>
<p>Guidelines protect parents with very low incomes. Some tables include a shaded low-income area, some apply a self-support reserve so that the paying parent keeps a minimum to live on, and many set a minimum order, often around fifty dollars a month, rather than nothing. At the top, most tables stop at a combined income ceiling. Above it, the state either extends the table by a percentage, freezes the amount at the top row, or leaves the figure to the judge, who looks at the children's actual needs and the standard of living. The calculator tells you when your incomes fall outside the table.</p>
<h2>How long child support lasts</h2>
<p>Support usually continues until the child turns 18, and in many states longer if the child is still in high school, often until 19. A few states set a different age, and some allow support for college expenses or for an adult child with a disability. The state pages quote the exact rule. Ending support is not automatic everywhere: in several states the paying parent must ask the agency or the court to close the case when the last child emancipates.</p>
<h2>Changing the amount later</h2>
<p>An order can be modified when circumstances change substantially, such as a job loss, a large raise, a change in custody or new medical needs. Many states define “substantial” with a threshold, for example a recalculated amount that differs by a set percentage from the current order, and many child support agencies review orders every few years on request. Until a court changes the order, the old amount stays due, and arrears generally cannot be forgiven retroactively.</p>
<h2>A worked example</h2>
<p>Consider a mother with primary custody of two children who earns three thousand dollars a month and a father who earns five thousand. In an income-shares state, their combined eight thousand dollars is located in the state table for two children, and the father owes five eighths of the table amount, plus five eighths of the child care and the children's health premium. If the father has the children every other weekend and one weeknight, about a hundred nights a year, he may or may not reach his state's shared-parenting threshold, and that single fact can change the order by several hundred dollars a month. In a percentage state such as Texas, the mother's income does not enter the basic calculation at all. Use the mini calculator above to compare states with these incomes.</p>
<h2>Who collects and enforces support</h2>
<p>Every state runs a child support agency under Title IV-D of the Social Security Act. It can locate a parent, establish paternity, set and modify orders, and collect through income withholding, tax refund interception and license suspension. Its services are open to any parent, usually for a small application fee, and they are automatic for families receiving public assistance. Payments often flow through the state disbursement unit, which keeps a record that settles later disputes.</p>
<p>To check your own case, open the ${h.a('child-support', 'child support calculator')}, choose your state and enter both incomes as your state defines them, the number of children and the overnights. The steps under the result show the table amount or the formula, each parent's share and the adjustments applied.</p>`,
  faqs: [
    { q: 'What percentage of income goes to child support?', a: `It depends on the state and on both incomes. Percentage states set it directly, for example 20 percent of net resources for one child in Texas. In income-shares states the share falls as income rises. For one child, a paying parent earning ${usd(A)} a month while the other earns ${usd(B)} pays a median of about ${num(pctOfPay)} percent of income across the guidelines on this site.` },
    { q: 'Is there a maximum amount of child support?', a: 'Most guidelines cap the income their table or percentage covers, but there is rarely an absolute maximum. Above the cap the judge decides, based on the children’s needs and the parents’ standard of living, and may extend the guideline or stop at the top amount. A few states extend their schedule by a fixed percentage of the income above the table, so the amount keeps rising.' },
    { q: 'Can child support be more than half of a paycheck?', a: 'Federal law limits how much can be withheld from wages for support: up to 50 percent of disposable earnings for a parent supporting another family and 60 percent otherwise, plus 5 points for arrears older than twelve weeks (Consumer Credit Protection Act). The guideline amount itself is normally far below that, but arrears and several orders together can reach the limit.' },
    { q: 'Does child support go down if I have another child?', a: 'Often, yes, but not automatically. Many guidelines give a credit or a deduction for children born later or living in the paying parent’s home, and some states use a multiple-family table. The change only takes effect when the order is modified, so the parent must ask the agency or the court for a review; until then the existing amount remains due in full.' },
    { q: 'What happens if the paying parent loses a job?', a: 'The order does not change by itself. The parent should ask for a modification right away, because support keeps accruing at the old amount until the court or agency changes it, and past-due support generally cannot be reduced later. Courts may base the new amount on unemployment benefits, or impute income if they find the parent could be earning more.' },
  ],
  related: ['child-support', 'child-support:california', 'child-support:texas', 'child-support:new-york', 'alimony', 'how-is-alimony-calculated'],
  sources: ['usc667', 'cfr30256', 'ccpa1673', 'acfCss'],
});
