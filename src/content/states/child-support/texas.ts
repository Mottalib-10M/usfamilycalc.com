import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, day } from '../../../lib/kit';

const d = cs('texas');
const P = d.percent!;
const cap = P.cap!.amount;
const lowThr = P.lowIncome!.threshold;
const lowPct = P.lowIncome!.byChildren;
const MF = (d.formula as { multipleFamily: { table: number[][] } }).multipleFamily.table;
const capFrom = day(d.effective!);
const capYear = Number(d.effective!.slice(0, 4));
const cashMedical = Number(/up to (\d+)%/.exec(d.addOnsText)?.[1] ?? 0);

// Worked examples (monthly net resources of the obligor; the other parent's income plays no part).
const ex = csCalc('texas', 6000, 0, 2);
const atCap1 = csCalc('texas', cap, 0, 1);
const over1 = csCalc('texas', 18000, 0, 1);
const justUnder = csCalc('texas', lowThr - 1, 0, 1);
const atThr = csCalc('texas', lowThr, 0, 1);
const grid = [3000, 6000, cap, 18000].map((r) => [r, [1, 2, 3].map((n) => csCalc('texas', r, 0, n).monthly)] as const);
const mfIncome = 5000;
const mf11 = MF[1][1];
const mf12 = MF[1][2];

export default defineStatePage({
  topic: 'child-support',
  slug: 'texas',
  title: `Texas Child Support Calculator 2026: ${pct(P.byChildren[0])} of Net Resources`,
  description: `Texas child support 2026: ${pct(P.byChildren[0])} to ${pct(P.byChildren[4])} of the obligor’s monthly net resources, counted up to ${usd(cap)} a month. Two children on ${usd(6000)} net: ${usd(ex.monthly)} a month.`,
  intro: 'Texas looks at one paycheck only: a fixed percentage of the paying parent’s net resources, whatever the other parent earns.',
  resume: `Texas child support is a percentage of the paying parent’s monthly net resources: ${pct(P.byChildren[0])} for one child, ${pct(P.byChildren[1])} for two, ${pct(P.byChildren[2])} for three, ${pct(P.byChildren[3])} for four and ${pct(P.byChildren[4])} for five or more (Texas Family Code § 154.125). The other parent’s income is not part of the calculation. The percentage applies only to the first ${usd(cap)} of net resources a month, the cap in force since ${capFrom}, so the presumptive amount for one child stops at ${usd(atCap1.monthly)}. A parent with ${usd(6000)} of net resources and two children pays ${usd(ex.monthly)} a month. Below ${usd(lowThr)} of net resources, a lower schedule applies (${pct(lowPct[0])} for one child). Net resources are gross income minus federal income tax figured as a single filer, Social Security and Medicare, union dues and the cost of the children’s health and dental coverage. Medical and dental support are ordered on top of the percentage, and the number of nights each parent has does not change the guideline.`,
  body: (h) => `<h2>One income, not two</h2>
<p>Texas is one of the few states where the parent receiving support could double their salary and the guideline would not move by a dollar. Section 154.125 applies its percentage to the obligor’s net resources alone; the obligee’s income, the parents’ relative earnings and the children’s actual budget only come in as reasons the court may give for departing from the guideline (§ 154.123). That makes the Texas calculation short, but it makes the definition of net resources decisive. Under § 154.062 they include wages, overtime, bonuses, self-employment and rental profit, Social Security other than SSI, unemployment and workers’ compensation, and alimony received. Federal income tax is then deducted as if the parent were single, with the standard deduction, whatever the filing status on the parent’s real return. Texas has no state income tax, so there is nothing to deduct for it on a Texas paycheck. The ${h.ext(d.officialCalculatorUrl!, 'Attorney General’s Monthly Child Support Calculator')} performs that tax step from gross pay; our calculator takes the net figure directly.</p>
${h.table(['Net resources a month', '1 child', '2 children', '3 children'], grid.map(([r, v]) => [h.usd(r), ...v.map((m) => h.usd(m))]), `Presumptive monthly support (§ 154.125(b)); amounts above ${h.usd(cap)} of net resources are not counted.`, ['l', 'r', 'r', 'r'])}

<h2>The ${h.usd(cap)} ceiling and the ${capYear} adjustment</h2>
<p>The guideline percentages apply only to net resources up to a maximum that the Title IV-D agency, the Office of the Attorney General, publishes in the Texas Register. The figure is indexed to inflation every six years, rounded to the nearest ${h.usd(50)}, and takes effect on September 1 of the adjustment year (§ 154.125(a-1)); the current ${h.usd(cap)} has applied since ${capFrom}, and the next revision is due in ${capYear + 6}. An obligor netting ${h.usd(18000)} a month therefore owes the same presumptive ${h.usd(over1.monthly)} for one child as someone at exactly the cap. Above it, the obligee may ask for more, but only by proving the child’s needs, and the order cannot exceed the greater of the presumptive amount or the proven needs (§ 154.126). We read the ${h.usd(cap)} figure on the OAG calculator, not in the Register notice itself.</p>

<h2>A cliff at ${h.usd(lowThr)}</h2>
<p>For obligors under ${h.usd(lowThr)} of monthly net resources, § 154.125(c) lowers each percentage by ${h.num(P.byChildren[0] - lowPct[0])} points. Because the schedule switches all at once rather than phasing in, a parent netting ${h.usd(lowThr - 1)} owes ${h.usd(justUnder.monthly)} for one child, and a parent netting ${h.usd(lowThr)} owes ${h.usd(atThr.monthly)}. A raise of one dollar adds about ${h.usd(atThr.monthly - justUnder.monthly)} of support. It is worth checking which side of it the net resources really fall on before an order is signed.</p>

<h2>Children in another household</h2>
<p>An obligor who also supports children not before the court gets a lower percentage. Section 154.129 publishes a grid: the row is the number of other children the obligor has a duty to support, the column the number before the court. With one other child, a single child before the court calls for ${h.pct(mf11)} instead of ${h.pct(P.byChildren[0])}, which on ${h.usd(mfIncome)} of net resources is ${h.usd((mfIncome * mf11) / 100)} a month; two children before the court call for ${h.pct(mf12)}. Section 154.128 offers the alternative of deducting a notional amount for the other children from net resources first. Our calculator does not ask about other households, so apply the grid rate yourself if it fits your case.</p>

<h2>Medical and dental support, and possession</h2>
<p>Health and dental coverage for the child are separate orders under §§ 154.181 to 154.1825, added to the percentage. When the obligor provides the insurance, its cost is deducted from the obligor’s net resources before the percentage is applied. When the obligee provides it, the obligor reimburses the reasonable cost as additional support. When no coverage is available, the court orders cash medical support of up to ${h.pct(cashMedical)} of the obligor’s annual resources. Time with the child is different: a standard possession order and an expanded one produce the same guideline figure. A parent with near-equal possession can only ask the judge to deviate, and the order must then state both parents’ net resources and the reason for the variance (§ 154.130).</p>`,
  faqs: [
    {
      q: 'Does the other parent’s income count for child support in Texas?',
      a: `Not in the guideline. Texas applies its percentage to the paying parent’s net resources alone: ${pct(P.byChildren[0])} for one child, ${pct(P.byChildren[1])} for two. The income of the parent receiving support, or of a new spouse, enters only if the judge is asked to deviate from the guideline under Family Code § 154.123, and the order must then explain the reasons for the difference and state both parents’ net resources.`,
    },
    {
      q: 'What is the maximum child support in Texas in 2026?',
      a: `The presumptive maximum for one child is ${usd(atCap1.monthly)} a month, which is ${pct(P.byChildren[0])} of the ${usd(cap)} net-resources cap in force since ${capFrom}. With two children it is ${usd(csCalc('texas', cap, 0, 2).monthly)}. A court may order more for a high earner only if the child’s proven needs justify it, under Family Code § 154.126.`,
    },
    {
      q: 'Does 50/50 possession lower child support in Texas?',
      a: `Not automatically. The Texas guideline has no parenting-time formula, so a standard possession order, an expanded one and an equal schedule all give the same percentage of net resources. A parent with substantially equal time can ask the court to deviate under § 154.123, and many agreed 50/50 orders are written that way, but the judge decides whether the guideline amount is unjust in that case.`,
    },
    {
      q: 'How is cash medical support calculated in Texas?',
      a: `If neither parent can get health insurance for the child at a reasonable cost, the Texas court orders cash medical support of up to ${pct(cashMedical)} of the obligor’s annual resources, on top of the percentage guideline. If the obligee covers the child, the obligor reimburses the actual premium, up to a reasonable cost. Dental coverage is ordered separately under the same chapter of the Family Code.`,
    },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:california', 'child-support:new-york', 'workers-comp'],
});
