/** California Family Code § 4055: CS = K[HN − (H%)(TN)], K = (1 + H%) or (2 − H%) × fraction(TN); § 4061 child care add-on; § 4055(b)(7) low-income adjustment. */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural } from './_util';

export default function california(d: CSData, inp: CSInput): CSResult {
  const F = d.formula as { kTable: Array<{ tnMin: number; tnMax: number | null; constant: number; divisor: number | null; fixedOverTN: number | null }>; childrenMultiplier: Record<string, number>; lowIncomeAdjustment?: { thresholdMonthly2026Computed?: number } };
  const A = n0(inp.payer), B = n0(inp.other);
  const TN = A + B;
  const payerHigh = A >= B;
  const HN = payerHigh ? A : B;
  const nights = Math.max(0, Math.min(365, inp.payerOvernights));
  const H = (payerHigh ? nights : 365 - nights) / 365;
  // Brackets are whole dollars ($0–2,900, $2,901–5,000…): an amount with cents belongs to the lower bracket until the next whole dollar.
  const row = F.kTable.find((r) => TN < (r.tnMax ?? Infinity) + 1) ?? F.kTable[F.kTable.length - 1];
  const fraction = row.constant + (row.divisor ? TN / row.divisor : 0) + (row.fixedOverTN && TN > 0 ? row.fixedOverTN / TN : 0);
  const K = (H <= 0.5 ? 1 + H : 2 - H) * fraction;
  const n = Math.max(1, Math.min(Math.round(inp.children), Object.keys(F.childrenMultiplier).length));
  const mult = F.childrenMultiplier[String(n)] ?? 1;
  const cs = K * (HN - H * TN) * mult; // > 0: the high earner pays; < 0: the low earner pays (§ 4055(b)(5))
  const steps: CSStep[] = [
    { label: 'Total net disposable income (TN)', value: TN, kind: 'money' },
    { label: 'High earner’s time with the children (H%)', value: H * 100, kind: 'pct' },
    { label: 'K factor', value: (Math.round(K * 1000) / 1000).toString(), kind: 'text' },
    { label: `Formula amount, ${plural(n)} (× ${mult})`, value: Math.abs(cs), kind: 'money' },
  ];
  const notes: string[] = [];
  let payerOwes = payerHigh ? cs : -cs;
  const share = TN > 0 ? A / TN : 1;
  // § 4061(c)-(d), since September 1, 2024: add-ons are shared in proportion to net incomes after the
  // basic support is moved from the parent who pays it to the parent who receives it.
  const payerAdj = A - payerOwes, otherAdj = B + payerOwes;
  const careShare = payerAdj + otherAdj > 0 ? Math.max(0, Math.min(1, payerAdj / (payerAdj + otherAdj))) : share;
  if (d.addOns.childcare && inp.childcare > 0) { payerOwes += inp.childcare * careShare; steps.push({ label: 'Child care, paying parent’s share (§ 4061)', value: inp.childcare * careShare, kind: 'money' }); }
  const thr = F.lowIncomeAdjustment?.thresholdMonthly2026Computed;
  const obligorNet = payerOwes >= 0 ? A : B;
  if (thr && obligorNet < thr && Math.abs(cs) > 0) {
    steps.push({ label: 'Low-income adjustment available, up to', value: (Math.abs(cs) * (thr - obligorNet)) / thr, kind: 'money' });
    notes.push('ca-lia');
  }
  let monthly = payerOwes, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: Math.abs(cs), payerShare: share, steps, notes };
}
