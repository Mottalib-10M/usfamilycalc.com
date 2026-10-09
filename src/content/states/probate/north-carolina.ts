import { defineStatePage } from '../../../lib/page-types';
import { pb, pbFeesOf, usd, usdx, pct, num } from '../../../lib/kit';

const d = pb('north-carolina');
const rate = pbFeesOf('north-carolina')!.schedules[0].tiers![0].pct;
const money = (t: string) => (t.match(/\$[\d,]+(?:\.\d+)?/g) ?? []).map((x) => Number(x.replace(/[$,]/g, '')));
const C = money(d.filingFee!.text);
const flat = C[0] + C[1] + C[2];
const per100 = Number((d.filingFee!.text.match(/(\d+) cents per \$100/) ?? ['', '0'])[1]) / 100;
const capCost = C[4];
const courtCost = (v: number) => flat + Math.min((v / 100) * per100, capCost);
const spouse = money(d.smallEstate.text)[1];
const debtsToDecedent = money(d.simplified!.text)[0];
const months = d.creditorClaims.months!;
const limit = d.smallEstate.limit!;
// Worked example: a Raleigh estate with $180,000 of accounts and a car, $35,000 of bills and expenses paid, and the house deeded to the children.
const personal = 180000, spent = 35000;
const comm = ((personal + spent) * rate) / 100;
const cost = courtCost(personal);
const bigEstate = 2000000;

export default defineStatePage({
  topic: 'probate',
  slug: 'north-carolina',
  title: `North Carolina Probate 2026: ${pct(rate)} Commission Cap, Clerk Costs`,
  description: `North Carolina probate 2026: the clerk allows up to ${pct(rate)} of receipts and expenditures, ${usd(comm)} in our Raleigh example, and court costs of ${usdx(cost)} on that estate.`,
  intro: 'In North Carolina, probate runs before the clerk of superior court, who fixes the executor’s commission and charges court costs that grow with the personal estate.',
  resume: `North Carolina probate fees are set by the clerk of superior court within a statutory ceiling: the personal representative may receive up to ${pct(rate)} of the receipts and of the expenditures made in administering the estate, with nothing earned on distributions to heirs, so an estate that collects ${usd(personal)} and pays out ${usd(spent)} allows at most ${usd(comm)}. Court costs follow G.S. 7A-307: a flat ${usdx(flat)} plus ${usdx(per100)} per ${usd(100)} of personal property, the value-based part capped at ${usd(capCost)}, which comes to ${usdx(cost)} on that estate. Attorneys hired by the estate are paid as reasonable expenses approved by the clerk. The probate calendar is short at the start and long at the end. The notice to creditors runs four weeks in a newspaper and names a deadline at least ${num(months)} months after first publication, but the final account is not due until one year after the representative qualifies, so that one-year account date often sets the horizon of a North Carolina estate. Personal property of ${usd(limit)} or less can be collected by affidavit 30 days after death.`,
  body: (h) => `<h2>The clerk, not a judge</h2>
<p>North Carolina gives original jurisdiction over estates to the clerk of superior court in each county. The clerk issues letters, receives the inventory and accounts, and fixes the commission under G.S. 28A-23-3. The ${h.pct(rate)} figure is a ceiling, not an entitlement: clerks look at the time spent, the care and the results, and they may take into account legal or other professional fees the estate already paid for work the representative would otherwise have done.</p>
<h2>What the commission is computed on</h2>
<p>The base is receipts plus expenditures, never the total value of the estate. Personal property counts at its value when received; real estate counts only if it is sold and the proceeds are applied to debts or devises. Take a Raleigh estate holding ${h.usd(personal)} of bank accounts and a car, where the representative pays ${h.usd(spent)} of bills, funeral costs and taxes, and the house goes to the children by deed instead of a sale. The maximum is ${h.pct(rate)} of ${h.usd(personal + spent)}, or ${h.usd(comm)}. The house adds nothing. The calculator above applies the percentage to the whole value you enter, so it shows the highest figure the clerk could allow, not the likely one.</p>
<h2>Court costs that scale with the estate</h2>
<p>G.S. 7A-307 charges a fixed ${h.usdx(flat)} plus ${h.usdx(per100)} for every ${h.usd(100)} of gross personal estate, including proceeds from realty sales but not realty itself. For the Raleigh estate that is ${h.usdx(cost)}. The value-based part stops at ${h.usd(capCost)}, a ceiling reached once the personal estate passes ${h.usd((capCost / per100) * 100)}; an estate of ${h.usd(bigEstate)} pays ${h.usdx(courtCost(bigEstate))}. The research behind this page read the clerk-costs statute through an archive copy of the legislature's site, because the official pages refuse automated readers.</p>
<h2>Shortcuts below full administration</h2>
<p>The affidavit route of G.S. 28A-25-1 covers personal property up to ${h.usd(limit)}, or ${h.usd(spouse)} when the surviving spouse is the sole heir or sole devisee, filed with the clerk at least 30 days after death. Debts of up to ${h.usd(debtsToDecedent)} owed to the decedent can be paid straight to the clerk. A surviving spouse who takes everything can ask for summary administration under Article 28 instead of a full estate.</p>
<h2>Where the year goes</h2>
<p>A State tax release, a house slow to sell, or a dispute over who the heirs are can push the final account past its one-year mark, since the statute moves the due date to six months after a tax release when that comes later. A ${h.a('probate:florida', 'Florida')} estate, by contrast, faces a fixed commission schedule and a shorter creditor window.</p>`,
  faqs: [
    { q: 'What percentage does an executor get in North Carolina?', a: `Up to ${pct(rate)} of the estate's receipts and of its expenditures, fixed by the clerk of superior court under G.S. 28A-23-3. Distributions to heirs and devisees earn nothing, and real estate counts only when sold and applied to debts or devises. With ${usd(personal)} collected and ${usd(spent)} paid out, the most the clerk could allow is ${usd(comm)}.` },
    { q: 'How much are court costs to probate an estate in North Carolina?', a: `G.S. 7A-307 sets a fixed ${usdx(flat)} plus ${usdx(per100)} per ${usd(100)} of the gross personal estate, with the value-based part capped at ${usd(capCost)}. Real estate is not counted unless sold. An estate with ${usd(personal)} of personal property pays ${usdx(cost)}; the maximum total is ${usdx(flat + capCost)}. A separate minimum of ${usdx(C[5])} applies per filing.` },
    { q: 'What is the small estate limit in North Carolina?', a: `${usd(limit)} of personal property, net of liens, under G.S. 28A-25-1, or ${usd(spouse)} when the surviving spouse is the sole heir or sole devisee. The affidavit is filed with the clerk of superior court once 30 days have passed since death. Real estate is not collected this way. The thresholds are not indexed to inflation.` },
  ],
  related: ['probate', 'how-long-does-probate-take', 'probate:florida', 'probate:maryland', 'divorce-cost:north-carolina', 'child-support:north-carolina'],
});
