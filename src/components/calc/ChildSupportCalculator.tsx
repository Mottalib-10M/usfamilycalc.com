/**
 * Child support calculator, every state's own guideline (src/lib/engine/child-support.ts).
 * On a state page the state is locked and its data (schedule included) comes as a prop. On the pillar
 * the other states' files are loaded on demand when picked (one small chunk each), so the page does not
 * ship 51 schedules. First render = build defaults (RECETTE §17.5); the shared link is applied in useEffect.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { StickyKey, useBelow } from './StickyKey';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { childSupport, toMonthly, type CSData, type CSStep } from '../../lib/engine/child-support';
import { formatMoney, formatNumber } from '../../lib/format';
import { readParams, num, str, updateURL } from '../../lib/url-state';

interface Meta { slug: string; name: string; abbr: string }
interface Props { states: Meta[]; initial: CSData; lockState?: boolean; methodHref?: string; idPrefix?: string; payer?: number; other?: number }
const usd = (n: number) => formatMoney(n, 0);
const MODEL_LABEL: Record<string, string> = { 'income-shares': 'Income shares schedule', 'percent-obligor': 'Percentage of the payer’s income', 'percent-combined': 'Percentage of combined income', 'ca-formula': 'Statewide formula', melson: 'Melson formula', 'bands-combined': 'Income bands formula', other: 'State formula' };
const loaders = import.meta.glob<{ default: CSData }>('../../data/cs/*.json');
async function load(slug: string): Promise<CSData | null> {
  const f = loaders[`../../data/cs/${slug}.json`];
  return f ? (await f()).default : null;
}
const fmtStep = (s: CSStep) => (typeof s.value === 'string' ? s.value : s.kind === 'pct' ? `${formatNumber(s.value, 1)}%` : s.value < 0 ? `−${usd(-s.value)}` : usd(s.value));

export function noteText(d: CSData, code: string): string | null {
  const per = d.period === 'weekly' ? 'a week' : d.period === 'annual' ? 'a year' : 'a month';
  const s = d.schedule; const top = s?.rows[s.rows.length - 1]?.[0];
  switch (code) {
    case 'below-min': return `Combined income is below the first row of the ${d.name} schedule: the first row is used, and the court applies the state's low-income rules.`;
    case 'above-max-pct': return `Above the top row of the ${d.name} schedule (${usd(top ?? 0)} ${per}), the guideline adds a percentage of the excess, as applied here.`;
    case 'above-max-extrapolated': return `Combined income is above the top of the ${d.name} schedule (${usd(top ?? 0)} ${per}); the amount is extended in proportion, and the court may set it differently.`;
    case 'above-max-cap': case 'above-max-discretion': return `Combined income is above the top of the ${d.name} schedule (${usd(top ?? 0)} ${per}): the figure uses the top row, and the court decides whether more is due.`;
    case 'above-cap': return `Income above the ${d.name} guideline cap is left to the court: the figure applies the guideline up to the cap.`;
    case 'shared-applied': return `The ${d.name} shared-parenting rule is applied to the overnights you entered.`;
    case 'reverse': return 'With this parenting time and these incomes, the guideline result runs the other way: the other parent would owe the amount shown below.';
    case 'self-support-reserve': return `The order is reduced so that the paying parent keeps the ${d.name} self-support reserve.`;
    case 'children-capped': return `The ${d.name} table stops at ${d.maxChildren} children; the court sets support for more.`;
    case 'model-not-modeled': return `This calculator does not model the ${d.name} guideline yet.`;
    default: return null;
  }
}

export default function ChildSupportCalculator({ states, initial, lockState = false, methodHref = '/en/method/', idPrefix = 'cs', payer: payer0 = 5000, other: other0 = 3000 }: Props) {
  const [data, setData] = useState<CSData>(initial);
  const [slug, setSlug] = useState(initial.slug);
  const [payer, setPayer] = useState(payer0);
  const [other, setOther] = useState(other0);
  const [children, setChildren] = useState(1);
  const [nights, setNights] = useState(0);
  const [childcare, setChildcare] = useState(0);
  const [health, setHealth] = useState(0);
  const [healthBy, setHealthBy] = useState<'payer' | 'other'>('other');
  const [copied, setCopied] = useState(false);
  const pick = (s: string) => {
    setSlug(s);
    if (s === initial.slug) { setData(initial); return; }
    load(s).then((d) => { if (d) setData(d); });
  };
  useEffect(() => {
    const u = readParams(window.location.search);
    if (!lockState) { const s = str(u, 's', initial.slug); if (s !== initial.slug && states.some((x) => x.slug === s)) pick(s); }
    setPayer(num(u, 'a', payer0)); setOther(num(u, 'b', other0)); setChildren(num(u, 'n', 1)); setNights(num(u, 'o', 0));
    setChildcare(num(u, 'cc', 0)); setHealth(num(u, 'hi', 0)); if (str(u, 'hb', '') === 'p') setHealthBy('payer');
  }, []);
  useEffect(() => { updateURL({ s: lockState ? undefined : slug, a: payer, b: other, n: children, o: nights || undefined, cc: childcare || undefined, hi: health || undefined, hb: healthBy === 'payer' ? 'p' : undefined }); }, [slug, payer, other, children, nights, childcare, health, healthBy]);
  const ready = data.slug === slug;
  const r = useMemo(() => childSupport(data, { payer, other, children, payerOvernights: nights, childcare, health, healthBy }), [data, payer, other, children, nights, childcare, health, healthBy]);
  const p = idPrefix;
  const copy = () => { navigator.clipboard?.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  const maxKids = Math.max(1, Math.min(data.maxChildren, 6));
  const shared = data.shared;
  const nightsHelp = shared?.method === 'cross-credit' && shared.thresholdOvernights != null
    ? `${data.name}: shared-parenting formula from ${shared.thresholdOvernights} overnights a year.`
    : shared?.method === 'percent-reduction' && shared.reductionTable?.length ? `${data.name}: reduction from ${shared.reductionTable[0][0]} overnights a year.` : 'Overnights the children spend with the paying parent.';
  const notes = r.notes.map((c) => noteText(data, c)).filter(Boolean) as string[];
  const card = useRef<HTMLDivElement>(null);
  const below = useBelow(card);
  return (
    <div className="rechner grid gap-6 rounded-xl border border-navy-200 bg-white p-4 sm:p-6 lg:grid-cols-2 lg:items-start">
      <form className="grid gap-x-5 gap-y-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        {lockState
          ? <div className="grid grid-rows-subgrid row-span-3 content-start gap-y-0"><span className="mb-1 block text-sm font-medium text-navy-700">State</span><p className="flex h-12 items-center rounded-lg border border-navy-200 bg-navy-50 px-4 font-semibold text-navy-900">{data.name}</p><span className="mt-1 text-xs text-navy-500">{data.modelName}</span></div>
          : <SelectField id={`${p}-state`} label="State" value={slug} onChange={pick} options={states.map((x) => ({ value: x.slug, label: x.name }))} help={ready ? (MODEL_LABEL[data.model] ?? 'State guideline') : 'Loading the state’s guideline…'} />}
        <SelectField id={`${p}-kids`} label="Children of this relationship" value={String(Math.min(children, maxKids))} onChange={(v) => setChildren(Number(v))} options={Array.from({ length: maxKids }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} />
        <NumberField id={`${p}-payer`} label="Paying parent, monthly income" value={payer} onChange={setPayer} unit="$" max={1_000_000} help={data.incomeLabel} />
        <NumberField id={`${p}-other`} label="Other parent, monthly income" value={other} onChange={setOther} unit="$" max={1_000_000} help="Same definition of income, for the parent the children live with most." />
        <NumberField id={`${p}-nights`} label="Overnights a year with the paying parent" value={nights} onChange={setNights} unit="nights" max={365} help={nightsHelp} />
        <NumberField id={`${p}-care`} label="Work-related child care, monthly" value={childcare} onChange={setChildcare} unit="$" max={50_000} help={data.addOns.childcare ? 'Added to the obligation and shared by income.' : `${data.name}: handled outside the basic formula.`} />
        <NumberField id={`${p}-health`} label="Children’s health insurance, monthly" value={health} onChange={setHealth} unit="$" max={20_000} help={data.addOns.health ? 'The children’s part of the premium only.' : `${data.name}: ordered separately from the basic amount.`} className="sm:col-span-2" />
        <Toggle id={`${p}-hb`} label="Premium paid by" value={healthBy} onChange={(v) => setHealthBy(v as 'payer' | 'other')} options={[{ value: 'other', label: 'Other parent' }, { value: 'payer', label: 'Payer' }]} />
      </form>
      <div ref={card} aria-live="polite" data-resultat className="rounded-xl bg-accent-50 p-4 sm:p-5">
        <p className="text-sm font-medium text-navy-700">{r.reverse > 0 ? 'Other parent pays, per month' : `Guideline child support in ${data.name}, per month`}</p>
        <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{usd(r.reverse > 0 ? r.reverse : r.monthly)}</p>
        <p className="mt-1 text-sm text-navy-700">{usd((r.reverse > 0 ? r.reverse : r.monthly) * 12)} a year{data.period === 'weekly' ? ` · ${usd(((r.reverse > 0 ? r.reverse : r.monthly) * 12) / 52)} a week, the period of the ${data.abbr} table` : ''}</p>
        <table className="mt-4 w-full text-sm"><tbody className="divide-y divide-navy-200">
          {r.steps.map((s) => <tr key={s.label}><td className="py-1.5 pr-3 text-navy-700">{s.label}</td><td className="tabular-nums py-1.5 text-right text-navy-900">{fmtStep(s)}</td></tr>)}
        </tbody></table>
        {notes.map((n) => <p key={n} className="mt-2 text-xs text-navy-700">{n}</p>)}
        <p className="mt-3 text-xs text-navy-600">Estimate under the {data.name} guideline as published, from the incomes you enter. Deviations, imputed income, other children and the judge's findings can change the order. <a className="underline" href={methodHref}>How this is calculated</a>.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button type="button" onClick={copy} className="rounded-lg border border-navy-300 bg-white px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'Link copied' : 'Copy share link'}</button>
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-navy-300 bg-white px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">Print</button>
        </div>
        <StickyKey show={below} card={card} label={r.reverse > 0 ? 'Other parent pays, per month' : `Guideline child support in ${data.name}, per month`} value={usd(r.reverse > 0 ? r.reverse : r.monthly)} />
      </div>
    </div>
  );
}
export { toMonthly };
