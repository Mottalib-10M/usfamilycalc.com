import { defineStatePage } from '../../../lib/page-types';
import { al, alCalc, pct, num } from '../../../lib/kit';

const d = al('utah');
const T = d.durationTable as unknown as Array<{ maxPctOfMarriageLength: number }>;
const cap = T[0].maxPctOfMarriageLength;
const ex = alCalc('utah', { payer: 6800, payee: 2100, years: 11 });
const short = alCalc('utah', { payer: 6800, payee: 2100, years: 4 });
const tempMonths = 10;

export default defineStatePage({
  topic: 'alimony',
  slug: 'utah',
  title: `Utah Alimony Calculator 2026: Term Capped at Marriage Length`,
  description: `Utah alimony 2026: no amount formula, and alimony may not last longer than ${pct(cap)} of the marriage, ${num(ex.durationMonths ?? 0)} months after 11 years, temporary months included.`,
  intro: 'Utah leaves the amount of alimony to the judge but stops its length at the length of the marriage.',
  resume: `Utah has no formula for the amount of alimony. Under Utah Code § 81-4-502, part of the domestic relations code recodified in Title 81 from September 1, 2024, the court weighs the payee's financial condition and needs, earning capacity, the payor's ability to pay, tax consequences, the length of the marriage, custody of minor children, work in the payor's business and contributions to the payor's education. What the statute fixes is the term: alimony may not be ordered for longer than the marriage lasted, so ${num(ex.durationMonths ?? 0)} months after an 11-year marriage, and months of temporary alimony paid during the case count toward that limit. The court may go beyond it only if it finds extenuating circumstances or good cause before alimony ends. Alimony ends automatically on the payee's remarriage or death, and the court must end it, or refuse it, if the payee cohabits. Our calculator returns no monthly amount for Utah and shows the maximum term.`,
  body: (h) => `<h2>The clock starts during the case</h2>
<p>The rarest feature of the Utah rule is that it counts temporary alimony. Under § 81-4-502(7)(b), every month paid while the divorce is pending reduces the period left after the decree. A spouse who paid ${h.num(tempMonths)} months of temporary alimony during a long contested case after an 11-year marriage has at most ${h.num((ex.durationMonths ?? 0) - tempMonths)} months left to pay under the decree, not ${h.num(ex.durationMonths ?? 0)}. Litigation length therefore matters to both sides. A four-year marriage gives at most ${h.num(short.durationMonths ?? 0)} months in total.</p>

<h2>Remarried to each other</h2>
<p>A 2026 amendment addressed couples who divorce, remarry each other and divorce again. When the second divorce petition is filed on or after January 1, 2026, the court adds the two marriages together to measure the length-of-marriage limit. Before that, only the last marriage counted, which could shorten alimony for a spouse whose career break dated from the first one.</p>

<h2>Cohabitation ends everything</h2>
<p>Utah treats cohabitation severely. If the payor proves that the payee cohabits with another person, during the case or after the decree, the court may not order alimony, including temporary alimony, and must terminate any existing order, even if the cohabitation has ended by the time the motion is filed (§ 81-4-505). The payor must move within one year of when he or she knew or should have known about it. Remarriage ends alimony automatically, though payments resume if the new marriage is annulled as void and the payor took part in the annulment.</p>
<p>Retirement also has its own rule: a party's retirement is a substantial material change in circumstances allowing a petition to modify alimony, unless the decree says otherwise. Without a formula, the amount itself is argued from budgets: the payee may show needs from expenses during the marriage rather than post-separation expenses, and income can be imputed under § 81-4-503 when a payee has no recent work history.</p>`,
  faqs: [
    {
      q: 'How long can alimony last in Utah?',
      a: `No longer than the marriage itself, under Utah Code § 81-4-502(7), so ${num(ex.durationMonths ?? 0)} months after an 11-year marriage. Temporary alimony paid while the divorce was pending counts toward that limit. The Utah court can order a longer period only if, before alimony ends, it finds extenuating circumstances or good cause that justify it.`,
    },
    {
      q: 'Does cohabitation end alimony in Utah?',
      a: 'Yes. If the paying spouse proves the recipient cohabits with another person, Utah Code § 81-4-505 says the court may not order alimony and must terminate an existing order, even if the cohabitation has ended by the time of the motion. The request must be made within one year after the payor knew or should have known of the cohabitation.',
    },
    {
      q: 'Is there a Utah alimony formula for the amount?',
      a: 'No. Utah judges decide the amount from the factors in Utah Code § 81-4-502: the recipient’s financial condition and needs, earning capacity, the payer’s ability to pay, tax consequences, the length of the marriage, custody of minor children and contributions to the other spouse’s career. The usual approach compares the recipient’s needs with the payer’s ability to cover them.',
    },
  ],
  related: ['alimony', 'how-is-alimony-calculated', 'divorce-cost', 'alimony:arizona', 'alimony:colorado'],
});
