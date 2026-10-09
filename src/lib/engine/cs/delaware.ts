/**
 * Delaware Child Support Formula (Melson), Family Court Form 509i, 2026 (effective February 1, 2026).
 * Monthly amounts rounded to whole dollars. Line 6 = gross income − $1,600 self-support allowance (no other
 * deductions or other dependents in the inputs); Line 9 share. Primary need = primary support allowance per
 * household (whole children, or half children when the child has 164+ overnights in each home) + child care +
 * children's medical premium × 75 %. Line 14 = share × need; Line 15 = Line 8 − Line 14; high-income offset
 * 30 % of the excess over $16,000; SOLA = (Line 15 − offset) × SOLA %. Line 24 = Line 19 − retained primary and
 * SOLA − child care / premium paid − parenting time adjustment (10 % / 30 % of the other parent's Line 20 for
 * 80-124 / 125-163 overnights), capped at 50 % of Line 8; minimum order $160 / $240 outside shared placement;
 * in shared placement the higher Line 24 is offset by the lower and nothing is owed under $50.
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = {
  selfSupportAllowance: number;
  primarySupportAllowance: { first: number; eachAdditional: number; half: number; eachAdditionalHalf: number };
  medicalPremiumFactor: { noOtherDependents: number };
  highIncomeThreshold: number;
  highIncomeOffsetPct: number;
  solaPct: Record<string, number>;
  parentingTimeTable: Array<[number, number]>;
  sharedFromOvernights: number;
  selfSupportProtectionPct: { default: number };
  minimumOrder: Record<string, unknown>;
  sharedNoObligationBelow: number;
};

const r = (x: number) => Math.round(x);

export default function delaware(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const notes: string[] = [];
  const n = Math.max(1, Math.round(inp.children));
  const nights = nightsOf(inp.payerOvernights);
  const shared = nights.payer >= f.sharedFromOvernights && nights.other >= f.sharedFromOvernights;
  const P = f.primarySupportAllowance;
  // Children of this union in each household [payer, other] and primary support allowance (Lines 10-11).
  const kids = shared ? [n / 2, n / 2] : [0, n];
  const allowance = (k: number) => {
    if (k <= 0) return 0;
    if (shared) return P.half + P.eachAdditionalHalf * (Math.round(k * 2) - 1);
    return P.first + P.eachAdditional * (k - 1);
  };
  const l11 = kids.map(allowance);
  const l8 = [r(n0(inp.payer) - f.selfSupportAllowance), r(n0(inp.other) - f.selfSupportAllowance)].map((x) => Math.max(0, x));
  const tot8 = l8[0] + l8[1];
  const share = tot8 > 0 ? l8[0] / tot8 : (n0(inp.payer) >= n0(inp.other) ? 1 : 0);
  const shares = [share, 1 - share];
  const care = r(n0(inp.childcare));
  const prem = r(n0(inp.health) * f.medicalPremiumFactor.noOtherDependents);
  const l12 = [inp.healthBy === 'payer' ? prem : 0, care + (inp.healthBy === 'other' ? prem : 0)];
  const need = l11[0] + l11[1] + l12[0] + l12[1];
  const l14 = shares.map((s) => r(s * need));
  const l15 = [0, 1].map((i) => Math.max(0, l8[i] - l14[i]));
  const excess = l15.reduce((a, x) => a + Math.max(0, x - f.highIncomeThreshold), 0);
  const offset = excess > 0 ? r((excess * f.highIncomeOffsetPct) / 100) : 0;
  const keys = Object.keys(f.solaPct).filter((k) => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
  const top = keys[keys.length - 1];
  const solaPct = n <= top ? f.solaPct[String(n)] : f.solaPct[String(top)] + f.solaPct.eachAdditional * (n - top);
  const sola = l15.map((x) => r((Math.max(0, x - offset) * solaPct) / 100));
  const perChildSola = (sola[0] + sola[1]) / n;
  const l19 = [0, 1].map((i) => l14[i] + sola[i]);
  const l20 = [0, 1].map((i) => r(kids[i] * perChildSola + l11[i]));
  const ptPct = shared ? 0 : ([...f.parentingTimeTable].reverse().find(([from]) => nights.payer >= from)?.[1] ?? 0);
  const l22 = [r((ptPct / 100) * l20[1]), 0];
  const cap = l8.map((x) => r((x * f.selfSupportProtectionPct.default) / 100));
  const l24 = [0, 1].map((i) => Math.min(l19[i] - l20[i] - l12[i] - l22[i], cap[i]));

  const steps: CSStep[] = [
    money('Income after the self-support allowance (paying parent)', l8[0]),
    percent('Paying parent’s share of net available income', share * 100),
    money(`Total primary need, ${plural(n)}`, need),
    money(`Standard of living adjustment (${solaPct} %), paying parent`, sola[0]),
  ];
  if (offset > 0) { steps.push(money('High-income offset', offset)); }
  if (ptPct > 0) { steps.push(money(`Parenting time adjustment (${ptPct} % of the other household’s retained support)`, l22[0])); notes.push('shared-applied'); }

  let monthly = 0, reverse = 0;
  if (shared) {
    notes.push('shared-applied');
    steps.push(text('Shared placement', `${f.sharedFromOvernights}+ overnights in each home: half a child per household, obligations offset`));
    const net = Math.max(0, l24[0]) - Math.max(0, l24[1]);
    if (net >= f.sharedNoObligationBelow) monthly = net;
    else if (-net >= f.sharedNoObligationBelow) { reverse = -net; notes.push('reverse'); }
  } else {
    monthly = Math.max(0, l24[0]);
    if (l19[0] - l20[0] - l12[0] - l22[0] > cap[0]) notes.push('self-support-reserve');
    const mins = f.minimumOrder as Record<string, number>;
    const min = n === 1 ? mins['1'] : mins['2+'];
    if (monthly < min) { monthly = min; notes.push('below-min'); steps.push(money('Minimum order', min)); }
  }
  steps.push(money('Net monthly obligation (Line 24)', monthly));
  return { monthly, reverse, basicMonthly: need + sola[0] + sola[1], payerShare: share, steps, notes };
}
