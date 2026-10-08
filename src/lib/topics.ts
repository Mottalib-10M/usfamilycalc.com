/**
 * The five subjects of the site. Each has a pillar page at /en/<base>/ (a PageDef whose id is the
 * topic id) and state pages at /en/<base>/<state>/ (a StateTopicDef, id "<topic>:<state>").
 */
export type Topic = 'child-support' | 'alimony' | 'divorce-cost' | 'probate' | 'workers-comp';
export interface TopicInfo {
  id: Topic;
  /** URL segment of the pillar and parent of the state pages. */
  base: string;
  /** Menu and breadcrumb label. */
  label: string;
  /** H1 of a state page, from the state name. */
  h1: (state: string) => string;
  /** One line under a link card to a state page. */
  card: (state: string) => string;
  /** Short name of the state page in lists and breadcrumbs. */
  short: (state: string) => string;
}
export const TOPICS: TopicInfo[] = [
  { id: 'child-support', base: 'child-support', label: 'Child support', h1: (s) => `${s} child support calculator`, card: (s) => `${s} guideline, worksheet and 2026 amounts`, short: (s) => `${s} child support` },
  { id: 'alimony', base: 'alimony', label: 'Alimony', h1: (s) => `${s} alimony and spousal support calculator`, card: (s) => `The ${s} formula, cap and duration rule`, short: (s) => `${s} alimony` },
  { id: 'divorce-cost', base: 'divorce-cost', label: 'Divorce cost', h1: (s) => `Cost of divorce in ${s}`, card: (s) => `${s} court fees, waiting period and total cost`, short: (s) => `${s} divorce cost` },
  { id: 'probate', base: 'probate', label: 'Probate', h1: (s) => `${s} probate: fees and how long it takes`, card: (s) => `${s} probate fees, deadlines and small estates`, short: (s) => `${s} probate` },
  { id: 'workers-comp', base: 'workers-comp', label: "Workers' comp", h1: (s) => `${s} workers' comp calculator`, card: (s) => `${s} weekly benefit, 2026 maximum and minimum`, short: (s) => `${s} workers' comp` },
];
export const topicInfo = (id: Topic): TopicInfo => TOPICS.find((t) => t.id === id)!;
export const stateTopicId = (topic: Topic, slug: string) => `${topic}:${slug}`;
