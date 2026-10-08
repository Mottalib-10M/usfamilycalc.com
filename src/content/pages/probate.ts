import { definePage } from '../../lib/page-types';
import { pbAll, pbFeesOf, pbCalc, usd, usdx, listOf, num } from '../../lib/kit';

const PB = pbAll();
const statutory = PB.filter((d) => pbFeesOf(d.slug));
const claims = PB.filter((d) => d.creditorClaims.months != null).map((d) => d.creditorClaims.months as number);
const small = PB.filter((d) => d.smallEstate.limit != null).sort((a, b) => (a.smallEstate.limit as number) - (b.smallEstate.limit as number));
const ca = PB.some((d) => d.slug === 'california') ? pbCalc('california', 500000) : null;

export default definePage({
  id: 'probate',
  topic: 'probate',
  kind: 'pillar',
  order: 1,
  slug: 'probate',
  nav: 'Probate fees calculator',
  card: 'Statutory fees, small-estate limits and the probate calendar',
  title: 'Probate Fees Calculator 2026: Cost and Timeline by State',
  description: 'Probate fees calculator for 2026: statutory executor and attorney fees where a state sets them, filing fees, small-estate limits and the creditor deadline.',
  h1: 'Probate fees and timeline calculator',
  intro: 'What probate costs and how long it lasts are both written partly into state law: the fee schedules some states impose, and the creditor deadline every state sets.',
  resume: `Probate costs and timing depend on the state where the person lived. ${statutory.length ? `${listOf(statutory.map((d) => d.name))} set the executor's commission or the attorney's fee by statute as a percentage of the estate` : 'A few states set executor and attorney fees by statute'}${ca ? `; in California a ${usd(500000)} estate gives ${usd(ca.lines[0]?.value ?? 0)} to the personal representative and the same to the attorney, before extraordinary services` : ''}, while most states only require fees to be reasonable and approved by the court. The timeline has a legal floor: creditors have ${claims.length ? `${num(Math.min(...claims))} to ${num(Math.max(...claims))} months` : 'several months'} to file claims after the estate opens or notice is published, so even a simple estate rarely closes in less than six months to a year. ${small.length ? `Estates under the small-estate limit, from ${usdx(small[0].smallEstate.limit as number)} in ${small[0].name} to ${usdx(small[small.length - 1].smallEstate.limit as number)} in ${small[small.length - 1].name}, can often skip full probate.` : ''} The calculator applies these rules to the estate value you enter.`,
  tool: 'probate',
  toolProps: { state: 'california' },
  body: (h) => `<h2>What probate is, and what it is not</h2>
<p>Probate is the court procedure that confirms who manages a deceased person's estate, pays the debts and taxes and transfers what is left to the heirs or the beneficiaries of the will. It covers only the probate estate: assets in the deceased's name alone with no beneficiary designation. Life insurance, retirement accounts with a named beneficiary, joint accounts with right of survivorship, payable-on-death accounts and assets held in a living trust pass outside probate, which is why two estates of the same total value can face very different probate costs.</p>
<h2>Statutory fees and reasonable fees</h2>
<p>Most states let the personal representative and the attorney charge a reasonable fee, usually hourly, which the court reviews. A few write the fee into the statute as a percentage of the estate, decreasing as the estate grows. In those states the percentage applies to the gross probate estate, not to the net value after the mortgage, so a house with little equity can generate a large fee. Extraordinary work, such as selling real estate, litigation or running a business, is paid on top with court approval. Florida's attorney schedule is a presumption that clients can negotiate; California's applies unless the court allows more.</p>
<h2>The court's own fees</h2>
<p>The petition to open probate carries a filing fee set by the state or the county, sometimes on a sliding scale by estate size, as in New York. Publication of the notice to creditors in a newspaper, a bond for the personal representative when the will does not waive it, certified copies of letters and an appraisal add smaller amounts.</p>
<h2>How long probate takes</h2>
<p>The creditor claim period is the hard floor: the estate cannot be closed safely before it ends. After it, the personal representative pays valid claims, files the final income tax returns, sells or transfers property and prepares an accounting or a receipt from each heir. A simple estate often closes within a year; a contested will, a house that is slow to sell, an estate tax return or missing heirs can stretch it to two years or more. The ${h.a('how-long-does-probate-take', 'probate timeline guide')} goes step by step.</p>
<h2>Small estates</h2>
<p>Every state has a shortcut for small estates, usually an affidavit that lets heirs collect bank accounts and personal property after a waiting period, sometimes a summary administration in court. The value limit and what counts toward it differ widely; many states exclude real estate, vehicles or assets passing outside probate. The state pages quote the statute.</p>
<h2>Taxes are separate</h2>
<p>Probate fees are not taxes. The estate itself may owe federal estate tax only above a high exemption, and a few states levy estate or inheritance taxes; the personal representative also files the deceased's final income tax return and, when the estate earns income, an estate income tax return (${h.src('irs559', 'IRS Publication 559')}).</p>
${h.table(['State', 'Creditor claims', 'Small-estate limit', 'Executor and attorney fees'], PB.map((d) => [h.aIf(`probate:${d.slug}`, d.name), d.creditorClaims.months != null ? `${d.creditorClaims.months} months` : 'see state', d.smallEstate.limit != null ? usdx(d.smallEstate.limit) : 'see state', pbFeesOf(d.slug) ? 'statutory schedule' : 'reasonable, court-approved']), 'Read on the probate codes of each state', ['l', 'r', 'r', 'l'])}`,
  faqs: [
    { q: 'How much does probate cost?', a: 'It depends on the state and the estate. In states with a statutory schedule, executor and attorney fees are a percentage of the gross probate estate, each often a few percent. Elsewhere they are reasonable fees, usually hourly, approved by the court. Court filing fees, publication, a bond and appraisals add smaller amounts. The calculator applies the rules of your state.' },
    { q: 'Who pays probate fees?', a: 'The estate pays them, before the heirs receive their shares: filing fees, the personal representative’s compensation, the attorney’s fees and other administration costs come out of the estate’s assets. A personal representative who is also an heir may waive the commission, which can save income tax because commissions are taxable while inheritances generally are not.' },
    { q: 'Can you avoid probate?', a: 'Often, at least partly. Assets with a named beneficiary, joint ownership with right of survivorship, payable-on-death and transfer-on-death designations and assets in a funded living trust pass without probate. Estates under the state’s small-estate limit can usually use an affidavit or a summary procedure instead of full administration.' },
    { q: 'Is the executor fee taxable?', a: 'Yes. Compensation paid to a personal representative is taxable income to that person under federal law, and a professional executor may also owe self-employment tax, as IRS Publication 559 explains. A family member who is also a beneficiary sometimes waives the fee for that reason, receiving the same money as a tax-free inheritance instead.' },
    { q: 'What happens if there is no will?', a: 'The estate still goes through probate, called intestate administration, and the court appoints an administrator, usually a close relative, who may have to post a bond. The property passes to heirs in the order set by the state’s intestacy statute, typically the spouse and children first. Fees and timelines follow the same rules as an estate with a will.' },
    { q: 'How long do creditors have to file a claim?', a: `Every state sets a deadline, usually counted from the issuance of letters or the first publication of notice to creditors${claims.length ? `: from ${num(Math.min(...claims))} to ${num(Math.max(...claims))} months among the states on this site` : ''}. Known creditors must often receive direct notice. Claims filed after the deadline are generally barred, which is why the estate is not distributed before it ends.` },
  ],
  related: ['how-long-does-probate-take', 'divorce-cost', 'alimony', 'child-support', 'workers-comp'],
  sources: ['irs559'],
  extraSources: statutory.slice(0, 3).map((d) => ({ name: `${d.name}: statutory probate fees`, url: pbFeesOf(d.slug)!.schedules[0]?.url ?? '' })).filter((s) => s.url),
});
