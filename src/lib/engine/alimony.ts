/**
 * Alimony / spousal support / maintenance: one model file per state that publishes a formula, a cap
 * or a duration rule (`src/lib/engine/al/<slug>.ts`, default export `(d, inp) => ALResult`), reading
 * its parameters from src/data/alimony/<slug>.json (built from research/alimony by scripts/build-data.py).
 */
export interface ALDuration { marriageYearsMin?: number; marriageYearsMax?: number | null; [k: string]: unknown }
export interface ALData {
  slug: string; name: string; abbr: string; verified: string;
  /** What the rule covers (temporary vs final, conditions). */
  scope: string;
  incomeBasis: 'gross' | 'net';
  formulaText: string; durationText: string;
  params: Record<string, any>;
  durationTable: ALDuration[] | null;
}
/** Inputs, MONTHLY, in the income basis of the state (incomeBasis). */
export interface ALInput { payer: number; payee: number; years: number; children: boolean; childSupport?: number }
export interface ALResult {
  monthly: number;
  /** A range when the state gives one (Massachusetts 30–35%, Arizona…). */
  low?: number; high?: number;
  /** Longest and shortest duration under the rule, in months; null = indefinite or set by the judge. */
  durationMonths?: number | null; durationMinMonths?: number | null;
  steps: Array<{ label: string; value: string | number; kind?: 'money' | 'pct' | 'text' }>;
  /** Sentences shown under the result (conditions not met, caps applied…). */
  notes: string[];
}
type Model = (d: ALData, inp: ALInput) => ALResult;
const mods = import.meta.glob<{ default: Model }>(['./al/*.ts', '!./al/_*.ts'], { eager: true });
const MODELS: Record<string, Model> = Object.fromEntries(Object.entries(mods).map(([f, m]) => [f.split('/').pop()!.replace(/\.ts$/, ''), m.default]));
export const hasAlimonyModel = (slug: string) => !!MODELS[slug];
export function alimony(d: ALData, inp: ALInput): ALResult {
  const m = MODELS[d.slug];
  if (!m) return { monthly: 0, steps: [], notes: [`No formula is modeled for ${d.name}.`] };
  return m(d, inp);
}
