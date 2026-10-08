import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num } from '../../../lib/kit';

const d = cs('nevada');
type Tier = { upTo: number | null; pct: number[]; additionalChildPct: number };
const T = d.percent!.tiers as unknown as Tier[];
const b1 = T[0].upTo!, b2 = T[1].upTo!;
const J = (d.formula as { jointCustody: { minDaysEachParent: number } }).jointCustody.minDaysEachParent;
const rows = d.schedule!.rows;
const lowTop = rows[rows.length - 1][0];
const lowFirst = rows[0][0];

const one = csCalc('nevada', 5000, 0, 1);
const two = csCalc('nevada', 8000, 0, 2);
const three = csCalc('nevada', 12000, 0, 3);
const five = csCalc('nevada', 15000, 0, 5);
const flatTwo = (8000 * T[0].pct[1]) / 100;
const jA = 8000, jB = 4000;
const primary = csCalc('nevada', jA, jB, 2, { payerOvernights: J - 1 });
const joint = csCalc('nevada', jA, jB, 2, { payerOvernights: J });
const mixed = csCalc('nevada', 6000, 1500, 1, { payerOvernights: J });
const low = csCalc('nevada', 1500, 0, 1);
const lowFlat = (1500 * T[0].pct[0]) / 100;
const floor = csCalc('nevada', 600, 0, 1);

export default defineStatePage({
  topic: 'child-support',
  slug: 'nevada',
  title: `Nevada Child Support 2026: ${pct(T[0].pct[0])}, ${pct(T[1].pct[0])}, ${pct(T[2].pct[0])} Income Tiers`,
  description: `Nevada child support 2026 under NAC 425.140: ${pct(T[0].pct[0])} of the first ${usd(b1)} of gross pay for one child, ${usd(two.monthly)} for two at ${usd(8000)}, an offset in joint custody.`,
  intro: 'NAC 425 explained with numbers: three income slices taxed at falling rates, a poverty-based schedule at the bottom, and a straight offset when custody is joint.',
  resume: `A Nevada parent with ${usd(5000)} of gross monthly income owes ${usd(one.monthly)} a month for one child, because NAC 425.140 takes ${pct(T[0].pct[0])} of the first ${usd(b1)} of income. Beyond that the rate falls: ${pct(T[1].pct[0])} on the slice from ${usd(b1)} to ${usd(b2)}, ${pct(T[2].pct[0])} above ${usd(b2)}, with higher rates for more children (${pct(T[0].pct[1])}, ${pct(T[1].pct[1])} and ${pct(T[2].pct[1])} for two). There is no income cap and no deduction for taxes. When both parents have joint physical custody, each one's amount is computed and the larger is reduced by the smaller, with no multiplier: at ${usd(jA)} and ${usd(jB)} with two children the order drops from ${usd(primary.monthly)} to ${usd(joint.monthly)}. Parents earning up to ${usd(lowTop)} a month can be placed on the low-income schedule, ${usd(low.monthly)} for one child at ${usd(1500)}.`,
  body: (h) => `<h2>Income sliced like a tax bracket</h2>
<p>Nevada rewrote its guideline in 2020, when regulations of the Division of Welfare and Supportive Services replaced the old statutory percentages of NRS 125B.070. The new rule reads like an income tax schedule turned upside down: each slice of gross monthly income carries its own rate, and the rate shrinks as income grows. Two children at ${usd(8000)} cost ${usd(two.monthly)}, not the ${usd(flatTwo)} a flat ${pct(T[0].pct[1])} would give. Three children at ${usd(12000)} come to ${usd(three.monthly)}.</p>
<p>Families with more than four children are not left at the four-child rate. Each additional child adds ${pct(T[0].additionalChildPct)} in the first slice, ${pct(T[1].additionalChildPct)} in the second and ${pct(T[2].additionalChildPct)} in the third, so five children at ${usd(15000)} lead to ${usd(five.monthly)} a month.</p>
<h2>Joint custody means two obligors</h2>
<p>NAC 425.037 makes each parent an obligor when custody is joint. The court figures both amounts with the same tiers and nets them; the parent with the higher figure pays the difference. The regulation sets no night count. The custody statute, NRS 125C.003, presumes joint physical custody is not in the child's interest when a parent cannot care for the child at least ${num(J)} days a year, and our calculator uses that line. Below it, a payer at ${usd(jA)} owes ${usd(primary.monthly)} for two children; from ${num(J)} days, with a co-parent at ${usd(jB)}, the offset leaves ${usd(joint.monthly)}.</p>
<p>The offset uses each parent's own guideline amount, including the low-income schedule. In the official calculator, a parent at ${usd(6000)} sharing one child with a parent at ${usd(1500)} pays ${usd(mixed.monthly)}, because the lower earner's figure comes from the schedule rather than the tiers.</p>
<h3>The yearly low-income schedule</h3>
<p>The Administrative Office of the Courts publishes a new schedule by March 31 each year, keyed to the federal poverty guidelines. In the 2026 version used by the state's calculator, the first row covers gross income up to ${usd(lowFirst)} and the last reaches ${usd(lowTop)}. A parent at ${usd(1500)} with one child pays ${usd(low.monthly)} instead of ${usd(lowFlat)}; at ${usd(600)}, ${usd(floor.monthly)}. A judge may still go lower when income is below the schedule, balancing the parent's self-support.</p>
<p>Child care is divided equitably by the court and every order must provide medical support, with a premium treated as reasonable up to a share of gross income set in NAC 425.135. Those sit outside the base figure the calculator returns. Nevada's neighbor ${h.a('child-support:california', 'California')} works from both parents' net incomes instead, and ${h.a('child-support:idaho', 'Idaho')} uses an income-shares table.</p>`,
  faqs: [
    { q: 'How much is child support in Nevada for one child?', a: `Under NAC 425.140 it is ${pct(T[0].pct[0])} of the first ${usd(b1)} of the obligor's gross monthly income, ${pct(T[1].pct[0])} of the part up to ${usd(b2)} and ${pct(T[2].pct[0])} of anything above. A parent earning ${usd(5000)} a month owes ${usd(one.monthly)}. Very low incomes use the yearly low-income schedule instead, which gives ${usd(low.monthly)} at ${usd(1500)}.` },
    { q: 'How does joint custody change child support in Nevada?', a: `With joint physical custody both parents are obligors. Each one's amount is computed from his or her own gross income with the same tiers, then the two are offset and the higher earner pays the difference. At ${usd(jA)} and ${usd(jB)} with two children that is ${usd(joint.monthly)} a month, against ${usd(primary.monthly)} if the higher earner had the children less than ${num(J)} days.` },
    { q: 'Is there a maximum amount of child support in Nevada?', a: `No. The regulations in force since 2020 set no ceiling on the income counted, and income above ${usd(b2)} a month is still counted, at ${pct(T[2].pct[0])} for one child or ${pct(T[2].pct[1])} for two. A parent at ${usd(15000)} with five children owes ${usd(five.monthly)} a month. The court can adjust for factors listed in NAC 425.150, such as special educational needs.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:california', 'child-support:idaho'],
});
