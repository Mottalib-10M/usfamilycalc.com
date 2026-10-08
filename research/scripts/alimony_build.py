#!/usr/bin/env python3
"""Build research/alimony/<slug>.json from the figures read on official sources on 2026-10-08.

Every number below was read on the URL cited next to it (raw copies in research/raw/ where the server
allowed a download). Test cases are computed here, by hand-coded formulas, from the published rules.
Colorado's duration table is re-parsed from the official PDF by alimony_colorado_table.py.

Usage: python3 alimony_build.py   (writes ../alimony/*.json)
"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "alimony")
VERIFIED = "2026-10-08"
TAX = {
    "text": "Federal: for divorce or separation agreements executed after 2018 (or older ones modified to adopt the new rule), the payer cannot deduct alimony and the recipient does not include it in gross income (IRS Topic No. 452).",
    "url": "https://www.irs.gov/taxtopics/tc452",
}


def r2(x):
    return round(x + 1e-9, 2)


# ---------------------------------------------------------------- Texas
TX_URL = "https://tcss.legis.texas.gov/resources/FA/htm/FA.8.htm"


def tx_cap(avg_monthly_gross):
    return r2(min(5000, 0.20 * avg_monthly_gross))


texas = {
    "slug": "texas", "name": "Texas", "abbr": "TX", "verified": VERIFIED,
    "scope": "Court-ordered post-divorce spousal maintenance under Tex. Fam. Code ch. 8 (contractual alimony agreed by the parties is not limited by these caps). Temporary support while the divorce is pending is not governed by ch. 8.",
    "formula": {
        "text": "No guideline amount. Tex. Fam. Code § 8.055(a) caps court-ordered maintenance at the lesser of $5,000 per month or 20 percent of the obligor spouse's average monthly gross income. § 8.055(a-1) defines gross income (includes wages, self-employment, net rental income, dividends, pensions, etc.; excludes return of capital, SSI/social security, VA disability, workers' compensation, TANF, foster care payments).",
        "params": {"capMonthly": 5000, "capPctOfObligorAvgMonthlyGross": 20, "incomeBasis": "obligor average monthly gross income (§ 8.055(a-1))"},
        "url": TX_URL,
    },
    "duration": {
        "text": "Tex. Fam. Code § 8.054(a)(1): maintenance may not remain in effect more than 5 years after the order if married < 10 years and eligibility rests on family violence (§ 8.051(1)), or if married 10 to 20 years; 7 years if married 20 to 30 years; 10 years if married 30 years or more. § 8.054(a)(2): the court shall limit duration to the shortest reasonable period unless disability, care of an infant or young child, or another compelling impediment. § 8.054(b): for disability (§ 8.051(2)(A) or (C)) maintenance may last as long as eligibility continues.",
        "table": [
            {"marriageYearsMin": 0, "marriageYearsMax": 10, "maxYears": 5, "note": "only when eligibility is family violence under § 8.051(1)"},
            {"marriageYearsMin": 10, "marriageYearsMax": 20, "maxYears": 5},
            {"marriageYearsMin": 20, "marriageYearsMax": 30, "maxYears": 7},
            {"marriageYearsMin": 30, "marriageYearsMax": None, "maxYears": 10},
        ],
        "url": TX_URL,
    },
    "eligibility": {
        "text": "Tex. Fam. Code § 8.051: the spouse seeking maintenance must lack sufficient property to meet minimum reasonable needs AND either (1) the other spouse was convicted of or received deferred adjudication for family violence against the spouse or the spouse's child within 2 years before filing or while the suit is pending, or (2) the spouse is unable to earn sufficient income because of an incapacitating disability, has been married 10 years or longer and lacks the ability to earn sufficient income, or is the custodian of a disabled child of the marriage. § 8.053 presumes maintenance under the 10-year ground is not warranted unless the spouse exercised diligence in earning income or developing skills.",
        "url": TX_URL,
    },
    "taxNote": TAX,
    "testCases": [
        {"inputs": {"obligorAvgMonthlyGross": 8000}, "expected": tx_cap(8000), "what": "maximum monthly maintenance (20% of 8,000 < 5,000)", "source": "computed by hand from § 8.055(a)"},
        {"inputs": {"obligorAvgMonthlyGross": 40000}, "expected": tx_cap(40000), "what": "maximum monthly maintenance ($5,000 cap binds)", "source": "computed by hand from § 8.055(a)"},
        {"inputs": {"marriageYears": 25, "eligibility": "10-year marriage"}, "expected": 7, "what": "maximum duration in years", "source": "computed by hand from § 8.054(a)(1)(B)"},
    ],
    "facts": [
        {"text": "Maintenance terminates on the death of either party or remarriage of the obligee, and the court shall terminate it on proof that the obligee cohabits with a romantic partner in a permanent place of abode on a continuing basis (Tex. Fam. Code § 8.056).", "url": TX_URL},
        {"text": "Court-ordered maintenance can never exceed $5,000 a month, however high the obligor's income (§ 8.055(a)).", "url": TX_URL},
        {"text": "Marital misconduct, including adultery and cruel treatment, is one of the 11 factors the court weighs in setting maintenance (§ 8.052(10)).", "url": TX_URL},
        {"text": "VA service-connected disability compensation, social security, SSI and workers' compensation benefits are excluded from gross income for the cap (§ 8.055(a-1)(2)).", "url": TX_URL},
    ],
    "uncertain": [
        "Official HTML at statutes.capitol.texas.gov is now a JavaScript app; text read from the legislature's resource copy at tcss.legis.texas.gov (same statute text, latest amendment shown: Acts 2023, H.B. 2070, eff. June 9, 2023).",
    ],
}

# ---------------------------------------------------------------- Florida
FL_URL = "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0000-0099/0061/Sections/0061.08.html"


def fl_durational(payer_net, payee_net, need):
    return r2(min(need, 0.35 * (payer_net - payee_net)))


florida = {
    "slug": "florida", "name": "Florida", "abbr": "FL", "verified": VERIFIED,
    "scope": "Alimony on dissolution of marriage under Fla. Stat. § 61.08 as amended by ch. 2023-315, Laws of Florida, applying to all initial petitions pending or filed on or after July 1, 2023 (§ 61.08(11)). Forms: temporary, bridge-the-gap, rehabilitative, durational; permanent alimony is no longer listed.",
    "formula": {
        "text": "Durational alimony amount (§ 61.08(8)(c)): the lesser of the obligee's reasonable need or 35 percent of the difference between the parties' net incomes, net income computed under § 61.30(2) and (3) and excluding spousal support paid under a court order in the action. § 61.08(9): the award may not leave the payor with significantly less net income than the recipient without written findings of exceptional circumstances. No percentage cap is set for bridge-the-gap or rehabilitative alimony.",
        "params": {"durationalCapPctOfNetIncomeDifference": 35, "incomeBasis": "net income per § 61.30(2)-(3)", "bridgeTheGapMaxYears": 2, "rehabilitativeMaxYears": 5, "durationalMinMarriageYears": 3},
        "url": FL_URL,
    },
    "duration": {
        "text": "§ 61.08(5): rebuttable presumption that a short-term marriage is < 10 years, moderate-term 10 to 20 years, long-term 20 years or longer, measured from the date of marriage to the date of filing. § 61.08(6): bridge-the-gap alimony may not exceed 2 years. § 61.08(7)(c): rehabilitative alimony may not exceed 5 years and requires a specific rehabilitative plan. § 61.08(8)(a)-(b): durational alimony is not available after a marriage of less than 3 years and may not exceed 50% of the length of a short-term marriage, 60% of a moderate-term marriage, or 75% of a long-term marriage, unless extended under exceptional circumstances by clear and convincing evidence.",
        "table": [
            {"category": "short-term", "marriageYearsMin": 3, "marriageYearsMax": 10, "maxPctOfMarriageLength": 50},
            {"category": "moderate-term", "marriageYearsMin": 10, "marriageYearsMax": 20, "maxPctOfMarriageLength": 60},
            {"category": "long-term", "marriageYearsMin": 20, "marriageYearsMax": None, "maxPctOfMarriageLength": 75},
        ],
        "url": FL_URL,
    },
    "eligibility": {
        "text": "§ 61.08(2)(a): the court first determines whether the party seeking alimony has an actual need and the other party has the ability to pay; the requesting party bears the burden of proof. § 61.08(3) then lists the factors (duration of marriage, standard of living, age and health, resources and income, earning capacity, contributions, child responsibilities, other factors). Adultery and its economic impact may be considered (§ 61.08(1)(a)).",
        "url": FL_URL,
    },
    "taxNote": TAX,
    "testCases": [
        {"inputs": {"payerNetMonthly": 8000, "payeeNetMonthly": 3000, "payeeReasonableNeed": 2000}, "expected": fl_durational(8000, 3000, 2000), "what": "maximum monthly durational alimony (35% x 5,000 = 1,750 < need)", "source": "computed by hand from § 61.08(8)(c)"},
        {"inputs": {"marriageYears": 15}, "expected": 9.0, "what": "maximum durational alimony term in years (moderate-term, 60% x 15)", "source": "computed by hand from § 61.08(5) and (8)(b)"},
        {"inputs": {"marriageYears": 8}, "expected": 4.0, "what": "maximum durational alimony term in years (short-term, 50% x 8)", "source": "computed by hand from § 61.08(5) and (8)(b)"},
    ],
    "facts": [
        {"text": "Bridge-the-gap alimony is capped at 2 years and can be modified neither in amount nor in duration (§ 61.08(6)).", "url": FL_URL},
        {"text": "Marriage length for alimony runs from the wedding to the date the dissolution petition is filed, not to the final judgment (§ 61.08(5)).", "url": FL_URL},
        {"text": "The court may order the payer to buy life insurance or a bond to secure alimony only on specific findings of special circumstances (§ 61.08(4)).", "url": FL_URL},
        {"text": "Durational alimony ends on the death of either party or remarriage of the obligee, and its length may be changed only in exceptional circumstances (§ 61.08(8)(a)).", "url": FL_URL},
    ],
    "uncertain": [
        "The history line of § 61.08 cites s. 1, ch. 2023-315 as the 2023 amendment; the bill number given in the brief (HB 1301) was not verified on flsenate.gov.",
    ],
}

# ---------------------------------------------------------------- Illinois
IL_URL = "https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=075000050K504"
IL_MULT = [(0, 5, 0.20), (5, 6, 0.24), (6, 7, 0.28), (7, 8, 0.32), (8, 9, 0.36), (9, 10, 0.40), (10, 11, 0.44),
           (11, 12, 0.48), (12, 13, 0.52), (13, 14, 0.56), (14, 15, 0.60), (15, 16, 0.64), (16, 17, 0.68),
           (17, 18, 0.72), (18, 19, 0.76), (19, 20, 0.80)]


def il_amount(payer_net, payee_net):
    a = payer_net / 3 - 0.25 * payee_net
    cap = 0.40 * (payer_net + payee_net) - payee_net
    return r2(max(0, min(a, cap)))


def il_duration(years):
    for lo, hi, m in IL_MULT:
        if lo <= years < hi:
            return r2(years * m)
    return None


illinois = {
    "slug": "illinois", "name": "Illinois", "abbr": "IL", "verified": VERIFIED,
    "scope": "Post-dissolution maintenance under 750 ILCS 5/504(b-1); guideline applies only if the court first finds maintenance appropriate. Temporary maintenance (§ 501) may be credited against the guideline duration (§ 504(b-1)(1.5)).",
    "formula": {
        "text": "750 ILCS 5/504(b-1)(1)(A): if the parties' combined gross annual income is less than $500,000 and the payor has no child support or maintenance obligation from a prior relationship, guideline maintenance = 33 1/3% of the payor's net annual income minus 25% of the payee's net annual income, but maintenance plus the payee's net income may not exceed 40% of the parties' combined net income. If guideline maintenance plus child support exceeds 50% of the payor's net income, the court may set non-guideline amounts. (A-1): modifications of pre-2019 tax-deductible orders use 30% of payor gross minus 20% of payee gross, capped at 40% of combined gross.",
        "params": {"combinedGrossAnnualLimit": 500000, "payerNetPct": 33.3333, "payerNetFraction": "1/3", "payeeNetPct": 25, "capPctOfCombinedNet": 40, "combinedSupportReviewPctOfPayerNet": 50, "pre2019Modification": {"payerGrossPct": 30, "payeeGrossPct": 20, "capPctOfCombinedGross": 40}},
        "url": IL_URL,
    },
    "duration": {
        "text": "750 ILCS 5/504(b-1)(1)(B): duration = length of the marriage at the time the action was commenced x the factor for that length (0.20 for < 5 years, rising by 0.04 per full year to 0.80 for 19 to < 20 years). For a marriage of 20 years or more, the court in its discretion orders maintenance for a period equal to the length of the marriage or for an indefinite term.",
        "table": [{"marriageYearsMin": lo, "marriageYearsMax": hi, "factor": m} for lo, hi, m in IL_MULT] + [{"marriageYearsMin": 20, "marriageYearsMax": None, "factor": None, "note": "period equal to the length of the marriage or indefinite"}],
        "url": IL_URL,
    },
    "eligibility": {
        "text": "750 ILCS 5/504(a) factors decide whether maintenance is appropriate; under (b-1) the court bars maintenance unless it finds an award appropriate, and only then applies the guideline (or non-guideline maintenance after considering the (a) factors, with findings under (b-2)).",
        "url": IL_URL,
    },
    "taxNote": TAX,
    "testCases": [
        {"inputs": {"payerNetAnnual": 120000, "payeeNetAnnual": 40000}, "expected": il_amount(120000, 40000), "what": "annual guideline maintenance (40,000 - 10,000 = 30,000, capped at 40% x 160,000 - 40,000 = 24,000)", "source": "computed by hand from § 504(b-1)(1)(A)"},
        {"inputs": {"payerNetAnnual": 90000, "payeeNetAnnual": 0}, "expected": il_amount(90000, 0), "what": "annual guideline maintenance (1/3 x 90,000 = 30,000 < 40% cap of 36,000)", "source": "computed by hand from § 504(b-1)(1)(A)"},
        {"inputs": {"marriageYears": 12}, "expected": il_duration(12), "what": "guideline duration in years (12 x 0.52)", "source": "computed by hand from § 504(b-1)(1)(B)"},
    ],
    "facts": [
        {"text": "Unpaid maintenance accrues simple interest and each missed installment is a judgment that creates a lien on the obligor's property by operation of law (750 ILCS 5/504(b-5), (b-7)).", "url": IL_URL},
        {"text": "The court must state whether maintenance is fixed-term, indefinite, reviewable or reserved (750 ILCS 5/504(b-2)(3)).", "url": IL_URL},
        {"text": "Maintenance paid in the pending case is excluded from both gross and net income for the guideline (750 ILCS 5/504(b-3), (b-3.5)).", "url": IL_URL},
    ],
    "uncertain": [
        "ilga.gov refused connections from this machine on 2026-10-08; text read from the Wayback Machine copy of the official page dated 2025-06-21 (https://web.archive.org/web/20250621210118/https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=075000050K504), source line P.A. 103-967, eff. 1-1-25. Amendments after June 2025 not checked.",
        "The statute says 33 1/3%; params give 1/3 exactly (33.3333 is a display value).",
    ],
}

# ---------------------------------------------------------------- Pennsylvania
PA_URL = "https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/231/chapter1910/s1910.16-4.html"
PA_HI = "https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/231/chapter1910/s1910.16-3.1.html"
PA_16_1 = "https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/231/chapter1910/s1910.16-1.html"


def pa_partB(obligor_net, obligee_net, children):
    a, b = (0.25, 0.30) if children else (0.33, 0.40)
    return r2(max(0, a * obligor_net - b * obligee_net))


def pa_partIV(obligor_net, obligee_net, obligor_cs=0.0, children=False):
    if children:
        return r2(max(0, 0.30 * (obligor_net - obligee_net - obligor_cs)))
    return r2(max(0, 0.40 * (obligor_net - obligee_net)))


pennsylvania = {
    "slug": "pennsylvania", "name": "Pennsylvania", "abbr": "PA", "verified": VERIFIED,
    "scope": "Guideline spousal support and alimony pendente lite (APL) under Pa.R.Civ.P. 1910.16-4 (support while separated / while the divorce is pending). Post-divorce alimony (23 Pa.C.S. § 3701) has no formula and is discretionary.",
    "formula": {
        "text": "Pa.R.Civ.P. 1910.16-4(a)(1) Part B (orders entered on or after Jan. 1, 2019): without dependent children, 33% of the obligor's monthly net income (after support owed to others) minus 40% of the obligee's monthly net income; with dependent children, 25% of the obligor's monthly net income minus 30% of the obligee's monthly net income; a negative result is zero. Spousal support/APL is computed before child support, and the obligor's income for child support is reduced by it (Part C line 18). Part IV of (a)(2) (modifications of pre-2019 orders that include spousal support/APL) keeps the older formula: 40% of (obligor net - obligor's other support - obligee net) without children, and 30% of that difference after also deducting the obligor's child support with children. Combined monthly net income above $30,000: the same formula is a preliminary analysis, then deviation factors, expenses and expense statements are considered (Rule 1910.16-3.1(b)).",
        "params": {
            "post2018": {"noChildren": {"obligorNetPct": 33, "obligeeNetPct": 40}, "withChildren": {"obligorNetPct": 25, "obligeeNetPct": 30}, "order": "spousal/APL before child support"},
            "pre2019Modification": {"noChildren": {"pctOfDifference": 40}, "withChildren": {"pctOfDifferenceAfterChildSupport": 30}},
            "highIncomeCombinedMonthlyNet": 30000, "incomeBasis": "monthly net income (Pa.R.Civ.P. 1910.16-2)",
        },
        "url": PA_URL,
    },
    "duration": {
        "text": "No guideline duration. Spousal support and APL orders may not be in effect simultaneously, and in setting their duration the court considers the length of the marriage from the date of marriage to the date of final separation (Pa.R.Civ.P. 1910.16-1(c)).",
        "table": None,
        "url": PA_16_1,
    },
    "eligibility": {
        "text": "If the trier of fact finds a duty to pay, the guideline amount is rebuttably presumed correct; the presumption is rebutted by a written finding or a statement on the record that it is unjust or inappropriate, considering the deviation factors of Rule 1910.16-5 (Rule 1910.16-1(d)). Final alimony after divorce is governed by 23 Pa.C.S. § 3701 (factor-based, no formula).",
        "url": PA_16_1,
    },
    "taxNote": TAX,
    "testCases": [
        {"inputs": {"obligorNetMonthly": 6000, "obligeeNetMonthly": 2000, "children": False}, "expected": pa_partB(6000, 2000, False), "what": "preliminary monthly spousal support/APL, Part B without children (1,980 - 800)", "source": "computed by hand from Rule 1910.16-4(a)(1) Part B"},
        {"inputs": {"obligorNetMonthly": 6000, "obligeeNetMonthly": 2000, "children": True}, "expected": pa_partB(6000, 2000, True), "what": "preliminary monthly spousal support/APL, Part B with children (1,500 - 600)", "source": "computed by hand from Rule 1910.16-4(a)(1) Part B"},
        {"inputs": {"obligorNetMonthly": 6000, "obligeeNetMonthly": 2000, "children": False, "pre2019Order": True}, "expected": pa_partIV(6000, 2000), "what": "monthly spousal support/APL, Part IV without children (40% x 4,000)", "source": "computed by hand from Rule 1910.16-4(a)(2) Part IV"},
    ],
    "facts": [
        {"text": "Spousal support and alimony pendente lite cannot both be in effect at the same time (Pa.R.Civ.P. 1910.16-1(c)(1)).", "url": PA_16_1},
        {"text": "Pennsylvania's support guidelines must be reviewed at least every four years (Pa.R.Civ.P. 1910.16-1(e)).", "url": PA_16_1},
        {"text": "When the spouse who has the children owes spousal support, the court offsets that spousal support against the other parent's child support in a five-step calculation (Pa.R.Civ.P. 1910.16-4(e)).", "url": PA_URL},
        {"text": "Rule 1910.16-4 was last amended August 11, 2025, effective January 1, 2026 (55 Pa.B. 5978), after an amendment effective January 1, 2022 (51 Pa.B. 5539).", "url": PA_URL},
    ],
    "uncertain": [
        "The brief expected '40% of the difference / 30% with children'; that is only the Part IV formula for modifying pre-2019 orders. For orders entered on or after Jan. 1, 2019 the rule (as published through 56 Pa.B. 5370, Aug. 8, 2026) uses 33%/40% and 25%/30% of each party's net income.",
        "Content of the 2022 and 2026 amendments (51 Pa.B. 5539; 55 Pa.B. 5978) not read; only the current consolidated rule text was read.",
        "23 Pa.C.S. § 3701 not read: palegis.us / legis.state.pa.us timed out from this machine on 2026-10-08. Cite it only after reading https://www.palegis.us/statutes/consolidated/view-statute?txtType=HTM&ttl=23&div=0&chpt=37&sctn=1&subsctn=0.",
    ],
}

# ---------------------------------------------------------------- New York
NY_URL = "https://www.nysenate.gov/legislation/laws/DOM/236"
NY_CAP_URL = "https://www.nycourts.gov/divorce-resources/important-information-about-matrimonial-matters"
NY_CAP = 241000
NY_SSR = 21546


def ny_amount(payor, payee, child_support_paid_by_payor):
    p = min(payor, NY_CAP)
    if child_support_paid_by_payor:
        a = 0.20 * p - 0.25 * payee
    else:
        a = 0.30 * p - 0.20 * payee
    b = 0.40 * (p + payee) - payee
    amt = max(0, min(a, b))
    if payor - amt < NY_SSR:
        amt = max(0, payor - NY_SSR)
    return r2(amt)


new_york = {
    "slug": "new-york", "name": "New York", "abbr": "NY", "verified": VERIFIED,
    "scope": "Temporary maintenance (DRL § 236(B)(5-a)) and post-divorce maintenance (DRL § 236(B)(6)); same amount formula for both; advisory duration schedule for post-divorce maintenance only. Actions commenced under Part B.",
    "formula": {
        "text": "DRL § 236(B)(5-a)(c) and (6)(c), for payor income up to the income cap: (1) if child support will be paid and the payor is the non-custodial parent: 20% of payor income minus 25% of payee income; (2) otherwise (no child support, or payor is the custodial parent): 30% of payor income minus 20% of payee income. Then 40% of combined income minus payee income. The guideline amount is the lower of the two; zero if <= 0. Maintenance is computed before child support. Above the cap, additional maintenance is discretionary (para. d). If the guideline amount would reduce the payor below the self-support reserve, the amount is the payor's income minus the reserve; payor below the reserve = rebuttable presumption of no maintenance. Income = CSSA income (DRL § 240) without deducting maintenance paid to this spouse.",
        "params": {
            "incomeCapPayorAnnual": NY_CAP, "incomeCapEffective": "2026-03-01", "previousIncomeCap": 228000, "statutoryBaseCap": 184000,
            "withChildSupport": {"payorPct": 20, "payeePct": 25}, "withoutChildSupport": {"payorPct": 30, "payeePct": 20},
            "capPctOfCombined": 40, "selfSupportReserve": NY_SSR, "selfSupportReserveEffective": "2026-03-01",
            "capAdjustment": "every two years from March 1, 2020 by the CPI-U change, rounded to the nearest $1,000; published by the Office of Court Administration",
        },
        "url": NY_URL,
    },
    "duration": {
        "text": "DRL § 236(B)(6)(f)(1) advisory schedule for post-divorce maintenance (length of marriage = date of marriage to commencement of the action): 0 up to and including 15 years: 15%-30% of the length of the marriage; more than 15 up to and including 20 years: 30%-40%; more than 20 years: 35%-50%. The court may award non-durational maintenance in an appropriate case (f)(2). Temporary maintenance lasts no later than the judgment of divorce (5-a)(g).",
        "table": [
            {"marriageYearsMin": 0, "marriageYearsMax": 15, "pctMin": 15, "pctMax": 30, "bounds": "0 up to and including 15"},
            {"marriageYearsMin": 15, "marriageYearsMax": 20, "pctMin": 30, "pctMax": 40, "bounds": "more than 15 up to and including 20"},
            {"marriageYearsMin": 20, "marriageYearsMax": None, "pctMin": 35, "pctMax": 50, "bounds": "more than 20"},
        ],
        "url": NY_URL,
    },
    "eligibility": {
        "text": "On application, the court shall order the guideline amount up to the cap unless it finds it unjust or inappropriate under the listed factors (DRL § 236(B)(5-a)(h), (6)(e)), with written reasons. Maintenance ends on the death of either party or the payee's remarriage (§ 236(B)(1)(a), (6)(f)(3)).",
        "url": NY_URL,
    },
    "taxNote": TAX,
    "testCases": [
        {"inputs": {"payorAnnual": 150000, "payeeAnnual": 40000, "childSupportPaidByPayor": False}, "expected": ny_amount(150000, 40000, False), "what": "annual guideline maintenance (min(45,000-8,000=37,000; 76,000-40,000=36,000))", "source": "computed by hand from DRL § 236(B)(6)(c)(2)"},
        {"inputs": {"payorAnnual": 150000, "payeeAnnual": 40000, "childSupportPaidByPayor": True}, "expected": ny_amount(150000, 40000, True), "what": "annual guideline maintenance (min(30,000-10,000=20,000; 36,000))", "source": "computed by hand from DRL § 236(B)(6)(c)(1)"},
        {"inputs": {"payorAnnual": 300000, "payeeAnnual": 0, "childSupportPaidByPayor": False}, "expected": ny_amount(300000, 0, False), "what": "annual guideline maintenance on income up to the $241,000 cap (30% x 241,000), excess discretionary", "source": "computed by hand from DRL § 236(B)(6)(c)-(d) and the 2026 cap"},
        {"inputs": {"marriageYears": 18}, "expected": [5.4, 7.2], "what": "advisory post-divorce duration range in years (30%-40% of 18)", "source": "computed by hand from DRL § 236(B)(6)(f)(1)"},
    ],
    "facts": [
        {"text": "Since March 1, 2026 the maintenance guideline applies to the payor's income up to $241,000 (previously $228,000), and the self-support reserve is $21,546 (NY Courts notice).", "url": NY_CAP_URL},
        {"text": "When a party is unrepresented, the court may not enter a maintenance order without telling them the guideline amount (DRL § 236(B)(5-a)(h)(3), (6)(g)).", "url": NY_URL},
        {"text": "If the payor defaults or income evidence is insufficient, temporary or post-divorce maintenance is based on the payee's needs or the pre-divorce standard of living, whichever is greater (DRL § 236(B)(5-a)(j), (6)(i)).", "url": NY_URL},
        {"text": "Actual retirement of the payor with a substantial drop in income is a ground to modify post-divorce maintenance (DRL § 236(B)(6)(f)(4)).", "url": NY_URL},
    ],
    "uncertain": [
        "nycourts.gov returns 403 to scripts; the March 1, 2026 figures ($241,000 cap, $21,546 self-support reserve) were read in a browser on the official notice page, not downloaded to raw/.",
        "DRL § 236 text read in a browser on nysenate.gov (revision dated 2026-01-23); curl gets 403.",
    ],
}

# ---------------------------------------------------------------- Colorado
CO_URL = "https://www.coloradojudicial.gov/sites/default/files/2026-06/Spousal%20Maintenance%20Advisement.pdf"
co_table = json.loads(subprocess.run([sys.executable, os.path.join(HERE, "alimony_colorado_table.py"), "--no-download"], capture_output=True, text=True, check=True).stdout)


def co_amount(a, b, deductible=False):
    c = a + b
    f = max(0, 0.4 * c - min(a, b))
    if deductible:
        return r2(f)
    if c <= 10000:
        return r2(0.8 * f)
    if c <= 20000:
        return r2(0.75 * f)
    return None


colorado = {
    "slug": "colorado", "name": "Colorado", "abbr": "CO", "verified": VERIFIED,
    "scope": "Advisory maintenance guideline of C.R.S. § 14-10-114 for dissolution or legal separation (final and temporary maintenance), for marriages of at least 36 months and combined annual income of $240,000 or less. Advisory only: no presumption; the court keeps full discretion.",
    "formula": {
        "text": "Per the Colorado Judicial Branch advisement form under C.R.S. § 14-10-114: 40% of the parties' combined adjusted gross monthly income minus the lower earner's adjusted gross monthly income (zero if negative) = Line F. If maintenance is NOT deductible by the payer for federal tax purposes (post-2018 orders), the guideline is 80% of Line F when combined gross monthly income is $10,000 or less, and 75% of Line F when it is $10,001 to $20,000. If deductible, Line F applies.",
        "params": {"combinedAnnualLimit": 240000, "minMarriageMonths": 36, "pctOfCombined": 40, "nonDeductibleFactor": [{"combinedMonthlyMax": 10000, "factor": 0.80}, {"combinedMonthlyMin": 10001, "combinedMonthlyMax": 20000, "factor": 0.75}], "incomeBasis": "adjusted gross monthly income"},
        "url": CO_URL,
    },
    "duration": {
        "text": "Duration table (months of marriage 36 to 240 -> percentage of months married -> suggested term in months): 31.00% at 36 months rising by 0.1667 point per month to 50.00% at 150 months and staying at 50.00% through 240 months. Example on the form: 38% of a 78-month marriage = 30 months.",
        "table": {"columns": ["monthsOfMarriage", "pctOfMonthsMarried", "suggestedTermMonths"], "rows": co_table, "file": "computed by scripts/alimony_colorado_table.py from the official PDF"},
        "url": CO_URL,
    },
    "eligibility": {
        "text": "Before awarding maintenance the court considers need and ability to pay, property distribution, income from property, lifestyle during the marriage, employability, historical earnings, marriage duration, ability to meet own needs, age and health, education needs, temporary maintenance paid, contributions and other factors; the guideline applies only to marriages of at least 3 years (date of marriage to decree) with combined gross annual income of $240,000 or less.",
        "url": CO_URL,
    },
    "taxNote": TAX,
    "testCases": [
        {"inputs": {"incomeAMonthly": 8000, "incomeBMonthly": 2000, "deductible": False}, "expected": co_amount(8000, 2000), "what": "advisory monthly maintenance (Line F = 4,000 - 2,000 = 2,000; x 0.80)", "source": "computed by hand from the official advisement worksheet"},
        {"inputs": {"incomeAMonthly": 12000, "incomeBMonthly": 3000, "deductible": False}, "expected": co_amount(12000, 3000), "what": "advisory monthly maintenance (Line F = 6,000 - 3,000 = 3,000; x 0.75)", "source": "computed by hand from the official advisement worksheet"},
        {"inputs": {"marriageMonths": 78}, "expected": 30, "what": "suggested term in months", "source": "official example on the advisement form (38% of 78 months)"},
    ],
    "facts": [
        {"text": "Colorado's maintenance guideline is advisory: it creates no presumption that maintenance will be ordered, in any amount or for any duration.", "url": CO_URL},
        {"text": "Below 36 months of marriage the guideline is not computed at all; the parties only sign the advisement.", "url": CO_URL},
        {"text": "Marriage length for the guideline runs from the date of marriage to the date the decree of dissolution or legal separation enters.", "url": CO_URL},
    ],
    "uncertain": [
        "C.R.S. § 14-10-114 itself not read: leg.colorado.gov / content.leg.colorado.gov return 403 to scripts and the browser on 2026-10-08, and the CRS is hosted by LexisNexis. Formula, 80%/75% factors, $240,000 limit and table read on the Colorado Judicial Branch advisement form (Arapahoe County, District Court; form revision R02/2021, file dated 2026-06).",
        "The form calls the threshold 'combined gross annual income' while the worksheet uses adjusted gross income; check statute wording.",
        "A 2025 bill (HB 25-1159, content.leg.colorado.gov/sites/default/files/2025a_1159_signed.pdf) amended § 14-10-114(8) definitions; text not read (403).",
        "Statutory rule for marriages over 240 months (indefinite or not less than 120 months) not verified, so not included.",
    ],
}

# ---------------------------------------------------------------- Massachusetts
MA_TYPES = "https://www.mass.gov/info-details/learn-about-the-types-of-alimony"
MA_AMOUNT = "https://www.mass.gov/info-details/how-the-court-decides-on-alimony"

massachusetts = {
    "slug": "massachusetts", "name": "Massachusetts", "abbr": "MA", "verified": VERIFIED,
    "scope": "Alimony after divorce under the Alimony Reform Act (M.G.L. c. 208, §§ 48-55): general term, rehabilitative, reimbursement and transitional alimony; duration limits apply to general term alimony.",
    "formula": {
        "text": "Except for reimbursement alimony or unusual circumstances, alimony should generally not exceed the recipient's need or 30-35% of the difference between the parties' gross incomes when the order issues (M.G.L. c. 208, § 53(b), as explained by the Probate and Family Court). Gross income is the Child Support Guidelines definition, excluding capital gains, dividends and interest from assets already divided, and income already used for a child support order. The new spouse's income of a remarried payer is not considered.",
        "params": {"pctOfGrossIncomeDifferenceMin": 30, "pctOfGrossIncomeDifferenceMax": 35, "incomeBasis": "gross income (Child Support Guidelines definition)"},
        "url": MA_AMOUNT,
    },
    "duration": {
        "text": "General term alimony maximum (M.G.L. c. 208, § 49(b), per the Probate and Family Court): marriages of 5 years or less: 50% of the number of months married; 10 years or less: 60%; 15 years or less: 70%; 20 years or less: 80%; more than 20 years: as long as the judge finds fair. Alimony normally ends on the death of either spouse, remarriage of the recipient, or the payer reaching full retirement age; cohabitation for at least 3 months can reduce or end it.",
        "table": [
            {"marriageYearsMax": 5, "maxPctOfMonthsMarried": 50},
            {"marriageYearsMin": 5, "marriageYearsMax": 10, "maxPctOfMonthsMarried": 60},
            {"marriageYearsMin": 10, "marriageYearsMax": 15, "maxPctOfMonthsMarried": 70},
            {"marriageYearsMin": 15, "marriageYearsMax": 20, "maxPctOfMonthsMarried": 80},
            {"marriageYearsMin": 20, "marriageYearsMax": None, "maxPctOfMonthsMarried": None, "note": "court discretion"},
        ],
        "url": MA_TYPES,
    },
    "eligibility": {
        "text": "Alimony is paid by a spouse able to pay to a spouse in need; the court weighs length of marriage, age, health, income and employability, economic and non-economic contributions, marital lifestyle, ability to maintain it, lost economic opportunity and other factors. Reimbursement and transitional alimony are only for marriages of no more than 5 years.",
        "url": MA_AMOUNT,
    },
    "taxNote": TAX,
    "testCases": [
        {"inputs": {"payerGrossAnnual": 150000, "recipientGrossAnnual": 50000}, "expected": [30000.0, 35000.0], "what": "general term alimony ceiling range per year (30%-35% of 100,000), unless need is lower", "source": "computed by hand from § 53(b) as stated by the Probate and Family Court"},
        {"inputs": {"marriageMonths": 60}, "expected": 30, "what": "maximum general term alimony in months (court's own example)", "source": "official example, mass.gov types-of-alimony page"},
        {"inputs": {"marriageMonths": 144}, "expected": 100.8, "what": "maximum general term alimony in months (70% x 144)", "source": "computed by hand from § 49(b) as stated by the Probate and Family Court"},
    ],
    "facts": [
        {"text": "General term alimony normally stops when the payer reaches full retirement age, unless the judge orders otherwise.", "url": MA_TYPES},
        {"text": "Living with a partner for at least 3 months can reduce or end the recipient's alimony.", "url": MA_TYPES},
        {"text": "Reimbursement and transitional alimony are reserved to marriages of no more than 5 years.", "url": MA_TYPES},
        {"text": "When a remarried payer's alimony is reviewed for an increase, the new spouse's income is not considered.", "url": MA_AMOUNT},
    ],
    "uncertain": [
        "M.G.L. c. 208 §§ 48-55 not read directly: malegislature.gov refused connections (curl, WebFetch and browser) on 2026-10-08. Figures read on the Probate and Family Court pages on mass.gov; section numbers (§ 49(b), § 49(f), § 53(b)) taken from the brief, not re-verified on the statute.",
        "Maximum terms of rehabilitative (5 years) and transitional (3 years) alimony are in the statute but were not read, so not included.",
    ],
}

# ---------------------------------------------------------------- Virginia
VA_JDR = "https://law.lis.virginia.gov/vacode/title16.1/chapter11/section16.1-278.17:1/"
VA_CIR = "https://law.lis.virginia.gov/vacode/title20/chapter6/section20-103/"
VA_107 = "https://law.lis.virginia.gov/vacode/title20/chapter6/section20-107.1/"


def va_pl(payor, payee, children):
    a, b = (0.26, 0.58) if children else (0.27, 0.50)
    return r2(max(0, a * payor - b * payee))


virginia = {
    "slug": "virginia", "name": "Virginia", "abbr": "VA", "verified": VERIFIED,
    "scope": "Presumptive formula only for pendente lite (temporary) spousal support: § 16.1-278.17:1 (juvenile and domestic relations district courts) and § 20-103 (circuit courts). Final spousal support under § 20-107.1 is factor-based with no formula.",
    "formula": {
        "text": "With minor children in common: 26% of the payor spouse's monthly gross income minus 58% of the payee spouse's monthly gross income. With no minor children in common: 27% of the payor's monthly gross income minus 50% of the payee's. Gross income as defined in § 20-108.2. Spousal support is determined before child support. Applies only when combined monthly gross income does not exceed $10,000; deviation for good cause.",
        "params": {"withChildren": {"payorGrossPct": 26, "payeeGrossPct": 58}, "withoutChildren": {"payorGrossPct": 27, "payeeGrossPct": 50}, "combinedMonthlyGrossMax": 10000, "incomeBasis": "monthly gross income (§ 20-108.2)"},
        "url": VA_JDR,
    },
    "duration": {
        "text": "No formula for duration. § 20-107.1(C): support may be for a defined duration, an undefined duration, a lump sum, or a combination. § 20-107.1(D): when the right to future support is reserved, a rebuttable presumption that the reservation lasts 50% of the time between the date of marriage and the date of separation.",
        "table": None,
        "url": VA_107,
    },
    "eligibility": {
        "text": "§ 20-107.1(B): no permanent support to a spouse against whom adultery (§ 20-91(A)(1)) is established, unless denial would be a manifest injustice shown by clear and convincing evidence. § 20-107.1(E) lists 13 factors for nature, amount and duration.",
        "url": VA_107,
    },
    "taxNote": TAX,
    "testCases": [
        {"inputs": {"payorGrossMonthly": 7000, "payeeGrossMonthly": 2000, "minorChildren": True}, "expected": va_pl(7000, 2000, True), "what": "presumptive monthly pendente lite support (1,820 - 1,160)", "source": "computed by hand from § 16.1-278.17:1(C)"},
        {"inputs": {"payorGrossMonthly": 7000, "payeeGrossMonthly": 2000, "minorChildren": False}, "expected": va_pl(7000, 2000, False), "what": "presumptive monthly pendente lite support (1,890 - 1,000)", "source": "computed by hand from § 16.1-278.17:1(C)"},
    ],
    "facts": [
        {"text": "The pendente lite formula is presumptive only where the spouses' combined monthly gross income is $10,000 or less (§ 16.1-278.17:1(E); § 20-103(I)).", "url": VA_JDR},
        {"text": "A pendente lite order has no presumptive effect on the final decision in the case (§ 20-103(J)).", "url": VA_CIR},
        {"text": "A reservation of the right to future spousal support is presumed to last half the time from marriage to separation, and that duration cannot be modified (§ 20-107.1(D)).", "url": VA_107},
        {"text": "Adultery bars permanent support unless denial would be a manifest injustice (§ 20-107.1(B)).", "url": VA_107},
    ],
    "uncertain": [
        "The brief's figures (28%/58% with children; 30%/50% without) are outdated: the current text (2020, c. 651) reads 26%/58% and 27%/50%.",
    ],
}

# ---------------------------------------------------------------- Arizona
AZ_SMG = "https://azcourts.sharepoint.com/:b:/s/CourtForms/EQvSfL4r15hJjprxdRU_67oBvxcGNWOE_ezKDPCVhG-_fA?e=UcPHWb"
AZ_PAGE = "https://www.azcourts.gov/familylaw/Child-Support-Family-Law-Information/Spousal-Maintenance-Guidelines"
AZ_STAT = "https://www.azleg.gov/ars/25/00319.htm"


def az_range(months):
    if months < 24:
        return [3, 12]
    if months < 60:
        return [6, 36]
    if months < 120:
        return [6, 48]
    if months < 192:
        return [12, 60]
    return [12, max(144, months / 2)]


arizona = {
    "slug": "arizona", "name": "Arizona", "abbr": "AZ", "verified": VERIFIED,
    "scope": "Arizona Spousal Maintenance Guidelines adopted by the Supreme Court under A.R.S. § 25-319(B); current edition effective 09/01/2025 (AO 2025-101), previous 2023 edition effective July 10, 2023. Apply to petitions filed on or after September 24, 2022; also to temporary orders (Section VI).",
    "formula": {
        "text": "No percentage formula. After eligibility under § 25-319(A), the court uses the official Spousal Maintenance Calculator: (1) family size (max 5); (2) combined Spousal Maintenance Income (actual + attributed income of both spouses); (3) the calculator generates combined expenditures from BLS Consumer Expenditure Survey data (per capita method) and the receiving spouse's share proportional to income; (4) amount range = combined expenditures minus the receiving spouse's share. High-income adjustment: +1% for every $2,500 of intact family income from $175,000 a year, up to +70%. Combined income at or below 80% of the state minimum wage gives zero; above that but under $44,000 the range starts at zero. A 4% rate of return may be attributed to income-producing property.",
        "params": {"highIncomeStartAnnual": 175000, "highIncomeStepAnnual": 2500, "highIncomeStepPct": 1, "highIncomeMaxPct": 70, "lowIncomeRangeStartsAtZeroBelowAnnual": 44000, "zeroAwardAtOrBelowPctOfStateMinWage": 80, "attributedReturnOnPropertyPct": 4, "maxFamilySize": 5, "calculatorUrl": AZ_PAGE},
        "url": AZ_SMG,
    },
    "duration": {
        "text": "Guidelines Section IV(B)(2): marriage length = months from marriage to service of the petition. Standard duration ranges: < 24 months: 3 to 12 months; 24 to < 60: 6 to 36 months; 60 to < 120: 6 to 48 months; 120 to < 192: 12 to 60 months; 192 or more (not under the Rule of 65): 12 months up to 144 months or 50% of the marriage length, whichever is greater. Rule of 65: if the requesting spouse is at least 42, the marriage is at least 192 months, and age + marriage years >= 65, duration is discretionary. Courts cannot deviate from the duration ranges.",
        "table": [
            {"marriageMonthsMin": 0, "marriageMonthsMax": 24, "minMonths": 3, "maxMonths": 12},
            {"marriageMonthsMin": 24, "marriageMonthsMax": 60, "minMonths": 6, "maxMonths": 36},
            {"marriageMonthsMin": 60, "marriageMonthsMax": 120, "minMonths": 6, "maxMonths": 48},
            {"marriageMonthsMin": 120, "marriageMonthsMax": 192, "minMonths": 12, "maxMonths": 60},
            {"marriageMonthsMin": 192, "marriageMonthsMax": None, "minMonths": 12, "maxMonths": "greater of 144 or 50% of marriage months"},
        ],
        "url": AZ_SMG,
    },
    "eligibility": {
        "text": "A.R.S. § 25-319(A): the spouse seeking maintenance lacks sufficient property for reasonable needs, lacks earning ability adequate to be self-sufficient, is the parent of a child whose age or condition prevents outside work, made a significant contribution to the other spouse's education or career or reduced own career, or had a long marriage and is of an age that may preclude adequate employment. Maintenance is ordered without regard to marital misconduct (§ 25-319(C)).",
        "url": AZ_STAT,
    },
    "taxNote": TAX,
    "testCases": [
        {"inputs": {"marriageMonths": 61}, "expected": az_range(61), "what": "duration range in months", "source": "official example (60 months and 1 day -> 6 to 48 months), Guidelines Section IV(B)(2)"},
        {"inputs": {"marriageMonths": 300, "requestingSpouseAge": 40}, "expected": az_range(300), "what": "duration range in months (Rule of 65 not met; 50% of 300 = 150 > 144)", "source": "official example 1 (25 years, age 40 -> up to 150 months), Guidelines Section IV(B)(2)(b)"},
        {"inputs": {"marriageMonths": 150}, "expected": az_range(150), "what": "duration range in months", "source": "computed by hand from Guidelines Section IV(B)(2)(a)"},
    ],
    "facts": [
        {"text": "Arizona's maintenance amount comes from household expenditure data (BLS Consumer Expenditure Survey), not from a percentage of income.", "url": AZ_SMG},
        {"text": "There are no lifetime awards under the Guidelines; indefinite awards shift the burden of modification to the paying spouse.", "url": AZ_SMG},
        {"text": "Courts may deviate from the amount range but not from the duration ranges (Guidelines Section I).", "url": AZ_SMG},
        {"text": "Marriage length is counted only to the date the dissolution petition is served; cohabitation before the wedding is excluded.", "url": AZ_SMG},
    ],
    "uncertain": [
        "The 2025 guidelines PDF is hosted on azcourts.sharepoint.com (linked from the azcourts.gov page); downloaded copy research/raw/az-smg-2025.pdf (file AOCDRS99H-090125). AO 2025-101 itself not read (orders.azcourts.gov link returned 404).",
        "The brief said 'effective April 1, 2022'; the azcourts.gov page states the statute amendment was effective September 24, 2022 and the current guidelines are effective 09/01/2025.",
        "The calculator's expenditure tables are not published as a table in the guidelines, so the amount range cannot be reproduced offline.",
    ],
}

# ---------------------------------------------------------------- California
CA_4320 = "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=FAM&sectionNum=4320"
CA_4336 = "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=FAM&sectionNum=4336"
CA_SC = "https://santaclara.courts.ca.gov/system/files/rules/family.pdf"


def ca_sc(payer_net, payee_net):
    return r2(max(0, 0.40 * payer_net - 0.50 * payee_net))


california = {
    "slug": "california", "name": "California", "abbr": "CA", "verified": VERIFIED,
    "scope": "No statewide formula. Permanent (judgment) spousal support is set on the Fam. Code § 4320 factors. Temporary support uses county local formulas; Santa Clara County's is the best known and is used in the Judicial Council-approved support software.",
    "formula": {
        "text": "Santa Clara County Superior Court Local Family Rule 3(C) (effective 1/1/2011): temporary spousal or partner support is generally 40% of the payor's net income minus 50% of the payee's net income, adjusted for tax consequences; if there is child support, it is computed on net income not allocated to child support and child-related expenses. The court uses the formula at temporary hearings unless it would be inequitable or the demonstrated need is below the formula amount (Appendix, Discretionary Policy Statements, A.3). Not used for permanent support (Rule 3(B)).",
        "params": {"payerNetPct": 40, "payeeNetPct": 50, "county": "Santa Clara", "appliesTo": "temporary spousal or partner support", "afterChildSupport": True},
        "url": CA_SC,
    },
    "duration": {
        "text": "Fam. Code § 4320(l): goal that the supported party be self-supporting within a reasonable period, which generally is one-half the length of the marriage, except for a marriage of long duration. § 4336(b): rebuttable presumption that a marriage of 10 years or more (marriage to separation) is of long duration; the court then retains jurisdiction indefinitely (§ 4336(a)).",
        "table": [
            {"marriageYearsMin": 0, "marriageYearsMax": 10, "rule": "reasonable period generally = one-half the length of the marriage (§ 4320(l))"},
            {"marriageYearsMin": 10, "marriageYearsMax": None, "rule": "presumed long duration: no half-length rule; court retains jurisdiction indefinitely (§ 4336)"},
        ],
        "url": CA_4320,
    },
    "eligibility": {
        "text": "Fam. Code § 4320 lists the circumstances the court must consider for permanent support: earning capacity vs. marital standard of living, contributions to the other's education or career, ability to pay, needs, assets, duration, employability with children, age and health, documented domestic violence, tax consequences, hardships, the self-support goal, criminal conviction of an abusive spouse, and other just factors.",
        "url": CA_4320,
    },
    "taxNote": TAX,
    "testCases": [
        {"inputs": {"payerNetMonthly": 6000, "payeeNetMonthly": 2000, "childSupport": 0}, "expected": ca_sc(6000, 2000), "what": "Santa Clara temporary spousal support before tax adjustment (2,400 - 1,000)", "source": "computed by hand from Santa Clara Local Family Rule 3(C)"},
        {"inputs": {"marriageYears": 8}, "expected": 4.0, "what": "'reasonable period' benchmark in years (one-half of 8)", "source": "computed by hand from Fam. Code § 4320(l)"},
    ],
    "facts": [
        {"text": "A marriage of 10 years or more is presumed to be of long duration, and the court keeps jurisdiction over spousal support indefinitely (Fam. Code § 4336).", "url": CA_4336},
        {"text": "Documented domestic violence between the parties, including a nolo contendere plea or a protective order, is a factor in setting spousal support (Fam. Code § 4320(i)).", "url": CA_4320},
        {"text": "In Santa Clara County a computer support printout must be filed when child or temporary spousal support is at issue, but not for permanent support (Local Family Rule 3(B)).", "url": CA_SC},
    ],
    "uncertain": [
        "leginfo.legislature.ca.gov blocks scripts (Cloudflare); §§ 4320 and 4336 were read in a browser (4320 as amended by Stats. 2018, ch. 938, eff. Jan. 1, 2019).",
        "Alameda / Contra Costa local temporary support rules not checked.",
        "'Adjusted for tax consequences' means the formula runs on net incomes inside the certified software; the plain 40%/50% result is a pre-tax-adjustment approximation.",
    ],
}

# ---------------------------------------------------------------- New Mexico
NM_URL = "https://nmcourts.gov/wp-content/uploads/sites/30/2024/01/forms_AlimonyGuidelines.pdf"


def nm(payor, recip, children):
    a, b = (0.28, 0.58) if children else (0.30, 0.50)
    return r2(max(0, a * payor - b * recip))


new_mexico = {
    "slug": "new-mexico", "name": "New Mexico", "abbr": "NM", "verified": VERIFIED,
    "scope": "Statewide Alimony Guidelines and Commentaries (revised September 6, 2006), published on nmcourts.gov; advisory, used with the factors of NMSA 1978 § 40-4-7(E).",
    "formula": {
        "text": "Alimony Guideline Worksheet: no children for whom support is paid: 30% of payor's gross monthly income minus 50% of recipient's gross monthly income; with children for whom support is paid: 28% of payor's gross monthly income minus 58% of recipient's. Zero or negative = no alimony. Gross income = child support definition (NMSA 1978 § 40-4-11.1). Alimony is computed first and then subtracted from / added to gross incomes for child support. No cap recommended, but in high-income cases the guideline may be unreasonable.",
        "params": {"withoutChildren": {"payorGrossPct": 30, "recipientGrossPct": 50}, "withChildren": {"payorGrossPct": 28, "recipientGrossPct": 58}, "incomeCap": None},
        "url": NM_URL,
    },
    "duration": {
        "text": "Commentary II.F: 0 to < 5 years of marriage: generally no alimony; 5 to < 10: generally only rehabilitative or transitional; > 10 to < 20: some states use 30% to 50% of the years of marriage; > 20 years: the court reserves jurisdiction unless the parties agree to lump-sum non-modifiable support.",
        "table": [
            {"marriageYearsMin": 0, "marriageYearsMax": 5, "rule": "generally no alimony"},
            {"marriageYearsMin": 5, "marriageYearsMax": 10, "rule": "generally rehabilitative or transitional only"},
            {"marriageYearsMin": 10, "marriageYearsMax": 20, "pctMin": 30, "pctMax": 50, "rule": "durational range used by some states (illustrative)"},
            {"marriageYearsMin": 20, "marriageYearsMax": None, "rule": "court reserves jurisdiction"},
        ],
        "url": NM_URL,
    },
    "eligibility": {"text": "NMSA 1978 § 40-4-7(E) factors (age and health, earnings and earning capacity, good-faith efforts to be self-supporting, reasonable needs, duration of marriage, property awarded, assets, liabilities, income from property, agreements), reproduced in the guidelines.", "url": NM_URL},
    "taxNote": TAX,
    "testCases": [
        {"inputs": {"payorGrossMonthly": 6000, "recipientGrossMonthly": 1800, "children": False}, "expected": nm(6000, 1800, False), "what": "guideline monthly alimony", "source": "official Example 1 in the guidelines"},
        {"inputs": {"payorGrossMonthly": 6000, "recipientGrossMonthly": 1800, "children": True}, "expected": nm(6000, 1800, True), "what": "guideline monthly alimony", "source": "official Example 2 in the guidelines"},
    ],
    "facts": [
        {"text": "New Mexico's guideline formula was modelled on the Fairfax County, Virginia pendente lite guideline.", "url": NM_URL},
        {"text": "The guideline sets no income cap, consistent with New Mexico's child support guidelines.", "url": NM_URL},
    ],
    "uncertain": [
        "Guidelines date from 2006 (committee of the Second Judicial District, published statewide); no statute or rule makes them binding. NMSA § 40-4-7 itself not read on nmonesource.com.",
    ],
}

# ---------------------------------------------------------------- Maine
ME_URL = "https://legislature.maine.gov/statutes/19-A/title19-Asec951-A.html"
maine = {
    "slug": "maine", "name": "Maine", "abbr": "ME", "verified": VERIFIED,
    "scope": "Spousal support under 19-A M.R.S. § 951-A (general, transitional, reimbursement, nominal and interim support). No amount formula.",
    "formula": {"text": "No amount formula; the court considers the factors in § 951-A(5).", "params": {}, "url": ME_URL},
    "duration": {
        "text": "19-A M.R.S. § 951-A(2)(A)(1): rebuttable presumption that general support may not be awarded if married less than 10 years at filing, and may not exceed one-half the length of the marriage if married at least 10 but not more than 20 years. A finding that the presumed result is inequitable or unjust rebuts the presumption.",
        "table": [
            {"marriageYearsMin": 0, "marriageYearsMax": 10, "rule": "presumption: no general support"},
            {"marriageYearsMin": 10, "marriageYearsMax": 20, "maxPctOfMarriageLength": 50, "rule": "presumption: general support term <= 1/2 the marriage"},
            {"marriageYearsMin": 20, "marriageYearsMax": None, "rule": "no presumption"},
        ],
        "url": ME_URL,
    },
    "eligibility": {"text": "General support helps a spouse with substantially less income potential so both can keep a reasonable standard of living; transitional support covers short-term needs or work-force reentry; reimbursement support answers exceptional circumstances (economic misconduct or abuse, contributions to the other's education or career); interim support covers the pendency of the case (§ 951-A(2)).", "url": ME_URL},
    "taxNote": TAX,
    "testCases": [
        {"inputs": {"marriageYears": 16}, "expected": 8.0, "what": "presumptive maximum general support term in years", "source": "computed by hand from § 951-A(2)(A)(1)"},
        {"inputs": {"marriageYears": 8}, "expected": 0, "what": "presumptive general support (none)", "source": "computed by hand from § 951-A(2)(A)(1)"},
    ],
    "facts": [
        {"text": "Economic abuse by a spouse is listed as an exceptional circumstance justifying reimbursement support (19-A M.R.S. § 951-A(2)(C), PL 2023, c. 646).", "url": ME_URL},
        {"text": "Awards issued on or after October 1, 2013 can be modified on a substantial change in circumstances (§ 951-A(4)).", "url": ME_URL},
    ],
    "uncertain": ["Effective date of PL 2023, c. 646 (economic abuse amendment) not checked."],
}

# ---------------------------------------------------------------- Utah
UT_URL = "https://le.utah.gov/xcode/Title81/Chapter4/81-4-P5.html"
utah = {
    "slug": "utah", "name": "Utah", "abbr": "UT", "verified": VERIFIED,
    "scope": "Alimony under Utah Code Title 81, Chapter 4, Part 5 (recodified from former § 30-3-5, effective 9/1/2024). No amount formula.",
    "formula": {"text": "No amount formula; Utah Code § 81-4-502 lists factors (payee's financial condition and needs, earning capacity, payor's ability to pay, tax consequences, length of marriage, custody of minor children, work in the payor's business, contributions to the payor's skills).", "params": {}, "url": UT_URL},
    "duration": {
        "text": "Utah Code § 81-4-502(7): except for extenuating circumstances or good cause found before alimony ends, the court may not order alimony for longer than the length of the marriage; temporary alimony paid during the case counts toward that period. § 81-4-502(8): for parties who remarry each other, the two marriages are aggregated if the later divorce petition is filed on or after January 1, 2026.",
        "table": [{"rule": "max duration = length of the marriage", "maxPctOfMarriageLength": 100}],
        "url": UT_URL,
    },
    "eligibility": {"text": "Factors of Utah Code § 81-4-502; alimony terminates on the payee's remarriage or death and the court may not order (and shall terminate) alimony if the payee cohabits (§ 81-4-505).", "url": UT_URL},
    "taxNote": TAX,
    "testCases": [{"inputs": {"marriageYears": 7, "temporaryAlimonyMonthsPaid": 12}, "expected": 72, "what": "maximum remaining months of alimony after the decree (84 - 12)", "source": "computed by hand from § 81-4-502(7)(a)-(b)"}],
    "facts": [
        {"text": "Months of temporary alimony paid during the divorce count toward the length-of-marriage limit (Utah Code § 81-4-502(7)(b)).", "url": UT_URL},
        {"text": "A payor must seek termination for cohabitation within one year of when he or she knew or should have known of it (§ 81-4-505(2)(b)).", "url": UT_URL},
        {"text": "Retirement of a party is a substantial material change allowing a petition to modify alimony unless the decree says otherwise (§ 81-4-504(2)).", "url": UT_URL},
    ],
    "uncertain": ["Text read from the Part 5 PDF download (C81-4-P5_2024090120240501.pdf) which already includes 2026 General Session amendments (ch. 249); subsection numbering should be re-checked on the section pages before publishing."],
}

# ---------------------------------------------------------------- engine-ready fields
# Income basis of each state's inputs, extra parameters the engines read (each restates a figure quoted in
# formula/duration text above, same source), and test cases in the harness format of tests/engine.test.ts:
# inputs {payer, payee, years, children, childSupport} MONTHLY; expected = monthly number or {monthly|low|high}.
# "durationMonths" in expected is documentation (the harness checks only monthly/low/high).
def tc(payer, payee, years, children, expected, what, source, cs=0):
    return {"inputs": {"payer": payer, "payee": payee, "years": years, "children": children, "childSupport": cs}, "expected": expected, "what": what, "source": source}


BASIS = {"texas": "gross", "florida": "net", "illinois": "net", "pennsylvania": "net", "new-york": "gross", "colorado": "gross",
         "massachusetts": "gross", "virginia": "gross", "arizona": "gross", "california": "net", "new-mexico": "gross", "maine": "gross", "utah": "gross"}
for s in [texas, florida, illinois, pennsylvania, new_york, colorado, massachusetts, virginia, arizona, california, new_mexico, maine, utah]:
    s["incomeBasis"] = BASIS[s["slug"]]

virginia["formula"]["params"]["reservationPresumptionPctOfMarriage"] = 50  # § 20-107.1(D)
california["formula"]["params"].update({"longMarriageYears": 10, "reasonablePeriodPctOfMarriage": 50})  # §§ 4336(b), 4320(l)
arizona["duration"]["table"][-1] = {"marriageMonthsMin": 192, "marriageMonthsMax": None, "minMonths": 12, "maxMonths": 144, "orPctOfMarriageIfGreater": 50,
                                     "rule": "12 months up to 144 months or 50% of the length of the marriage, whichever is greater (not under the Rule of 65)"}
arizona["formula"]["params"]["ruleOf65"] = {"minAge": 42, "minMarriageMonths": 192, "ageplusYears": 65}
massachusetts["duration"]["table"][0]["marriageYearsMin"] = 0

TXS = "computed by hand from Tex. Fam. Code §§ 8.054-8.055"
texas["testCases"] = [
    tc(8000, 0, 15, False, {"monthly": tx_cap(8000), "durationMonths": 60}, "maximum monthly maintenance (20% of 8,000 < $5,000), 15-year marriage: 5 years max", TXS),
    tc(40000, 0, 25, False, {"monthly": tx_cap(40000), "durationMonths": 84}, "maximum monthly maintenance ($5,000 cap binds), 25-year marriage: 7 years max", TXS),
]
FLS = "computed by hand from Fla. Stat. § 61.08(5), (8)(b)-(c)"
florida["testCases"] = [
    tc(8000, 3000, 15, False, {"monthly": r2(0.35 * 5000), "durationMonths": 108}, "maximum monthly durational alimony (35% x 5,000), moderate-term 15 years: 60% = 108 months", FLS),
    tc(6000, 2000, 8, True, {"monthly": r2(0.35 * 4000), "durationMonths": 48}, "maximum monthly durational alimony (35% x 4,000), short-term 8 years: 50% = 48 months", FLS),
]
ILS = "computed by hand from 750 ILCS 5/504(b-1)(1)(A)-(B)"
illinois["testCases"] = [
    tc(10000, 10000 / 3, 12, False, {"monthly": r2(il_amount(120000, 40000) / 12), "durationMonths": 74.88}, "monthly guideline maintenance (annual 120,000/40,000: 40% cap gives 24,000/yr), 12 years x 0.52", ILS),
    tc(7500, 0, 21, False, {"monthly": r2(il_amount(90000, 0) / 12)}, "monthly guideline maintenance (1/3 of 7,500 under the 40% cap)", ILS),
]
PAS = "computed by hand from Pa.R.Civ.P. 1910.16-4(a)(1) Part B"
pennsylvania["testCases"] = [
    tc(6000, 2000, 10, False, pa_partB(6000, 2000, False), "monthly spousal support/APL without children (1,980 - 800)", PAS),
    tc(6000, 2000, 10, True, pa_partB(6000, 2000, True), "monthly spousal support/APL with children (1,500 - 600), before child support", PAS, cs=1000),
]
NYS = "computed by hand from DRL § 236(B)(6)(c)-(d), (f) and the March 1, 2026 cap"
new_york["testCases"] = [
    tc(12500, 40000 / 12, 18, False, {"monthly": r2(ny_amount(150000, 40000, False) / 12), "durationMonths": 86.4}, "monthly guideline maintenance, no child support (annual 36,000), 18 years: 30%-40%", NYS),
    tc(12500, 40000 / 12, 10, True, r2(ny_amount(150000, 40000, True) / 12), "monthly guideline maintenance, payor pays child support (annual 20,000)", NYS),
    tc(25000, 0, 25, False, r2(ny_amount(300000, 0, False) / 12), "monthly guideline maintenance on income up to the $241,000 cap (30% x 241,000 / 12)", NYS),
]
COS = "computed by hand from the Colorado Judicial Branch advisement worksheet and table"
colorado["testCases"] = [
    tc(8000, 2000, 6.5, False, {"monthly": co_amount(8000, 2000), "durationMonths": 30}, "advisory monthly maintenance (Line F 2,000 x 0.80), 78-month marriage: 30 months (official example)", COS),
    tc(12000, 3000, 10, True, {"monthly": co_amount(12000, 3000), "durationMonths": 54}, "advisory monthly maintenance (Line F 3,000 x 0.75), 120 months: 54 months", COS),
    tc(15000, 6000, 10, False, 0, "no guideline: combined income above $240,000 a year", COS),
]
MAS = "computed by hand from M.G.L. c. 208 §§ 49(b), 53(b) as stated by the Probate and Family Court"
massachusetts["testCases"] = [
    tc(12500, 50000 / 12, 12, False, {"low": r2(0.30 * 100000 / 12), "high": r2(0.35 * 100000 / 12), "durationMonths": 100.8}, "monthly general term alimony ceiling range (30%-35% of the gross difference), 12 years: 70% of 144 months", MAS),
    tc(6000, 2000, 5, False, {"low": 1200, "high": 1400, "durationMonths": 30}, "monthly range 30%-35% of 4,000; 60-month marriage: 30 months (court's example)", MAS),
]
VAS = "computed by hand from Va. Code § 16.1-278.17:1(C), (E)"
virginia["testCases"] = [
    tc(7000, 2000, 10, True, va_pl(7000, 2000, True), "presumptive monthly pendente lite support with children (1,820 - 1,160)", VAS),
    tc(7000, 2000, 10, False, va_pl(7000, 2000, False), "presumptive monthly pendente lite support without children (1,890 - 1,000)", VAS),
    tc(9000, 2000, 10, False, 0, "no presumptive amount: combined monthly gross above $10,000", VAS),
]
AZS = "Arizona Spousal Maintenance Guidelines (2025) Section IV(B)(2)"
arizona["testCases"] = [
    tc(8000, 2000, 61 / 12, False, {"monthly": 0, "durationMonths": 48}, "amount from the court calculator; 61-month marriage: 6 to 48 months (official example)", AZS),
    tc(8000, 2000, 25, False, {"monthly": 0, "durationMonths": 150}, "amount from the court calculator; 25-year marriage: 12 to 150 months (official example 1)", AZS),
]
CAS = "computed by hand from Santa Clara Local Family Rule 3(C) and Fam. Code §§ 4320(l), 4336"
california["testCases"] = [
    tc(6000, 2000, 8, False, {"monthly": ca_sc(6000, 2000), "durationMonths": 48}, "Santa Clara temporary support (2,400 - 1,000), 8-year marriage: half = 48 months", CAS),
    tc(6000, 2000, 12, True, {"monthly": ca_sc(6000 - 1000, 2000)}, "Santa Clara temporary support on net income after $1,000 child support (2,000 - 1,000)", CAS, cs=1000),
]
NMS = "official examples 1 and 2, New Mexico Alimony Guidelines (2006)"
new_mexico["testCases"] = [
    tc(6000, 1800, 10, False, nm(6000, 1800, False), "guideline monthly alimony, no children (Example 1)", NMS),
    tc(6000, 1800, 10, True, nm(6000, 1800, True), "guideline monthly alimony, two children (Example 2)", NMS),
]
MES = "computed by hand from 19-A M.R.S. § 951-A(2)(A)(1)"
maine["testCases"] = [
    tc(6000, 2000, 16, False, {"monthly": 0, "durationMonths": 96}, "no amount formula; 16-year marriage: general support presumed at most 96 months", MES),
    tc(6000, 2000, 8, False, {"monthly": 0, "durationMonths": 0}, "no amount formula; 8-year marriage: presumption of no general support", MES),
]
utah["testCases"] = [
    tc(6000, 2000, 7, False, {"monthly": 0, "durationMonths": 84}, "no amount formula; 7-year marriage: alimony at most 84 months", "computed by hand from Utah Code § 81-4-502(7)(a)"),
]

STATES = [texas, florida, illinois, pennsylvania, new_york, colorado, massachusetts, virginia, arizona, california, new_mexico, maine, utah]

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for s in STATES:
        with open(os.path.join(OUT, s["slug"] + ".json"), "w", encoding="utf-8") as f:
            json.dump(s, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(s["slug"], [t["expected"] for t in s["testCases"]])
