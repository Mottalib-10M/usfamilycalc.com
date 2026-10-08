import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, usdx, pct, num, day } from '../../../lib/kit';

const d = cs('new-jersey');
const S = d.schedule!;
const F = d.formula as { fixedPct: number; variablePct: number; controlledPct: number; sharedMinPctOfOvernights: number; minimumAwardWeekly: number };
const SSR = d.lowIncome!.selfSupportReserve!;
const wk = (m: number) => (m * 12) / 52;
const A = 5000, B = 3000;
const sole = csCalc('new-jersey', A, B, 2);
const minNights = Math.ceil((F.sharedMinPctOfOvernights / 100) * 365);
const visit = 52;
const par = csCalc('new-jersey', A, B, 2, { payerOvernights: visit });
const shared = csCalc('new-jersey', A, B, 2, { payerOvernights: minNights });
const lowA = 2200, lowB = 9000;
const low = csCalc('new-jersey', lowA, lowB, 2);
const lowPlain = (low.basicMonthly * lowA) / (lowA + lowB);
const top = S.rows[S.rows.length - 1];

export default defineStatePage({
  topic: 'child-support',
  slug: 'new-jersey',
  title: `New Jersey Child Support 2026: Weekly Schedule, 28% Rule`,
  description: `New Jersey child support 2026: weekly net income schedule to ${usd(S.maxIncome)}, ${pct(F.sharedMinPctOfOvernights)} shared-parenting line, ${usd(SSR)} weekly self-support reserve and two worked examples.`,
  intro: 'Appendix IX-F of the New Jersey Court Rules, read in weekly dollars, with the IX-A adjustments for parenting time and low income.',
  resume: `New Jersey sets child support by the week, not the month: Appendix IX-F lists awards for combined net weekly income from ${usd(S.minIncome)} to ${usd(S.maxIncome)}, and a parent netting ${usd(wk(A))} a week (${usd(A)} a month) next to a parent netting ${usd(wk(B))} owes about ${usd(wk(sole.monthly))} a week, ${usd(sole.monthly)} a month, for two children. The schedule now in force took effect on ${day(d.effective!)}. Time with the children lowers the figure in two different ways. Below ${pct(F.sharedMinPctOfOvernights)} of overnights, roughly two nights a week, the court may give a parenting-time credit for food and transportation, the ${pct(F.variablePct)} of spending that follows the child. From ${pct(F.sharedMinPctOfOvernights)}, a shared-parenting award recognizes that the second home also carries housing costs. At the other end, the self-support reserve of ${usd(SSR)} a week keeps a low-earning obligor above 150% of the poverty guideline when the other parent can afford it.`,
  body: (h) => `<h2>Why the week is the unit</h2>
<p>New Jersey built its guideline around weekly pay stubs. Every input in the worksheet is a weekly net figure: gross pay minus income taxes, mandatory union dues, mandatory retirement and support already paid for other children. A parent paid monthly should multiply by twelve and divide by fifty-two before reading the table; skipping that step is the most common error in self-made calculations, and it overstates the award by about a third. Rows are spaced ${usd(S.rows[1][0] - S.rows[0][0])} apart. Above ${usd(top[0])} a week, roughly ${usd(top[0] * 52)} a year, the top award (${usd(top[2])} for two children) becomes a floor and the judge adds a discretionary amount under N.J.S.A. 2A:34-23. The rule forbids extrapolating the table.</p>
<p>The 2025 revision produced an odd feature at the top: the one-child and two-children columns nearly meet (${usd(top[1])} against ${usd(top[2])} at the last row). It is how the schedule was adopted, and the calculator copies it as published.</p>
<h2>Parenting time: credit or shared award</h2>
<p>Appendix IX-A splits what parents spend on a child into three pools: ${pct(F.fixedPct)} fixed (housing), ${pct(F.variablePct)} variable (food, transportation) and ${pct(F.controlledPct)} controlled (clothing, personal care, entertainment), which stays with the parent of primary residence.</p>
<p><strong>Below the line.</strong> A parent of alternate residence with regular overnights can receive a credit equal at most to the award times ${pct(F.variablePct)} times his or her share of overnights. The word is "may", so courts can give less. With ${num(visit)} nights a year our paying parent would owe ${usd(wk(par.monthly))} a week at the maximum credit, against ${usd(wk(sole.monthly))} with none.</p>
<p><strong>At or above ${pct(F.sharedMinPctOfOvernights)}.</strong> The alternate parent is assumed to carry fixed costs too, prorated at twice the time share. The award becomes that parent's income share of the basic award plus those fixed costs, minus the fixed and variable costs he or she already bears. At ${num(minNights)} nights the example drops to ${usd(wk(shared.monthly))} a week. Two guardrails sit outside the calculator: separate living accommodations for the child, and a check that the primary household keeps at least twice the poverty guideline for its size. If that test fails, the court calculates a sole-parenting award instead.</p>
<h3>The reserve at the bottom</h3>
<p>The reserve equals 150% of the poverty guideline for one person, ${usd(SSR)} a week as Appendix IX-A states it for 2025; we found no later figure in the published appendix when we checked. Example: an obligor at ${usd(wk(lowA))} a week next to a parent at ${usd(wk(lowB))} would owe ${usd(wk(lowPlain))} under the schedule, which would leave less than the reserve, so the award falls to ${usd(wk(low.monthly))}. It never goes below ${usdx(F.minimumAwardWeekly)} a week. Compare the monthly approach of ${h.a('child-support:michigan', 'Michigan')} on the ${h.a('child-support', 'calculator')}.</p>`,
  faqs: [
    { q: 'Is New Jersey child support calculated weekly or monthly?', a: `Weekly. The Appendix IX-F schedule is expressed in combined net weekly income and weekly awards, from ${usd(S.minIncome)} to ${usd(S.maxIncome)} a week. Monthly figures must be converted first (multiply by 12, divide by 52). Orders are usually entered as a weekly amount too. In our example, ${usd(A)} and ${usd(B)} of monthly net income mean about ${usd(wk(sole.monthly))} a week for two children.` },
    { q: 'How many overnights count as shared parenting in New Jersey?', a: `The parent of alternate residence must have the child the equivalent of two or more overnights a week, at least ${pct(F.sharedMinPctOfOvernights)} of the time, with separate living space for the child and a parenting plan on file. Even then the shared-parenting award is not automatic: the court decides, and it calculates a sole-parenting award if the primary household's income would fall too low.` },
    { q: 'What is the New Jersey self-support reserve for child support?', a: `It is 150% of the federal poverty guideline for one person, stated as ${usd(SSR)} a week in Appendix IX-A. The award is reduced when paying it would leave the obligor below the reserve, but only if the other parent's net income after his or her own share stays above the same level. The reduced award cannot fall below ${usdx(F.minimumAwardWeekly)} a week.` },
    { q: 'What happens above the New Jersey child support schedule?', a: `When combined net income exceeds ${usd(S.maxIncome)} a week, the award at the top row becomes the minimum. The judge adds a discretionary amount based on the extra income and the factors in N.J.S.A. 2A:34-23, such as the children's needs, the parents' standard of living and their assets. Appendix IX-F expressly prohibits extending the table by extrapolation.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:michigan', 'child-support:virginia'],
});
