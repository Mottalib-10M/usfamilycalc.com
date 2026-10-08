import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num } from '../../../lib/kit';

const d = cs('nebraska');
const S = d.schedule!;
const SH = d.shared!;
const F = d.formula as { minimumSupportFloor: number; minimumSupportPctOfNet: number; basicSubsistenceLimitMonthly: number; jointCustodyPresumptionDaysOver: number; jointCustodyDiscretionFromDays: number };
const limit = F.basicSubsistenceLimitMonthly;
const days = F.jointCustodyPresumptionDaysOver;
const M = SH.multiplier!;
const A = 4000, B = 2000;
const sole = csCalc('nebraska', A, B, 2);
const atLine = csCalc('nebraska', A, B, 2, { payerOvernights: days });
const past = csCalc('nebraska', A, B, 2, { payerOvernights: days + 1 });
const exA = 1500, exB = 500;
const ex = csCalc('nebraska', exA, exB, 3);
const exShare = ex.basicMonthly * (exA / (exA + exB));
const topPct = S.aboveMax.pct!;

export default defineStatePage({
  topic: 'child-support',
  slug: 'nebraska',
  title: `Nebraska Child Support 2026: Table 1 and the ${usd(limit)} Floor`,
  description: `Nebraska child support 2026: Table 1 on combined net income, Worksheet 3 past ${num(days)} days, and a ${usd(limit)} subsistence floor. Two children, ${usd(A)} and ${usd(B)}: ${usd(sole.monthly)}.`,
  intro: 'The Nebraska Supreme Court rules, Neb. Ct. R. § 4-201 and following, worked through with the numbers that change an order.',
  resume: `In Nebraska a parent with ${usd(A)} of monthly net income, next to a parent with ${usd(B)}, owes about ${usd(sole.monthly)} a month for two children who live with the other parent. That is two thirds of the ${usd(sole.basicMonthly)} that Table 1 lists for a combined net income of ${usd(A + B)}. Nebraska's guidelines are court rules, not a statute: the Supreme Court writes them in Chapter 4, Article 2, and updates one figure every January, the basic subsistence limitation, now ${usd(limit)} of net income a month. No order for support, child care and health care may push a parent below it, although the minimum order (${usd(F.minimumSupportFloor)} or ${pct(F.minimumSupportPctOfNet)} of net income, whichever is greater) can still apply. Time matters too: when joint physical custody is ordered and each parent has more than ${num(days)} days a year, Worksheet 3 replaces Worksheet 1 and the figure here drops to ${usd(past.monthly)}.`,
  body: (h) => `<h2>The subsistence limitation, revised every winter</h2>
<p>Section 4-218 is the rule Nebraska amends most often. Its history line lists a new figure nearly every January since 1992; the current text sets ${usd(limit)} of net monthly income, or the federal poverty guideline for one person, as the amount a parent keeps. The rule's own worked example in § 4-207 shows a father with ${usd(exA)} of net income paying ${usd(exShare)} for three children out of the ${usd(ex.basicMonthly)} that Table 1 gives at ${usd(exA + exB)}. Applied in 2026, that order would leave him less than ${usd(limit)}, so the calculator stops at ${usd(ex.monthly)}, the income above the floor. Below that, the minimum order of § 4-209 takes over: ${pct(F.minimumSupportPctOfNet)} of net income or ${usd(F.minimumSupportFloor)}, whichever is greater, with a lower figure possible for disability or incarceration.</p>
<h2>Days with each parent: ${num(F.jointCustodyDiscretionFromDays)}, ${num(days)} and beyond</h2>
<p>Section 4-212 draws two lines. When the court orders joint physical custody and each parent's time exceeds ${num(days)} days a year, Worksheet 3 is presumed: the Table 1 amount times ${num(M, 1)}, each parent's share of that figure multiplied by the share of the year the children spend with the other parent, and the difference paid. Between ${num(F.jointCustodyDiscretionFromDays)} and ${num(days)} days, the court may use Worksheet 3 but does not have to; our calculator keeps Worksheet 1 there. A "day" generally includes an overnight. In our example, ${num(days)} days still gives ${usd(atLine.monthly)}; one more day gives ${usd(past.monthly)}. Parents who share time without a joint physical custody order are handled by § 4-210 instead, which allows a reduction of up to 80 percent during parenting time of 28 days or more in any 90-day period.</p>
<h3>Net income, and a table that stops</h3>
<p>Table 1 is read on combined monthly <em>net</em> income: gross pay minus income taxes at standard deductions, FICA, mandatory retirement (or up to 4 percent voluntary), support for other children and the parent's own health insurance. It runs to ${usd(S.maxIncome)}. Above that, § 4-203(C) lets the court add ${pct(topPct[0])} of the excess for one to three children and up to ${pct(topPct[topPct.length - 1])} for six; the rule's example multiplies the wrong base, and the calculator follows the rule's wording, not its example. Neighbors with a gross-income table are on the ${h.a('child-support:michigan', 'Michigan')} and ${h.a('child-support:idaho', 'Idaho')} pages.</p>`,
  faqs: [
    { q: 'What is the Nebraska basic subsistence limitation for 2026?', a: `${usd(limit)} of net income a month, under Neb. Ct. R. § 4-218 as amended in January 2026. A parent's child support, child care and health care obligation should not reduce his or her net income below that amount or the federal poverty guideline. The minimum order still applies: ${usd(F.minimumSupportFloor)} a month or ${pct(F.minimumSupportPctOfNet)} of net income, whichever is greater.` },
    { q: 'How many days do you need for Worksheet 3 in Nebraska?', a: `More than ${num(days)} days a year for each parent, with joint physical custody ordered: then the court presumes Worksheet 3, the Table 1 amount times ${num(M, 1)} cross-credited by time. From ${num(F.jointCustodyDiscretionFromDays)} to ${num(days)} days the court may use it at its discretion. With ${usd(A)} and ${usd(B)} of net income and two children, the order falls from ${usd(atLine.monthly)} to ${usd(past.monthly)}.` },
    { q: 'Does Nebraska child support use gross or net income?', a: `Net income. Section 4-204 counts income from all sources except means-tested benefits, annualized and divided by 12, and § 4-205 then subtracts income taxes at standard deductions, FICA, mandatory retirement contributions, prior support orders and the parent's own health insurance premium. The combined net figure is what you look up in Table 1, which ends at ${usd(S.maxIncome)} a month.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:idaho', 'child-support:michigan'],
});
