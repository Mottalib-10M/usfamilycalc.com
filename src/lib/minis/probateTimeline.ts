/** Earliest probate timeline by state. arg = [[name, creditor months | null], …]. */
import { parseArg } from './_kit';
type Row = [string, number | null];
export default (arg?: string) => {
  const list = parseArg<Row[]>(arg, [['Example', 4]]);
  return {
    title: 'How long probate takes at the least',
    cta: 'Add the statutory fees in the full probate calculator',
    inputs: [
      { id: 's', label: 'State', def: 0, options: list.map(([n], i) => ({ value: String(i), label: n })) },
      { id: 'o', label: 'Months to open the case (petition to letters)', def: 2, unit: 'months', max: 60 },
      { id: 'w', label: 'Months to sell, file returns, distribute', def: 6, unit: 'months', max: 120 },
    ],
    run: ({ s, o, w }: Record<string, number>) => {
      const [n, c] = list[s] ?? list[0];
      const claims = c ?? 0;
      const total = o + claims + w;
      return {
        head: [`Probate in ${n}, from filing to closing`, `${total} months`] as [string, string],
        rows: [['Opening the estate (your estimate)', `${o} months`], ['Creditor claim period (state law)', c != null ? `${c} months` : 'no fixed period'], ['Administration after the claims (your estimate)', `${w} months`]] as Array<[string, string]>,
        note: 'The claim period runs in parallel with some work, but an estate rarely closes before it ends; a will contest or a tax audit adds months.',
      };
    },
  };
};
