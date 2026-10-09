import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, usdx, num, pct, day } from '../../../lib/kit';

const SLUG = 'vermont';
const d = cs(SLUG);
const rows = d.schedule!.rows;
const first = rows[0];
const last = rows[rows.length - 1];
const SSR = d.lowIncome!.selfSupportReserve!;
const F = d.formula as { sharedPctOfYear: number; partialSharedPctOfYear: number; sharedMultiplier: number; reverseMinimum: number };
const T = d.shared!.thresholdOvernights!;
const P = Math.ceil((F.partialSharedPctOfYear / 100) * 365);
const A = 4000, B = 2000;
const base = csCalc(SLUG, A, B, 2);
const partial = csCalc(SLUG, A, B, 2, { payerOvernights: T - 1 });
const shared = csCalc(SLUG, A, B, 2, { payerOvernights: 120 });
const premium = 300;
const withPremium = csCalc(SLUG, A, B, 2, { health: premium, healthBy: 'payer' });
const lowA = 2000, lowB = 3000;
const low = csCalc(SLUG, lowA, lowB, 1);
const lowShare = (low.basicMonthly * lowA) / (lowA + lowB);
const tinyA = 1500;
const evenA = 2900, evenB = 3100, evenN = 182;
const even = csCalc(SLUG, evenA, evenB, 2, { payerOvernights: evenN });
const evenRaw = (evenA / (evenA + evenB)) * even.basicMonthly * F.sharedMultiplier - (evenN / 365) * even.basicMonthly * F.sharedMultiplier;

export default defineStatePage({
  topic: 'child-support',
  slug: SLUG,
  title: 'Vermont Child Support 2026: Available Income and Custody',
  description: `Vermont child support 2026: ${usd(A)} and ${usd(B)} of available income, two children, ${usd(base.monthly)} a month; shared custody at ${pct(F.sharedPctOfYear)} of overnights and a ${usd(SSR)} reserve.`,
  intro: 'The Vermont Table of Intact Family Expenditures, the self-support reserve and the 15 V.S.A. § 657 custody rules, applied to monthly available income.',
  resume: `With ${usd(A)} of monthly available income on one side and ${usd(B)} on the other, a Vermont parent owes ${usd(base.monthly)} a month for two children under 15 V.S.A. § 656. Available income is an after-tax figure the Office of Child Support builds with its own tax conversion tables, so the gross pay on a stub is not the number to enter. That income is matched against the Table of Intact Family Expenditures on Children, revised ${day(d.effective!)}, in ${usd(50)} brackets from ${usd(first[0])} to ${usdx(last[1])}. The paying parent always keeps a self-support reserve, ${usd(SSR)} a month since February 2, 2026. Custody counts in overnights: at ${pct(F.sharedPctOfYear)} of the year for each parent the guideline adds half again for two homes and nets the two obligations, which brings our example to ${usd(shared.monthly)} at 120 nights, never above the sole-custody amount.`,
  body: (h) => `<h2>What a family that stayed together would spend</h2>
<p>Section 654 sets a goal that few statutes spell out: the table must reflect what Vermont parents living together ordinarily spend on their children, so the children keep the same share of parental income after the split. Hence the table's name. It is built on available income, which section 653(1) defines in detail: gross income minus FICA, spousal support and earlier child support actually paid, the cost of the children's health insurance, and state and federal income tax computed with the standard deduction. The tax step is not neutral. The custodial parent is taxed as head of household with the children's exemptions, the other parent as single with one exemption, so two parents with the same gross pay can have different available incomes.</p>
<p>The health premium is a deduction, not an add-on. If the paying parent of our example covers the children for ${usd(premium)} a month, that parent's available income falls by the same amount and the order becomes ${usd(withPremium.monthly)} instead of ${usd(base.monthly)}. Child care and extraordinary medical or school costs do the opposite: they join the table amount to form the total support obligation shared by income.</p>
<h2>The reserve, and the nominal order below it</h2>
<p>A paying parent with ${usd(lowA)} a month, facing ${usd(lowB)}, one child, would owe ${usd(lowShare)} as an income share. Paying it would leave less than ${usd(SSR)}, so section 656(c) presumes the share is the difference: ${usd(low.monthly)}. Under the reserve, at ${usd(tinyA)} for instance, or under the table's first income of ${usd(first[0])}, the court uses the section 659 factors and must still order a nominal amount; the statute names no figure, so the calculator shows zero and says why.</p>
<h3>Shared custody in three bands</h3>
<p>Section 657 counts overnights. From ${pct(F.sharedPctOfYear)} of a calendar year with each parent, about ${num(T)} nights, the table amount is multiplied by ${num(F.sharedMultiplier, 1)}; the paying parent owes his or her income share of that larger total, minus a credit equal to his or her share of the year times the larger amount. At 120 nights our family lands at ${usd(shared.monthly)}. Subsection (c) forbids a result above the sole-custody amount.</p>
<p>Between ${pct(F.partialSharedPctOfYear)} and ${pct(F.sharedPctOfYear)}, roughly ${num(P)} to ${num(T - 1)} nights, a shared costs table adopted by rule should apply. It is not in the tables republished in 2024, so for that band the calculator keeps the sole amount, here ${usd(partial.monthly)}, and flags it. Near equal time the formula can reverse: with ${usd(evenA)} against ${usd(evenB)} and ${num(evenN)} nights, the result is negative by ${usd(-evenRaw, 2)}, and the OCS worksheet then has the other parent pay that amount or ${usd(F.reverseMinimum)}, whichever is greater: ${usd(even.reverse)} here. For a state with a different time rule nearby, see ${h.a('child-support:new-hampshire', 'New Hampshire')}.</p>`,
  faqs: [
    { q: 'What is the self-support reserve for Vermont child support in 2026?', a: `${usd(SSR)} a month, effective February 2, 2026, according to the Office of Child Support. It equals 120% of the federal poverty guideline for one person (15 V.S.A. § 653(7)). If paying the guideline amount would leave the paying parent below it, the order is presumed to be available income minus the reserve: ${usd(low.monthly)} for a parent with ${usd(lowA)} facing ${usd(lowB)}, one child.` },
    { q: 'When does shared custody change child support in Vermont?', a: `When each parent keeps the children overnight at least ${pct(F.sharedPctOfYear)} of the calendar year, about ${num(T)} nights. The table amount is then raised by half to reflect two households and the obligations are netted by income and time (15 V.S.A. § 657(a)). The result can never exceed the sole-custody amount. With ${usd(A)} and ${usd(B)} of available income and two children, 120 nights give ${usd(shared.monthly)} a month.` },
    { q: 'Is Vermont child support based on gross pay or take-home pay?', a: `On available income, which is closer to take-home pay but standardized. Starting from gross income, the Office of Child Support subtracts FICA, income taxes computed with the standard deduction and a filing status fixed by custody, spousal and prior child support actually paid, and the children's health insurance. Its conversion tables turn monthly adjusted gross income into after-tax income by number of children.` },
    { q: 'How often is the Vermont child support table updated?', a: `The guideline is reviewed on a cycle: the current tables were updated on ${day(d.effective!)}, and the Office of Child Support schedules the next review for completion by January 2, 2028. The self-support reserve moves separately each year with the poverty guideline, which is why it changed mid-year in 2026 while the table itself stayed the same.` },
  ],
  related: ['child-support', 'child-support:new-hampshire', 'child-support:massachusetts', 'child-support:new-york', 'workers-comp:vermont'],
});
