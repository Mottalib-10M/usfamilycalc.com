/** Maine 19-A M.R.S. § 951-A(2)(A)(1): duration presumptions for general support; no amount formula. */
import type { ALData, ALInput, ALResult } from '../alimony';
import { n0, months, rowFor } from './_util';

export default function maine(d: ALData, inp: ALInput): ALResult {
  const rows = (d.durationTable ?? []) as Array<{ marriageYearsMin: number; marriageYearsMax: number | null; maxPctOfMarriageLength?: number; rule: string }>;
  const y = n0(inp.years);
  // "less than 10 years" / "at least 10 but not more than 20": 20 belongs to the middle row.
  const row = rows.find((r) => y >= r.marriageYearsMin && (r.marriageYearsMax == null || (r.maxPctOfMarriageLength != null ? y <= r.marriageYearsMax : y < r.marriageYearsMax)));
  const durationMonths = row?.maxPctOfMarriageLength != null ? (months(y) * row.maxPctOfMarriageLength) / 100 : row?.marriageYearsMin === 0 ? 0 : null;
  return {
    monthly: 0, durationMonths,
    steps: [
      { label: 'Length of marriage at filing', value: `${y} years`, kind: 'text' },
      { label: 'Presumption for general support', value: row?.rule ?? 'none', kind: 'text' },
    ],
    notes: [
      'Maine has no formula for the amount of spousal support; the court weighs the factors of § 951-A(5).',
      'These are rebuttable presumptions: a finding that they would be inequitable or unjust is enough to set them aside.',
      'Transitional, reimbursement, nominal and interim support are not subject to these presumptions.',
    ],
  };
}
