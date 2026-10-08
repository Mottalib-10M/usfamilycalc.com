import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day } from '../../../lib/kit';

const d = cs('california');
type KRow = { tnMin: number; tnMax: number | null; constant: number; divisor: number | null; fixedOverTN: number | null };
const F = d.formula as {
  kTable: KRow[];
  childrenMultiplier: Record<string, number>;
  lowIncomeAdjustment: { minimumWageHourly2026: number; thresholdMonthly2026Computed: number };
  statutoryKExample: { hPercent: number; tn: number; k: number };
};
const LIA = F.lowIncomeAdjustment;
const mult2 = F.childrenMultiplier['2'];
const mult3 = F.childrenMultiplier['3'];
const flat = F.kTable.find((r) => !r.divisor && !r.fixedOverTN)!;
const top = F.kTable[F.kTable.length - 1];
const operative = day(d.effective!);

// Worked example: high earner 6,000, other parent 4,000 net disposable a month, two children.
const HI = 6000, LO = 4000;
const nightsRows = [0, 73, 110, 146, 183];
const byNights = nightsRows.map((n) => ({ n, h: Math.round((n / 365) * 100), r: csCalc('california', HI, LO, 2, { payerOvernights: n }) }));
const at20 = byNights[1].r;
const at0 = byNights[0].r;
const at50 = byNights[4].r;
const oneChild20 = csCalc('california', HI, LO, 1, { payerOvernights: 73 });

// Child care under § 4061(c)-(d): the payer's net is reduced by basic support and the recipient's raised by it.
const care = 1000;
const adjPayerShare = (HI - at20.basicMonthly) / (HI + LO);
const rawPayerShare = HI / (HI + LO);

// Low-income adjustment: obligor nets 2,400, the other parent 3,000, the obligor has 73 overnights.
const low = csCalc('california', 2400, 3000, 1, { payerOvernights: 73 });
const liaStep = low.steps.find((s) => /Low-income/.test(s.label));
const liaMax = typeof liaStep?.value === 'number' ? liaStep.value : 0;

// High income: no cap, the top band's fraction keeps falling.
const rich = csCalc('california', 30000, 5000, 1);
const richFraction = top.constant + (top.fixedOverTN ?? 0) / 35000;

export default defineStatePage({
  topic: 'child-support',
  slug: 'california',
  title: `California Child Support Calculator 2026: K-Factor Formula`,
  description: `California child support 2026 by the § 4055 K-factor formula: two children, parents netting ${usd(HI)} and ${usd(LO)} a month, 20% timeshare, gives ${usd(at20.monthly)} a month.`,
  intro: 'California runs every case through one statewide equation, so your timeshare percentage moves the figure as much as your paycheck does.',
  resume: `California child support is set by an equation, not a table: CS = K[HN − (H%)(TN)], where HN is the higher earner’s net disposable income, TN is both parents’ net disposable income combined, H% is the share of time the higher earner has the children, and K is an income fraction scaled by that timeshare (Family Code § 4055, current version operative ${operative} after SB 343). For a parent netting ${usd(HI)} a month, another parent netting ${usd(LO)}, two children and a 20% timeshare for the higher earner, the guideline is ${usd(at20.monthly)} a month; with no overnights for the higher earner it climbs to ${usd(at0.monthly)}, and at an even split it falls to ${usd(at50.monthly)}. The result is multiplied by ${num(mult2, 1)} for two children and ${num(mult3)} for three. Child care tied to work or school and uninsured health costs are added on top and shared by income, and an obligor earning less than full-time minimum wage, about ${usd(LIA.thresholdMonthly2026Computed)} a month in 2026, may get a low-income reduction.`,
  body: (h) => `<h2>Timeshare is a variable inside the equation</h2>
<p>Most states compute support first and then trim it for parenting time once the paying parent passes an overnight threshold. California has no threshold. H%, the percentage of time the higher earner has primary physical responsibility, sits in two places at once: it scales K up (1 + H%, or 2 − H% past one half) and it subtracts H% of the family’s total net income from the higher earner’s net. Every extra night therefore changes the result, from the first one. With net incomes of ${h.usd(HI)} and ${h.usd(LO)} and two children, the formula gives:</p>
${h.table(['Higher earner’s overnights a year', 'H%', 'Guideline, a month'], byNights.map((x) => [h.num(x.n), h.pct(x.h), h.usd(x.r.monthly)]), `Same parents, two children, only the timeshare changes (combined net ${h.usd(HI + LO)}, so the fraction is a flat ${h.num(flat.constant, 3)}).`, ['r', 'r', 'r'])}
<p>The drop from ${h.usd(at0.monthly)} to ${h.usd(at50.monthly)} is why the timeshare figure is so often the contested one in a California support hearing. Courts look at the actual pattern of care, and the DCSS calculator asks for it as a percentage, not as a custody label. When a parent does not appear and nobody proves the schedule, § 4055(b)(6) sets H% at zero if the absent parent is the higher earner.</p>

<h2>Net disposable income under § 4059</h2>
<p>The two incomes in the equation are net figures, but not the net on a pay stub. Section 4059 deducts federal and state income taxes actually payable after the filing status, credits and deductions a parent is entitled to, which can differ sharply from withholding. FICA, mandatory union dues and retirement contributions, health premiums for the parent and the children, support actually paid for children of another relationship and approved hardship deductions also come off. A new spouse’s or partner’s income is left out except in cases of extreme hardship to a child (§ 4057.5). The official ${h.ext(d.officialCalculatorUrl!, 'DCSS Guideline Calculator')} does this tax work for you from gross figures; our calculator expects you to enter the net already.</p>

<h2>The K factor after SB 343</h2>
<p>SB 343 rewrote the income bands of the K fraction for orders computed on or after ${operative}. Combined net income up to the first band adds a slowly rising slice to a base of ${h.num(F.kTable[0].constant, 3)}; the middle band is flat at ${h.num(flat.constant, 3)}; above ${h.usd(top.tnMin - 1)} a month the fraction becomes ${h.num(top.constant, 2)} plus ${h.usd(top.fixedOverTN ?? 0)} divided by combined income, so it keeps shrinking as income grows. There is no income cap. A parent netting ${h.usd(30000)} with an ex netting ${h.usd(5000)} and one child in the other home gets a fraction of about ${h.num(richFraction, 3)} and a guideline of ${h.usd(rich.monthly)} a month; past that point the court may deviate only on proof that the amount exceeds the child’s needs (§ 4057). The statute’s own check: at H% ${h.pct(F.statutoryKExample.hPercent * 100)} and combined net ${h.usd(F.statutoryKExample.tn)}, K rounds to ${h.num(F.statutoryKExample.k, 2)}.</p>

<h2>Child care add-on: the split changed in 2024</h2>
<p>Work- or school-related child care is a mandatory add-on (§ 4062). Since SB 343, the shares are not plain income ratios: for this step the payer’s net is reduced by the basic support paid, and the recipient’s raised by it (§ 4061(c)-(d)). In the two-child case at a 20% timeshare, basic support of ${h.usd(at20.basicMonthly)} moves the payer’s share of a ${h.usd(care)} monthly child care bill from ${h.pct(Math.round(rawPayerShare * 100))} (${h.usd(care * rawPayerShare)}) to ${h.pct(Math.round(adjPayerShare * 1000) / 10)} (${h.usd(care * adjPayerShare)}). The calculator above applies this adjusted split when you enter a child care amount.</p>

<h2>Low-income adjustment</h2>
<p>An obligor whose net disposable income is below the monthly gross pay of a full-time minimum-wage job (${h.usdx(LIA.minimumWageHourly2026)} an hour in 2026, which we compute to ${h.usdx(LIA.thresholdMonthly2026Computed)} a month) is presumed entitled to a reduction. An obligor netting ${h.usd(2400)} who has the child ${h.num(73)} nights a year, facing a parent netting ${h.usd(3000)}, owes ${h.usd(low.monthly)} for one child before the adjustment; the court may take off up to ${h.usd(liaMax)}. The presumption is rebuttable, and a separate rule lets the judge cut support that still exceeds half the obligor’s net income (§ 4057(b)(5)). With one child at the 20% timeshare instead of two, the first example drops to ${h.usd(oneChild20.monthly)}, the youngest child’s share under § 4055(b)(8).</p>`,
  faqs: [
    {
      q: 'What is the K factor in the California child support formula?',
      a: `K is the slice of combined net income California treats as available for the children. It equals an income fraction from § 4055(b)(3), multiplied by 1 plus the higher earner’s timeshare (or 2 minus it above 50%). In the middle band of combined net income the fraction is a flat ${num(flat.constant, 3)}; above that it shrinks, so higher-income families pay a smaller percentage, with no cap on the income counted.`,
    },
    {
      q: 'Did SB 343 change child support amounts in California?',
      a: `Yes, for support computed on or after ${operative}. SB 343 replaced the K-factor income bands, re-based the low-income adjustment on the state minimum wage, and changed how child care and medical add-ons are shared, by first reducing the payer’s net income by the basic support paid. Existing orders did not change automatically: a parent must file a request to modify to have the new formula applied.`,
    },
    {
      q: 'How many overnights change child support in California?',
      a: `Every one. California has no overnight threshold: the higher earner’s timeshare enters the equation directly, so moving from 0 to 73 overnights a year takes the two-child example on this page from ${usd(at0.monthly)} to ${usd(at20.monthly)} a month. Courts count actual responsibility for the children, which is why the DCSS calculator asks for a timeshare percentage rather than the label on the custody order.`,
    },
    {
      q: 'Is there a maximum child support amount in California?',
      a: `No. The California formula has no income cap; above ${usd(top.tnMin - 1)} of combined net income a month, the fraction becomes ${num(top.constant, 2)} plus ${usd(top.fixedOverTN ?? 0)} divided by that income, so support keeps rising but more slowly. A judge may order less only when the parent shows that the guideline amount exceeds the children’s reasonable needs, one of the deviation factors listed in Family Code § 4057.`,
    },
    {
      q: 'Who qualifies for the low-income adjustment in California?',
      a: `An obligor whose net disposable income is below the gross monthly earnings of a full-time job at the state minimum wage: ${usd(LIA.thresholdMonthly2026Computed)} a month with the 2026 rate of ${usd(LIA.minimumWageHourly2026, 2)} an hour, by our computation. The reduction is presumed but rebuttable, and it can reach support multiplied by the gap between that threshold and the obligor’s net income, divided by the threshold.`,
    },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:texas', 'child-support:new-york', 'workers-comp'],
});
