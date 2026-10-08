import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, day } from '../../../lib/kit';

const d = cs('kansas');
const F = d.formula as { timeAdjustment: Array<[number, number]>; equalTimePct: number; directExpense: { pctLow: number; pctMid: number; pctHigh: number; lowMax: number; highFrom: number }; ageFactor0to5: number; ageFactor6to11: number; extendedExponent: number; extendedMultiplierByChildren: number[] };
const S = (d as unknown as { extra: { schedulesByChildren: Record<string, number[][]> } }).extra.schedulesByChildren;
const two = S['2'];
const top = two[two.length - 1];
const A = 4000, B = 2000, C = A + B;
const r6000 = two.find((r) => r[0] === C)!;
const base = csCalc('kansas', A, B, 2);
const ages = [['both under 6', r6000[1] * 2], ['both 6 to 11', r6000[2] * 2], ['both 12 to 18', r6000[3] * 2], ['one of 4, one of 15', r6000[1] + r6000[3]]] as Array<[string, number]>;
const nights = [0, 128, 146, 164, 183];
const ladder = nights.map((n) => csCalc('kansas', A, B, 2, { payerOvernights: n }).monthly);
const hiA = 15000, hiB = 10000;
const hi = csCalc('kansas', hiA, hiB, 2);
const de = F.directExpense;

export default defineStatePage({
  topic: 'child-support',
  slug: 'kansas',
  title: 'Kansas Child Support Calculator 2026: Schedules by Age',
  description: `Kansas child support 2026 by age group: two children aged 6 to 11, with ${usd(A)} and ${usd(B)} of gross income, cost the paying parent about ${usd(base.monthly)} a month.`,
  intro: 'The Kansas Child Support Guidelines effective July 2025: one schedule per family size, a column per age group, and the time adjustments.',
  resume: `Kansas prices child support per child and by age. The guidelines in force since ${day(d.effective!)} (Supreme Court Administrative Order 2025-RL-121) print six schedules, one per family size, each with three columns: children aged 0 to 5, 6 to 11 and 12 to 18. A family with ${usd(A)} and ${usd(B)} of gross monthly income and two children in the middle group reads ${usd(r6000[2])} per child on the ${usd(C)} line, ${usd(r6000[2] * 2)} in all, of which the parent with ${usd(A)} owes ${usd(base.monthly)} a month. The youngest group costs ${Math.round((1 - F.ageFactor0to5) * 100)}% less than teenagers and the middle group ${Math.round((1 - F.ageFactor6to11) * 100)}% less. The calculator has no age field, so it uses the 6 to 11 column for every child. Time counts from ${F.timeAdjustment[0][0]}% of the year with the other parent, and equal parenting time has its own formula.`,
  body: (h) => `<h2>Three columns per child</h2>
<p>Appendix II is built backwards from teenagers. The 12 to 18 amount is the result of a support function; the 6 to 11 amount is that value times ${num(F.ageFactor6to11, 2)}, and the 0 to 5 amount times ${num(F.ageFactor0to5, 2)}, rounded only at the end. A child's age is taken at the nearest birthday, so a child five months short of twelve already counts as twelve. For one family, the age mix alone moves the total.</p>
${h.table(['Two children', 'Gross child support obligation'], ages.map(([k, v]) => [k, usd(v)]), `Kansas, ${usd(C)} of combined child support income`, ['l', 'r'])}
<p>The paying parent's share is the income percentage, rounded to a tenth of a point. Orders for families whose children cross an age boundary are not adjusted automatically, but a child moving into a new age group counts as a material change that allows a motion to modify.</p>
<h2>Time with the paying parent</h2>
<p>The parenting time adjustment of section IV.H.2 is a table, applied to the paying parent's share: ${F.timeAdjustment.map(([p, a]) => `${a}% from ${p}% of the child's time`).join(', ')}. School and day care hours do not count toward the percentage. Equal parenting time leaves this table for a direct expense formula: half the difference between the two parents' shares, plus ${de.pctLow}% of the total obligation when combined income is at most ${usd(de.lowMax)}, ${de.pctMid}% up to ${usd(de.highFrom)} and ${de.pctHigh}% above, paid by the parent who does not cover the children's direct expenses. The calculator assumes that parent is the one paying support.</p>
${h.table(['Overnights a year with the paying parent', 'Monthly support, two children aged 6 to 11'], nights.map((n, i) => [num(n), usd(ladder[i])]), `Kansas, ${usd(A)} and ${usd(B)} gross, no add-ons`, ['l', 'r'])}
<h3>Past the last line</h3>
<p>The schedules stop at ${usd(top[0])} of combined income. Under each one, the guidelines print an extended formula: income raised to the power ${num(F.extendedExponent, 4)}, times ${num(F.extendedMultiplierByChildren[1], 4)} for two children, gives the 12 to 18 amount per child. The result is discretionary, not presumptive; at ${usd(hiA)} and ${usd(hiB)} it suggests about ${usd(hi.monthly)} a month for two school-age children. Courts also run an ability-to-pay check against the federal poverty guideline for one person. The guidelines and the worksheet are on ${h.ext('https://kscourts.gov/About-the-Courts/Programs/Child-Support-Guidelines', 'kscourts.gov')}; compare ${h.a('child-support:nebraska', 'Nebraska')} and ${h.a('child-support:oklahoma', 'Oklahoma')}.</p>`,
  faqs: [
    { q: 'Why does the age of my children change Kansas child support?', a: `Because each Kansas schedule has three columns per child. The 12 to 18 amount is the base, the 6 to 11 amount is ${num(F.ageFactor6to11 * 100)}% of it and the 0 to 5 amount ${num(F.ageFactor0to5 * 100)}%. At ${usd(C)} of combined income, two teenagers cost ${usd(r6000[3] * 2)} a month against ${usd(r6000[1] * 2)} for two preschoolers. Age is measured at the nearest birthday.` },
    { q: 'How much time do I need for a parenting time adjustment in Kansas?', a: `The child must spend at least ${F.timeAdjustment[0][0]}% of the time with the parent who does not have primary residency. The court may then reduce that parent's share by ${F.timeAdjustment[0][1]}%, ${F.timeAdjustment[1][1]}% or ${F.timeAdjustment[2][1]}% as time rises toward half. Fourteen or more consecutive days, typically in summer, can justify a separate extended parenting time reduction of up to half the monthly amount.` },
    { q: 'Which Kansas child support guidelines apply in 2026?', a: `The version effective ${day(d.effective!)}, adopted by Kansas Supreme Court Administrative Order 2025-RL-121 of October 3, 2025, which superseded the May 1, 2025 version. The schedules in Appendix II are those of the 2024 review, based on 2023 poverty guidelines, and stop at ${usd(top[0])} of combined monthly child support income.` },
    { q: 'When does child support end in Kansas?', a: 'At 18, unless the parents agreed in writing to pay longer. A child still in high school keeps support until June 30 of the school year in which the child turned 18, and on motion the court can extend it through the school year in which the child turns 19, as long as the child remains a bona fide high school student (K.S.A. 23-3001).' },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:nebraska', 'child-support:oklahoma', 'child-support:iowa'],
});
