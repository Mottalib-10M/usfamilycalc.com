/**
 * States whose guideline needs more than the generic engine (a formula, a low-income table, a
 * parenting-time formula, a table with per-child or age columns…): one file per state,
 * `src/lib/engine/cs/<slug>.ts`, default export `(d, inp) => CSResult`. Each reads its parameters
 * from the state's data file (`formula`, `schedule`, `extra`, `percent`, `lowIncome`), never from
 * constants typed in the code. Reference cases: tests/engine.test.ts (research/cs/<slug>.json testCases).
 */
import type { CSData, CSInput, CSResult } from './child-support';

type Model = (d: CSData, inp: CSInput) => CSResult;
const mods = import.meta.glob<{ default: Model }>(['./cs/*.ts', '!./cs/_*.ts'], { eager: true });
const MODELS: Record<string, Model> = Object.fromEntries(Object.entries(mods).map(([f, m]) => [f.split('/').pop()!.replace(/\.ts$/, ''), m.default]));
export const customModel = (slug: string): Model | undefined => MODELS[slug];
