/** California: Santa Clara County temporary support formula (Local Family Rule 3(C)); Fam. Code § 4320(l) and § 4336 duration guides. */
import type { ALData, ALInput, ALResult } from '../alimony';
import { n0, pos, months } from './_util';

export default function california(d: ALData, inp: ALInput): ALResult {
  const P = d.params as { payerNetPct: number; payeeNetPct: number; longMarriageYears: number; reasonablePeriodPctOfMarriage: number };
  const cs = n0(inp.childSupport);
  const avail = pos(n0(inp.payer) - cs);
  const a = (avail * P.payerNetPct) / 100, b = (n0(inp.payee) * P.payeeNetPct) / 100;
  const monthly = pos(a - b);
  const y = n0(inp.years);
  const long = y >= P.longMarriageYears;
  const durationMonths = long ? null : (months(y) * P.reasonablePeriodPctOfMarriage) / 100;
  const notes = [
    'California has no statewide formula: this is the Santa Clara County temporary support guideline, used while the case is pending, not for the final judgment.',
    'The court software adjusts the result for taxes; the figure here is before that adjustment.',
    long ? `A marriage of ${P.longMarriageYears} years or more is presumed long: the court keeps jurisdiction over support indefinitely (§ 4336).` : `For permanent support, a reasonable period to become self-supporting is generally ${P.reasonablePeriodPctOfMarriage}% of the length of the marriage (§ 4320(l)).`,
  ];
  if (cs > 0) notes.push('Child support is taken out of the payer’s net income first, as the local rule requires.');
  return {
    monthly, durationMonths,
    steps: [
      { label: 'Payer’s net income after child support', value: avail, kind: 'money' },
      { label: `${P.payerNetPct}% of that income`, value: a, kind: 'money' },
      { label: `${P.payeeNetPct}% of the payee’s net income`, value: b, kind: 'money' },
      { label: 'Temporary spousal support (difference)', value: monthly, kind: 'money' },
    ],
    notes,
  };
}
