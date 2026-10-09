import { defineStatePage } from '../../../lib/page-types';
import { pb, pbCalc, pbFeesOf, usd, pct, num, day } from '../../../lib/kit';
import { scheduleFee } from '../../../lib/engine/probate';

const d = pb('ohio');
const S = pbFeesOf('ohio')!.schedules;
const OB = S.find((s) => s.otherBase)!;
const A = S.find((s) => !s.otherBase)!.tiers!, B = OB.tiers![0].pct;
const amounts = (t: string) => t.match(/\$[\d,]+/g) ?? [];
const spouseLimit = amounts(d.smallEstate.text)[1];
const months = d.creditorClaims.months!;
const limit = d.smallEstate.limit!;
const eff = d.smallEstate.effective!;
// Worked example: a Columbus house kept by the family ($280,000, not sold) and $230,000 of accounts and a car.
const house = 280000, personal = 230000;
const onPersonal = pbCalc('ohio', personal).lines[0].value;
const onHouse = scheduleFee(house, OB);
const exact = onPersonal + onHouse;
// Same estate, but the house is sold: its proceeds join the first schedule.
const sold = pbCalc('ohio', house + personal).lines[0].value;

export default defineStatePage({
  topic: 'probate',
  slug: 'ohio',
  title: `Ohio Probate Fees 2026: ${pct(A[0].pct)} to ${pct(A[2].pct)}, Plus ${pct(B)} on Unsold Land`,
  description: `Ohio probate 2026: R.C. 2113.35 pays executors ${pct(A[0].pct)} to ${pct(A[2].pct)} plus ${pct(B)} on unsold real estate, ${usd(exact)} in our ${usd(house + personal)} example, and claims close ${num(months)} months after death.`,
  intro: 'Ohio pays its executors on a two-part statutory schedule and starts the creditors’ clock on the day of death, not on the day the estate is opened.',
  resume: `Ohio probate fees for executors and administrators are set by R.C. 2113.35: ${pct(A[0].pct)} of the first ${usd(A[0].upTo!)} of personal property, income and proceeds of real estate sold, ${pct(A[1].pct)} up to ${usd(A[1].upTo!)}, ${pct(A[2].pct)} above that, and a separate ${pct(B)} on real estate that is not sold. An estate made of a ${usd(house)} house the family keeps and ${usd(personal)} of accounts and a car therefore allows ${usd(exact)}. Attorney fees are not scheduled; the probate court allows what is reasonable. Ohio's timing rule is unusual: all claims must be presented within ${num(months)} months after the death itself, whether or not anyone has been appointed, so a family that waits three months to open probate leaves creditors only three months more. The executor is expected to file a final and distributive account within six months after appointment unless an exception applies, such as a will contest or a spousal election, which keeps many Ohio estates short. Estates of ${usd(limit)} or less can be released from administration.`,
  body: (h) => `<h2>Two bases, two rates</h2>
<p>The statute splits the estate in two before applying any percentage. Personal property with its income, plus the gross proceeds of any real estate the executor sells, goes through the sliding ${h.pct(A[0].pct)} / ${h.pct(A[1].pct)} / ${h.pct(A[2].pct)} scale. Real estate that passes to heirs without being sold earns only ${h.pct(B)}. In the Columbus example, the ${h.usd(personal)} of accounts and car give ${h.usd(onPersonal)} and the ${h.usd(house)} house kept by the family gives ${h.usd(onHouse)}, ${h.usd(exact)} in all. Sell the house instead and its proceeds move to the first base: the commission becomes ${h.usd(sold)}. The gap matters when heirs choose between keeping the home and selling it inside the estate.</p>
<p>The calculator above runs the sliding scale on the value you enter and shows the ${h.pct(B)} line apart, since it belongs to a different pool of assets: enter the personal property and sale proceeds as the estate, and read the land line on the value of the house kept. The statute also adds ${h.pct(B)} on some non-probate property that would have been taxable under the repealed Ohio estate tax as of the end of 2012, joint and survivorship property excepted; few estates are affected.</p>
<h2>A deadline counted from death</h2>
<p>R.C. 2117.06 is blunt: claims not presented within ${h.num(months)} months of death are barred, appointment or no appointment. Waiting before opening the estate does not move the deadline; it only shortens the time left once notice is possible, so creditors in Ohio watch the probate docket closely. R.C. 2117.061 sets out the only exceptions.</p>
<h2>Release from administration, no affidavit</h2>
<p>Ohio has no out-of-court small estate affidavit. The short route is a court order releasing the estate from administration under R.C. 2113.03, available up to ${h.usd(limit)}, or ${spouseLimit} when the surviving spouse takes everything. The thresholds date from ${h.day(eff)} and are not indexed. A summary release for estates that do not exceed funeral costs exists in R.C. 2113.031, which we did not read.</p>
<h2>Court costs vary by county</h2>
<p>Ohio has no single filing fee. R.C. 2101.16 lists itemized probate court charges, and each county adds deposits and local costs. The Franklin County schedule could not be read when we checked, so the calculator adds no court fee for Ohio. ${h.a('probate:illinois', 'Illinois')}, by comparison, sets no executor percentage at all.</p>`,
  faqs: [
    { q: 'How much is the executor fee in Ohio?', a: `Under R.C. 2113.35 it is ${pct(A[0].pct)} of the first ${usd(A[0].upTo!)}, ${pct(A[1].pct)} from there to ${usd(A[1].upTo!)} and ${pct(A[2].pct)} above, on personal property, income and real estate sale proceeds, plus ${pct(B)} on real estate not sold. Our ${usd(house + personal)} example with an unsold house allows ${usd(exact)}. The court can add an amount for extraordinary services, and a will can provide otherwise.` },
    { q: 'How long do creditors have to file a claim against an Ohio estate?', a: `${num(months)} months from the date of death under R.C. 2117.06, whether or not an executor or administrator has been appointed. A claim presented after that is barred, except as R.C. 2117.061 allows. Because the clock starts at death, a late opening of the estate shortens the time creditors have once notice is possible.` },
    { q: 'What qualifies as a small estate in Ohio?', a: `An estate with assets of ${usd(limit)} or less, or ${spouseLimit} or less when the surviving spouse inherits the whole estate by will or by intestacy, can be released from administration by the probate court under R.C. 2113.03. It is still a court filing; Ohio has no affidavit that heirs can hand to a bank without the court. The thresholds have not changed since ${day(eff)}.` },
  ],
  related: ['probate', 'how-long-does-probate-take', 'probate:illinois', 'divorce-cost:ohio', 'child-support:ohio', 'workers-comp:ohio'],
});
