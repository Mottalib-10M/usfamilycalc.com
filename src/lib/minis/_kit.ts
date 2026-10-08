/**
 * Shared tools for the mini-simulators (ignored by the registry: "_" prefix).
 * RULE: a mini never imports the eager data loaders (every state file would ship to the browser).
 * State figures arrive through `arg` (JSON written by the page from the data with the kit).
 */
import { formatMoney, formatNumber } from '../format';
export { pct } from '../fmt';
export const usd = (x: number, d = 0) => formatMoney(x, d);
export const num = (x: number, d = 0) => formatNumber(x, d);
export const yesNo = [{ value: '0', label: 'No' }, { value: '1', label: 'Yes' }];
export function parseArg<T>(arg: string | undefined, fallback: T): T {
  if (!arg) return fallback;
  try { return JSON.parse(arg) as T; } catch { return fallback; }
}
