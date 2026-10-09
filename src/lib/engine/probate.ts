/**
 * Probate: statutory fee schedules (personal representative commissions and attorney fees) and the
 * timeline floor set by the creditor-claim period. Data: src/data/probate.json (51 states) and
 * src/data/probate-fees/<slug>.json (states whose statute sets a percentage or dollar schedule).
 */
export interface PBState {
  slug: string; name: string; abbr: string; verified: string;
  creditorClaims: { months: number | null; text: string; url: string };
  earliestClose?: { text: string; url: string } | null;
  smallEstate: { limit: number | null; text: string; url: string };
  simplified?: { text: string; url: string } | null;
  filingFee?: { amount: number | null; text: string; url: string } | null;
  personalRepFee: { type: string; text: string; url: string };
  attorneyFee: { type: string; text: string; url: string };
}
/** A marginal schedule: pct applies to the slice of the base up to `upTo` (null = no upper bound). */
export interface Tier { upTo: number | null; pct: number }
/** A dollar schedule: flat fee for a base up to `upTo`, then (optionally) a percentage of the base. */
export interface FixedBracket { upTo: number | null; fee?: number | null; pct?: number | null; pctOf?: 'total' | 'excess'; over?: number | null }
export interface FeeSchedule { who: string; /** Applies to other assets than the probate estate: shown, not added to the total. */ otherBase?: boolean; tiers?: Tier[] | null; fixed?: FixedBracket[] | null; text: string; url: string; capNote?: string | null }
export interface PBFees { slug: string; base: string; schedules: FeeSchedule[]; testCases?: unknown[] }
export interface PBLine { label: string; value: number; who: string; otherBase?: boolean }
export interface PBResult { total: number; lines: PBLine[]; filingFee: number | null; claimMonths: number | null; belowSmallEstate: boolean }

export function tiered(base: number, tiers: Tier[]): number {
  let prev = 0, total = 0;
  for (const t of tiers) {
    const top = t.upTo ?? Infinity;
    if (base > prev) total += ((Math.min(base, top) - prev) * t.pct) / 100;
    prev = top;
    if (base <= top) break;
  }
  return total;
}
export function fixedSchedule(base: number, brackets: FixedBracket[]): number {
  for (const b of brackets) {
    if (b.upTo == null || base <= b.upTo) {
      const fee = b.fee ?? 0;
      if (b.pct == null) return fee;
      const over = b.over ?? 0;
      return fee + ((b.pctOf === 'excess' ? Math.max(0, base - over) : base) * b.pct) / 100;
    }
  }
  return 0;
}
export function scheduleFee(base: number, s: FeeSchedule): number {
  if (s.tiers?.length) return tiered(base, s.tiers);
  if (s.fixed?.length) return fixedSchedule(base, s.fixed);
  return 0;
}
export function probateFees(d: PBState, f: PBFees | null, estate: number): PBResult {
  const lines: PBLine[] = (f?.schedules ?? []).filter((s) => !s.otherBase).map((s) => ({ label: s.who, value: scheduleFee(Math.max(0, estate), s), who: s.who }));
  const filing = d.filingFee?.amount ?? null;
  const total = lines.reduce((a, l) => a + l.value, 0) + (filing ?? 0);
  return { total, lines, filingFee: filing, claimMonths: d.creditorClaims.months, belowSmallEstate: d.smallEstate.limit != null && estate <= d.smallEstate.limit };
}
