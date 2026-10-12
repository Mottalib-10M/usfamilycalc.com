/**
 * Alimony / spousal support / maintenance calculator: the formula, cap and duration rule each state
 * publishes (src/lib/engine/alimony.ts). States with no formula are not offered here: their pages say
 * why. First render = build defaults (RECETTE §17.5).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { StickyKey, useBelow } from './StickyKey';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { alimony, type ALData } from '../../lib/engine/alimony';
import { formatMoney, formatNumber } from '../../lib/format';
import { readParams, num, str, updateURL } from '../../lib/url-state';

interface Props { states: ALData[]; state?: string; lockState?: boolean; methodHref?: string; idPrefix?: string }
const usd = (n: number) => formatMoney(n, 0);
const dur = (m: number) => (m >= 24 && m % 12 === 0 ? `${m / 12} years` : `${formatNumber(m, 0)} months`);

export default function AlimonyCalculator({ states, state = 'california', lockState = false, methodHref = '/en/method/', idPrefix = 'al' }: Props) {
  const [slug, setSlug] = useState(state);
  const [payer, setPayer] = useState(8000);
  const [payee, setPayee] = useState(3000);
  const [years, setYears] = useState(12);
  const [kids, setKids] = useState<'no' | 'yes'>('no');
  const [cs, setCs] = useState(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const u = readParams(window.location.search);
    if (!lockState) { const s = str(u, 's', state); if (states.some((x) => x.slug === s)) setSlug(s); }
    setPayer(num(u, 'a', 8000)); setPayee(num(u, 'b', 3000)); setYears(num(u, 'y', 12)); if (str(u, 'k', '') === '1') setKids('yes'); setCs(num(u, 'cs', 0));
  }, []);
  useEffect(() => { updateURL({ s: lockState ? undefined : slug, a: payer, b: payee, y: years, k: kids === 'yes' ? 1 : undefined, cs: cs || undefined }); }, [slug, payer, payee, years, kids, cs]);
  const S = states.find((x) => x.slug === slug) ?? states[0];
  const r = useMemo(() => alimony(S, { payer, payee, years, children: kids === 'yes', childSupport: cs }), [S, payer, payee, years, kids, cs]);
  const p = idPrefix;
  const copy = () => { navigator.clipboard?.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  const basis = S.incomeBasis === 'net' ? 'net' : 'gross';
  const range = r.low != null && r.high != null && r.high > r.low;
  const durText = r.durationMonths == null ? null : r.durationMinMonths != null && r.durationMinMonths !== r.durationMonths ? `${dur(r.durationMinMonths)} to ${dur(r.durationMonths)}` : `up to ${dur(r.durationMonths)}`;
  const card = useRef<HTMLDivElement>(null);
  const below = useBelow(card);
  return (
    <div className="rechner grid gap-6 rounded-xl border border-navy-200 bg-white p-4 sm:p-6 lg:grid-cols-2 lg:items-start">
      <form className="grid gap-x-5 gap-y-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        {lockState
          ? <div className="grid grid-rows-subgrid row-span-3 content-start gap-y-0"><span className="mb-1 block text-sm font-medium text-navy-700">State</span><p className="flex h-12 items-center rounded-lg border border-navy-200 bg-navy-50 px-4 font-semibold text-navy-900">{S.name}</p><span className="mt-1 text-xs text-navy-500">{S.scope}</span></div>
          : <SelectField id={`${p}-state`} label="State" value={slug} onChange={setSlug} options={states.map((x) => ({ value: x.slug, label: x.name }))} help={S.scope} />}
        <NumberField id={`${p}-years`} label="Length of the marriage" value={years} onChange={setYears} unit="years" max={80} decimals={1} help="From the wedding to the filing (or the date the state uses)." />
        <NumberField id={`${p}-payer`} label={`Higher earner, monthly ${basis} income`} value={payer} onChange={setPayer} unit="$" max={2_000_000} />
        <NumberField id={`${p}-payee`} label={`Lower earner, monthly ${basis} income`} value={payee} onChange={setPayee} unit="$" max={2_000_000} />
        <Toggle id={`${p}-kids`} label="Child support also paid?" value={kids} onChange={(v) => setKids(v as 'no' | 'yes')} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />
        {kids === 'yes' && <NumberField id={`${p}-cs`} label="Child support, monthly" value={cs} onChange={setCs} unit="$" max={100_000} help="Some formulas run after child support is deducted." />}
      </form>
      <div ref={card} aria-live="polite" data-resultat className="rounded-xl bg-accent-50 p-4 sm:p-5">
        <p className="text-sm font-medium text-navy-700">{range ? `Guideline range in ${S.name}, per month` : `Estimated spousal support in ${S.name}, per month`}</p>
        <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{range ? `${usd(r.low!)} to ${usd(r.high!)}` : usd(r.monthly)}</p>
        <p className="mt-1 text-sm text-navy-700">{durText ? `Duration: ${durText}` : 'Duration: set by the judge'}</p>
        <table className="mt-4 w-full text-sm"><tbody className="divide-y divide-navy-200">
          {r.steps.map((s) => <tr key={s.label}><td className="py-1.5 pr-3 text-navy-700">{s.label}</td><td className="tabular-nums py-1.5 text-right text-navy-900">{typeof s.value === 'string' ? s.value : s.kind === 'pct' ? `${formatNumber(s.value, 1)}%` : usd(s.value)}</td></tr>)}
        </tbody></table>
        {r.notes.map((n) => <p key={n} className="mt-2 text-xs text-navy-700">{n}</p>)}
        <p className="mt-3 text-xs text-navy-600">Estimate under the {S.name} formula as published; eligibility, the judge's findings and an agreement between spouses decide the real order. <a className="underline" href={methodHref}>How this is calculated</a>.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button type="button" onClick={copy} className="rounded-lg border border-navy-300 bg-white px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'Link copied' : 'Copy share link'}</button>
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-navy-300 bg-white px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">Print</button>
        </div>
        <StickyKey show={below} card={card} label={range ? `Guideline range in ${S.name}, per month` : `Estimated spousal support in ${S.name}, per month`} value={range ? `${usd(r.low!)} to ${usd(r.high!)}` : usd(r.monthly)} />
      </div>
    </div>
  );
}
