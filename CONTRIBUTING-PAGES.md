# Écrire une page du site « family law calculators by state »

Notice pour les agents qui écrivent ou étoffent une page. À lire en entier avant d'écrire, avec
`~/Documents/GitHub/RECETTE-SITE.md` (§0, §6, §6.5, §7, §9, §9.3, §11, §17.4, §21, §26).

Le site : cinq calculateurs pour les 50 États et DC — **child support** (barème ou formule officielle de
chaque État), **alimony** (formules d'État qui existent), **divorce cost** (frais de greffe officiels),
**probate** (délais, petites successions, barèmes légaux d'honoraires), **workers' comp** (taux, maximum et
minimum hebdomadaires 2026). **Anglais américain seul**, sous `/en/`. Dollars, `$` devant, virgule des milliers.
Éditeur : la société **Radif Partners** (jamais un nom de personne, jamais de photo, ni INSEAD, ni Mines, ni
LinkedIn). Aucun lien vers un autre site du portefeuille (`_trame/domaines-ovh.txt`), jamais « taxineo ».

## Les fichiers d'une page

| Page | Fichier de prose | Données (ne pas modifier) | Route |
|---|---|---|---|
| Page d'État d'un sujet | `src/content/states/<topic>/<slug>.ts` (`defineStatePage`) | `src/data/cs|wc|alimony/<slug>.json`, `src/data/divorce.json`, `src/data/probate.json` | `/en/<topic>/<slug>/` |
| Pilier d'un sujet, guide | `src/content/pages/<id>.ts` (`definePage`) | idem | `/en/<slug>/` |

`<topic>` ∈ `child-support`, `alimony`, `divorce-cost`, `probate`, `workers-comp`. L'id d'une page d'État est
`<topic>:<slug>` (ex. `child-support:texas`) ; celui d'un pilier est le topic (`child-support`).

Le composant de page affiche **seul**, depuis les données : les chiffres clés en tête, le calculateur verrouillé
sur l'État, puis, après la prose, la règle officielle complète (tableau, extrait du barème, texte de la règle,
faits, sources). **La prose ne répète pas ces blocs** : elle explique ce qui est singulier dans l'État et fait
un ou deux calculs d'exemple avec le kit. Ordre affiché : chiffres clés → `resume` (replié) → calculateur →
`body` → règles générées → FAQ → pages liées → sources.

### Champs d'une page d'État (`defineStatePage`)

| Champ | Règle |
|---|---|
| `topic`, `slug` | = dossier et nom du fichier. |
| `title` | 50 à 60 caractères, contient 2026, **commence par le nom de l'État** puis le terme-clé : « Texas Child Support Calculator 2026: 20% of Net Resources ». Pas de tiret cadratin. Unique. |
| `description` | 150 à 160 caractères, contient 2026 et au moins un chiffre calculé depuis les données. Unique. |
| `intro` | une phrase. |
| `resume` | **UN** paragraphe de 120 mots ou plus (viser 130 à 170) : la réponse à la requête de la page, chiffres compris. Affiché replié : la **première phrase porte le message**. |
| `body(h)` | HTML, **≥ 300 mots** de prose hors tableaux (viser 350 à 500), écrit pour cet État seulement : ce qui y est singulier (formule, seuils, règles de temps de garde, réforme datée, juridiction, organisme), un exemple chiffré calculé avec le kit, l'erreur fréquente ou le cas limite. Optionnel : un mini-simulateur `${h.mini('kind', arg)}`. Deux ou trois `<h2>`/`<h3>` propres à la page. |
| `faqs` | 3 à 5 vraies questions **qui contiennent le nom de l'État**, réponses de **45 à 85 mots** (le test compte 42-88), uniques sur tout le site. |
| `related` | 3 à 6 ids : le même sujet dans des États voisins (`child-support:oklahoma`), les autres sujets du même État (`workers-comp:texas`) s'ils existent, le pilier (`child-support`), un guide. |

## La règle des chiffres (non négociable, RECETTE §17.4 point 7)

Aucun taux, seuil, montant ou date qui existe dans les données n'est tapé en dur : il se lit ou se calcule.

```ts
import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, wc, wcCalc, wcWeekly, wcWageAtMax, dv, pb, pbCalc, al, alCalc, usd, usdx, pct, num, day } from '../../../lib/kit';
const d = cs('texas');
const ex = csCalc('texas', 6000, 0, 2);          // payeur 6 000 $/mois, autre parent 0, 2 enfants
title: `Texas Child Support Calculator 2026: ${pct(d.percent!.byChildren[0])} for One Child`
`a parent with ${usd(6000)} of monthly net resources and two children pays ${usd(ex.monthly)} a month`
```

Une hypothèse d'exemple (« a parent earning $6,000 », « 30 days off ») peut s'écrire `usd(6000)`. Un chiffre qui
n'existe que dans un texte des données (ex. `d.sharedText`) peut être cité tel qu'écrit là. Un chiffre absent des
données **ne s'écrit pas** — sauf s'il vient d'une source officielle que vous lisez vous-même (WebFetch) : dans ce
cas, citez-la avec `h.ext(url, texte)` dans le corps, et signalez-le dans votre compte rendu.

### Le kit (`src/lib/kit.ts`) et les helpers `h`

- Child support : `cs(slug)` (données : `model`, `period`, `percent`, `schedule`, `shared`, `incomeLabel`,
  `modelText`, `sharedText`, `addOnsText`, `lowIncomeText`, `emancipation`, `facts`, `effective`…),
  `csCalc(slug, payeur, autre, enfants, { payerOvernights, childcare, health, healthBy })` → `{ monthly, reverse, basicMonthly, payerShare, steps, notes }` (montants **mensuels**, dans la base de revenu de l'État : `incomeLabel`).
- Workers' comp : `wc(slug)` (`ttd.rate`, `ttd.max`, `ttd.min`, `ttd.basis`, `ttd.effective`, `waiting.days`,
  `waiting.retroactiveAfterDays`, `ttdDuration.maxWeeks`, `agency.name`, `facts`…), `wcWeekly(slug, salaireHebdo)`,
  `wcCalc(slug, salaireHebdo, joursArrêt)` → `{ weekly, total, paidDays, unpaidDays, bound }`, `wcWageAtMax(slug)`.
- Alimony : `al(slug)`, `alCalc(slug, { payer, payee, years, children, childSupport })` → `{ monthly, low, high, durationMonths, durationMinMonths }`.
- Divorce : `dv(slug)` (`filingFee`, `responseFee`, `feeScope`, `residency.text`, `waitingPeriod.days`, `waiver`…), `dvCalc(slug, {…})`.
- Probate : `pb(slug)` (`creditorClaims.months`, `smallEstate.limit`, `filingFee`, `personalRepFee`, `attorneyFee`…), `pbFeesOf(slug)`, `pbCalc(slug, valeur)` → `{ total, lines }`.
- Formats : `usd(n)` (sans cents), `usdx(n)` (cents si le chiffre officiel en a : `$1,764.11`), `pct(20)` → « 20% », `num`, `day(iso)` → « January 1, 2026 », `listOf([...])`.
- Dans `body(h)` : tout le kit via `h.`, plus `h.a(id, texte)` (lien interne ; un id inconnu fait échouer le test),
  `h.table(entêtes, lignes, légende, alignements)`, `h.ext(url, texte)` (lien officiel), `h.box(titre, html)`,
  `h.mini(kind, arg)`, `h.src(clé)` (sources fédérales de `params-2026.json`).

## Ton et langue

- **Anglais américain** ; termes locaux exacts (« noncustodial parent », « obligor », « parenting time »,
  « net resources » au Texas, « CSSA » à New York, « maintenance » à New York/Illinois/Colorado, « TTD », « AWW »…).
- Voix humaine, phrases de longueur variable, **le chiffre d'abord**. Interdits (le test les refuse) : tiret
  cadratin « — », « it's important to note », « dive into », « delve », « whether you're… », « navigate the »,
  « Moreover », « Additionally », « Furthermore ». Pas de triplets en série, pas de conclusion qui résume, pas d'émoji.
- **Local réel** : organismes (Office of the Attorney General Child Support Division, DCSS, Judicial Council,
  Division of Workers' Compensation…), textes (Family Code § 154.125…), comtés, réformes datées tels qu'ils
  figurent dans les données.
- **Honnêteté** : un chiffre 2026 non publié se dit (« the 2026 figure was not published when we checked on … ;
  the calculator uses the figure effective … »). Jamais d'avis juridique : « an estimate », « the court decides ».
- **Unicité** (§6) : `check-unique` compare toutes les pages, chiffres neutralisés, seuil 30 %, fenêtre des
  12 000 premiers caractères. Écrire ce qui n'appartient qu'à l'État, avec **un vocabulaire propre** ; aucune
  tournure reprise d'une autre page ni d'un autre site du portefeuille (`check-portefeuille`). Ouvrir le `body`
  sur ce que l'État a de plus rare, pas sur ce que tous partagent.

## Contrôles (à lancer avant de rendre la main)

```bash
cd ~/Documents/GitHub/a-publier/domaine-a-choisir/us-family-law-calculators
PAGE_FILES=child-support:texas,child-support:ohio npx vitest run tests/pages.test.ts   # vos pages
```

Puis, une fois toutes les pages écrites (l'orchestrateur le fait) : `npm run build`, `check-unique`, `check-seo`,
`check-trame`, `check-portefeuille`.

## Ce qu'on ne fait pas

- Ne pas toucher au cœur (`src/lib`, `src/components`, `src/data`, `scripts`) : un besoin va dans le compte rendu.
- Ne pas toucher à `_trame`, à la RECETTE, ni à un autre site. Pas de git, pas de dépôt, pas de DNS.
