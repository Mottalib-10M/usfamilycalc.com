/**
 * Kentucky, KRS 403.211, 403.212, 403.2122. Table of KRS 403.212(9), $100 rows ($0 to $30,000, read at the
 * row at or below the income: the statute gives no rounding rule), shared by income (403.212(5)(a)); child
 * care and health coverage added and prorated (403.211(6)-(7)). Self-support reserve (403.212(5)(b)): at or
 * below the income threshold for the number of children, the table is also read at the obligor's income
 * alone and the lesser applies. Shared parenting time credit (403.2122): from 88 days a year, the chart
 * percentage times the combined table amount is subtracted from the obligor's share; the credit and the
 * reserve are not combined, the lesser result applies (403.2122(3)(c)). Minimum $60 (403.212(6)), not when
 * the credit brings the amount lower (403.2122(3)).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { scheduleLookup } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { ssrIncomeThresholdsByChildren: number[]; minimumOrder: number };
type Band = { fromDays: number; toDays: number; pct: number };

export default function kentucky(d: CSData, inp: CSInput): CSResult {
  const s = d.schedule!, f = d.formula as unknown as F;
  const bands = ((d.shared as unknown as { table?: Band[] })?.table ?? []) as Band[];
  const notes: string[] = [];
  const n = Math.max(1, Math.min(Math.round(inp.children), d.maxChildren));
  if (inp.children > d.maxChildren) notes.push('children-capped');
  const A = n0(inp.payer), B = n0(inp.other), C = A + B;
  const share = C > 0 ? A / C : 1;
  const basic = scheduleLookup(s, C, n, notes);
  const steps: CSStep[] = [
    money('Combined monthly adjusted parental gross income', C),
    money(`KRS 403.212 table amount, ${plural(n)} (row at or below the income)`, basic),
    percent('Obligated parent’s share of combined income', share * 100),
  ];
  const care = n0(inp.childcare);
  const hPayer = inp.healthBy === 'payer' ? n0(inp.health) : 0;
  const hOther = inp.healthBy === 'other' ? n0(inp.health) : 0;
  const addOns = (care + hPayer + hOther) * share - hPayer;
  const proRata = basic * share + addOns;
  if (care + hPayer + hOther > 0) steps.push(money('Child care and health coverage, obligated parent’s share (net of premium paid)', addOns));

  // Shared parenting time credit.
  const nights = nightsOf(inp.payerOvernights);
  const band = bands.find((b) => nights.payer >= b.fromDays && nights.payer <= Math.ceil(b.toDays)) ?? (nights.payer > Math.max(...bands.map((b) => b.toDays)) ? bands[bands.length - 1] : undefined);
  let credited: number | null = null;
  if (band) {
    const credit = (basic * band.pct) / 100;
    credited = proRata - credit;
    steps.push(money(`Shared parenting time credit: ${band.pct} % of the table amount (${nights.payer} days)`, credit));
    notes.push('shared-applied');
  }
  // Self-support reserve.
  let reserved: number | null = null;
  const thr = f.ssrIncomeThresholdsByChildren[n - 1];
  if (A <= thr) {
    reserved = scheduleLookup(s, A, n);
    steps.push(money(`Self-support reserve: table read at the obligated parent’s income alone (at or below $${thr.toLocaleString('en-US')})`, reserved));
  }
  let amount = proRata, rule = 'pro rata share';
  if (credited != null && credited < amount) { amount = credited; rule = 'shared parenting time credit'; }
  if (reserved != null && reserved < amount) { amount = reserved; rule = 'self-support reserve'; notes.push('self-support-reserve'); }
  if (credited != null || reserved != null) steps.push(text('Lesser amount applies (KRS 403.212(5)(c))', rule));
  if (rule !== 'shared parenting time credit' && amount < f.minimumOrder) {
    amount = f.minimumOrder;
    steps.push(money('Minimum child support (KRS 403.212(6))', f.minimumOrder));
  }
  // The credit can exceed the share with equal time; the statute names no payment the other way.
  if (amount < 0) { steps.push(text('Credit larger than the share', 'no payment either way in this estimate')); amount = 0; }
  return { monthly: amount, reverse: 0, basicMonthly: basic, payerShare: share, steps, notes };
}
