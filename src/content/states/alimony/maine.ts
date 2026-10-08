import { defineStatePage } from '../../../lib/page-types';
import { al, alCalc, pct, num } from '../../../lib/kit';

const d = al('maine');
const T = d.durationTable as unknown as Array<{ marriageYearsMin: number; marriageYearsMax: number | null; maxPctOfMarriageLength?: number; rule: string }>;
const [none, half, open] = T;
const ex15 = alCalc('maine', { payer: 7000, payee: 2500, years: 15 });
const ex9 = alCalc('maine', { payer: 7000, payee: 2500, years: 9 });
const ex20 = alCalc('maine', { payer: 7000, payee: 2500, years: half.marriageYearsMax! });

export default defineStatePage({
  topic: 'alimony',
  slug: 'maine',
  title: `Maine Spousal Support Calculator 2026: Duration Presumptions`,
  description: `Maine spousal support 2026: no general support presumed after under ${none.marriageYearsMax} years of marriage, and at most ${pct(half.maxPctOfMarriageLength!)} of the marriage from ${half.marriageYearsMin} to ${half.marriageYearsMax} years; no amount rule.`,
  intro: 'Maine sets no amount for spousal support but writes two presumptions about general support into the statute, both tied to the length of the marriage.',
  resume: `Maine has no formula for the amount of spousal support. What 19-A M.R.S. § 951-A does fix is the length of general support, through two rebuttable presumptions measured on the date the divorce is filed. If the spouses were married for less than ${none.marriageYearsMax} years, general support is presumed not to be awarded at all. If they were married at least ${half.marriageYearsMin} but not more than ${half.marriageYearsMax} years, it is presumed not to last more than ${pct(half.maxPctOfMarriageLength!)} of the length of the marriage: ${num(ex15.durationMonths ?? 0)} months after 15 years. After more than ${open.marriageYearsMin} years there is no presumption. A court that finds the presumed result inequitable or unjust can set it aside by saying so. The presumptions cover only general support; transitional, reimbursement, nominal and interim support follow their own purposes. Our calculator therefore returns no monthly amount for Maine and reports the presumed maximum term, which the judge weighs with the factors of § 951-A(5).`,
  body: (h) => `<h2>Five kinds of support, one with limits</h2>
<p>Maine's statute names its tools precisely. <strong>General support</strong> helps a spouse with substantially less income potential so that both can keep a reasonable standard of living. <strong>Transitional support</strong> covers short-term dislocation or a return to work, including training and rehabilitation. <strong>Reimbursement support</strong> answers exceptional circumstances such as economic misconduct, economic abuse, or substantial contributions to the other spouse's education or career, and only when the property division cannot fix them. <strong>Nominal support</strong> keeps the court's power to award support later without paying anything meaningful now. <strong>Interim support</strong> covers the pendency of the case. The duration presumptions apply to the first only, which is why a short marriage can still lead to transitional support.</p>

<h2>The ${h.num(none.marriageYearsMax ?? 0)}-year and ${h.num(half.marriageYearsMax ?? 0)}-year marks</h2>
<p>The two presumptions turn on the marriage length at filing. Nine years: general support presumed unavailable (${h.num(ex9.durationMonths ?? 0)} months in our calculator). Fifteen years: presumed to last at most ${h.num(ex15.durationMonths ?? 0)} months. Exactly ${h.num(half.marriageYearsMax ?? 0)} years still falls in the half-length band, capping the presumed term at ${h.num(ex20.durationMonths ?? 0)} months; one more year and the statute is silent. Because they are rebuttable, a single finding by the court that the presumed result would be inequitable or unjust is enough to depart from them, and parties often argue exactly that for a spouse who left the workforce for the children.</p>

<h2>What the order must say</h2>
<p>Section 951-A requires every order to state the type of support, the method of payment, the term and any limits, whether the support can be modified later, and, in a contested case, the factors the court relied on. Limits can cap future increases or decreases, the term, or tie support to the recipient's remarriage or cohabitation. Awards issued since October 1, 2013 can be modified on a substantial change in circumstances unless the order says otherwise. There is no amount guideline to compute, so the calculator stops at the term.</p>`,
  faqs: [
    {
      q: 'Can you get spousal support in Maine after a short marriage?',
      a: `General support is presumed unavailable in Maine when the marriage lasted less than ${none.marriageYearsMax} years at the filing date, under 19-A M.R.S. § 951-A(2)(A). The presumption can be rebutted if the court finds it inequitable or unjust. Transitional, reimbursement and interim support are not covered by that presumption and remain available after a short marriage.`,
    },
    {
      q: 'How long does general spousal support last in Maine?',
      a: `For marriages of ${half.marriageYearsMin} to ${half.marriageYearsMax} years, Maine presumes general support will last no more than ${pct(half.maxPctOfMarriageLength!)} of the length of the marriage. After more than ${open.marriageYearsMin} years, the statute sets no presumption and the court decides the term, which can be long or open-ended. Either presumption gives way if the court finds it would be inequitable or unjust.`,
    },
    {
      q: 'Is there a formula for spousal support amounts in Maine?',
      a: 'No. Maine courts set the amount of spousal support from the factors listed in 19-A M.R.S. § 951-A(5), such as the length of the marriage, each party’s ability to pay, age, employment history, earning capacity, health, tax consequences, contributions as homemaker and the standard of living. The statute regulates the type, term and modifiability of support rather than its dollar amount.',
    },
  ],
  related: ['alimony', 'how-is-alimony-calculated', 'divorce-cost', 'alimony:massachusetts', 'alimony:utah'],
});
