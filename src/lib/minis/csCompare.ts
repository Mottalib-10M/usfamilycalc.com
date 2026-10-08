/** Child support for the same family in different states. arg = { a, b, rows: [[name, [1 child, 2, 3]], …] } (monthly, precomputed by the engine). */
import { usd, parseArg } from './_kit';
type Arg = { a: number; b: number; rows: Array<[string, number[]]> };
export default (arg?: string) => {
  const x = parseArg<Arg>(arg, { a: 5000, b: 3000, rows: [['Example', [800, 1200, 1500]]] });
  return {
    title: `Same family, different state: payer ${usd(x.a)}, other parent ${usd(x.b)} a month`,
    cta: 'Enter your own incomes and overnights in the full calculator',
    inputs: [
      { id: 's', label: 'State', def: 0, options: x.rows.map(([n], i) => ({ value: String(i), label: n })) },
      { id: 'n', label: 'Children', def: 1, options: [1, 2, 3].map((k) => ({ value: String(k), label: String(k) })) },
    ],
    run: ({ s, n }: Record<string, number>) => {
      const [name, v] = x.rows[s] ?? x.rows[0];
      const m = v[Math.max(0, Math.min(2, n - 1))] ?? 0;
      const all = x.rows.map((r) => r[1][Math.max(0, Math.min(2, n - 1))] ?? 0).sort((p, q) => p - q);
      const rank = all.findIndex((y) => y >= m) + 1;
      return {
        head: [`Guideline support in ${name}`, `${usd(m)} a month`] as [string, string],
        rows: [['A year', usd(m * 12)], ['Lowest of the states shown', usd(all[0])], ['Highest of the states shown', usd(all[all.length - 1])], ['Rank, lowest first', `${rank} of ${all.length}`]] as Array<[string, string]>,
        note: 'Each state counts income its own way (gross, net or adjusted): the same dollar figure is not always the same income.',
      };
    },
  };
};
