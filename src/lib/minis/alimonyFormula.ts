/** Alimony under each state's published formula. arg = ALData[] of the states with an amount formula. */
import { usd, parseArg } from './_kit';
import { alimony, type ALData } from '../engine/alimony';
export default (arg?: string) => {
  const list = parseArg<ALData[]>(arg, []);
  return {
    title: 'Spousal support under the state formulas',
    cta: 'Add the marriage length and child support in the full alimony calculator',
    inputs: [
      { id: 's', label: 'State', def: 0, options: list.map((d, i) => ({ value: String(i), label: d.name })) },
      { id: 'a', label: 'Higher earner, monthly income', def: 8000, unit: '$', max: 2_000_000 },
      { id: 'b', label: 'Lower earner, monthly income', def: 3000, unit: '$', max: 2_000_000 },
    ],
    run: ({ s, a, b }: Record<string, number>) => {
      const d = list[s];
      if (!d) return { head: ['No state', usd(0)] as [string, string], rows: [] as Array<[string, string]> };
      const r = alimony(d, { payer: a, payee: b, years: 12, children: false });
      const range = r.low != null && r.high != null && r.high > r.low;
      return {
        head: [`${d.name}, a month`, range ? `${usd(r.low!)} to ${usd(r.high!)}` : usd(r.monthly)] as [string, string],
        rows: [['Income counted', d.incomeBasis === 'net' ? 'net' : 'gross'], ['A year', range ? `${usd(r.low! * 12)} to ${usd(r.high! * 12)}` : usd(r.monthly * 12)], ['Rule', d.scope.split('.')[0].slice(0, 90)]] as Array<[string, string]>,
        note: 'For a 12-year marriage without children; the judge decides eligibility first.',
      };
    },
  };
};
