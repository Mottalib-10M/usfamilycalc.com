/** llms.txt (RECETTE §21), generated at build from the page registry: always in sync with the site. */
import { PAGES, STATE_PAGES } from '../lib/pages';
import { SITE_URL, LAST_UPDATED, SITE_NAMES } from '../data/site-config';
import { route } from '../i18n/routes';
import { TOPICS, topicInfo, stateTopicId } from '../lib/topics';
import { stateRef } from '../data/states';
export function GET() {
  const lines = [
    `# ${SITE_NAMES.en}`,
    '',
    `> Child support, alimony, divorce cost, probate and workers' compensation calculators for each US state. Each state page applies that state's own child support guideline (schedule, percentage or formula), spousal support formula or cap, court filing fees, probate deadlines and fee statute, or 2026 workers' comp weekly maximum and minimum, read on the state's code, courts or agency and dated. Calculations run in the browser. Estimates, not legal advice. Published by Radif Partners. Last updated ${LAST_UPDATED}.`,
    '',
    '## Calculators and guides',
    `- [Home](${SITE_URL}${route('home', 'en')})`,
    ...PAGES.map((p) => `- [${p.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.card}`),
    ...TOPICS.flatMap((t) => {
      const xs = STATE_PAGES.filter((s) => s.topic === t.id);
      return xs.length ? ['', `## ${t.label} by state`, ...xs.map((s) => `- [${topicInfo(t.id).short(stateRef(s.slug).name)}](${SITE_URL}${route(stateTopicId(t.id, s.slug), 'en')}): ${s.intro}`)] : [];
    }),
    '',
    '## About',
    `- [How we calculate](${SITE_URL}${route('method', 'en')})`,
    `- [About](${SITE_URL}${route('about', 'en')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
