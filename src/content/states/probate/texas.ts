import { defineStatePage } from '../../../lib/page-types';
import { pb, pbCalc, pbFeesOf, usd, usdx, pct, day } from '../../../lib/kit';

const d = pb('texas');
const rate = pbFeesOf('texas')!.schedules[0].tiers![0].pct;
const limit = d.smallEstate.limit!;
const eff = d.smallEstate.effective!;
const harris = d.filingFee!.amount!;
// Worked example: a Houston house sold for $250,000 during administration, $80,000 in checking at death, $40,000 of debts and expenses paid in cash.
const sale = 250000, checking = 80000, paid = 40000;
const gross = sale + checking;
const commBase = sale + paid;
const comm = Math.min((commBase * rate) / 100, (gross * rate) / 100);
const ceiling = pbCalc('texas', gross).lines[0].value;
const rv = 600000;
const rvMax = pbCalc('texas', rv).lines[0].value;

export default defineStatePage({
  topic: 'probate',
  slug: 'texas',
  title: `Texas Probate Fees 2026: ${pct(rate)} Executor Commission Cap`,
  description: `Texas probate in 2026: executors earn ${pct(rate)} on cash received or paid out, never above ${usd(rvMax)} on a ${usd(rv)} estate, and Harris County charges ${usd(harris)} to file.`,
  intro: 'Texas sets no general deadline for creditors and caps the executor at a single percentage, which is why its probate can be among the quickest or the longest.',
  resume: `Texas probate fees are capped rather than scheduled: an executor or administrator earns ${pct(rate)} of the cash actually received or paid out during administration, never more than ${pct(rate)} of the estate's gross market value, so at most ${usd(rvMax)} on a ${usd(rv)} estate, and the real figure is often much lower because cash in the bank at death, life insurance and payments to heirs earn nothing. Lawyers are paid reasonable fees approved by the court, and opening a new estate costs ${usd(harris)} at the Harris County Clerk. Texas also stands apart on timing. There is no statewide bar date for creditors: a claim can be presented at any time before the estate is closed, unless the representative sends a creditor a permissive notice, which bars that claim if it is not presented before the 121st day after the notice is received. Many Texas wills create an independent administration or go through as a muniment of title, and an uncomplicated estate can then be settled quickly. Intestate estates of up to ${usd(limit)} can use the small estate affidavit.`,
  body: (h) => `<h2>A commission that ignores the bank balance</h2>
<p>Section 352.002 of the Estates Code pays ${h.pct(rate)} on money that passes through the representative's hands, then removes three kinds of money from the count: cash on hand or in financial accounts at death, life insurance proceeds, and anything paid to heirs or legatees. Suppose a Houston estate holds a house the administrator sells for ${h.usd(sale)} and ${h.usd(checking)} in a checking account, and the administrator pays ${h.usd(paid)} of debts and expenses in cash. The commission runs on the sale proceeds and the payments, ${h.usd(commBase)}, giving ${h.usd(comm)}. The checking account adds nothing. The cap of ${h.pct(rate)} of the gross estate would have allowed ${h.usd(ceiling)}, which is the figure the calculator shows as a maximum. When the commission is unreasonably low, or the representative runs a business, the court may award reasonable compensation instead under section 352.003.</p>
<h2>Muniment of title and independent administration</h2>
<p>Much of Texas probate never becomes a full administration. If the estate owes no debt other than a mortgage or similar lien on real estate, a will can be admitted as a muniment of title: the court order itself transfers the property, no executor is appointed, and no commission is earned. Where an executor is needed, most Texas wills, and many heirs by agreement, choose independent administration, which lets the executor act without court approval after filing the inventory. The court then sees the estate again only if someone asks it to. These two features, more than any fee table, explain why Texas probate is often fast.</p>
<h2>The small estate affidavit has a catch</h2>
<p>The affidavit of Estates Code chapter 205 works only when there is no will. Since ${h.day(eff)} it reaches ${h.usd(limit)} of estate assets, leaving out the homestead and exempt property, so a family can keep a modest house and still qualify. A judge must approve the affidavit, and 30 days must pass after death. An estate with a will, even a tiny one, goes another way, usually the muniment of title.</p>
<h2>What keeps a Texas estate open</h2>
<p>With no general claims deadline, the representative decides how long to wait. Sending permissive notices to unsecured creditors starts their 121-day clocks; skipping them leaves claims possible until closing. Heirship proceedings, needed when there is no will and real estate is involved, add a hearing and an attorney ad litem. The ${h.usd(harris)} filing figure is the Harris County Clerk's published amount and showed no effective date when we read it on ${h.day(d.verified)}; other counties set their own. Across the Red River, ${h.a('probate:oklahoma', 'Oklahoma')} works with a fixed presentment date instead.</p>`,
  faqs: [
    { q: 'How much does a Texas executor get paid?', a: `Up to ${pct(rate)} of the cash the executor receives or pays out, with the total capped at ${pct(rate)} of the estate's gross fair market value. Cash in accounts at death, life insurance and distributions to heirs do not count. In our Houston example, ${usd(commBase)} of qualifying cash gives ${usd(comm)}. Many family executors waive the commission, and a will can set a different amount.` },
    { q: 'Is there a deadline for creditors to file claims in Texas probate?', a: `Not a general one. Texas lets a claim be presented any time before the estate is closed, subject to ordinary limitation periods. The representative must publish a notice within a month of letters and can also send a permissive notice to an unsecured creditor; that creditor's claim is then barred unless presented before the 121st day after receiving it.` },
    { q: 'Can I use the Texas small estate affidavit if there is a will?', a: `No. The affidavit in Estates Code section 205.001 is for intestate estates only, with assets of ${usd(limit)} or less excluding the homestead and exempt property, at least 30 days after death and with no administration pending. When there is a will, the usual low-cost route is probate as a muniment of title, available if the estate has no unpaid debts other than real estate liens.` },
  ],
  related: ['probate', 'how-long-does-probate-take', 'probate:oklahoma', 'divorce-cost:texas', 'child-support:texas', 'alimony:texas'],
});
