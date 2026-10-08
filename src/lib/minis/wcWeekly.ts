/** Workers' comp weekly benefit by state. arg = [[name, rate %, max | null, min | null, 'wage'|'fixed'|'none'], …]. */
import { usd, parseArg } from './_kit';
type Row = [string, number, number | null, number | null, string];
export default (arg?: string) => {
  const list = parseArg<Row[]>(arg, [['Example', 66.67, 1500, 300, 'fixed']]);
  return {
    title: 'Weekly temporary total disability benefit',
    cta: 'Add waiting days and the time off in the full calculator',
    inputs: [
      { id: 's', label: 'State', def: 0, options: list.map(([n], i) => ({ value: String(i), label: n })) },
      { id: 'w', label: 'Average weekly wage', def: 1100, unit: '$', max: 100_000 },
    ],
    run: ({ s, w }: Record<string, number>) => {
      const [n, rate, max, min, rule] = list[s] ?? list[0];
      const raw = (w * rate) / 100;
      let weekly = raw, why = `${rate}% of the wage`;
      if (max != null && raw > max) { weekly = max; why = `capped at the ${n} maximum`; }
      else if (min != null && raw < min && rule !== 'none') { weekly = rule === 'wage' && w < min ? w : min; why = rule === 'wage' && w < min ? 'equal to the wage, below the minimum' : `raised to the ${n} minimum`; }
      return {
        head: [`Weekly benefit in ${n}`, usd(weekly)] as [string, string],
        rows: [['Rule applied', why], ['A month (52 weeks ÷ 12)', usd((weekly * 52) / 12)], ['Share of the wage replaced', w > 0 ? `${Math.round((weekly / w) * 100)}%` : '—']] as Array<[string, string]>,
        note: 'Tax-free wage-loss benefit for a total disability; medical care is paid on top.',
      };
    },
  };
};
