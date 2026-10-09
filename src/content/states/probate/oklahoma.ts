import { defineStatePage } from '../../../lib/page-types';
import { pb, pbCalc, pbFeesOf, usd, pct, num, day } from '../../../lib/kit';

const d = pb('oklahoma');
const T = pbFeesOf('oklahoma')!.schedules[0].tiers!;
const money = (t: string) => (t.match(/\$[\d,]+/g) ?? []).map((x) => Number(x.replace(/[$,]/g, '')));
const summaryCap = money(d.simplified!.text)[0];
const dispenseCap = money(d.simplified!.text)[1];
const months = d.creditorClaims.months!;
const limit = d.smallEstate.limit!;
const plus = (iso: string, m: number) => { const t = new Date(`${iso}T00:00:00Z`); t.setUTCMonth(t.getUTCMonth() + m); return t.toISOString().slice(0, 10); };
// Worked example: a Tulsa estate of $350,000; letters issued April 1, 2026, notice to creditors filed April 8, 2026.
const v = 350000;
const comm = pbCalc('oklahoma', v).lines[0].value;
const letters = '2026-04-01', filed = '2026-04-08';
const presentment = plus(filed, months);
const lastFiling = plus(letters, months);
const rv = 180000;
const rc = pbCalc('oklahoma', rv).lines[0].value;

export default defineStatePage({
  topic: 'probate',
  slug: 'oklahoma',
  title: `Oklahoma Probate 2026: ${pct(T[2].pct)} Commission, ${num(months)}-Month Claims`,
  description: `Oklahoma probate in 2026: 58 O.S. § 527 pays the personal representative ${usd(comm)} on a ${usd(v)} estate, and claims close ${num(months)} months after the notice is filed.`,
  intro: 'Oklahoma pays its executors a statutory commission that flattens quickly, and gives creditors one of the shortest presentment windows in the country.',
  resume: `Oklahoma probate fees for the personal representative come from 58 O.S. § 527: ${pct(T[0].pct)} of the first ${usd(T[0].upTo!)}, ${pct(T[1].pct)} of the next ${usd(T[1].upTo! - T[0].upTo!)} and ${pct(T[2].pct)} of everything above, unless the will says otherwise. That is ${usd(rc)} on a ${usd(rv)} estate and ${usd(comm)} on ${usd(v)}. Any further allowance for extraordinary services cannot exceed the commission itself, and co-representatives split a single fee. Attorney fees are allowed by the district court as reasonable; we did not read a statutory schedule for them, nor the court filing fees. The calendar is short on paper. Within ${num(months)} months after letters the personal representative files a notice to creditors, published twice and mailed to known creditors, with a presentment date at least ${num(months)} months after filing, so claims can be closed off within roughly ${num(months)} to ${num(months * 2)} months of letters. Smaller estates have faster routes: an affidavit for property up to ${usd(limit)} ten days after death, dispensing with regular proceedings up to ${usd(dispenseCap)}, and summary administration up to ${usd(summaryCap)}.`,
  body: (h) => `<h2>A schedule that turns flat almost at once</h2>
<p>The two upper break points in § 527 sit at ${h.usd(T[0].upTo!)} and ${h.usd(T[1].upTo!)}, amounts too small to matter for most estates today. In practice, almost every Oklahoma estate is paid at ${h.pct(T[2].pct)} on nearly its whole value. For the Tulsa estate of ${h.usd(v)}, the first two slices yield ${h.usd((T[0].upTo! * T[0].pct) / 100 + ((T[1].upTo! - T[0].upTo!) * T[1].pct) / 100)} and the remaining ${h.usd(v - T[1].upTo!)} yields ${h.usd(((v - T[1].upTo!) * T[2].pct) / 100)}, for ${h.usd(comm)}. If the court finds the representative performed extraordinary services, such as running a farm or defending litigation, it can add up to the same amount again, so the ceiling for that estate is ${h.usd(comm * 2)}. Two co-executors share the one commission rather than doubling it.</p>
<h2>The presentment date</h2>
<p>Oklahoma does not count claims from death or from first publication. Section 331 has the personal representative file a notice to creditors, within ${h.num(months)} months after letters, naming a presentment date at least ${h.num(months)} months after the filing. In the example, letters issue on ${h.day(letters)} and the notice is filed on ${h.day(filed)}: the earliest valid presentment date is ${h.day(presentment)}. A representative who waits until the last day, ${h.day(lastFiling)}, pushes the window out to ${h.day(plus(lastFiling, months))}. Contract claims not presented by that date are barred, with a narrow exception for out-of-state creditors who were not mailed notice.</p>
<h2>Three thresholds below full probate</h2>
<p>Oklahoma layers its shortcuts. The affidavit of 58 O.S. § 393 transfers property worth ${h.usd(limit)} or less, net of liens, ten days after death, when no administration is pending and debts and taxes are paid or barred. Between that figure and ${h.usd(dispenseCap)}, § 241 lets the court dispense with regular proceedings. Summary administration under § 245 covers estates of ${h.usd(summaryCap)} or less, decedents dead more than five years, and non-residents. None of these thresholds is indexed.</p>
<h2>What our sources do not cover</h2>
<p>This page relies on the complete Title 58 file published by the Oklahoma Legislature, because the court system's statute site could not be reached. The probate filing fee charged by county court clerks and any statute on attorney fees were not read, so the calculator adds neither for Oklahoma. South across the Red River, ${h.a('probate:texas', 'Texas')} pays executors on cash flows only.</p>`,
  faqs: [
    { q: 'How much does an Oklahoma executor get paid?', a: `Unless the will provides otherwise, 58 O.S. § 527 allows ${pct(T[0].pct)} of the first ${usd(T[0].upTo!)}, ${pct(T[1].pct)} of the next ${usd(T[1].upTo! - T[0].upTo!)} and ${pct(T[2].pct)} above ${usd(T[1].upTo!)} of the estate accounted for. A ${usd(v)} estate gives ${usd(comm)}. Extraordinary services can add up to the same amount again, and co-representatives share one commission.` },
    { q: 'How long do creditors have in an Oklahoma probate?', a: `Until the presentment date in the notice to creditors, which the personal representative files within ${num(months)} months after letters and which must fall at least ${num(months)} months after filing, under 58 O.S. § 331. The notice is published twice and mailed to known creditors. Contract claims not presented by that date are barred forever, apart from a narrow exception for some out-of-state creditors.` },
    { q: 'Can I avoid probate in Oklahoma with a small estate affidavit?', a: `Yes, if the Oklahoma property passing by will or intestacy is worth ${usd(limit)} or less after liens, at least ten days have passed since death, no personal representative is pending or appointed, and debts and taxes are paid or barred (58 O.S. § 393). Larger estates up to ${usd(summaryCap)} can use summary administration in court.` },
  ],
  related: ['probate', 'how-long-does-probate-take', 'probate:texas', 'child-support:oklahoma', 'workers-comp:oklahoma'],
});
