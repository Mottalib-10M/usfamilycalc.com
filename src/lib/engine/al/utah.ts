/** Utah Code § 81-4-502(7): alimony may not last longer than the marriage (absent extenuating circumstances); no amount formula. */
import type { ALData, ALInput, ALResult } from '../alimony';
import { n0, months } from './_util';

export default function utah(d: ALData, inp: ALInput): ALResult {
  const rows = (d.durationTable ?? []) as Array<{ maxPctOfMarriageLength: number }>;
  const pct = rows[0]?.maxPctOfMarriageLength;
  const durationMonths = pct != null ? (months(inp.years) * pct) / 100 : null;
  return {
    monthly: 0, durationMonths,
    steps: [
      { label: 'Length of marriage', value: `${n0(inp.years)} years`, kind: 'text' },
      { label: 'Longest alimony term', value: durationMonths == null ? 'set by the court' : `${durationMonths} months`, kind: 'text' },
    ],
    notes: [
      'Utah has no formula for the amount of alimony; the court weighs the factors of § 81-4-502 (needs, earning capacity, ability to pay, length of marriage…).',
      'Months of temporary alimony paid during the divorce count toward the limit, and the court may exceed it only for extenuating circumstances or good cause found before alimony ends.',
      'Alimony ends on the payee’s remarriage or death, and the court must end it if the payee cohabits.',
    ],
  };
}
