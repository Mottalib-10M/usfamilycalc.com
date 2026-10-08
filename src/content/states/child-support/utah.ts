import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, day } from '../../../lib/kit';

const d = cs('utah');
const rows = d.schedule!.rows as Array<Array<number | null>>;
const top = rows[rows.length - 1];
const F = d.formula as { jointMinPctOfYear: number; jointBand1From: number; jointBand1To: number; jointBand1Factor: number; jointBand2From: number; jointBand2Factor: number; equalTimeLowerIncomeOvernights: number; soleMinimumAward: number; childcareSharePct: number };
const LOW = (d as unknown as { extra: { lowIncomeTable: { rows: Array<Array<number | null>> } } }).extra.lowIncomeTable.rows;
const firstFull = rows.find((r) => r.slice(2).every((v) => v != null))!;
const A = 4000, B = 2000;
const sole = csCalc('utah', A, B, 2);
const nights = [0, 110, 120, 130, 146, 183];
const ladder = nights.map((n) => csCalc('utah', A, B, 2, { payerOvernights: n }).monthly);
const lowA = 1500;
const low = csCalc('utah', lowA, 0, 1);
const lowTop = Math.max(...LOW.filter((r) => r[2] != null).map((r) => r[1] as number));

export default defineStatePage({
  topic: 'child-support',
  slug: 'utah',
  title: 'Utah Child Support Calculator 2026: Title 81 Tables',
  description: `Utah child support 2026 with the Title 81 tables: ${usd(A)} and ${usd(B)} of adjusted gross income, two children, ${usd(sole.monthly)} a month owed under sole physical custody.`,
  intro: 'The base combined table of Utah Code § 81-6-304, the obligor-only low income table and the joint custody overnight formula.',
  resume: `Utah child support in 2026 comes from tables that moved: since September 1, 2024 they sit in the new Utah Domestic Relations Code, Title 81, Chapter 6, and the old section numbers of Title 78B, Chapter 12 no longer exist. With ${usd(A)} and ${usd(B)} of monthly adjusted gross income and two children, the base combined obligation is ${usd(sole.basicMonthly)} and the parent without the children pays ${usd(sole.monthly)} a month. When each parent has the children more than ${num(F.jointMinPctOfYear)}% of the nights, joint physical custody applies and every overnight past ${num(F.jointBand1From)} subtracts a fixed slice of the base amount, a larger slice after ${num(F.jointBand2From)}: at ${num(nights[4])} nights the same parent owes ${usd(ladder[4])}. Very low incomes use a second table read on one parent's own income, with a ${usd(F.soleMinimumAward)} floor. The tables apply to orders entered since January 1, 2023.`,
  body: (h) => `<h2>Old citations, new home</h2>
<p>Court forms, articles and older orders still cite § 78B-12-301 for the table and § 78B-12-208 for joint custody. Chapter 366 of the 2024 General Session renumbered the whole child support act into Title 81: the base combined table is now § 81-6-304, the low income table § 81-6-305, sole custody § 81-6-205 and joint custody § 81-6-206. The amounts did not change with the move. They apply to orders entered for the first time since January 1, 2023, and a final order from before that date could be modified onto them from January 1, 2025.</p>
<h2>Fixed slices per overnight</h2>
<p>Utah does not cross-multiply time shares the way many income shares states do. Once both parents pass the ${num(F.jointMinPctOfYear)}% line, the parent with fewer overnights starts from an income share of the base combined obligation and loses ${num(F.jointBand1Factor, 4)} of that obligation for each night from ${num(F.jointBand1From + 1)} to ${num(F.jointBand1To)}, then ${num(F.jointBand2Factor, 4)} for each night beyond. A result below zero turns the other parent into the payer. On an equal schedule the lower earner is counted at ${num(F.equalTimeLowerIncomeOvernights)} nights, whichever split the plan shows.</p>
${h.table(['Overnights with the paying parent', 'Monthly award, two children'], nights.map((n, i) => [num(n), usd(ladder[i])]), `Utah, ${usd(A)} and ${usd(B)} of adjusted gross income, no add-ons`, ['l', 'r'])}
<p>The first slices are thin: the ${num(nights[2] - F.jointBand1From)} extra nights between ${num(F.jointBand1From)} and ${num(nights[2])} save ${usd(ladder[1] - ladder[2])}. Above ${num(F.jointBand2From)} each night is worth about three times as much.</p>
<h2>Blank cells and the second table</h2>
<p>The base table opens at ${usd(rows[0][0] as number)} with a single amount for one child; columns for more children begin further down, and the first line with all six columns is ${usd(firstFull[0] as number)}. Where the cell is blank the base combined obligation is zero, and each parent's award comes from the low income table on that parent's own income, which runs to ${usd(lowTop)} for one child. A parent earning ${usd(lowA)} alone owes ${usd(low.monthly)} for one child. A parent below the top of that table pays the lesser of the two tables. At the other end, the table stops at ${usd(top[1] as number)} and Utah sets no ceiling: the court orders a just amount, never less than ${usd(top[7] as number)} for six children or the top line for fewer.</p>
<h3>Costs split down the middle</h3>
<p>Child care and the children's health premium are not prorated by income in Utah: each parent pays ${num(F.childcareSharePct)}%, and so do uninsured medical and dental bills. From January 1, 2027 orders must also carry a minimal child care award from a new table. The statutes are on ${h.ext('https://le.utah.gov/xcode/Title81/Chapter6/81-6.html', 'le.utah.gov')}; alimony runs on its own rules, see ${h.a('alimony:utah', 'Utah alimony')}.</p>`,
  faqs: [
    { q: 'Where did Utah Code 78B-12-301 go?', a: `It was renumbered. Since September 1, 2024 Utah's child support law sits in Title 81, Chapter 6 of the Utah Domestic Relations Code: the base combined child support obligation table is § 81-6-304, the low income table § 81-6-305 and joint physical custody § 81-6-206. The figures are the tables in force for orders since January 1, 2023, so a worksheet citing the old numbers gives the same amount.` },
    { q: 'How many overnights make joint physical custody in Utah?', a: `More than ${num(F.jointMinPctOfYear)}% of the year with each parent, with both parents contributing to the child's expenses beyond support. The formula in § 81-6-206 then reduces the lower-overnight parent's share by ${num(F.jointBand1Factor, 4)} of the base obligation per night over ${num(F.jointBand1From)} and under ${num(F.jointBand1To + 1)}, and by ${num(F.jointBand2Factor, 4)} per night over ${num(F.jointBand2From)}.` },
    { q: 'What is the minimum child support in Utah?', a: `In sole physical custody the base award cannot be below ${usd(F.soleMinimumAward)} a month (§ 81-6-205(5)). Low earners are read on the low income table, which starts at ${usd(LOW[0][2] as number)} for the first income bracket. In joint custody there is no floor: when the base combined obligation is zero, both awards are zero. Incarcerated obligors follow separate rules in § 81-6-211.5.` },
    { q: 'Does Utah child support end at 18?', a: 'Usually at 18, but a child still enrolled in high school during the normal and expected year of graduation keeps receiving support until that graduation, and a child of any age who is incapacitated from earning a living can be supported for longer. Parents can agree to more, for example help with college, but the statute does not require it.' },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:idaho', 'alimony:utah'],
});
