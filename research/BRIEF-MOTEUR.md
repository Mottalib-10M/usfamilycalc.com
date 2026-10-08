# Brief: child support engine of a state

Site folder: `~/Documents/GitHub/a-publier/domaine-a-choisir/us-family-law-calculators/`.

The calculator applies each state's own guideline. Your research files (`research/cs/<slug>.json`,
`research/cs-schedules/<slug>.json`) are normalized by `python3 scripts/build-data.py cs` into
`src/data/cs/<slug>.json` (type `CSData` in `src/lib/engine/child-support.ts`):

- `period`, `model`, `maxChildren`, `incomeBasis`;
- `schedule`: `{ rows, lookup, minIncome, maxIncome, aboveMax: { method, pct }, columnFor }` — `rows` are
  **exactly** your parsed rows (numbers converted only); `extra`: every other key of your schedule file
  (low-income tables, bands, parenting-time tables, `columns`…);
- `percent`: `{ byChildren, tiers, cap, lowIncome }`; `formula`: your `formula.params` object;
- `shared`: `{ method: 'cross-credit' | 'percent-reduction' | 'none', thresholdOvernights, multiplier, reductionTable }`;
- `addOns: { childcare: boolean, health: boolean }` (default both true), `lowIncome`, `testCases` (yours).

## Generic engine (no code needed when it fits)

`childSupport(d, inp)` in `src/lib/engine/child-support.ts`, for `income-shares`:
combined monthly income → converted to the table's period → `scheduleLookup` (rows `[income, c1..cN]`,
`lookup` floor / nearest / interpolate / bracket, `aboveMax` percent-of-excess / cap / discretion / extrapolate)
→ × payer's income share; shared parenting `cross-credit` (overnights ≥ threshold: basic × multiplier, each
parent's share weighted by the other parent's overnights, netted) or `percent-reduction` table;
add-ons (child care + children's health insurance) shared by income, minus the premium if the payer pays it.
`percent-obligor` / `percent-combined`: percentage (or marginal `tiers`) with a `cap`.

## When the state needs more: one model file

Write `src/lib/engine/cs/<slug>.ts` with a default export `(d: CSData, inp: CSInput) => CSResult`.
Model it on `src/lib/engine/cs/new-york.ts` and `california.ts`; helpers in `cs/_util.ts`; you may import
`scheduleLookup`, `percentAmount`, `toPeriod`, `toMonthly` from `../child-support`.

- `inp`: **monthly** incomes in the state's income basis (`payer` = the parent who pays, `other`), `children`,
  `payerOvernights` (0–365 a year with the paying parent), monthly `childcare`, monthly `health` (children's
  premium) and `healthBy: 'payer' | 'other'`.
- Return **monthly** amounts: `monthly` (what the payer owes, ≥ 0), `reverse` (if the rule makes the *other*
  parent owe, the amount, else 0), `basicMonthly` (combined basic obligation, monthly), `payerShare`,
  `steps` (3 to 7 lines shown under the result: `{ label, value, kind: 'money' | 'pct' | 'text' }`, money
  monthly), `notes` (codes: `below-min`, `above-max-pct`, `above-max-cap`, `above-max-discretion`, `above-cap`,
  `shared-applied`, `reverse`, `self-support-reserve`, `children-capped`).
- **Every number comes from `d`** (schedule rows, `extra`, `formula`, `percent`…). If a parameter is missing
  from the data, add it to YOUR research file (with its official URL) and rerun `python3 scripts/build-data.py cs`;
  never type a statutory figure in the code.
- Apply the state's real rules that change the amount and that the inputs allow: low-income table or
  self-support reserve, parenting-time / shared custody formula, table above the top row, per-child or age
  columns (use the youngest-child column by default and say so in a step label), minimum order.
- What the inputs cannot express (multiple families, imputed income, deviations) stays out; say so in `steps`
  or leave it to the page text.

## Tests (must pass)

`tests/engine.test.ts` runs every `testCases` entry of your research file through the engine:
inputs `incomeA` (payer) / `incomeB` / `children` / `overnightsA` are **in the period of the table**
(`d.period`), and the expected value is compared, in that period, to `monthly` (or `reverse`), or to
`basicMonthly` when `what` mentions "basic", "schedule" or "table" without "share/payer/obligor/owes/pays".
Tolerance 1 %. Fix the test case **only** if it was itself wrong (say why in its `source`); add
`"skipEngine": true` only for a case the inputs cannot express (e.g. multiple families), with the reason.
Add at least one case per rule you implement (low income, shared parenting, above the table).

```bash
cd ~/Documents/GitHub/a-publier/domaine-a-choisir/us-family-law-calculators
python3 scripts/build-data.py cs
npx vitest run tests/engine.test.ts -t "<slug>"
```

**Never use a browser or Chrome tool** (curl / WebFetch / pypdf only). Do not edit `child-support.ts`, `cs-custom.ts`, the other states' files, the pages or anything outside
`src/lib/engine/cs/<your slugs>.ts` and your own research files. If the generic engine has a bug, describe it
in your reply instead of fixing it. No git.
