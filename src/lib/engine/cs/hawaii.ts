/**
 * Hawaii, 2024 Child Support Guidelines (effective April 1, 2024), CSG Worksheet: Net and SOLA incomes from the
 * official Table of Incomes; income shares in whole percents; Primary Child Support Need = base primary support
 * per child + child care + children's health insurance; SOLA = 10 % per child (max 30 %) of the parents' SOLA
 * income left after that need; each parent's obligation = (need + SOLA) × share, at least $91 per child and
 * generally not more than the parent's net income; credits for child care and premiums paid (Line 17, rounded).
 * Time-sharing (Extensive Time-Sharing Worksheet): 143 overnights or fewer = sole custody; equal time = half of
 * the difference of the two Line 17 amounts; between, the sole amount reduced per overnight above 143 (÷ 40).
 * Above the last row of the Table of Incomes the net income is extended at the table's last marginal rate
 * (the Judiciary's spreadsheet computes taxes exactly).
 */
import type { CSData, CSInput, CSResult, CSStep } from '../child-support';
import { n0, plural, nightsOf, money, percent, text } from './_util';

type F = { basePrimarySupportPerChild: number; solaIncomeDeduction: number; solaPctPerChild: number; solaPctMax: number; minimumPerChild: number; soleCustodyMaxOvernights: number; equalTimeOvernights: number; extensiveAdjustmentDivisor: number; equalTimeMonthsEach: number };

/** Net and SOLA income for a monthly gross, read in the Table of Incomes (rows [gross, net, sola, 70 % net]). */
function incomes(rows: number[][], firstTo: number, gross: number, solaDeduction: number) {
  const g = Math.round(gross);
  const sola = Math.max(0, g - solaDeduction);
  if (g <= firstTo) return { net: 0, sola, extended: false };
  const first = rows[0][0], last = rows[rows.length - 1];
  if (g <= last[0]) return { net: rows[g - first][1], sola, extended: false };
  const ref = rows[rows.length - 1001];
  const slope = (last[1] - ref[1]) / (last[0] - ref[0]);
  return { net: last[1] + (g - last[0]) * slope, sola, extended: true };
}

export default function hawaii(d: CSData, inp: CSInput): CSResult {
  const f = d.formula as unknown as F;
  const rows = d.schedule!.rows;
  const firstTo = ((d as unknown as { extra?: { firstBand?: { to: number } } }).extra?.firstBand?.to) ?? rows[0][0] - 1;
  const notes: string[] = [];
  const n = Math.max(1, Math.round(inp.children));
  const a = incomes(rows, firstTo, n0(inp.payer), f.solaIncomeDeduction), b = incomes(rows, firstTo, n0(inp.other), f.solaIncomeDeduction);
  if (a.extended || b.extended) notes.push('above-max-extrapolated');
  const totalNet = a.net + b.net;
  const pA = totalNet > 0 ? Math.round((a.net / totalNet) * 100) : (n0(inp.payer) >= n0(inp.other) ? 100 : 0);
  const pB = 100 - pA;
  const care = n0(inp.childcare);
  const hPayer = inp.healthBy === 'payer' ? n0(inp.health) : 0;
  const hOther = inp.healthBy === 'other' ? n0(inp.health) : 0;
  const need = f.basePrimarySupportPerChild * n + care + hPayer + hOther;
  const solaPct = Math.min(f.solaPctPerChild * n, f.solaPctMax);
  const sola = (Math.max(0, a.sola + b.sola - need) * solaPct) / 100;
  const calc = need + sola;
  const minimum = f.minimumPerChild * n;
  const line14 = (pct: number, net: number) => { let x = (calc * pct) / 100; if (net > minimum && x > net) x = net; return Math.max(x, minimum); };
  // Line 17: obligation minus child care and premium the parent pays (child care taken as paid by the other parent).
  const l17A = Math.round(line14(pA, a.net) - hPayer);
  const l17B = Math.round(line14(pB, b.net) - care - hOther);
  const steps: CSStep[] = [
    money('Net incomes (Table of Incomes), combined', totalNet),
    percent('Paying parent’s share of net income (whole percent)', pA),
    money(`Primary child support need, ${plural(n)}`, need),
    money(`Standard of living adjustment (${solaPct} % of remaining SOLA income)`, sola),
  ];
  const nights = nightsOf(inp.payerOvernights);
  let amount = l17A;
  if (nights.payer > f.soleCustodyMaxOvernights) {
    // Equal time-sharing, lines 18-21: each Line 17 at least the minimum, × months each, difference ÷ 12.
    const y = (x: number) => Math.max(x, minimum) * f.equalTimeMonthsEach;
    const equal = (y(l17A) - y(l17B)) / 12; // > 0: the paying parent pays
    if (nights.payer >= 365 - f.equalTimeOvernights) { // 182 / 183: the parents' time is equal
      amount = Math.round(equal);
      steps.push(money('Equal time-sharing support (lines 18-21)', equal));
    } else {
      // Extensive time-sharing, lines 22-29.
      const eqR = Math.round(equal); // Line 24 = Line 21, rounded
      const diff = eqR >= 0 ? l17A - eqR : l17A + Math.abs(eqR);
      const rate = diff / f.extensiveAdjustmentDivisor;
      amount = Math.round(l17A - rate * (nights.payer - f.soleCustodyMaxOvernights));
      steps.push(money(`Extensive time-sharing: credit per overnight above ${f.soleCustodyMaxOvernights}`, rate));
    }
    notes.push('shared-applied');
  }
  steps.push(money('Paying parent’s monthly support (Line 17)', l17A));
  if (amount <= minimum && !notes.includes('shared-applied')) notes.push('below-min');
  if (a.extended || b.extended) steps.push(text('Net income', 'extended beyond the Table of Incomes at its last marginal rate'));
  let monthly = amount, reverse = 0;
  if (monthly < 0) { reverse = -monthly; monthly = 0; notes.push('reverse'); }
  return { monthly, reverse, basicMonthly: calc, payerShare: pA / 100, steps, notes };
}
