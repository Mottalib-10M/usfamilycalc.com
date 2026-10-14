/**
 * Workers' comp calculator: weekly temporary total disability (TTD) benefit and the total for the
 * time off, under each state's rate, 2026 maximum and minimum, waiting period and duration cap.
 * The 51 state files are small and all ship as a prop. First render = build defaults (RECETTE §17.5).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { StickyKey, useBelow } from './StickyKey';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { workersComp, type WCData } from '../../lib/engine/workers-comp';
import { formatMoney, formatNumber } from '../../lib/format';
import { readParams, num, str, updateURL } from '../../lib/url-state';

interface Props { states: WCData[]; state?: string; lockState?: boolean; methodHref?: string; idPrefix?: string; wage?: number }
const usd = (n: number, d = 0) => formatMoney(n, d);
const exact = (n: number) => usd(n, Number.isInteger(n) ? 0 : 2);

export default function WorkersCompCalculator({ states, state = 'california', lockState = false, methodHref = '/en/method/', idPrefix = 'wc', wage: wage0 = 1100 }: Props) {
  const [slug, setSlug] = useState(state);
  const [wage, setWage] = useState(wage0);
  const [days, setDays] = useState(30);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const u = readParams(window.location.search);
    if (!lockState) { const s = str(u, 's', state); if (states.some((x) => x.slug === s)) setSlug(s); }
    setWage(num(u, 'w', wage0)); setDays(num(u, 'd', 30));
  }, []);
  useEffect(() => { updateURL({ s: lockState ? undefined : slug, w: wage, d: days }); }, [slug, wage, days]);
  const S = states.find((x) => x.slug === slug) ?? states[0];
  const r = useMemo(() => workersComp(S, { wage, daysOff: days }), [S, wage, days]);
  const p = idPrefix;
  const copy = () => { navigator.clipboard?.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  const wageLabel = S.ttd.basis === 'gross' ? 'Average weekly wage (gross)' : S.ttd.basis === 'monthly' ? 'Average weekly wage (gross)' : 'Weekly spendable earnings';
  const bound = r.bound === 'max' ? `Capped at the ${S.name} maximum of ${exact(S.ttd.max ?? 0)} a week.` : r.bound === 'min' ? `Raised to the ${S.name} minimum of ${exact(S.ttd.min ?? 0)} a week.` : r.bound === 'wage' ? 'Your wage is below the minimum, so the benefit equals your wage.' : null;
  const card = useRef<HTMLDivElement>(null);
  const below = useBelow(card);
  return (
    <div className="rechner grid gap-6 rounded-xl border border-navy-200 bg-white p-4 sm:p-6 lg:grid-cols-2 lg:items-start">
      <form className="grid content-start gap-x-5 gap-y-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        {lockState
          ? <div className="grid grid-rows-subgrid row-span-3 content-start gap-y-0"><span className="mb-1 block text-sm font-medium text-navy-700">State</span><p className="flex h-12 items-center rounded-lg border border-navy-200 bg-navy-50 px-4 font-semibold text-navy-900">{S.name}</p><span className="mt-1 text-xs text-navy-500">{S.ttd.periodLabel}</span></div>
          : <SelectField id={`${p}-state`} label="State where you were hurt" value={slug} onChange={setSlug} options={states.map((x) => ({ value: x.slug, label: x.name }))} help={S.ttd.periodLabel} />}
        <NumberField id={`${p}-wage`} label={wageLabel} value={wage} onChange={setWage} unit="$" max={100_000} help={S.ttd.basisLabel} />
        <NumberField id={`${p}-days`} label="Days off work" value={days} onChange={setDays} unit="days" max={3650} help={S.waiting.days != null ? `${S.name}: first ${S.waiting.days} days unpaid${S.waiting.retroactiveAfterDays != null ? `, paid back if off more than ${S.waiting.retroactiveAfterDays} days` : ''}.` : 'Calendar days you cannot work.'} />
      </form>
      <div ref={card} aria-live="polite" data-resultat className="rounded-xl bg-accent-50 p-4 sm:p-5">
        <p className="text-sm font-medium text-navy-700">Weekly temporary total disability benefit in {S.name}</p>
        <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{usd(r.weekly)}</p>
        <p className="mt-1 text-sm text-navy-700">{usd(r.monthly)} a month · {formatNumber(S.ttd.rate, S.ttd.rate % 1 ? 2 : 0)}% of the wage, tax-free</p>
        <table className="mt-4 w-full text-sm"><tbody className="divide-y divide-navy-200">
          <tr><td className="py-1.5 pr-3 text-navy-700">{formatNumber(S.ttd.rate, S.ttd.rate % 1 ? 2 : 0)}% of {usd(wage)}</td><td className="tabular-nums py-1.5 text-right text-navy-900">{usd(r.raw)}</td></tr>
          <tr><td className="py-1.5 pr-3 text-navy-700">Weekly maximum / minimum</td><td className="tabular-nums py-1.5 text-right text-navy-900">{S.ttd.max != null ? exact(S.ttd.max) : 'none'} / {S.ttd.min != null ? exact(S.ttd.min) : 'none'}</td></tr>
          <tr><td className="py-1.5 pr-3 text-navy-700">Days paid / unpaid waiting days</td><td className="tabular-nums py-1.5 text-right text-navy-900">{r.paidDays} / {r.unpaidDays}</td></tr>
          <tr><td className="py-1.5 pr-3 font-semibold text-navy-900">Total for the time off</td><td className="tabular-nums py-1.5 text-right font-semibold text-navy-900">{usd(r.total)}</td></tr>
        </tbody></table>
        {bound && <p className="mt-2 text-xs text-navy-700">{bound}</p>}
        {r.weeksCapped && <p className="mt-2 text-xs text-navy-700">{S.name} limits temporary total disability to {S.ttdDuration.maxWeeks} weeks; the total stops there.</p>}
        <p className="mt-3 text-xs text-navy-600">Estimate of wage-loss benefits for a total disability, from the {S.agency.name} rates. Medical care is paid separately; partial disability, permanent impairment ratings and settlements follow other rules. <a className="underline" href={methodHref}>How this is calculated</a>.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button type="button" onClick={copy} className="rounded-lg border border-navy-300 bg-white px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'Link copied' : 'Copy share link'}</button>
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-navy-300 bg-white px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">Print</button>
        </div>
        <StickyKey show={below} card={card} label={`Weekly temporary total disability benefit in ${S.name}`} value={usd(r.weekly)} />
      </div>
    </div>
  );
}
