/**
 * Temporary total disability (TTD) benefit: the state's replacement rate applied to the average
 * weekly wage (or to spendable / after-tax weekly earnings in the states that use them), bounded by
 * the state's weekly maximum and minimum for the injury year. Data: src/data/wc/<slug>.json.
 */
export interface WCData {
  slug: string; name: string; abbr: string; verified: string;
  agency: { name: string; url: string };
  ttd: {
    rate: number;
    /** 'gross' = gross average weekly wage; 'spendable' / 'after-tax' = the state's net wage concept. */
    basis: 'gross' | 'spendable' | 'after-tax' | 'monthly';
    basisLabel: string;
    rateText: string;
    max: number | null;
    min: number | null;
    /** Below the minimum: 'actual-wage-if-lower' (the wage itself), 'pct-of-wage-if-lower' (minPct % of the wage), 'fixed', 'none'. */
    minRule: 'actual-wage-if-lower' | 'pct-of-wage-if-lower' | 'fixed' | 'none';
    minPct?: number | null;
    effective: string;
    periodLabel: string;
    url: string;
  };
  waiting: { days: number | null; retroactiveAfterDays: number | null; text: string; url: string };
  ttdDuration: { maxWeeks: number | null; text: string; url: string };
}
export interface WCInput {
  /** Weekly wage in the basis of the state (gross AWW, or spendable earnings). */
  wage: number;
  /** Expected days off work. */
  daysOff: number;
}
export interface WCResult {
  weekly: number;
  /** Rate × wage before the max/min. */
  raw: number;
  bound: 'max' | 'min' | 'wage' | null;
  monthly: number;
  paidDays: number;
  unpaidDays: number;
  total: number;
  weeksCapped: boolean;
}
/** Weekly TTD benefit for a weekly wage. */
export function weeklyBenefit(d: WCData, wage: number): { weekly: number; raw: number; bound: WCResult['bound'] } {
  const raw = (Math.max(0, wage) * d.ttd.rate) / 100;
  const { max, min, minRule } = d.ttd;
  if (max != null && raw > max) return { weekly: max, raw, bound: 'max' };
  if (min != null && raw < min && minRule !== 'none') {
    if (minRule === 'actual-wage-if-lower' && wage < min) return { weekly: Math.max(0, wage), raw, bound: 'wage' };
    if (minRule === 'pct-of-wage-if-lower' && d.ttd.minPct != null && (wage * d.ttd.minPct) / 100 < min) return { weekly: Math.max(raw, (wage * d.ttd.minPct) / 100), raw, bound: 'wage' };
    return { weekly: min, raw, bound: 'min' };
  }
  return { weekly: raw, raw, bound: null };
}
export function workersComp(d: WCData, inp: WCInput): WCResult {
  const { weekly, raw, bound } = weeklyBenefit(d, inp.wage);
  const days = Math.max(0, Math.round(inp.daysOff));
  const wait = d.waiting.days ?? 0;
  const retro = d.waiting.retroactiveAfterDays;
  const unpaid = retro != null && days > retro ? 0 : Math.min(days, wait);
  let paidDays = days - unpaid;
  let capped = false;
  if (d.ttdDuration.maxWeeks != null && paidDays > d.ttdDuration.maxWeeks * 7) { paidDays = d.ttdDuration.maxWeeks * 7; capped = true; }
  return { weekly, raw, bound, monthly: (weekly * 52) / 12, paidDays, unpaidDays: unpaid, total: (weekly * paidDays) / 7, weeksCapped: capped };
}
