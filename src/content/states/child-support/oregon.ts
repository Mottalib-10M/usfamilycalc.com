import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, day } from '../../../lib/kit';

const d = cs('oregon');
const F = d.formula as { ptcSlope: number; ptcOffsetPct: number; selfSupportReserve: number; minimumOrder: number; minimumOrderExemptEqualOvernights: number };
const rows = d.schedule!.rows as number[][];
const top = rows[rows.length - 1];
const credit = (n: number) => { const x = n / 365; return (1 / (1 + Math.exp(-F.ptcSlope * (x - 0.5))) - F.ptcOffsetPct / 100 + (2 * F.ptcOffsetPct / 100) * x) * 100; };
const A = 4000, B = 2000;
const base = csCalc('oregon', A, B, 2);
const ladderN = [0, 36, 73, 104, 146];
const ladder = ladderN.map((n) => csCalc('oregon', A, B, 2, { payerOvernights: n }).monthly);
const lowA = 2000, lowB = 4000;
const low = csCalc('oregon', lowA, lowB, 1);
const minA = 1800, minB = 5000;
const minCase = csCalc('oregon', minA, minB, 1);
const one = credit(1);

export default defineStatePage({
  topic: 'child-support',
  slug: 'oregon',
  title: 'Oregon Child Support Calculator 2026: Parenting Time Credit',
  description: `Oregon child support 2026: ${usd(A)} and ${usd(B)} of adjusted gross income, two kids, about ${usd(base.monthly)} a month; the time credit starts with the very first overnight.`,
  intro: 'The Oregon scale of OAR 137-050-0725, the logistic parenting time credit and the self-support reserve, applied to your incomes.',
  resume: `In Oregon a parent with ${usd(A)} of monthly adjusted gross income, facing ${usd(B)} on the other side, owes about ${usd(base.monthly)} a month for two children when the children sleep at the other home every night. The Division of Child Support scale reads combined adjusted income in ${usd(50)} brackets, takes the lower amount of the bracket, and stops growing at ${usd(top[1])}. What sets Oregon apart is the parenting time credit: there is no threshold of nights. A smooth S-shaped curve turns any number of overnights into a credit percentage, so ${num(ladderN[2])} overnights already bring the same parent down to ${usd(ladder[2])}. Low earners are protected twice. Each parent keeps a self-support reserve of ${usd(F.selfSupportReserve)} a month (OAR 137-050-0745, the figure effective July 1, 2026), and the rules then presume that a paying parent can still afford ${usd(F.minimumOrder)}.`,
  body: (h) => `<h2>A credit for every overnight</h2>
<p>Most states wait until the paying parent has a quarter or a third of the year before time counts. Oregon starts at night one. OAR 137-050-0730(6) gives the credit percentage as a logistic function of the share of the year spent with each parent, with a slope of ${num(F.ptcSlope, 2)} and a correction of ${num(F.ptcOffsetPct, 2)} points that pins the curve to zero at no time and to one hundred percent at a full year. One overnight a year is worth ${num(one, 2)}%; half the year is worth exactly half. The rule prefers the exact formula and keeps a rounded table only for people working by hand.</p>
<p>The credit is a dollar amount, not a discount on one parent's share: the percentage multiplies the whole combined scale amount, and each parent receives a credit for their own nights. Only the parent whose net obligation stays larger is ordered to pay (OAR 137-050-0710(1)(i)).</p>
${h.table(['Overnights a year with the paying parent', 'Credit', 'Monthly support, two children'], ladderN.map((n, i) => [num(n), `${num(credit(n), 2)}%`, usd(ladder[i])]), `Oregon, ${usd(A)} and ${usd(B)} of adjusted gross income, no add-ons`, ['l', 'r', 'r'])}
<p>The curve is flat at the start and steep in the middle. Moving from ${num(ladderN[3])} to ${num(ladderN[4])} nights saves far more than the first ${num(ladderN[1])} nights do, because the S-curve accelerates around one third of the year.</p>
<h2>The scale itself is old, the reserve is new</h2>
<p>The scale printed in the appendix to OAR 137-050-0725 still carries the form date of February 2007 and rests on a 2006 economic study; the rule text in force dates from ${day(d.effective!)}. It covers up to ${num(d.maxChildren)} children and gross rather than net income. Above ${usd(top[1])} of combined adjusted income the amount stays at the top line (${usd(top[3])} for two children) unless a party rebuts it. The self-support reserve, by contrast, moves every year with the federal poverty guideline. Take ${usd(lowA)} against ${usd(lowB)} with one child: the income share would be a third of the scale amount, but the parent only has ${usd(lowA - F.selfSupportReserve)} above the reserve, so the order is ${usd(low.monthly)}. At ${usd(minA)} against ${usd(minB)}, the reserve leaves almost nothing and the ${usd(F.minimumOrder)} minimum takes over: ${usd(minCase.monthly)}.</p>
<h3>What the calculator leaves to the worksheet</h3>
<p>The official ${h.ext('https://justice.oregon.gov/guidelines/', 'Oregon DOJ guidelines calculator')} also handles a child attending school between 18 and 21, the non-joint child deduction and Social Security benefits paid for the child. Child care entered here is treated as paid by the parent with the children, and the cap of OAR 137-050-0735 Table 1 is not applied. See how other states treat time in the ${h.a('child-support', 'state-by-state overview')}.</p>`,
  faqs: [
    { q: 'How many overnights do I need for an Oregon parenting time credit?', a: `One. Oregon has no threshold: the credit percentage comes from a continuous formula in OAR 137-050-0730(6), so one overnight a year is worth ${num(one, 2)}% of the combined scale amount and half the year is worth 50%. Overnights are averaged over two consecutive years, and twelve continuous daytime hours can count as a day when a parent has long visits without nights.` },
    { q: 'What is the Oregon self-support reserve in 2026?', a: `${usd(F.selfSupportReserve)} a month, effective July 1, 2026. OAR 137-050-0745 sets it at the federal poverty guideline for one person multiplied by 1.303, rounded to the nearest dollar, and reviews it every year. Each parent subtracts it from adjusted income, and the total obligation, child care and health coverage included, cannot exceed what is left, apart from the minimum order rule.` },
    { q: 'Is there a minimum child support order in Oregon?', a: `Yes, a rebuttable one. OAR 137-050-0755 presumes that a paying parent can pay at least ${usd(F.minimumOrder)} a month, cash medical support or the cost of coverage included. It does not apply when each parent has exactly ${num(F.minimumOrderExemptEqualOvernights, 1)} overnights, when disability benefits are the only income, to an incarcerated obligor, or to a parent receiving public benefits.` },
    { q: 'Does Oregon use gross or net income for child support?', a: `Gross. The Oregon scale was built from net-income data and then converted to gross income, so parents enter actual or potential gross income from all sources. Adjusted income then subtracts mandatory union dues, the parent's own health insurance, spousal support paid and a deduction for children from other relationships, and adds spousal support received.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:idaho', 'child-support:california'],
});
