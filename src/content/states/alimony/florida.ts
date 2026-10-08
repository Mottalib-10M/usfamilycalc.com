import { defineStatePage } from '../../../lib/page-types';
import { al, alCalc, usd, pct, num } from '../../../lib/kit';

const d = al('florida');
const P = d.params;
const T = d.durationTable as unknown as Array<{ category: string; marriageYearsMin: number; marriageYearsMax: number | null; maxPctOfMarriageLength: number }>;
const [S, M, L] = T;
const ex = alCalc('florida', { payer: 7500, payee: 3500, years: 14 });
const longEx = alCalc('florida', { payer: 7500, payee: 3500, years: 24 });
const shortEx = alCalc('florida', { payer: 7500, payee: 3500, years: Math.max(0, P.durationalMinMarriageYears - 1) });
const yrs = (m: number | null | undefined) => num((m ?? 0) / 12, 1);

export default defineStatePage({
  topic: 'alimony',
  slug: 'florida',
  title: `Florida Alimony Calculator 2026: ${pct(P.durationalCapPctOfNetIncomeDifference)} Durational Cap`,
  description: `Florida alimony 2026 after the 2023 reform: durational alimony is capped at ${pct(P.durationalCapPctOfNetIncomeDifference)} of the net income gap and limited to ${pct(S.maxPctOfMarriageLength)} to ${pct(L.maxPctOfMarriageLength)} of the marriage length in years.`,
  intro: 'Since the 2023 reform, Florida has no permanent alimony and caps durational alimony both in amount and in years.',
  resume: `Florida durational alimony is the lesser of the receiving spouse's reasonable need and ${pct(P.durationalCapPctOfNetIncomeDifference)} of the difference between the two net incomes (Fla. Stat. § 61.08(8)(c)). On ${usd(7500)} and ${usd(3500)} of monthly net income, that ceiling is ${usd(ex.monthly)} a month. Its length depends on the marriage, measured from the wedding to the filing of the petition: at most ${pct(S.maxPctOfMarriageLength)} of a short marriage (under ${M.marriageYearsMin} years), ${pct(M.maxPctOfMarriageLength)} of a moderate one (${M.marriageYearsMin} to ${M.marriageYearsMax} years) and ${pct(L.maxPctOfMarriageLength)} of a long one (${L.marriageYearsMin} years or more), so a 14-year marriage allows ${yrs(ex.durationMonths)} years. No durational alimony follows a marriage under ${P.durationalMinMarriageYears} years. Bridge-the-gap alimony is limited to ${P.bridgeTheGapMaxYears} years and rehabilitative alimony to ${P.rehabilitativeMaxYears} years with a written plan. Permanent alimony was removed from the list of available forms for cases pending or filed from July 1, 2023, and the law applies to all initial petitions filed or pending on that date.`,
  body: (h) => `<h2>What the 2023 law took away</h2>
<p>Before July 1, 2023, a long Florida marriage could end with permanent periodic alimony. Chapter 2023-315 rewrote § 61.08 and left four forms only: temporary, bridge-the-gap, rehabilitative and durational. The change applies to every initial petition for dissolution pending or filed on or after that date, so older judgments keep their permanent awards while new cases cannot get one. The law also turned the marriage-length categories into rebuttable presumptions and attached a hard percentage to each.</p>
${h.table(['Marriage', 'Length', 'Durational alimony, at most'], T.map((r) => [r.category, r.marriageYearsMax == null ? `${h.num(r.marriageYearsMin)} years or more` : `${h.num(r.marriageYearsMin === S.marriageYearsMin ? P.durationalMinMarriageYears : r.marriageYearsMin)} to under ${h.num(r.marriageYearsMax)} years`, `${h.pct(r.maxPctOfMarriageLength)} of the marriage`]), 'Fla. Stat. § 61.08(5) and (8)(b); length runs from the wedding to the filing date.', ['l', 'l', 'r'])}

<h2>Need first, then the ${h.pct(P.durationalCapPctOfNetIncomeDifference)} ceiling</h2>
<p>The court starts with two findings: does the requesting spouse actually need support, and can the other pay? Only then does it look at the factors of § 61.08(3) and pick a form. For durational alimony the amount is the reasonable need, unless ${h.pct(P.durationalCapPctOfNetIncomeDifference)} of the net income gap is lower. Net income follows the child support definition in § 61.30, without counting support already ordered between the spouses. Take a spouse netting ${h.usd(7500)} a month and another netting ${h.usd(3500)}, married 14 years: the gap is ${h.usd(7500 - 3500)}, the ceiling ${h.usd(ex.monthly)}, the longest term ${h.num((ex.durationMonths ?? 0), 1)} months. Change the marriage to 24 years and the ceiling stays the same while the term grows to ${h.num((longEx.durationMonths ?? 0), 1)} months. With ${h.num(P.durationalMinMarriageYears - 1)} years of marriage the term falls to ${h.num(shortEx.durationMonths ?? 0)}: durational alimony is simply unavailable.</p>
<p>A second guardrail, § 61.08(9), says the award may not leave the payer with significantly less net income than the recipient unless the judge writes down exceptional circumstances. A judge can extend durational alimony beyond the percentage only on clear and convincing evidence about the recipient's age, resources, disability or care of a disabled common child.</p>

<h2>Short forms</h2>
<p>Bridge-the-gap alimony covers identifiable short-term needs during the move to single life, for at most ${h.num(P.bridgeTheGapMaxYears)} years, and cannot be modified in amount or length. Rehabilitative alimony lasts at most ${h.num(P.rehabilitativeMaxYears)} years and requires a specific plan of education, training or work experience; it can end early when the plan is completed or ignored. Adultery and its economic impact may be weighed in the amount.</p>`,
  faqs: [
    {
      q: 'Is permanent alimony still available in Florida?',
      a: 'No, not for new cases. The 2023 amendment to Fla. Stat. § 61.08 lists only temporary, bridge-the-gap, rehabilitative and durational alimony, and it applies to all initial petitions pending or filed on or after July 1, 2023. Permanent awards made in earlier judgments are not erased by the new list, though they remain subject to Florida’s separate rules on modification and retirement.',
    },
    {
      q: 'How is the length of a Florida marriage measured for alimony?',
      a: `From the date of the wedding to the date the petition for dissolution is filed, not to the final judgment (§ 61.08(5)). That date decides the category: under ${M.marriageYearsMin} years is short-term, ${M.marriageYearsMin} to ${M.marriageYearsMax} moderate-term, ${L.marriageYearsMin} or more long-term, each a rebuttable presumption. Filing a few weeks earlier or later can move a couple across a boundary and change the maximum term by a full percentage band.`,
    },
    {
      q: 'Can Florida alimony leave the payer with less income than the recipient?',
      a: `Not without written findings of exceptional circumstances, under § 61.08(9). The rule works alongside the ${pct(P.durationalCapPctOfNetIncomeDifference)} ceiling on durational alimony: even when the recipient's need is high, the judge must check that the payer does not end up with significantly less net income than the person receiving support once the payments are made.`,
    },
  ],
  related: ['alimony', 'how-is-alimony-calculated', 'divorce-cost', 'alimony:texas', 'alimony:new-york'],
});
