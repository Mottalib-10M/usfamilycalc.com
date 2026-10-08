# Research brief: official data for the US family-law calculators site

Site folder: `~/Documents/GitHub/a-publier/domaine-a-choisir/us-family-law-calculators/`
Everything you produce goes under `research/` of that folder. Today is 2026-10-08.

## Non-negotiable rules

1. **Official sources only.** State legislature/code sites (e.g. leginfo.legislature.ca.gov,
   statutes.capitol.texas.gov, flsenate.gov / leg.state.fl.us, nysenate.gov, ilga.gov, legis.state.pa.us,
   pacodeandbulletin.gov, codes.ohio.gov, legislature.mi.gov, ncleg.gov, law.lis.virginia.gov, azleg.gov…),
   state court sites (courts.ca.gov, nycourts.gov, flcourts.gov, nccourts.gov, njcourts.gov, mass.gov,
   courts.state.co.us…), state child support agencies (…gov), state workers' compensation agencies and
   departments of labor (…gov), the US DOL. **Never** a law firm blog, Nolo, FindLaw, Justia, Casetext,
   Avalara, a news site, Wikipedia or another calculator as the source of a number. You may use them only
   to find where the official text lives, then you read and cite the official page.
2. **Read every number yourself with WebFetch** (or download the official PDF with `curl -sL` into
   `research/raw/` and extract text with python `pypdf`, which is installed). Record the exact URL where
   you read it. If an official server blocks you, try another official URL for the same text (legislature
   vs. court vs. agency), then `https://web.archive.org/web/2026/<official url>`; say so in `uncertain`.
3. **2026 values.** If the 2026 figure is not published officially, take the latest official one, set the
   field `asOf` / `effective` to its real date and add a line to `uncertain` ("2026 value not published by
   <agency> as of 2026-10-08; latest official = <date>").
4. **Never invent, never round.** Copy figures exactly as published (cents included). Unknown = `null` +
   a line in `uncertain`.
5. Write valid JSON (UTF-8, no comments). One file per state unless told otherwise. Keep a replayable
   script in `research/scripts/` for any table you parse from a PDF/HTML (it re-downloads and re-parses).
**Never use a browser or Chrome tool** (curl / WebFetch / pypdf only). 6. Do not modify anything outside `research/`. Do not touch any other site or repo. No git commands.
7. Text fields (`text`, `rule`, `note`) are short factual English sentences (they will be rewritten by the
   site's writers, so precision matters more than style). Cite the section number in them.

## State list (slug, name, abbr)

alabama AL, alaska AK, arizona AZ, arkansas AR, california CA, colorado CO, connecticut CT, delaware DE,
district-of-columbia DC, florida FL, georgia GA, hawaii HI, idaho ID, illinois IL, indiana IN, iowa IA,
kansas KS, kentucky KY, louisiana LA, maine ME, maryland MD, massachusetts MA, michigan MI, minnesota MN,
mississippi MS, missouri MO, montana MT, nebraska NE, nevada NV, new-hampshire NH, new-jersey NJ,
new-mexico NM, new-york NY, north-carolina NC, north-dakota ND, ohio OH, oklahoma OK, oregon OR,
pennsylvania PA, rhode-island RI, south-carolina SC, south-dakota SD, tennessee TN, texas TX, utah UT,
vermont VT, virginia VA, washington WA, west-virginia WV, wisconsin WI, wyoming WY

## Schemas

### Child support — `research/cs/<slug>.json` (+ `research/cs-schedules/<slug>.json` when the state has a table)

```json
{
  "slug": "florida", "name": "Florida", "abbr": "FL", "verified": "2026-10-08",
  "model": "income-shares | percent-obligor | percent-combined | ca-formula | melson | bands-combined | other",
  "modelName": "Income shares, combined net income schedule",
  "incomeBasis": "net | gross | adjusted-gross | net-resources | other",
  "incomeDefinition": "What counts and what is deducted, with section number.",
  "period": "monthly | weekly | annual | biweekly",
  "maxChildren": 6,
  "schedule": {
    "file": "cs-schedules/florida.json",
    "columns": "combined income, then obligation for 1..N children",
    "minIncome": 800, "maxIncome": 10000, "step": 50,
    "lookup": "floor | nearest | interpolate | bracket",
    "lookupRule": "What the guideline says to do between two rows (quote/paraphrase + section).",
    "belowMin": { "rule": "...", "amounts": null },
    "aboveMax": { "method": "percent-of-excess | cap | discretion | extrapolate | formula", "pct": [5.0, 7.5, 9.5, 11.0, 12.0, 12.5], "text": "..." },
    "effective": "2023-07-01", "url": "official URL of the table"
  },
  "percent": {
    "byChildren": [20, 25, 30, 35, 40, 40],
    "tiers": null,
    "cap": { "amount": 11700, "period": "monthly", "appliesTo": "obligor net resources", "effective": "2025-09-01", "text": "...", "url": "..." },
    "text": "...", "url": "..."
  },
  "formula": { "text": "Exact description of the formula with all parameters below.", "params": {}, "url": "..." },
  "shared": {
    "method": "cross-credit | percent-reduction | table | none | other",
    "thresholdOvernights": 73, "multiplier": 1.5,
    "reductionTable": null,
    "text": "Exact rule with section.", "url": "..."
  },
  "addOns": { "childcare": "added to basic obligation and shared by income | other", "healthInsurance": "...", "text": "...", "url": "..." },
  "lowIncome": { "selfSupportReserve": null, "period": "monthly", "minimumOrder": null, "rule": "...", "url": "..." },
  "statute": { "cite": "Fla. Stat. § 61.30", "url": "..." },
  "guidelinesUrl": "...", "officialCalculatorUrl": "... or null",
  "emancipation": { "text": "Support ends at 18, or 19 if still in high school ... (§ ...)", "url": "..." },
  "testCases": [ { "inputs": { "incomeA": 4000, "incomeB": 2000, "children": 2, "overnightsA": 0 }, "expected": 0.0, "what": "payer's monthly basic obligation", "source": "official worked example / worksheet / official calculator, URL" } ],
  "facts": [ { "text": "Singular, verifiable fact about this state's child support (deviation factors, review cycle, interest on arrears, who runs the IV-D program, date of last schedule update...)", "url": "..." } ],
  "uncertain": []
}
```

Fill only the block(s) that match the model (`schedule` for income shares, `percent` for percentage states,
`formula` for CA / Melson / band formulas); set the others to `null`. **Schedules**: the full official
table, every row, as `[[income, c1, c2, c3, c4, c5, c6], ...]` in the period of the table (keep the state's
own column count; if it stops at 5 children, 5 columns). Verify by printing ~5 random rows and comparing
them to the source text. At least one `testCase`, taken from an official worked example when one exists
(otherwise compute one by hand from the table and say so in `source`). 3 to 6 `facts`.

### Workers' compensation — `research/wc/<slug>.json`

```json
{
  "slug": "california", "name": "California", "abbr": "CA", "verified": "2026-10-08",
  "agency": { "name": "Division of Workers' Compensation (DIR)", "url": "..." },
  "ttd": {
    "rate": 66.67, "basis": "gross AWW | spendable earnings | after-tax AWW",
    "rateText": "Two-thirds of average weekly wage (Labor Code § 4653)",
    "max": 1764.11, "min": 264.62, "minText": "or the actual wage if lower (if applicable)",
    "effective": "2026-01-01", "periodLabel": "injuries on or after January 1, 2026",
    "url": "official page or PDF listing the 2026 max/min", "asOf": "2026-01-01"
  },
  "waiting": { "days": 3, "retroactiveAfterDays": 14, "text": "...", "url": "..." },
  "ttdDuration": { "maxWeeks": 104, "text": "...", "url": "..." },
  "ppd": { "text": "How permanent partial disability is paid (schedule of weeks, rating, rate), with section", "url": "..." },
  "statute": { "cite": "Cal. Labor Code § 4453, § 4653", "url": "..." },
  "facts": [ { "text": "...", "url": "..." } ],
  "uncertain": []
}
```

`max`/`min` are the **weekly** TTD maximum and minimum for injuries in 2026 (or the fiscal year covering
October 2026: say which in `periodLabel`). For states that pay a percentage of *spendable* or *after-tax*
earnings (e.g. Alaska, Iowa, Michigan, Rhode Island, Connecticut, Maine…), say so exactly in `basis` and
`rateText`. 3 to 5 `facts` that are singular to the state (e.g. Texas non-subscriber employers, Ohio/
Washington/Wyoming/North Dakota monopolistic state funds, cost-of-living adjustments, choice of doctor…).

### Alimony — `research/alimony/<slug>.json`

Same spirit: `formula` (exact formula, every parameter, caps, income limits, and the official text URL),
`duration` (table or rule with section), `scope` (temporary/pendente lite vs. final), `testCases`,
`facts`, `uncertain`.

### Divorce — `research/divorce/states.json` (array of 51 objects)

```json
{ "slug": "california", "name": "California", "abbr": "CA",
  "filingFee": 435, "responseFee": 435, "feeScope": "statewide | county (name the county)",
  "feeText": "First paper fee for a petition for dissolution (Gov. Code § 70670)", "feeUrl": "...",
  "otherFees": [ { "what": "Request for order / motion", "amount": 60, "url": "..." } ],
  "waiver": { "name": "Request to Waive Court Fees (FW-001)", "url": "..." },
  "residency": { "text": "6 months in the state and 3 months in the county (Fam. Code § 2320)", "url": "..." },
  "waitingPeriod": { "days": 182, "text": "Judgment cannot take effect until 6 months after service (Fam. Code § 2339)", "url": "..." },
  "simplified": { "text": "Summary dissolution available if ... (Fam. Code § 2400)", "url": "..." },
  "parentingClass": { "required": true, "text": "...", "url": "..." },
  "uncertain": [] }
```

### Probate — `research/probate/states.json` (array of 51) + `research/probate/fees/<slug>.json` for states with a statutory fee schedule

```json
{ "slug": "california", "name": "California", "abbr": "CA",
  "creditorClaims": { "months": 4, "text": "Claims must be filed within 4 months after letters issue (Prob. Code § 9100)", "url": "..." },
  "earliestClose": { "text": "...", "url": "..." },
  "smallEstate": { "limit": 208850, "text": "Affidavit procedure for estates up to $208,850 (Prob. Code § 13100), for deaths on or after April 1, 2025", "url": "..." },
  "simplified": { "text": "...", "url": "..." },
  "filingFee": { "amount": 435, "text": "...", "url": "..." },
  "personalRepFee": { "type": "statutory-schedule | reasonable | percent", "text": "...", "url": "..." },
  "attorneyFee": { "type": "statutory-schedule | reasonable", "text": "...", "url": "..." },
  "uncertain": [] }
```

Fee schedule file `research/probate/fees/<slug>.json`:

```json
{ "slug": "florida", "base": "What the schedule applies to (inventory value + income, etc.), with section",
  "schedules": [
    { "who": "Personal representative commission (§ 733.617)",
      "tiers": [ { "upTo": 1000000, "pct": 3 }, { "upTo": 5000000, "pct": 2.5 }, { "upTo": 10000000, "pct": 2 }, { "upTo": null, "pct": 1.5 } ],
      "fixed": null, "text": "...", "url": "...", "capNote": null },
    { "who": "Attorney fee presumed reasonable (§ 733.6171)",
      "tiers": null,
      "fixed": [ { "upTo": 40000, "fee": 1500 }, { "upTo": 70000, "fee": 2250 }, { "upTo": 100000, "fee": 3000 },
                 { "upTo": 1000000, "fee": 0, "pct": 3, "pctOf": "total" }, … ],
      "text": "...", "url": "..." }
  ],
  "testCases": [ { "estate": 500000, "expected": { "Personal representative commission (§ 733.617)": 15000 }, "source": "computed by hand" } ] }
```

`tiers` = marginal percentages (each pct applies to the slice up to `upTo`). `fixed` = brackets checked in
order: the first whose `upTo` is ≥ the base (or null) gives `fee` + `pct`% of the base (`pctOf: "total"`) or
of the part above `over` (`pctOf: "excess"`). Use whichever reproduces the statute exactly; if a statute mixes
both (e.g. a flat fee then marginal %), encode it with `fixed` brackets using `over` and cumulative `fee`.
