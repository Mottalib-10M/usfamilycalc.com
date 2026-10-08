import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, day } from '../../../lib/kit';

const d = cs('alabama');
const S = d.schedule!;
const F = d.formula as { incomeAvailablePct: number; minimumOrder: number; sharedMultiplier: number; sharedConventionOvernights: number };
const SSR = d.lowIncome!.selfSupportReserve!;
const A = 4200, B = 3800;
const base = csCalc('alabama', A, B, 2);
const half = csCalc('alabama', A, B, 2, { payerOvernights: F.sharedConventionOvernights });
const near = csCalc('alabama', A, B, 2, { payerOvernights: F.sharedConventionOvernights - 30 });
const step = S.rows[2][0] - S.rows[1][0];
const lowA = 1200, lowB = 2800;
const low = csCalc('alabama', lowA, lowB, 2);
const lowPlain = Math.round(low.basicMonthly * Math.round((lowA / (lowA + lowB)) * 100) / 100);
const lowAvail = Math.round(((lowA - SSR) * F.incomeAvailablePct) / 100);
const tie = A + B + step / 2;
const tieCase = csCalc('alabama', A + step / 2, B, 2);
const top = S.rows[S.rows.length - 1];

export default defineStatePage({
  topic: 'child-support',
  slug: 'alabama',
  title: `Alabama Child Support Calculator 2026: Rule 32 Schedule`,
  description: `Alabama child support 2026: Rule 32's schedule from ${usd(0)} to ${usd(S.maxIncome)}, a ${usd(SSR)} self-support reserve, and ${usd(base.monthly)} a month for two children in our worked example.`,
  intro: 'Rule 32 of the Alabama Rules of Judicial Administration: the 2022 schedule, the reserve on Form CS-42 and the 50% custody adjustment of Form CS-42-S.',
  resume: `An Alabama parent with ${usd(A)} of monthly adjusted gross income and a co-parent at ${usd(B)} owes about ${usd(base.monthly)} a month for two children under Rule 32 of the Alabama Rules of Judicial Administration. The Supreme Court of Alabama adopted the current Schedule of Basic Child-Support Obligations by order of January 14, 2022, for cases filed from ${day(d.effective!)}; it lists ${usd(base.basicMonthly)} for two children at a combined ${usd(A + B)}, and the obligor's share is rounded to a whole percent, here ${num(base.payerShare * 100)}%. Two features set Alabama apart. The reserve for low earners is no longer hidden in the table: Form CS-42 takes ${num(F.incomeAvailablePct)}% of the obligor's income above ${usd(SSR)} and keeps the lesser amount. And only an order for equal physical custody changes the arithmetic, through Form CS-42-S, which raises the schedule amount by half and credits each parent half of it; for the same family that gives ${usd(half.monthly)}.`,
  body: (h) => `<h2>Two schedules online, only one in force</h2>
<p>Readers who open the rules page of the Alabama Judicial System still find an ${h.ext('https://judicial.alabama.gov/docs/library/rules/JA32_appx.pdf', 'Appendix to Rule 32')} that is the old table: it starts with "0-800.00", stops at $20,000 of combined income and has the reserve built into its numbers. It is no longer the law. The order of January 14, 2022 replaced it with Appendix I, which starts at a "0-250" line, runs in ${usd(step)} steps and ends at ${usd(top[0])}. The calculator uses only that ${h.ext('https://judicial.alabama.gov/docs/rules/Rule32AlaRJudAdminOrder.pdf', '2022 schedule')}. The June 1, 2023 amendments added the shared-custody form and changed the preface, but left the numbers alone.</p>
<p>Lookups follow Rule 32(C)(1): use the lower line when the income is less than halfway to the next one, the upper line from halfway up. At ${usd(tie)}, exactly halfway, the upper line wins and the order is ${usd(tieCase.monthly)}. Every dollar figure on the form is rounded to the dollar and every percentage to the nearest point, which is why Alabama results come out in whole dollars.</p>
<h2>The reserve on the form, not in the table</h2>
<p>Since 2022, lines 11 to 13 of Form CS-42 do the low-income test. Subtract the reserve of ${usd(SSR)} from the obligor's adjusted gross income, keep ${num(F.incomeAvailablePct)}% of what is left, and compare it with the obligor's share. A parent earning ${usd(lowA)} against ${usd(lowB)} for two children would owe ${usd(lowPlain)} as a share, but only ${usd(lowAvail)} is available for support, so that is the recommended order. When the available income falls under ${usd(F.minimumOrder)}, the rule presumes ${usd(F.minimumOrder)}. An obligor with no income at all who lives on means-tested benefits, or who has been incarcerated for more than 180 days, is presumed to owe nothing.</p>
<h3>Equal custody and everything short of it</h3>
<p>Rule 32(C)(7) applies only when a court orders physical custody split 50% (or close to it). The calculator treats ${num(F.sharedConventionOvernights)} overnights or more as that case; this cut-off is our convention, not a number in the rule. Form CS-42-S multiplies the schedule amount by ${num(F.sharedMultiplier * 100)}%, divides it by income, and gives each parent credit for half of the multiplied amount plus the costs he or she pays; the parent left owing more pays the difference. For our family that means ${usd(half.monthly)} instead of ${usd(base.monthly)}. At ${num(F.sharedConventionOvernights - 30)} overnights, by contrast, the guideline figure stays ${usd(near.monthly)}: any schedule short of equal time is a reason to ask for a deviation, not a formula. Neither the reserve nor the ${usd(F.minimumOrder)} floor applies on Form CS-42-S. Neighbors ${h.aIf('child-support:georgia', 'Georgia')}, ${h.aIf('child-support:tennessee', 'Tennessee')} and ${h.aIf('child-support:mississippi', 'Mississippi')} take other routes.</p>`,
  faqs: [
    { q: 'Which Alabama child support schedule is current in 2026?', a: `The one attached as Appendix I to the Supreme Court of Alabama's order of January 14, 2022, used for cases filed on or after ${day(d.effective!)}. It covers combined monthly adjusted gross income up to ${usd(S.maxIncome)}. An older appendix that stops at $20,000 still circulates online, including on the court's library page, and gives different numbers; check the first line, which reads "0-250" on the current schedule.` },
    { q: 'How does the self-support reserve work in Alabama?', a: `On Form CS-42, the obligor's monthly adjusted gross income minus ${usd(SSR)} goes on line 11, ${num(F.incomeAvailablePct)}% of that goes on line 12, and the recommended order on line 13 is the lesser of line 12 and the obligor's share. A parent at ${usd(lowA)} with two children ends up at ${usd(lowAvail)} a month. If line 12 falls under ${usd(F.minimumOrder)}, a ${usd(F.minimumOrder)} order is presumed.` },
    { q: 'Does Alabama reduce child support for 50/50 custody?', a: `Yes, when the court orders shared 50% physical custody. Form CS-42-S multiplies the schedule amount by ${num(F.sharedMultiplier * 100)}%, credits each parent half of that product and the costs each pays, and the parent who still owes more pays the other. For ${usd(A)} and ${usd(B)} of income and two children, the result is ${usd(half.monthly)} a month instead of ${usd(base.monthly)}. Other arrangements can only justify a deviation.` },
    { q: 'When can Alabama child support be modified?', a: 'A parent must show a material change in circumstances that is substantial and continuing. A difference of more than 10% between the current order and a new guideline calculation creates a rebuttable presumption that the order should change. Since 2023, a parent who fails without good cause to use 50% custody for more than 14 days in a year can face a modification and attorney fees.' },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:georgia', 'child-support:mississippi', 'child-support:tennessee', 'child-support:florida'],
});
