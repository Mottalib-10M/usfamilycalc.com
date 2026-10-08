import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day } from '../../../lib/kit';

const d = cs('arizona');
const S = d.schedule!;
type Band = { daysFrom: number; daysTo: number | null; pct: number };
const PT = (d.shared as unknown as { table: Band[] }).table;
const last = PT[PT.length - 1];
const firstPaid = PT.find((b) => b.pct > 0)!;
const A = 5000, B = 3000;
const none = csCalc('arizona', A, B, 2);
const at = (days: number) => csCalc('arizona', A, B, 2, { payerOvernights: days });
const sharePct = (A / (A + B)) * 100;
const top = csCalc('arizona', 40000, 10000, 1);
const mid = PT[Math.floor(PT.length / 2)];
const before = at(mid.daysFrom - 1), after = at(mid.daysFrom);
const lastBand = PT[PT.length - 2];

export default defineStatePage({
  topic: 'child-support',
  slug: 'arizona',
  title: `Arizona Child Support 2026: Parenting Time Counted in Days`,
  description: `Arizona child support 2026 under the ${d.effective!.slice(0, 4)} guidelines: closest-row schedule to ${usd(S.maxIncome)}, a ${PT.length}-step parenting time table, and ${usd(none.monthly)} a month for two kids.`,
  intro: 'The Arizona Child Support Guidelines turn parenting time into a percentage of the basic obligation, step by step.',
  resume: `A parent in Arizona with ${usd(A)} of monthly child support income, next to a co-parent at ${usd(B)}, carries ${pct(Math.round(sharePct * 10) / 10)} of the basic obligation for two children: ${usd(none.monthly)} a month before insurance and child care, when that parent has fewer than ${num(firstPaid.daysFrom)} parenting days a year. Arizona does not use a single shared-custody switch. Its Parenting Time Table has ${PT.length} bands, and each band takes a fixed percentage of the basic obligation off the paying parent's share, from ${pct(firstPaid.pct * 100)} at ${num(firstPaid.daysFrom)} days up to ${pct(last.pct * 100)} once the count reaches ${num(last.daysFrom)}. The count is made in days built from hours, so an overnight that ends at breakfast is not a full day. The schedule rows go from ${usd(S.minIncome)} to ${usd(S.maxIncome)} of combined income in steps of ${usd(S.rows[1][0] - S.rows[0][0])}, and the guidelines in force were adopted for orders entered from ${day(d.effective!)}.`,
  body: (h) => `<h2>Hours, quarter days and half days</h2>
<p>Many income-shares states count overnights. Arizona counts parenting time in blocks of hours and converts each block into days, and the conversion rule sits in the guidelines themselves: ${d.sharedText.match(/\(24 hours[^)]*\)/)?.[0] ?? ''}. Short visits therefore matter. A Wednesday dinner from 5 p.m. to 8 p.m. every week is a quarter day each time, so about thirteen days over a year; added to a few holiday weekends, that can carry a parent into the second band of the table.</p>
<p>Pickup and return times are what the court looks at. If the exchange happens at school, the receiving parent's time starts when classes end, not at the morning drop-off. Two families with the same calendar of weekends can land in different bands because one hands over on Sunday evening and the other on Monday morning.</p>
<h2>What each band is worth for one family</h2>
<p>The table below runs the calculator for the same couple, ${usd(A)} and ${usd(B)} a month, two children, no add-ons. The paying parent's share of the basic obligation is ${usd(none.basicMonthly * (A / (A + B)))}; the parenting time percentage is applied to the whole basic obligation of ${usd(none.basicMonthly)}, not to that share, which is why the drop is steep near the top of the table.</p>
${h.table(['Parenting days a year', 'Percentage', 'Monthly support'], PT.map((b) => [b.daysTo == null ? `${num(b.daysFrom)} or more` : `${num(b.daysFrom)} to ${num(b.daysTo)}`, pct(b.pct * 100), usd(at(b.daysFrom).monthly)]), `Arizona Parenting Time Table applied to ${usd(A)} and ${usd(B)} of monthly income, two children`, ['left', 'right', 'right'])}
<p>One extra day can move a parent across a line: at ${num(mid.daysFrom - 1)} days this family's order is ${usd(before.monthly)}, at ${num(mid.daysFrom)} days it is ${usd(after.monthly)}. The highest band starts at ${num(last.daysFrom)} days, where the deduction is ${pct(last.pct * 100)} against ${pct(lastBand.pct * 100)} in the band just below. When parenting time is essentially equal, the parent with the larger income still pays, and the guidelines add that the parent paying the children's insurance deducts that premium from what is owed.</p>
<h3>The closest row, and what this estimate omits</h3>
<p>Arizona does not interpolate. ${d.scheduleText ?? ''} Above ${usd(S.maxIncome)} the top row is the presumptive amount unless a party asks for more: a family at ${usd(50000)} with one child starts from ${usd(top.basicMonthly)}.</p>
<p>Two adjustments in the guidelines are not in this calculator. The older-child increase needs the children's ages. The Self-Support Reserve Test needs the current reserve, which the guidelines define as ${d.lowIncomeText.match(/80% of monthly full-time earnings at the state minimum wage/)?.[0] ?? 'a share of full-time minimum wage earnings'}; our data holds no dollar figure for 2026, so a paying parent near minimum wage should expect the court's worksheet to come out lower than the figure shown here. Compare with the shared-responsibility line of ${h.a('child-support:new-mexico', 'New Mexico')} or the time percentage built into the formula of ${h.a('child-support:california', 'California')}.</p>`,
  faqs: [
    { q: 'Does Arizona count parenting time by overnights or by days?', a: `By days built from hours. Under section V.C of the guidelines, 24 hours counts as one day, a block of 12 hours or more as a day, 6 to 11 hours as half a day and 3 to 5 hours as a quarter day. The parent with less time adds up every block over the year, and that total picks the band of the Parenting Time Table, so short weekday visits also count.` },
    { q: 'What happens at the top of the Arizona Parenting Time Table?', a: `From ${num(last.daysFrom)} parenting days a year, the paying parent deducts ${pct(last.pct * 100)} of the basic obligation from his or her share. With ${usd(A)} and ${usd(B)} of monthly income and two children, that brings the order to ${usd(at(last.daysFrom).monthly)} a month. If incomes were equal and time essentially equal, the two shares would cancel and little or nothing would be paid.` },
    { q: 'Is there an income ceiling in the Arizona child support schedule?', a: `The schedule stops at ${usd(S.maxIncome)} of combined monthly income. Above it, the amount in that last row is the basic obligation unless one parent asks for more and shows the children's needs justify it. For one child, the top row is ${usd(S.rows[S.rows.length - 1][1])} a month, before insurance, child care and the parenting time deduction.` },
    { q: 'When does Arizona child support end?', a: `Usually on the last day of the month in which the youngest child turns 18. If that child will still be in high school, support runs to the end of the month of the expected graduation, but never past age 19. The court writes a presumptive termination date into the order, and the income withholding order uses the same date.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:new-mexico', 'child-support:california', 'alimony:arizona'],
});
