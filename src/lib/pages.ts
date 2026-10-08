/** Registry: every file of `src/content/pages/` and `src/content/states/<topic>/` is loaded here. */
import type { PageDef, StateTopicDef } from './page-types';
import { TOPICS, stateTopicId, type Topic } from './topics';
import { STATE_LIST } from '../data/states';

const mods = import.meta.glob<{ default: PageDef }>(['../content/pages/*.ts', '!../content/pages/_*.ts'], { eager: true });
export const PAGES: PageDef[] = Object.entries(mods)
  .map(([file, m]) => {
    const g = m.default;
    const base = file.split('/').pop()!.replace(/\.ts$/, '');
    if (g.id !== base) throw new Error(`${file}: id "${g.id}" differs from the file name`);
    return g;
  })
  .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
export const pageById = (id: string) => PAGES.find((p) => p.id === id);

const smods = import.meta.glob<{ default: StateTopicDef }>('../content/states/*/*.ts', { eager: true });
export const STATE_PAGES: StateTopicDef[] = Object.entries(smods)
  .map(([file, m]) => {
    const g = m.default;
    const parts = file.split('/');
    const base = parts.pop()!.replace(/\.ts$/, '');
    const dir = parts.pop()!;
    if (g.slug !== base) throw new Error(`${file}: slug "${g.slug}" differs from the file name`);
    if (g.topic !== dir) throw new Error(`${file}: topic "${g.topic}" differs from the folder`);
    if (!TOPICS.some((t) => t.id === g.topic)) throw new Error(`${file}: unknown topic`);
    if (!STATE_LIST.some((s) => s.slug === g.slug)) throw new Error(`${file}: unknown state`);
    return g;
  })
  .sort((a, b) => a.topic.localeCompare(b.topic) || a.slug.localeCompare(b.slug));
export const statePage = (topic: Topic, slug: string) => STATE_PAGES.find((p) => p.topic === topic && p.slug === slug);
export const statePagesOf = (topic: Topic) => STATE_PAGES.filter((p) => p.topic === topic);
export const statePageById = (id: string) => STATE_PAGES.find((p) => stateTopicId(p.topic, p.slug) === id);
