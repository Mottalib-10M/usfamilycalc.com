import { defineStatePage } from '../../../lib/page-types';
import { pb, pbCalc, pbFeesOf, usd, usdx, pct, num, day } from '../../../lib/kit';

const d = pb('california');
const T = pbFeesOf('california')!.schedules[0].tiers!;
const amounts = (t: string) => t.match(/\$[\d,]+/g) ?? [];
const residence = amounts(d.simplified!.text)[0];
const fee = (v: number) => pbCalc('california', v).lines[0].value;
const months = d.creditorClaims.months!;
const filing = d.filingFee!.amount!;
const limit = d.smallEstate.limit!;
const eff = d.smallEstate.effective!;
// Worked example: a house appraised at $900,000 with a $700,000 loan, plus $100,000 in a brokerage account.
const house = 900000, loan = 700000, brokerage = 100000;
const gross = house + brokerage;
const ex = pbCalc('california', gross);
const each = ex.lines[0].value;
const resumeValue = 750000;

export default defineStatePage({
  topic: 'probate',
  slug: 'california',
  title: `California Probate Fees 2026: ${pct(T[0].pct)} to ${pct(T[T.length - 1].pct)} Statutory Schedule`,
  description: `California probate fees in 2026: a ${usd(resumeValue)} estate pays ${usd(fee(resumeValue))} to the executor and ${usd(fee(resumeValue))} to the attorney under Probate Code §§ 10800 and 10810, by statute.`,
  intro: 'California is one of the few states where the executor and the lawyer are paid by a percentage written into the Probate Code, and the base ignores the mortgage.',
  resume: `In California, probate fees come from a statutory table: on a ${usd(resumeValue)} estate the personal representative is entitled to ${usd(fee(resumeValue))} and the attorney to another ${usd(fee(resumeValue))}, so ${usd(2 * fee(resumeValue))} for ordinary services before any extraordinary work, plus ${usd(filing)} to file the first petition. Both commissions are computed on the gross value the representative accounts for, which means a loan against the house does not reduce them. The calendar has a legal floor too. Creditors may file until ${num(months)} months after letters are first issued, or 60 days after a notice mailed to them if that ends later, and the estate is not distributed before that window closes. Add the weeks it takes a busy county court to set the first hearing and the hearing on the final petition, and a simple California probate runs well beyond that ${num(months)}-month floor. An estate whose California property stays at or below ${usdx(limit)}, for deaths on or after ${day(eff)}, can avoid court entirely with the affidavit of Probate Code § 13100.`,
  body: (h) => `<h2>Gross value, not equity</h2>
<p>The percentage in Probate Code § 10800 bites on the inventory and appraisal value, gains on sales and receipts, without subtracting what the decedent owed. Picture a Pasadena house appraised at ${h.usd(house)} that still carries a ${h.usd(loan)} loan, plus a ${h.usd(brokerage)} brokerage account. The heirs inherit roughly ${h.usd(house - loan + brokerage)} of equity, yet the schedule runs on ${h.usd(gross)}: ${h.usd(each)} for the executor and ${h.usd(each)} for the lawyer, ${h.usd(2 * each)} together, before the ${h.usd(filing)} court fee. That gap between equity and the fee base is the reason so many Californians fund a living trust: trust assets never enter the estate accounted for.</p>
<p>The fee is a ceiling for ordinary work, and the parties can agree on less. Selling real property, defending a will contest, preparing tax returns or running a business count as extraordinary services, which the court may award on top after a petition. A family member serving as executor can also waive the commission, which keeps the money as an inheritance instead of taxable income.</p>
<h2>What form DE-300 changes, and when</h2>
<p>California indexes its small-estate thresholds, which almost no other state does. The Judicial Council republishes them every three years on form DE-300 under Probate Code § 890, and the figure that applies is the one in force on the date of death, not the date you file. For deaths on or after ${h.day(eff)}, the affidavit works up to ${h.usdx(limit)} of California property, counted gross; joint tenancy, trust assets and property passing to a surviving spouse are left out of that total. Heirs must wait 40 days after the death before presenting it to a bank. A primary residence worth up to ${residence} can now pass by a simpler court petition under § 13151 instead of a full administration, a route available for deaths on or after the same date.</p>
<h2>Where California estates lose months</h2>
<p>The ${h.num(months)}-month claim period is rarely what drags. Getting letters can take weeks in Los Angeles or Orange County, where the first probate hearing is often set well after the petition is filed, and publication of the notice must precede it. The inventory and appraisal goes through a probate referee appointed by the court, and a sale of real estate under independent administration still requires a notice of proposed action to the heirs. Each objection or continuance pushes the final hearing back. The deadline the Probate Code sets for petitioning for final distribution could not be confirmed on the official site when we checked, so this page does not state one.</p>
<p>Across the state line, ${h.a('probate:oregon', 'Oregon')} also sets the executor's fee by statute, with a much lower slope above ${h.usd(h.pbFeesOf('oregon')!.schedules[0].tiers![2].upTo!)}.</p>`,
  faqs: [
    { q: 'Can a California executor and attorney both take the full statutory fee?', a: `Yes. Probate Code § 10800 pays the personal representative and § 10810 pays the attorney on the same schedule, so each receives the full amount: ${usd(fee(resumeValue))} apiece on a ${usd(resumeValue)} estate, ${usd(2 * fee(resumeValue))} combined. Extraordinary services are billed separately with court approval. Either can agree to take less, and a relative serving as executor often waives the commission altogether.` },
    { q: 'What is the California small estate limit for a death in 2026?', a: `${usdx(limit)}, the figure for deaths on or after ${day(eff)} printed on Judicial Council form DE-300. It counts the gross value of California real and personal property, leaving out joint tenancy, trust and spousal property. The heirs wait 40 days after death, then present the affidavit of Probate Code § 13100 to the bank or holder. The next adjustment is scheduled for April 2028.` },
    { q: 'Does a mortgage lower California probate fees?', a: `No. The statutory fee is calculated on the value the representative accounts for, without reference to encumbrances. A ${usd(house)} house with a ${usd(loan)} loan counts at ${usd(house)}. In our example estate of ${usd(gross)}, with only ${usd(house - loan + brokerage)} of equity, the executor and the attorney are each entitled to ${usd(each)}, the same as for a debt-free estate of that size.` },
    { q: 'How long do creditors have to file a claim in a California probate?', a: `Until the later of ${num(months)} months after letters are first issued to a general personal representative or 60 days after a notice of administration was mailed or delivered to that creditor, under Probate Code § 9100. Mailing a notice late can therefore keep a claim window open after the main period. A separate one-year limit from the date of death still caps most actions against the estate.` },
  ],
  related: ['probate', 'how-long-does-probate-take', 'probate:oregon', 'probate:arizona', 'divorce-cost:california', 'child-support:california'],
});
