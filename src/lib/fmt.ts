/** Formatters with no dependency on routes (safe from page files, minis and the engines). */
import { formatMoney, formatNumber } from './format';
/** $1,234 (no cents by default, RECETTE §4.1). Official amounts with cents: usd(x, 2). */
export const usd = (n: number, d = 0) => formatMoney(n, d);
/** A rate as the statute writes it, in percent: 20 → "20%", 33.33 → "33.33%", 66.67 → "66.67%". */
export const pct = (p: number) => `${formatNumber(p, Math.min(3, String(p).split('.')[1]?.length ?? 0))}%`;
export const num = (n: number, d = 0) => formatNumber(n, d);
/** "August 7, 2026" from an ISO date. */
export const day = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
/** "A, B and C". */
export const listOf = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
/** Exact amount: cents only when the official figure has cents ($1,764.11 but $435). */
export const usdx = (n: number) => usd(n, Number.isInteger(n) ? 0 : 2);
