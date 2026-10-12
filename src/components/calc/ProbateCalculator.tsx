/**
 * Probate cost and timeline: statutory personal representative and attorney fees where a state sets
 * them, the court filing fee, the small-estate shortcut, and the minimum time the creditor-claim
 * period imposes. First render = build defaults (RECETTE §17.5).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { StickyKey, useBelow } from './StickyKey';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { probateFees, type PBState, type PBFees } from '../../lib/engine/probate';
import { formatMoney, formatNumber } from '../../lib/format';
import { readParams, num, str, updateURL } from '../../lib/url-state';

type Row = PBState & { fees: PBFees | null };
interface Props { states: Row[]; state?: string; lockState?: boolean; methodHref?: string; idPrefix?: string; estate?: number }
const usd = (n: number) => formatMoney(n, 0);
const exact = (n: number) => formatMoney(n, Number.isInteger(n) ? 0 : 2);

export default function ProbateCalculator({ states, state = 'california', lockState = false, methodHref = '/en/method/', idPrefix = 'pb', estate: estate0 = 500000 }: Props) {
  const [slug, setSlug] = useState(state);
  const [estate, setEstate] = useState(estate0);
  const [extra, setExtra] = useState(6);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const u = readParams(window.location.search);
    if (!lockState) { const s = str(u, 's', state); if (states.some((x) => x.slug === s)) setSlug(s); }
    setEstate(num(u, 'e', estate0)); setExtra(num(u, 'm', 6));
  }, []);
  useEffect(() => { updateURL({ s: lockState ? undefined : slug, e: estate, m: extra }); }, [slug, estate, extra]);
  const S = states.find((x) => x.slug === slug) ?? states[0];
  const r = useMemo(() => probateFees(S, S.fees, estate), [S, estate]);
  const months = (r.claimMonths ?? 0) + extra;
  const p = idPrefix;
  const copy = () => { navigator.clipboard?.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  const statutory = r.lines.length > 0;
  const card = useRef<HTMLDivElement>(null);
  const below = useBelow(card);
  return (
    <div className="rechner grid gap-6 rounded-xl border border-navy-200 bg-white p-4 sm:p-6 lg:grid-cols-2 lg:items-start">
      <form className="grid gap-x-5 gap-y-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        {lockState
          ? <div className="grid grid-rows-subgrid row-span-3 content-start gap-y-0"><span className="mb-1 block text-sm font-medium text-navy-700">State</span><p className="flex h-12 items-center rounded-lg border border-navy-200 bg-navy-50 px-4 font-semibold text-navy-900">{S.name}</p><span className="mt-1 text-xs text-navy-500">{statutory ? 'Fees set by statute' : 'Fees: “reasonable”, set by the court'}</span></div>
          : <SelectField id={`${p}-state`} label="State of the probate" value={slug} onChange={setSlug} options={states.map((x) => ({ value: x.slug, label: x.name }))} help="Where the person lived at death (real estate elsewhere may need its own case)." />}
        <NumberField id={`${p}-estate`} label="Value of the probate estate" value={estate} onChange={setEstate} unit="$" max={500_000_000} help="Assets in the deceased's name alone, without a beneficiary or joint owner." />
        <NumberField id={`${p}-extra`} label="Months to sell, file taxes and distribute" value={extra} onChange={setExtra} unit="months" max={120} help="Your estimate after the creditor period: 3 to 12 months is common." />
      </form>
      <div ref={card} aria-live="polite" data-resultat className="rounded-xl bg-accent-50 p-4 sm:p-5">
        <p className="text-sm font-medium text-navy-700">{statutory ? `Statutory fees and court fee in ${S.name}` : `Court filing fee in ${S.name}`}</p>
        <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{usd(r.total)}</p>
        <p className="mt-1 text-sm text-navy-700">{estate > 0 ? `${formatNumber((r.total / estate) * 100, 1)}% of the estate` : ''}{r.claimMonths != null ? ` · at least ${months} months before final distribution` : ''}</p>
        <table className="mt-4 w-full text-sm"><tbody className="divide-y divide-navy-200">
          {r.lines.map((l) => <tr key={l.label}><td className="py-1.5 pr-3 text-navy-700">{l.label}</td><td className="tabular-nums py-1.5 text-right text-navy-900">{usd(l.value)}</td></tr>)}
          <tr><td className="py-1.5 pr-3 text-navy-700">Court filing fee</td><td className="tabular-nums py-1.5 text-right text-navy-900">{r.filingFee != null ? exact(r.filingFee) : 'set by the county'}</td></tr>
          <tr><td className="py-1.5 pr-3 text-navy-700">Creditor claim period</td><td className="tabular-nums py-1.5 text-right text-navy-900">{r.claimMonths != null ? `${r.claimMonths} months` : 'see state rules'}</td></tr>
          <tr><td className="py-1.5 pr-3 text-navy-700">Small-estate limit</td><td className="tabular-nums py-1.5 text-right text-navy-900">{S.smallEstate.limit != null ? exact(S.smallEstate.limit) : 'no fixed limit'}</td></tr>
        </tbody></table>
        {r.belowSmallEstate && <p className="mt-2 text-xs font-medium text-navy-800">This value is within the {S.name} small-estate limit: the heirs may be able to collect assets by affidavit or a summary procedure, without full probate.</p>}
        {(S.fees?.schedules ?? []).filter((x) => x.otherBase).map((x) => <p key={x.who} className="mt-2 text-xs text-navy-700">{x.who}: charged on other assets than the probate estate, not included above.</p>)}
        {!statutory && <p className="mt-2 text-xs text-navy-700">{S.name} does not set a percentage schedule: the personal representative and the attorney are paid a reasonable fee approved by the court, often hourly.</p>}
        <p className="mt-3 text-xs text-navy-600">Estimate under the {S.name} probate statutes. Publication, bond, appraisal, extraordinary services and the estate's own taxes are extra. <a className="underline" href={methodHref}>How this is calculated</a>.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button type="button" onClick={copy} className="rounded-lg border border-navy-300 bg-white px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'Link copied' : 'Copy share link'}</button>
          <button type="button" onClick={() => window.print()} className="rounded-lg border border-navy-300 bg-white px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">Print</button>
        </div>
        <StickyKey show={below} card={card} label={statutory ? `Statutory fees and court fee in ${S.name}` : `Court filing fee in ${S.name}`} value={usd(r.total)} />
      </div>
    </div>
  );
}
