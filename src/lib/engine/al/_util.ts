/** Shared helpers for the alimony models (files starting with _ are not models). */
export const n0 = (x: unknown) => { const v = Number(x); return Number.isFinite(v) && v > 0 ? v : 0; };
export const pos = (x: number) => (x > 0 ? x : 0);
export const months = (years: number) => Math.round(n0(years) * 12 * 100) / 100;
export const fmtMonths = (m: number) => `${Math.round(m * 10) / 10} months`;
/** Row whose [marriageYearsMin, marriageYearsMax) contains y (max null = open). */
export function rowFor<T extends { marriageYearsMin?: number; marriageYearsMax?: number | null }>(rows: T[], y: number, inclusiveMax = false): T | undefined {
  return rows.find((r) => y >= (r.marriageYearsMin ?? 0) && (r.marriageYearsMax == null || (inclusiveMax ? y <= r.marriageYearsMax : y < r.marriageYearsMax)));
}
/** Parses "1/3" or a number. */
export const frac = (v: unknown) => { if (typeof v === 'number') return v; const m = String(v).match(/^(\d+)\s*\/\s*(\d+)$/); return m ? Number(m[1]) / Number(m[2]) : Number(v); };
