import { definePage } from '../../lib/page-types';
import { pbAll, num } from '../../lib/kit';

const PB = pbAll();
const withClaims = PB.filter((d) => d.creditorClaims.months != null);
const months = withClaims.map((d) => d.creditorClaims.months as number).sort((a, b) => a - b);
const median = months.length ? months[Math.floor(months.length / 2)] : 0;
const longest = withClaims.filter((d) => d.creditorClaims.months === months[months.length - 1]).map((d) => d.name);

export default definePage({
  id: 'how-long-does-probate-take',
  topic: 'probate',
  kind: 'guide',
  order: 2,
  slug: 'how-long-does-probate-take',
  nav: 'How long does probate take?',
  card: 'The creditor deadline, the steps after it and what delays an estate',
  title: 'Probate Timeline 2026: How Long Probate Takes in Each State',
  description: 'How long probate takes in 2026: the creditor claim period of each state, the steps from petition to distribution, and what turns the months into years.',
  h1: 'How long does probate take?',
  intro: 'A floor set by law, then the work of the estate: why most probates last six months to two years, and what decides where yours falls.',
  resume: `Probate usually takes between six months and two years, and the floor is set by state law: creditors have a fixed period to file claims after the estate is opened or notice is published, ${months.length ? `a median of ${num(median)} months among the states on this site, up to ${num(months[months.length - 1])} months in ${longest.join(' and ')}` : 'several months in most states'}, and the personal representative cannot safely distribute the estate before it ends. Opening the estate takes a few weeks to a few months depending on the court's calendar and whether anyone objects. After the claim period, the time depends on the estate itself: selling a house, collecting accounts, filing the final income tax returns and, for large estates, an estate tax return, then preparing the accounting. A will contest, a dispute among heirs, missing beneficiaries or a business to sell can add a year or more. Small estates can often avoid the process with an affidavit.`,
  mini: 'probateTimeline',
  miniArg: PB.map((d) => [d.name, d.creditorClaims.months]),
  body: (h) => `<h2>Step 1: opening the estate</h2>
<p>Someone, usually the executor named in the will or a close relative, petitions the probate court of the county where the person lived. The court admits the will, appoints the personal representative and issues letters testamentary or letters of administration. Heirs and beneficiaries must be notified, and some states require a hearing. In an uncontested case with a clear will, this takes from a few weeks to three months, mostly waiting for a court date; a bond requirement or an objection lengthens it.</p>
<h2>Step 2: notice to creditors and the claim period</h2>
<p>The personal representative publishes a notice to creditors in a local newspaper and mails it to known creditors. The claim period starts from publication or from the issuance of letters, depending on the state, and runs for the number of months the statute sets. This is the fixed part of every probate. Many states also bar all claims after a longer outside limit counted from the date of death, which protects heirs when no probate was opened.</p>
<h2>Step 3: inventory and management</h2>
<p>During the claim period the personal representative inventories the assets, often with appraisals, opens an estate bank account, keeps paying insurance and property taxes, and decides which claims to pay or reject. Real estate may be listed for sale. Most states set a deadline for filing the inventory with the court, often within a few months of appointment.</p>
<h2>Step 4: taxes</h2>
<p>The final individual income tax return is due on the usual date the year after death, and an estate that earns income files its own returns (${h.src('irs559', 'IRS Publication 559')}). Large estates file a federal estate tax return within nine months of death, with a possible extension, and some executors wait for the closing letter before distributing everything. A handful of states also tax estates or inheritances.</p>
<h2>Step 5: distribution and closing</h2>
<p>Once claims and taxes are paid, the personal representative distributes the remaining assets under the will or the intestacy statute, collects receipts, files a final accounting or a closing statement and asks the court to discharge the representative. Some states let heirs waive a formal accounting, which saves weeks.</p>
<h2>What slows probate down</h2>
<p>The usual causes are a will contest; disagreement among heirs over selling the house; assets that are hard to value or sell, such as a business or rental property; creditors who sue over rejected claims; heirs who cannot be found; and an estate tax audit. A personal representative who keeps heirs informed and sells early, once the court allows it, avoids most of the avoidable delay.</p>
<h2>A realistic calendar for a simple estate</h2>
<p>Take a widow who leaves a house, a checking account and a car to her two children under a will that names one of them executor. The petition is filed a month after the funeral and the hearing is set five weeks later. Letters issue the same day, the notice to creditors runs in the paper the following week and the claim period starts. While it runs, the executor lists the house, collects the bank balance into an estate account, pays the final utility bills and the funeral home, and files the inventory. The house sells around the end of the claim period. A few weeks later the executor files the final income tax return, pays the last bills, sends each sibling an accounting and asks the court to close the estate. Nine to twelve months is a fair result for this estate in most states, with the claim period accounting for almost half of it.</p>
<h2>Supervised and independent administration</h2>
<p>Many states let a personal representative act without asking the court's permission for each sale or payment, often called independent or unsupervised administration, when the will allows it or the heirs consent. Fewer hearings mean a faster estate. Supervised administration, where the court approves major steps, is slower but gives heirs more protection when they do not trust the executor or each other. The choice is usually made in the first petition.</p>
<h2>Ways to shorten or skip it</h2>
<p>Small estates can use the state's affidavit or summary procedure, usually after a short waiting period counted from the death; the heir signs a sworn statement and presents it with the death certificate to the bank or the holder of the asset. Assets with beneficiary designations or in a living trust pass outside probate entirely, often within weeks. Some states offer an independent or unsupervised administration that needs fewer court approvals. Compare the deadlines and limits of each state with the ${h.a('probate', 'probate calculator')}.</p>`,
  faqs: [
    { q: 'What is the fastest probate can be done?', a: 'Rarely faster than the creditor claim period plus a few weeks to open the estate and a few to close it, so roughly four to eight months in most states for a simple, uncontested estate. Small estates using an affidavit can be settled much faster, sometimes a month or two after death, once the state’s waiting period has passed.' },
    { q: 'Why does probate take so long?', a: 'Because state law imposes a creditor claim period before distribution, and because the estate’s work takes time: inventory, appraisals, selling property, paying debts and filing final tax returns. Court calendars add weeks at each step that needs a hearing. Disputes among heirs or a will contest are the main reasons a probate stretches beyond a year or two.' },
    { q: 'Can heirs get money before probate is finished?', a: 'Sometimes. Many states allow a partial distribution once the claim period has passed and enough money is kept for remaining debts and taxes, often with court approval or the heirs’ consent. A surviving spouse or minor children may receive a family allowance during probate. Assets outside probate, such as life insurance, are paid directly to beneficiaries.' },
    { q: 'Is there a deadline to open probate after a death?', a: 'Many states require anyone holding an original will to file it with the court within a short time after the death, often thirty days, and some limit how long after death a will can be admitted to probate. Waiting rarely helps: creditors may still claim within the outside limit, and assets in the deceased’s name cannot be sold or transferred until someone has authority.' },
    { q: 'Does a living trust avoid the probate timeline?', a: 'Yes, for the assets actually transferred into the trust before death. The successor trustee can manage and distribute them without court supervision, so there is no court-imposed waiting, although trustees still pay debts and taxes and some states set a shorter claim period for trusts. Assets left outside the trust may still need probate.' },
  ],
  related: ['probate', 'divorce-cost', 'child-support', 'workers-comp'],
  sources: ['irs559'],
  extraSources: withClaims.slice(0, 2).map((d) => ({ name: `${d.name}: creditor claim period`, url: d.creditorClaims.url })).filter((s) => s.url),
});
