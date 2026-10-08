/** Arizona Spousal Maintenance Guidelines (2025), Section IV: duration ranges by months of marriage; the amount comes from the court's calculator. */
import type { ALData, ALInput, ALResult } from '../alimony';
import { n0 } from './_util';

export default function arizona(d: ALData, inp: ALInput): ALResult {
  const P = d.params as { calculatorUrl: string; ruleOf65: { minAge: number; minMarriageMonths: number; ageplusYears: number } };
  const rows = (d.durationTable ?? []) as Array<{ marriageMonthsMin: number; marriageMonthsMax: number | null; minMonths: number; maxMonths: number; orPctOfMarriageIfGreater?: number }>;
  const m = Math.round(n0(inp.years) * 12);
  const row = rows.find((r) => m >= r.marriageMonthsMin && (r.marriageMonthsMax == null || m < r.marriageMonthsMax)) ?? rows[rows.length - 1];
  const max = row.orPctOfMarriageIfGreater != null ? Math.max(row.maxMonths, (m * row.orPctOfMarriageIfGreater) / 100) : row.maxMonths;
  const notes = [
    `Arizona sets the amount with the Supreme Court's Spousal Maintenance Calculator (${P.calculatorUrl}), which uses household spending data rather than a percentage, so no amount is computed here.`,
    'Courts may deviate from the amount range but not from the duration ranges.',
  ];
  if (m >= P.ruleOf65.minMarriageMonths) notes.push(`Rule of 65: if the requesting spouse is at least ${P.ruleOf65.minAge} and age plus years of marriage reach ${P.ruleOf65.ageplusYears}, the duration is left to the court.`);
  return {
    monthly: 0, durationMonths: max, durationMinMonths: row.minMonths,
    steps: [
      { label: 'Months of marriage (to service of the petition)', value: m, kind: 'text' },
      { label: 'Duration range', value: `${row.minMonths} to ${Math.round(max * 10) / 10} months`, kind: 'text' },
    ],
    notes,
  };
}
