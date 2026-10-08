/** Shared helpers for the per-state child support models (ignored by the registry: "_" prefix). */
import type { CSStep } from '../child-support';
export const n0 = (x: number) => Math.max(0, x);
export const plural = (n: number) => `${n} ${n === 1 ? 'child' : 'children'}`;
export const money = (label: string, value: number): CSStep => ({ label, value, kind: 'money' });
export const percent = (label: string, value: number): CSStep => ({ label, value, kind: 'pct' });
export const text = (label: string, value: string): CSStep => ({ label, value, kind: 'text' });
/** Overnights of each parent from the paying parent's overnights (0–365). */
export const nightsOf = (payerOvernights: number) => { const p = Math.max(0, Math.min(365, Math.round(payerOvernights))); return { payer: p, other: 365 - p }; };
