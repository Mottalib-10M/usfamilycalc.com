/** Court fees of a divorce by state, with or without attorneys. arg = [[name, filing | null, response | null], …]. */
import { usd, parseArg } from './_kit';
type Row = [string, number | null, number | null];
export default (arg?: string) => {
  const list = parseArg<Row[]>(arg, [['Example', 300, 0]]);
  return {
    title: 'Uncontested divorce: court fees plus what you choose to pay',
    cta: 'Price a contested case in the full divorce cost calculator',
    inputs: [
      { id: 's', label: 'State', def: 0, options: list.map(([n], i) => ({ value: String(i), label: n })) },
      { id: 'r', label: 'Attorney rate quoted to you', def: 0, unit: '$/h', max: 5_000 },
      { id: 'h', label: 'Attorney hours (drafting and review)', def: 0, unit: 'h', max: 500 },
    ],
    run: ({ s, r, h }: Record<string, number>) => {
      const [n, f, resp] = list[s] ?? list[0];
      const fees = (f ?? 0) + (resp ?? 0);
      return {
        head: [`Uncontested divorce in ${n}`, usd(fees + r * h)] as [string, string],
        rows: [['Filing fee', f != null ? usd(f, Number.isInteger(f) ? 0 : 2) : 'set by the county'], ['Response fee, if your spouse files one', resp != null ? usd(resp, Number.isInteger(resp) ? 0 : 2) : '—'], ['Attorney time', usd(r * h)]] as Array<[string, string]>,
        note: 'Filing fees are the official amounts; leave the attorney fields at 0 if you file yourselves.',
      };
    },
  };
};
