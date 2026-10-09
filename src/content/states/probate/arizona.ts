import { defineStatePage } from '../../../lib/page-types';
import { pb, pbCalc, usd, usdx, num, day } from '../../../lib/kit';

const d = pb('arizona');
const money = (t: string) => (t.match(/\$[\d,]+/g) ?? []).map((x) => Number(x.replace(/[$,]/g, '')));
const months = d.creditorClaims.months!;
const limit = d.smallEstate.limit!;
const realLimit = money(d.smallEstate.text)[1];
const filing = d.filingFee!.amount!;
const plus = (iso: string, m: number) => { const t = new Date(`${iso}T00:00:00Z`); t.setUTCMonth(t.getUTCMonth() + m); return t.toISOString().slice(0, 10); };
// Worked example: informal appointment on February 10, 2026, first publication on February 20, 2026.
const appointed = '2026-02-10', published = '2026-02-20';
const claimsEnd = plus(published, months);
const closeFloor = plus(appointed, months);
const earliest = claimsEnd > closeFloor ? claimsEnd : closeFloor;
// Small estate example: $185,000 of personal property and a Mesa house assessed at $260,000.
const personal = 185000, house = 260000;
const pOk = pbCalc('arizona', personal).belowSmallEstate;
const hOk = house <= realLimit;

export default defineStatePage({
  topic: 'probate',
  slug: 'arizona',
  title: `Arizona Probate 2026: ${usd(filing)} Filing Fee, ${num(months)}-Month Claims`,
  description: `Arizona probate in 2026: ${usd(filing)} to file, creditors barred ${num(months)} months after first publication, and affidavits up to ${usd(limit)} of personal property after 30 days.`,
  intro: 'Arizona follows the Uniform Probate Code: most estates open before a registrar without a hearing and can close by sworn statement once the creditor window shuts.',
  resume: `Arizona probate fees have no statutory percentage: the personal representative and the attorney are entitled to reasonable compensation under A.R.S. §§ 14-3719 and 14-3720, which the court reviews only if someone petitions, and the base clerk fee for an informal probate application is ${usdx(filing)}, before surcharges the county may add. Arizona is one of the faster states. Under the Uniform Probate Code model it adopted, a will can be admitted and a personal representative appointed informally by the probate registrar, usually without a court hearing. Creditors then have ${num(months)} months from the first publication of the notice, which runs once a week for three weeks, and the representative may close the estate by a sworn closing statement no earlier than ${num(months)} months after appointment. A clean Arizona estate can therefore close within months rather than years. Many never reach court at all: personal property worth up to ${usd(limit)} passes by affidavit 30 days after death, and Arizona real estate up to ${usd(realLimit)} by an affidavit of succession after six months.`,
  body: (h) => `<h2>Two affidavits, two waiting periods</h2>
<p>A.R.S. § 14-3971 offers two separate shortcuts, and an estate can use both. Personal property, net of liens, up to ${h.usd(limit)} is collected with an affidavit presented to the bank or holder 30 days after death, provided no personal representative has been appointed. Real property in Arizona, up to ${h.usd(realLimit)} of assessed full cash value net of liens, passes by an affidavit of succession filed with the court no sooner than six months after death. Consider a Mesa household with ${h.usd(personal)} in accounts and a car and a house assessed at ${h.usd(house)}. The personal property is ${pOk ? 'within' : 'above'} the first limit and the house is ${hOk ? 'within' : 'above'} the second, so ${pOk && hOk ? 'the family can avoid opening a probate case' : 'a probate case is needed'}. Neither limit is indexed, and the azleg.gov text shows no date for when these amounts took effect.</p>
<h2>How the calendar fits together</h2>
<p>Two clocks run in parallel. Suppose the registrar appoints the personal representative on ${h.day(appointed)} and the notice first appears in a Maricopa County newspaper on ${h.day(published)}. Claims are barred after ${h.day(claimsEnd)}, ${h.num(months)} months from first publication; known creditors who received written notice get 60 days from mailing if that ends later. The closing statement under A.R.S. § 14-3933 cannot be filed before ${h.day(closeFloor)}, ${h.num(months)} months after appointment. The later date wins, so ${h.day(earliest)} is the earliest this estate could close. Whatever happens, pre-death claims are barred two years after death.</p>
<h2>Reasonable, and prudent</h2>
<p>Arizona adds a rule of its own: A.R.S. § 14-1104 tells fiduciaries and their lawyers to manage the costs of administration prudently, in proportion to what is at stake. An heir who thinks the bill is out of line can petition under § 14-3721 for review, and the court can order a refund of excessive compensation. Hourly billing is the norm; no Arizona statute sets a percentage.</p>
<h2>About the ${h.usd(filing)}</h2>
<p>The figure is the statutory class C fee of A.R.S. § 12-284 for an informal probate application or a formal petition. Clerks add statutory surcharges and local fees, and the Maricopa County fee pages could not be read when this page was researched, so the total paid at the counter there was not verified. A supervised or contested case adds further filings. West of the Colorado River, ${h.a('probate:california', 'California')} sets fees by percentage instead.</p>`,
  faqs: [
    { q: 'How long does probate take in Arizona?', a: `Rarely less than ${num(months)} months, because a personal representative cannot file the sworn closing statement until ${num(months)} months after appointment and after the creditor period, ${num(months)} months from first publication, has run. In our example with appointment on ${day(appointed)}, the earliest close is ${day(earliest)}. A house sale, a will contest or supervised administration adds time.` },
    { q: 'What is the small estate limit in Arizona?', a: `${usd(limit)} of personal property, net of liens and encumbrances, collected by affidavit 30 days after death under A.R.S. § 14-3971(B). Real property is separate: up to ${usd(realLimit)} of Arizona real estate can pass by an affidavit of succession filed with the court six months after death. The two routes can be combined for the same estate.` },
    { q: 'Are Arizona executor fees a percentage of the estate?', a: `No. A.R.S. § 14-3719 gives the personal representative reasonable compensation and § 14-3720 does the same for attorneys, without any percentage. Fiduciaries must keep costs proportionate under § 14-1104, and an interested person can ask the court to review fees under § 14-3721. Many representatives who are family members serve without pay.` },
  ],
  related: ['probate', 'how-long-does-probate-take', 'probate:california', 'divorce-cost:arizona', 'child-support:arizona', 'alimony:arizona'],
});
