/**
 * What a page file needs to write figures into its title, description, answer block, body and FAQ
 * without typing a single official number (RECETTE §17.4, point 7): the data, the engines, the formatters.
 *   import { cs, csCalc, usd } from '../../../lib/kit';
 *   title: `Texas Child Support Calculator 2026: ${pct(cs('texas').percent!.byChildren[0])} for One Child`
 * Server side only (eager loaders): never import this file from a component that ships to the browser.
 */
import { STATE_LIST, stateRef, type StateRef } from '../data/states';
import { childSupport, toMonthly, type CSData, type CSInput, type CSResult } from './engine/child-support';
import { workersComp, weeklyBenefit, type WCData, type WCResult } from './engine/workers-comp';
import { alimony, type ALData, type ALInput, type ALResult } from './engine/alimony';
import { divorceCost, type DVState, type DVInput, type DVResult } from './engine/divorce';
import { probateFees, type PBState, type PBFees, type PBResult } from './engine/probate';
import { usd, usdx, pct, num, day, listOf } from './fmt';
import P from '../data/params-2026.json';

export interface Fact { text: string; url: string }
export interface Src { name: string; url: string }
/** Texts and sources that come with each state's data file (rendered by the page, cited by the prose). */
export interface Meta { facts: Fact[]; sources: Src[]; uncertain?: string[] }

const load = <T>(g: Record<string, { default: T }>) => Object.fromEntries(Object.entries(g).map(([f, m]) => [f.split('/').pop()!.replace(/\.json$/, ''), m.default]));
const CS = load(import.meta.glob<{ default: CSData & CSText }>('../data/cs/*.json', { eager: true }));
const WC = load(import.meta.glob<{ default: WCData & WCText }>('../data/wc/*.json', { eager: true }));
const AL = load(import.meta.glob<{ default: ALData & Meta }>('../data/alimony/*.json', { eager: true }));
const PBF = load(import.meta.glob<{ default: PBFees }>('../data/probate-fees/*.json', { eager: true }));
const DVall = import.meta.glob<{ default: Array<DVState & Meta> }>('../data/divorce.json', { eager: true });
const PBall = import.meta.glob<{ default: Array<PBState & Meta> }>('../data/probate.json', { eager: true });
const DV: Array<DVState & Meta> = Object.values(DVall)[0]?.default ?? [];
const PB: Array<PBState & Meta> = Object.values(PBall)[0]?.default ?? [];

/** Child support texts (beside the engine fields). */
export interface CSText extends Meta {
  statute: Src; guidelinesUrl: string; officialCalculatorUrl?: string | null;
  incomeDefinition: string; modelText: string; sharedText: string; addOnsText: string; lowIncomeText: string;
  emancipation: Fact; scheduleText?: string | null; aboveMaxText?: string | null; effective?: string | null; testCases?: unknown[];
}
export interface WCText extends Meta { ppd: Fact; statute: Src }

const need = <T>(x: T | undefined, what: string): T => { if (x === undefined) throw new Error(`No data: ${what}`); return x; };
export const states = STATE_LIST;
export const st = (slug: string): StateRef => stateRef(slug);
export const cs = (slug: string) => need(CS[slug], `cs/${slug}`);
export const hasCs = (slug: string) => !!CS[slug];
export const csAll = () => STATE_LIST.filter((s) => CS[s.slug]).map((s) => CS[s.slug]);
/** Child support for a case; defaults: 1 child, no overnights, no add-ons. */
export const csCalc = (slug: string, payer: number, other: number, children = 1, extra: Partial<CSInput> = {}): CSResult =>
  childSupport(cs(slug), { payer, other, children, payerOvernights: 0, childcare: 0, health: 0, healthBy: 'other', ...extra });
export const wc = (slug: string) => need(WC[slug], `wc/${slug}`);
export const hasWc = (slug: string) => !!WC[slug];
export const wcAll = () => STATE_LIST.filter((s) => WC[s.slug]).map((s) => WC[s.slug]);
export const wcWeekly = (slug: string, wage: number) => weeklyBenefit(wc(slug), wage).weekly;
export const wcCalc = (slug: string, wage: number, daysOff: number): WCResult => workersComp(wc(slug), { wage, daysOff });
/** Weekly wage at which the state maximum is reached. */
export const wcWageAtMax = (slug: string) => { const d = wc(slug); return d.ttd.max != null ? (d.ttd.max * 100) / d.ttd.rate : null; };
export const al = (slug: string) => need(AL[slug], `alimony/${slug}`);
export const hasAl = (slug: string) => !!AL[slug];
export const alAll = () => STATE_LIST.filter((s) => AL[s.slug]).map((s) => AL[s.slug]);
export const alCalc = (slug: string, inp: Partial<ALInput> & { payer: number; payee: number }): ALResult => alimony(al(slug), { years: 10, children: false, ...inp });
export const dv = (slug: string) => need(DV.find((x) => x.slug === slug), `divorce/${slug}`);
export const dvAll = () => DV;
export const dvCalc = (slug: string, inp: Partial<DVInput> = {}): DVResult => divorceCost(dv(slug), inp);
export const pb = (slug: string) => need(PB.find((x) => x.slug === slug), `probate/${slug}`);
export const pbAll = () => PB;
export const pbFeesOf = (slug: string): PBFees | null => PBF[slug] ?? null;
export const pbCalc = (slug: string, estate: number): PBResult => probateFees(pb(slug), pbFeesOf(slug), estate);
export { P, usd, usdx, pct, num, day, listOf, toMonthly };
export type { StateRef };

export interface Kit {
  states: StateRef[]; st: typeof st;
  cs: typeof cs; hasCs: typeof hasCs; csAll: typeof csAll; csCalc: typeof csCalc;
  wc: typeof wc; hasWc: typeof hasWc; wcAll: typeof wcAll; wcWeekly: typeof wcWeekly; wcCalc: typeof wcCalc; wcWageAtMax: typeof wcWageAtMax;
  al: typeof al; hasAl: typeof hasAl; alAll: typeof alAll; alCalc: typeof alCalc;
  dv: typeof dv; dvAll: typeof dvAll; dvCalc: typeof dvCalc;
  pb: typeof pb; pbAll: typeof pbAll; pbFeesOf: typeof pbFeesOf; pbCalc: typeof pbCalc;
  usd: typeof usd; usdx: typeof usdx; pct: typeof pct; num: typeof num; day: typeof day; listOf: typeof listOf;
}
export const KIT: Kit = { states, st, cs, hasCs, csAll, csCalc, wc, hasWc, wcAll, wcWeekly, wcCalc, wcWageAtMax, al, hasAl, alAll, alCalc, dv, dvAll, dvCalc, pb, pbAll, pbFeesOf, pbCalc, usd, usdx, pct, num, day, listOf };
