#!/usr/bin/env python3
"""Builds research/divorce/parts/g2b.json (HI, ID, IA, KS, KY, LA). Every figure below was read from the
official page cited in the object (raw copies in research/raw/divorce/, fetched with divorce_fetch.py)."""
import json, os
OUT = os.path.join(os.path.dirname(__file__), '..', 'divorce', 'parts', 'g2b.json')
HI_FEES = "https://www.courts.state.hi.us/docs/courts_docs/Family_Court_Fees.pdf"
HI_PACK = "https://www.courts.state.hi.us/docs/docs4/Divorce-With-Children-Packet.pdf"
HI_5801 = "https://www.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0580/HRS_0580-0001.htm"
HI_58042 = "https://www.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0580/HRS_0580-0042.htm"
ID_APPA = "https://isc.idaho.gov/rules/Appendix-A-Civil-Case-Filing-Fees-071224.pdf"
IA_FEES = "https://www.iowacourts.gov/for-the-public/representing-yourself/civil-court-fees/"
KS_DOCK = "https://kscourts.gov/KSCourts/media/30_JD/DocketFees.pdf"
KS_2001 = "https://www.ksrevisor.gov/statutes/chapters/ch60/060_020_0001.html"
KY = "https://apps.legislature.ky.gov/law/statutes/statute.aspx?id="
LA = "https://legis.la.gov/Legis/Law.aspx?d="
LA_EBR = "https://www.ebrclerk.com/s/17_Advance-Cost-Fee-Schedule-lhzs.pdf"
data = [
 {"slug": "hawaii", "name": "Hawaii", "abbr": "HI",
  "filingFee": 215, "responseFee": None, "feeScope": "statewide",
  "feeText": "Family Court divorce filing fee: initial filing fee $100 (HRS § 607-5(b)(15)) + surcharge $65 + computer system surcharge $50 = $215; a $50 parent education surcharge is added (total $265) if either party has minor children (Judiciary family court fee sheet, effective 6/17/22).",
  "feeUrl": HI_FEES,
  "otherFees": [
    {"what": "Total filing fee with minor children (includes $50 parent education surcharge)", "amount": 265, "url": HI_FEES},
    {"what": "Motions in a divorce case", "amount": 0, "url": HI_FEES}],
  "waiver": {"name": "Ex Parte Motion and Affidavit to Waive Filing Fees (as named in the Judiciary divorce packet)", "url": HI_PACK},
  "residency": {"text": "The applicant must be domiciled in the circuit at the time the complaint is filed; there is a military exception and an exception for marriages solemnized in Hawaii when the parties' home jurisdiction will not grant a divorce (HRS § 580-1(a), (b)).", "url": HI_5801},
  "waitingPeriod": {"days": 0, "text": "No statutory waiting period; an uncontested divorce may be granted on affidavit without a hearing. If one spouse denies the marriage is irretrievably broken, the court may continue the matter 30 to 60 days (HRS § 580-42).", "url": HI_58042},
  "simplified": {"text": "Uncontested divorces may proceed on affidavit; the court may waive the hearing and admit proof by affidavit (HRS § 580-42(a)).", "url": HI_58042},
  "parentingClass": {"required": True, "text": "In divorces with minor children the clerk issues a Notice to Attend Kids First for both parents (and the children) and a $50 parent education surcharge is charged at filing (Judiciary divorce packet and fee sheet).", "url": HI_PACK},
  "uncertain": [
    "capitol.hawaii.gov returned 403 to automated clients on 2026-10-08; HRS § 580-1 and § 580-42 were read from Internet Archive copies (2023-02-01 and 2023-12-08) of the official URLs. The 2023 text of § 580-1 (as amended by L 2021, c 69) requires only domicile at filing, with no minimum duration; any later amendment was not checked.",
    "Response/answer fee not stated on the Judiciary fee sheet (it lists motions as no fee); left null.",
    "The divorce packet read is the Fifth Circuit (Kauai) version; Kids First attendance in other circuits was not verified separately."]},
 {"slug": "idaho", "name": "Idaho", "abbr": "ID",
  "filingFee": 207, "responseFee": 136, "feeScope": "statewide",
  "feeText": "Category B.1 Divorce, with or without minor children: $207 (I.R.C.P. Appendix A filing fee schedule, effective July 12, 2024; I.C. § 31-3201A).",
  "feeUrl": ID_APPA,
  "otherFees": [{"what": "Initial appearance by a party other than the petitioner (Category I.1)", "amount": 136, "url": ID_APPA}],
  "waiver": {"name": "Affidavit of indigency / fee waiver request under Idaho Code § 31-3220", "url": "https://legislature.idaho.gov/statutesrules/idstat/Title31/T31CH32/SECT31-3220/"},
  "residency": {"text": "The plaintiff must have been a resident of Idaho for six full weeks before filing (I.C. § 32-701).", "url": "https://legislature.idaho.gov/statutesrules/idstat/Title32/T32CH7/SECT32-701/"},
  "waitingPeriod": {"days": 21, "text": "No hearing on the merits and no final decree until at least 21 days after commencement of the action and service of process (I.C. § 32-716).", "url": "https://legislature.idaho.gov/statutesrules/idstat/Title32/T32CH7/SECT32-716/"},
  "simplified": {"text": "No summary or simplified dissolution procedure was found in Idaho Code title 32, chapter 7.", "url": None},
  "parentingClass": {"required": False, "text": "Not mandatory statewide: the court may order parent education and parenting classes (I.R.F.L.P. 1001(c)); local district practice varies.", "url": "https://isc.idaho.gov/irflp"},
  "uncertain": [
    "legislature.idaho.gov sections 32-701, 32-716, 31-3201A and 31-3220 and the Appendix A PDF were read from Internet Archive 2026 copies of the official URLs (direct requests failed).",
    "Exact title of the Idaho fee-waiver form not verified (courtselfhelp.idaho.gov unreachable); the statute is cited instead.",
    "Whether a given judicial district requires a parenting class by local order was not checked."]},
 {"slug": "iowa", "name": "Iowa", "abbr": "IA",
  "filingFee": 285, "responseFee": None, "feeScope": "statewide",
  "feeText": "Divorce - dissolution of marriage, including docketing of the decree: $285 (Iowa Judicial Branch civil court fees page, citing Iowa Code § 602.8105(1)(b)).",
  "feeUrl": IA_FEES,
  "otherFees": [],
  "waiver": {"name": "Application to Defer Costs", "url": IA_FEES},
  "residency": {"text": "Unless the respondent is an Iowa resident personally served, the petition must state that the petitioner has been an Iowa resident for the last year (Iowa Code § 598.5(1)(k)).", "url": "https://www.legis.iowa.gov/docs/code/598.5.pdf"},
  "waitingPeriod": {"days": 90, "text": "No decree before 90 days have elapsed from service of the original notice (or last publication, or filing of waiver/acceptance of service), unless the court waives it for emergency or necessity (Iowa Code § 598.19).", "url": "https://www.legis.iowa.gov/docs/code/598.19.pdf"},
  "simplified": {"text": "No statutory summary dissolution procedure was found in Iowa Code chapter 598.", "url": None},
  "parentingClass": {"required": True, "text": "Parties to any action involving child custody or visitation must attend a court-approved course within 45 days of service of the petition, unless waived for good cause (Iowa Code § 598.15).", "url": "https://www.legis.iowa.gov/docs/code/598.15.pdf"},
  "uncertain": [
    "Conflict between official sources: Iowa Code 2026 § 602.8105(1)(b) (legis.iowa.gov PDF generated Dec 12, 2025) states $265, while the Iowa Judicial Branch fees page read on 2026-10-08 states $285 for the same subsection. The court page is used as the amount currently collected (presumably a 2026 amendment); not confirmed against a 2026 session law.",
    "Response/answer fee: none listed on the Judicial Branch fee page; left null."]},
 {"slug": "kansas", "name": "Kansas", "abbr": "KS",
  "filingFee": 173, "responseFee": None, "feeScope": "statewide",
  "feeText": "Statutory docket fee of $173 for any case filed in district court (K.S.A. 60-2001(a)); the Judicial Branch chart lists Domestic as $173 + $22 surcharge = $195, but that chart is labelled 'Effective July 1, 2020, through June 30, 2025'.",
  "feeUrl": KS_2001,
  "otherFees": [{"what": "Supreme Court surcharge (authorized by K.S.A. 60-2001(a) through June 30, 2025)", "amount": 22, "url": KS_DOCK},
                {"what": "Post-decree motion (K.S.A. 28-179) docket fee + surcharge per FY2021-2025 chart", "amount": 62, "url": KS_DOCK}],
  "waiver": {"name": "Poverty affidavit in lieu of docket fee (K.S.A. 60-2001(b))", "url": KS_2001},
  "residency": {"text": "The petitioner or respondent must have been an actual resident of Kansas for 60 days immediately before filing (K.S.A. 23-2703(a)).", "url": "https://www.ksrevisor.gov/statutes/chapters/ch23/023_027_0003.html"},
  "waitingPeriod": {"days": 60, "text": "A divorce action shall not be heard until 60 days after the petition is filed, unless the judge declares an emergency (K.S.A. 23-2708).", "url": "https://www.ksrevisor.gov/statutes/chapters/ch23/023_027_0008.html"},
  "simplified": {"text": "No summary dissolution procedure was found in K.S.A. chapter 23, article 27.", "url": None},
  "parentingClass": {"required": None, "text": "Not verified.", "url": None},
  "uncertain": [
    "The $22 surcharge is authorized by K.S.A. 60-2001(a) only 'through June 30, 2025' in the text read on ksrevisor.gov (history ends L. 2019); no official FY2026 docket fee chart was found, so whether the total is still $195 is unverified. filingFee is the statutory $173 only.",
    "Response fee: Kansas charges a docket fee only on filing a case; no answer fee found; left null.",
    "Parenting education requirement not checked (local rules vary by judicial district)."]},
 {"slug": "kentucky", "name": "Kentucky", "abbr": "KY",
  "filingFee": None, "responseFee": None, "feeScope": "statewide",
  "feeText": "Circuit Court civil filing fees are set by Supreme Court rule (KRS 23A.200(1)); the current schedule was not found on an official page.",
  "feeUrl": KY + "20629",
  "otherFees": [{"what": "Service of process by sheriff, per process (KRS 23A.200(2))", "amount": 20, "url": KY + "20629"}],
  "waiver": {"name": "Application to proceed as a poor person (in forma pauperis) under KRS 453.190", "url": KY + "46760"},
  "residency": {"text": "One party must have resided in Kentucky (or been stationed there in the armed services) for 180 days before filing the petition (KRS 403.140(1)(a)).", "url": KY + "1447"},
  "waitingPeriod": {"days": 60, "text": "No decree until the parties have lived apart for 60 days, which can include living under the same roof without sexual cohabitation (KRS 403.170(1)); where there are minor children no testimony except on temporary motions until 60 days after service of summons, warning order appointment or the defendant's appearance (KRS 403.044).", "url": KY + "1450"},
  "separationRequiredDays": 60,
  "simplified": {"text": "No summary dissolution procedure was found in KRS chapter 403.", "url": None},
  "parentingClass": {"required": None, "text": "Not verified; parent education is set by local family court rules.", "url": None},
  "uncertain": [
    "Filing fee not verified: KRS 23A.200 delegates civil fees to a Supreme Court rule, and the fee schedule was not found on kycourts.gov (the Clerk's Manual read via the Internet Archive does not list it).",
    "Exact KY fee-waiver form name/number not verified (kycourts.gov forms blocked; archive copy unavailable).",
    "Parenting class: Jefferson Family Court rules (C30FAMILYRULES) could not be retrieved."]},
 {"slug": "louisiana", "name": "Louisiana", "abbr": "LA",
  "filingFee": 150, "responseFee": None, "feeScope": "county (East Baton Rouge Parish)",
  "feeText": "East Baton Rouge Parish Clerk of Court advance cost deposit for a new family suit: $150 without service of process, $240 with one service of process (Advance Cost Fee Schedule, Form #17 rev. 7/3/24). Deposits are estimates; further costs are billed against them (R.S. 13:842).",
  "feeUrl": LA_EBR,
  "otherFees": [
    {"what": "New family suit with one service of process (deposit)", "amount": 240, "url": LA_EBR},
    {"what": "Rule to show cause under C.C. art. 102 (one rule)", "amount": 145, "url": LA_EBR},
    {"what": "Judgment of divorce", "amount": 125, "url": LA_EBR},
    {"what": "Reconvention / third-party demand / cross claim, initial page", "amount": 41, "url": LA_EBR}],
  "waiver": {"name": "Proceeding in forma pauperis (pauper affidavit; La. C.C.P. art. 5181 et seq.), handled by the clerk's Suit Accounting Department", "url": "https://www.ebrclerk.com/suit-accounting"},
  "residency": {"text": "A divorce may be brought if one or both spouses are domiciled in Louisiana; a spouse who has established and maintained a residence in a parish for six months is rebuttably presumed domiciled there (La. C.C.P. art. 10(A)(7), (B)).", "url": "https://legis.la.gov/Legis/Law.aspx?d=111104"},
  "waitingPeriod": {"days": 180, "text": "Under C.C. art. 102 the divorce is granted on a rule filed after 180 days (365 days if there are minor children) have elapsed from service of the petition and the spouses have lived separate and apart for that period (C.C. arts. 102, 103.1).", "url": LA + "108532"},
  "separationRequiredDays": 180,
  "simplified": {"text": "Alternatively, a divorce is granted on petition if the spouses have already lived separate and apart for 180 days (365 days with minor children) when the petition is filed (C.C. arts. 103(1), 103.1). Covenant marriages follow separate rules.", "url": LA + "108533"},
  "parentingClass": {"required": None, "text": "Not verified.", "url": None},
  "uncertain": [
    "Waiting period is 365 days instead of 180 when there are minor children of the marriage (C.C. art. 103.1(2)); the days field holds the no-children figure.",
    "Fee is an advance deposit, not a fixed fee; the cost actually charged depends on pleadings and services. Schedule is dated rev. 7/3/24 (latest found).",
    "Response/answer fee not stated as a fixed amount; left null.",
    "La. R.S. 9:306 (divorcing-parent seminar) could not be reached on legis.la.gov (postback navigation); parenting class left null."]},
]
json.dump(data, open(OUT, 'w'), indent=2, ensure_ascii=False)
print('wrote', len(data), OUT)
