/**
 * One page = ONE content file (CONTRIBUTING-PAGES.md):
 *  - a topic page (pillar of a subject, or guide): `src/content/pages/<id>.ts` (PageDef);
 *  - a state page of a subject: `src/content/states/<topic>/<slug>.ts` (StateTopicDef), whose official
 *    facts live in `src/data/<topic>/…` and are rendered by the page component, not by the prose.
 * Routes, menus, footer, sitemap, schemas and internal links read these files alone.
 */
import type { Topic } from './topics';
import type { Kit } from './kit';

export interface FAQ { q: string; a: string }

/** Writing tools passed to every body: links, formatters, tables, official links, and the data kit. */
export interface Helpers extends Kit {
  /** Internal link by page id ("child-support", "child-support:texas", "how-much-is-child-support"…). An unknown id fails the page test. */
  a: (id: string, text: string) => string;
  /** Link when the page exists, plain text otherwise (lists of states that grow over time). */
  aIf: (id: string, text: string) => string;
  /** Journal-style table; numbers are formatted, strings are inserted as HTML. */
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  /** Link to a general official source of params-2026.json (key) with optional text. */
  src: (key: string, text?: string) => string;
  /** Link to any official URL. */
  ext: (url: string, text: string) => string;
  /** Ruled box in the press style. */
  box: (title: string, html: string) => string;
  /** Inline mini-simulator placeholder: `<!--mini:kind|arg-->` rendered as an island. */
  mini: (kind: string, arg?: unknown) => string;
}

export type ToolKind = 'child-support' | 'alimony' | 'divorce-cost' | 'probate' | 'workers-comp';
export interface ToolProps { state?: string; lockState?: boolean }

export interface PageDef {
  id: string;
  /** Subject the page belongs to (menus), or 'guides' for cross-subject pages. */
  topic: Topic;
  kind: 'pillar' | 'guide';
  order: number;
  /** URL segment, lowercase and dashes, no year. A pillar's slug is its topic base. */
  slug: string;
  nav: string;
  card: string;
  /** 50 to 60 characters, key term first, 2026 included (RECETTE §11). */
  title: string;
  /** 150 to 160 characters, 2026 included. */
  description: string;
  h1: string;
  intro: string;
  /** ONE paragraph of 120 words or more, the direct answer with the figures (RECETTE §21). */
  resume: string;
  faqs: FAQ[];
  body: (h: Helpers) => string;
  /** Full calculator shown after the answer block (pillars). */
  tool?: ToolKind;
  toolProps?: ToolProps;
  /** Mini-simulator after the answer block (guides): `src/lib/minis/<kind>.ts`. */
  mini?: string;
  miniArg?: unknown;
  related: string[];
  /** Keys of params-2026.json > sources. */
  sources: string[];
  /** Official state pages cited by the page (taken from the data files). */
  extraSources?: Array<{ name: string; url: string }>;
}
export const definePage = (p: PageDef): PageDef => p;

export interface StateTopicDef {
  topic: Topic;
  /** = file name = state slug. */
  slug: string;
  /** 50–60 characters, starts with the state name and the key term, 2026 included. */
  title: string;
  /** 150–160 characters, 2026 included, at least one figure computed from the data. */
  description: string;
  /** One sentence under the H1. */
  intro: string;
  /** ONE paragraph of 120 words or more: the answer for this state, figures computed from the data. */
  resume: string;
  /** Prose written for this state only (HTML): what is singular here, a worked example computed with the kit. */
  body: (h: Helpers) => string;
  faqs: FAQ[];
  /** Ids of related pages: other subjects of the same state, neighbor states, guides. */
  related: string[];
}
export const defineStatePage = (s: StateTopicDef): StateTopicDef => s;
