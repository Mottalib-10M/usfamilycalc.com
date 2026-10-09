import { defineStatePage } from '../../../lib/page-types';
import { pb, pbCalc, usd, num, day } from '../../../lib/kit';

const d = pb('illinois');
const months = d.creditorClaims.months!;
const limit = d.smallEstate.limit!;
const eff = d.smallEstate.effective!;
const plus = (iso: string, m: number) => { const t = new Date(`${iso}T00:00:00Z`); t.setUTCMonth(t.getUTCMonth() + m); return t.toISOString().slice(0, 10); };
// Worked example: first publication on March 5, 2026; a known creditor mailed on July 20, 2026 (3 months for mailed notice under 18-3).
const published = '2026-03-05', mailed = '2026-07-20', mailMonths = 3;
const byPub = plus(published, months), byMail = plus(mailed, mailMonths);
const claimDate = byPub > byMail ? byPub : byMail;
const under = pbCalc('illinois', limit - 8000);
const over = pbCalc('illinois', limit + 15000);

export default defineStatePage({
  topic: 'probate',
  slug: 'illinois',
  title: `Illinois Probate 2026: ${num(months)}-Month Claims, ${usd(limit)} Affidavit`,
  description: `Illinois probate in 2026: a claim date at least ${num(months)} months after first publication, a ${usd(limit)} small estate affidavit, and fees the court finds reasonable.`,
  intro: 'Illinois writes no percentage for executors or lawyers, so its probate cost turns on hours billed, while its calendar turns on a claim date the representative chooses.',
  resume: `Illinois probate has no statutory fee schedule: the representative and the attorney are each entitled to reasonable compensation under 755 ILCS 5/27-1 and 27-2, usually billed by the hour and open to review by the court if an heir objects, so the cost depends on the work rather than on the size of the estate. The court filing fee is set by each circuit clerk, and the Cook County probate schedule could not be found online when we checked. The timeline is easier to pin down. The representative publishes a notice once a week for three weeks naming a claim date, which must fall at least ${num(months)} months after the first publication and at least three months after notice is mailed to known creditors; the estate cannot be closed before that date. Independent administration, the usual form, lets the representative close by verified report once every claim is settled, so even a simple Illinois estate stays open past the claim date, and usually some months beyond it. Personal property worth ${usd(limit)} or less can skip court with the small estate affidavit.`,
  body: (h) => `<h2>The claim date is a date, not a duration</h2>
<p>Illinois does not simply give creditors a fixed number of months. Section 18-3 of the Probate Act makes the representative publish a notice that names a specific claim date, and the statute only sets the earliest date that notice may name. Suppose the first publication in a Peoria newspaper runs on ${h.day(published)}. The claim date cannot be earlier than ${h.day(byPub)}. If the representative learns of a medical creditor later and mails that creditor notice on ${h.day(mailed)}, the creditor gets three months from mailing, until ${h.day(byMail)}, so the practical bar for that claim is ${h.day(claimDate)}. Every claim, noticed or not, is barred two years after death under section 18-12, which is the outer limit for an estate never opened.</p>
<h2>Reasonable fees, measured how</h2>
<p>Because 755 ILCS 5/27-1 and 27-2 only say reasonable, the yardsticks are practical: hours spent, the hourly rate customary in the county, the complexity, the size of the estate and the result. In independent administration nobody files a fee petition unless an heir objects; the fees appear in the final report. In supervised administration, the judge reviews them. A family member who serves without pay simply waives compensation. We do not publish typical Illinois percentages, because none are set by law and the surveys behind them are not official.</p>
<h2>The ${h.usd(limit)} affidavit, read closely</h2>
<p>The small estate affidavit of section 25-1 counts the gross value of the whole personal estate, including vehicles and accounts that pass by will or intestacy, with no subtraction for debts. Land and buildings are outside it: the affidavit cannot transfer Illinois real estate. A personal estate of ${h.usd(limit - 8000)} qualifies (${under.belowSmallEstate ? 'below the limit' : 'above the limit'}); one of ${h.usd(limit + 15000)} does not (${over.belowSmallEstate ? 'below the limit' : 'above the limit'}) and needs a court case. The ${h.usd(limit)} ceiling dates from Public Act 98-836, effective ${h.day(eff)}, and it is not indexed. We read the statute through an archive copy of the official site from mid-2025, so a later amendment could not be ruled out; check the current text of 755 ILCS 5/25-1 before relying on it.</p>
<h2>What slows an Illinois estate</h2>
<p>Real estate is the usual reason: without an affidavit route, a house in the decedent's name means letters of office, then a sale or a deed to heirs. Heirship must be proved by affidavit or testimony, and missing heirs require notice by publication. In Cook County, the volume of cases can add weeks to each hearing. Over in ${h.a('probate:ohio', 'Ohio')}, the creditors' clock starts at death rather than at publication.</p>`,
  faqs: [
    { q: 'How much does an Illinois executor charge?', a: `There is no percentage in Illinois law. Under 755 ILCS 5/27-1 the representative receives reasonable compensation, and section 27-2 gives the same standard for the attorney, so both usually bill by the hour or agree a flat amount. The court reviews fees in supervised estates or when an heir objects. A relative who serves as executor often takes nothing, since a fee would be taxable income.` },
    { q: 'What is the small estate limit in Illinois for 2026?', a: `${usd(limit)} of gross personal estate under 755 ILCS 5/25-1, the figure in force since ${day(eff)}. It counts bank accounts, vehicles and other personal property passing by will or intestacy, before debts. The affidavit cannot transfer real estate. We could not check amendments after mid-2025, so verify the current statute before signing an affidavit.` },
    { q: 'When can an Illinois estate be closed?', a: `Not before the claim date in the published notice, which is at least ${num(months)} months after first publication, and only once every claim filed is allowed, disallowed or barred. An independent representative then files a verified final report under 755 ILCS 5/28-11 and asks for discharge. A house sale, an heir dispute or a tax return usually keeps the estate open longer.` },
  ],
  related: ['probate', 'how-long-does-probate-take', 'probate:ohio', 'child-support:illinois', 'alimony:illinois', 'workers-comp:illinois'],
});
