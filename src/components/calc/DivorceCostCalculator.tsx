/**
 * Divorce cost calculator: official court fees of the state, then the costs only you can price
 * (attorney rate and hours, mediation, service). Without an attorney the figure is the court's fees
 * alone. First render = build defaults (RECETTE §17.5).
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { divorceCost, type DVState } from '../../lib/engine/divorce';
import { formatMoney } from '../../lib/format';
import { readParams, num, str, updateURL } from '../../lib/url-state';

interface Props { states: DVState[]; state?: string; lockState?: boolean; methodHref?: string; idPrefix?: string }
const usd = (n: number) => formatMoney(n, 0);
const exact = (n: number) => formatMoney(n, Number.isInteger(n) ? 0 : 2);

export default function DivorceCostCalculator({ states, state = 'california', lockState = false, methodHref = '/en/method/', idPrefix = 'dv' }: Props) {
  const [slug, setSlug] = useState(state);
  const [mode, setMode] = useState<'agree' | 'contest'>('agree');
  const [response, setResponse] = useState<'no' | 'yes'>('no');
  const [rate, setRate] = useState(0);
  const [hours, setHours] = useState(0);
  const [mediation, setMediation] = useState(0);
  const [service, setService] = useState(0);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const u = readParams(window.location.search);
    if (!lockState) { const s = str(u, 's', state); if (states.some((x) => x.slug === s)) setSlug(s); }
    if (str(u, 'c', '') === '1') setMode('contest');
    if (str(u, 'r', '') === '1') setResponse('yes');
    setRate(num(u, 'ar', 0)); setHours(num(u, 'h', 0)); setMediation(num(u, 'md', 0)); setService(num(u, 'sv', 0));
  }, []);
  useEffect(() => { updateURL({ s: lockState ? undefined : slug, c: mode === 'contest' ? 1 : undefined, r: response === 'yes' ? 1 : undefined, ar: rate || undefined, h: hours || undefined, md: mediation || undefined, sv: service || undefined }); }, [slug, mode, response, rate, hours, mediation, service]);
  const S = states.find((x) => x.slug === slug) ?? states[0];
  const r = useMemo(() => divorceCost(S, { contested: mode === 'contest', response: response === 'yes', rate, hours, mediation, service }), [S, mode, response, rate, hours, mediation, service]);
  const p = idPrefix;
  const copy = () => { navigator.clipboard?.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  const wait = S.waitingPeriod?.days;
  return (
    <div className="rechner rounded-xl border border-navy-200 bg-white p-4 sm:p-6">
      <form className="grid gap-x-5 gap-y-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        {lockState
          ? <div className="grid grid-rows-subgrid row-span-3 content-start gap-y-0"><span className="mb-1 block text-sm font-medium text-navy-700">State</span><p className="flex h-12 items-center rounded-lg border border-navy-200 bg-navy-50 px-4 font-semibold text-navy-900">{S.name}</p><span className="mt-1 text-xs text-navy-500">{S.feeScope}</span></div>
          : <SelectField id={`${p}-state`} label="State where you file" value={slug} onChange={setSlug} options={states.map((x) => ({ value: x.slug, label: x.name }))} help={S.feeScope} />}
        <Toggle id={`${p}-mode`} label="Do you agree on everything?" value={mode} onChange={(v) => setMode(v as 'agree' | 'contest')} options={[{ value: 'agree', label: 'Yes' }, { value: 'contest', label: 'No' }]} />
        <Toggle id={`${p}-resp`} label="Spouse files a response?" value={response} onChange={(v) => setResponse(v as 'no' | 'yes')} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />
        <NumberField id={`${p}-service`} label="Serving the papers" value={service} onChange={setService} unit="$" max={10_000} help="Sheriff or process server fee; $0 if your spouse signs a waiver." />
        <NumberField id={`${p}-rate`} label="Attorney hourly rate" value={rate} onChange={setRate} unit="$/h" max={5_000} help="The rate quoted to you; leave 0 if you file yourself." />
        <NumberField id={`${p}-hours`} label="Attorney hours, both spouses" value={hours} onChange={setHours} unit="h" max={2_000} help={mode === 'contest' ? 'Discovery, motions and a trial multiply the hours.' : 'Drafting and reviewing a settlement takes the fewest hours.'} />
        <NumberField id={`${p}-med`} label="Mediation" value={mediation} onChange={setMediation} unit="$" max={100_000} help="Total mediator fees, if you use one." />
      </form>
      <div aria-live="polite" className="mt-6 rounded-xl bg-accent-50 p-4 sm:p-5">
        <p className="text-sm font-medium text-navy-700">Estimated cost of a divorce in {S.name}</p>
        <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{usd(r.total)}</p>
        <p className="mt-1 text-sm text-navy-700">of which {exact(r.official)} in court fees{wait ? ` · earliest final decree after ${wait} days` : ''}</p>
        <table className="mt-4 w-full text-sm"><tbody className="divide-y divide-navy-200">
          {r.lines.map((l) => <tr key={l.label}><td className="py-1.5 pr-3 text-navy-700">{l.label}{l.official ? '' : ' (your figure)'}</td><td className="tabular-nums py-1.5 text-right text-navy-900">{exact(l.value)}</td></tr>)}
          {S.filingFee == null && <tr><td className="py-1.5 pr-3 text-navy-700">Court filing fee</td><td className="py-1.5 text-right text-navy-900">set by each county</td></tr>}
        </tbody></table>
        {S.waiver && <p className="mt-2 text-xs text-navy-700">Low income? Court fees can be waived in {S.name}: <a className="underline" href={S.waiver.url} target="_blank" rel="nofollow noopener noreferrer">{S.waiver.name}</a>.</p>}
        <p className="mt-3 text-xs text-navy-600">Court fees are the official {S.name} amounts; attorney, mediation and service costs are the figures you enter. <a className="underline" href={methodHref}>How this is calculated</a>.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button type="button" onClick={copy} className="rounded-lg border border-navy-300 bg-white px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'Link copied' : 'Copy share link'}</button>
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-navy-300 bg-white px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">Print</button>
        </div>
      </div>
    </div>
  );
}
