import { route, type Locale } from './routes';
import { PAGES, pageById, statePageById, statePagesOf } from '../lib/pages';
import { TOPICS, topicInfo, stateTopicId, type Topic } from '../lib/topics';
import { stateRef } from '../data/states';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<string, string> = { home: 'Family law calculators', method: 'How we calculate', about: 'About', widget: 'Embed a calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' };
export const label = (id: string, _lang?: Locale) => {
  if (CORE[id]) return CORE[id];
  const p = pageById(id); if (p) return p.nav;
  const s = statePageById(id); if (s) return topicInfo(s.topic).short(stateRef(s.slug).name);
  return id;
};
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id) });
/** A subject's menu: its pillar, its guides, then its most-requested states. */
const TOP = ['california', 'texas', 'florida', 'new-york', 'illinois', 'pennsylvania', 'ohio', 'georgia', 'north-carolina', 'michigan'];
export const inTopic = (t: Topic, lang: Locale, withStates = true): NavLink[] => {
  const pages = PAGES.filter((p) => p.topic === t).map((p) => link(p.id, lang));
  const states = withStates ? statePagesOf(t).filter((s) => TOP.includes(s.slug)).sort((a, b) => TOP.indexOf(a.slug) - TOP.indexOf(b.slug)).slice(0, 6).map((s) => link(stateTopicId(t, s.slug), lang)) : [];
  return [...pages, ...states];
};
export function navCategories(lang: Locale): NavCategory[] {
  return TOPICS.map((t) => ({ label: t.label, links: inTopic(t.id, lang) })).filter((c) => c.links.length);
}
export const navDirect = (lang: Locale): NavLink[] => [link('method', lang)];
export const footerColumns = (lang: Locale): NavCategory[] => [
  ...TOPICS.map((t) => ({ label: t.label, links: inTopic(t.id, lang, false) })).filter((c) => c.links.length),
  { label: 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) },
];
/** Child support in the ten most populous states, in the footer row. Every state page is two clicks
 *  from anywhere through its subject pillar (RECETTE §18.2). */
export const popularLinks = (lang: Locale): NavLink[] => TOP.map((s) => stateTopicId('child-support', s)).filter((id) => statePageById(id)).map((id) => link(id, lang));
