import { defineStatePage } from '../../../lib/page-types';
import { al, alCalc, usd, pct } from '../../../lib/kit';

const d = al('texas');
const P = d.params;
const T = d.durationTable as unknown as Array<{ marriageYearsMin: number; marriageYearsMax: number | null; maxYears: number }>;
const capAt = (P.capMonthly * 100) / P.capPctOfObligorAvgMonthlyGross; // income where the two limits meet
const mid = alCalc('texas', { payer: 9000, payee: 2500, years: 22 });
const high = alCalc('texas', { payer: 40000, payee: 0, years: 31 });
const y = (m: number | null | undefined) => (m == null ? 0 : m / 12);

export default defineStatePage({
  topic: 'alimony',
  slug: 'texas',
  title: `Texas Alimony Calculator 2026: ${usd(P.capMonthly)} Maintenance Cap`,
  description: `Texas spousal maintenance 2026: a court may order at most ${usd(P.capMonthly)} or ${pct(P.capPctOfObligorAvgMonthlyGross)} of average gross pay a month, for ${y(T[1].maxYears * 12)} to ${T[3].maxYears} years depending on the marriage length.`,
  intro: 'Texas does not compute alimony; it limits what a judge may order and for how long, once a spouse qualifies.',
  resume: `Court-ordered spousal maintenance in Texas can never be more than the lesser of ${usd(P.capMonthly)} a month or ${pct(P.capPctOfObligorAvgMonthlyGross)} of the paying spouse's average monthly gross income (Family Code § 8.055). The two limits meet at ${usd(capAt)} of monthly gross income: below it the percentage binds, above it the flat dollar cap does. There is no formula producing a likely amount, only this ceiling, and it applies only after the requesting spouse qualifies under § 8.051, for instance after a marriage of at least ${T[1].marriageYearsMin} years combined with an inability to earn enough for minimum reasonable needs. Duration is limited too: ${T[1].maxYears} years for a marriage of ${T[1].marriageYearsMin} to ${T[1].marriageYearsMax} years, ${T[2].maxYears} years for ${T[2].marriageYearsMin} to ${T[2].marriageYearsMax}, ${T[3].maxYears} years beyond. A payer with ${usd(9000)} of monthly gross income could be ordered to pay at most ${usd(mid.monthly)} a month. Agreements the spouses sign themselves (contractual alimony) are not bound by these limits.`,
  body: (h) => `<h2>A ceiling, not an estimate</h2>
<p>Most of what people call alimony calculators apply a percentage and print a number. Texas law works the other way round. Chapter 8 of the Family Code first asks whether the spouse asking for maintenance is eligible at all, then tells the judge what the order may not exceed. The figure on this page is that statutory maximum. A court can order less, and often orders nothing: maintenance is meant to help a spouse who will lack enough property, including separate property, to meet minimum reasonable needs after the divorce.</p>
<p>The cap compares two numbers every time. ${h.pct(P.capPctOfObligorAvgMonthlyGross)} of the obligor's average monthly gross income, and ${h.usd(P.capMonthly)}. Gross income here has its own definition in § 8.055(a-1): wages, bonuses, self-employment and net rental income count, while Social Security, SSI, VA service-connected disability and workers' compensation benefits are left out. Someone earning ${h.usd(9000)} a month faces a ceiling of ${h.usd(mid.monthly)}; someone earning ${h.usd(40000)} faces ${h.usd(high.monthly)}, the same as anyone earning ${h.usd(capAt)} or more.</p>

<h2>Who can ask</h2>
<p>Section 8.051 opens three doors. A spouse whose partner was convicted of, or received deferred adjudication for, family violence against them or their child within two years before filing or during the case. A spouse who cannot earn enough because of an incapacitating disability, or who has custody of a child of the marriage needing substantial care because of a disability. And a spouse married ${h.num(T[1].marriageYearsMin)} years or longer who lacks the ability to earn enough. For that last route, § 8.053 presumes maintenance is not warranted unless the spouse made diligent efforts to earn income or develop skills while separated and during the case.</p>

<h2>How many years</h2>
<p>The limits run from the date of the order. A marriage of ${h.num(T[2].marriageYearsMin)} years or more but under ${h.num(T[2].marriageYearsMax)} allows up to ${h.num(T[2].maxYears)} years, so the payer in our first example, married 22 years, faces at most ${h.num(y(mid.durationMonths))} years. Thirty years or more of marriage opens ${h.num(y(high.durationMonths))} years. Short marriages under ${h.num(T[0].marriageYearsMax ?? 0)} years only qualify through the family-violence door, with ${h.num(T[0].maxYears)} years as the ceiling. Within these limits the judge must still pick the shortest reasonable period that lets the spouse become self-supporting, unless a disability, the care of an infant or young child, or another compelling impediment stands in the way. Disability-based maintenance can continue as long as the disability does, with periodic reviews.</p>
<p>Maintenance ends at the death of either party or the recipient's remarriage, and the court must end it after a hearing if the recipient cohabits in a romantic relationship on a continuing basis (§ 8.056). Federal tax follows the post-2018 rule: the payer cannot deduct it and the recipient does not report it.</p>`,
  faqs: [
    {
      q: 'What is the most alimony a Texas court can order?',
      a: `The lesser of ${usd(P.capMonthly)} a month or ${pct(P.capPctOfObligorAvgMonthlyGross)} of the paying spouse's average monthly gross income, under Texas Family Code § 8.055. Anyone with gross income of ${usd(capAt)} or more a month therefore faces the same ${usd(P.capMonthly)} maximum. The cap governs court-ordered maintenance only; spouses can agree to larger contractual alimony in a settlement.`,
    },
    {
      q: 'How long can spousal maintenance last in Texas?',
      a: `Under § 8.054, no more than ${T[1].maxYears} years after a marriage of ${T[1].marriageYearsMin} to ${T[1].marriageYearsMax} years, ${T[2].maxYears} years after ${T[2].marriageYearsMin} to ${T[2].marriageYearsMax} years, and ${T[3].maxYears} years after ${T[3].marriageYearsMin} years or more. The judge must also keep it to the shortest reasonable period. Maintenance based on a disability of the spouse or of a child can last as long as the disability continues.`,
    },
    {
      q: 'Does adultery affect alimony in Texas?',
      a: 'It can. Marital misconduct, including adultery and cruel treatment, is one of the eleven factors a Texas judge weighs under Family Code § 8.052 when setting the nature, amount and duration of maintenance, along with family violence history and wasteful spending of community property. It does not create or bar eligibility on its own, which depends on § 8.051.',
    },
  ],
  related: ['alimony', 'how-is-alimony-calculated', 'child-support:texas', 'alimony:new-mexico', 'divorce-cost'],
});
