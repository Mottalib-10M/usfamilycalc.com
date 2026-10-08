/**
 * Cost of a divorce: the official court fees of the state (petition and response, from the state's
 * fee statute or the clerk of its most populous county) plus the costs only the visitor can price:
 * attorney time at the rate quoted to them, mediation, service of papers. Data: src/data/divorce.json.
 */
export interface DVState {
  slug: string; name: string; abbr: string; verified: string;
  filingFee: number | null; responseFee: number | null;
  feeScope: string; feeText: string; feeUrl: string;
  otherFees: Array<{ what: string; amount: number | null; url: string }>;
  waiver: { name: string; url: string } | null;
  residency: { text: string; url: string } | null;
  waitingPeriod: { days: number | null; text: string; url: string } | null;
  simplified?: { text: string; url: string } | null;
  parentingClass?: { required: boolean | null; text: string; url: string } | null;
}
export interface DVInput {
  /** Spouses agree on everything (uncontested) or not. */
  contested: boolean;
  /** Does the other spouse file a response (and pay its fee)? */
  response: boolean;
  /** Attorney rate per hour and hours for both spouses (0 = no attorney). */
  rate: number;
  hours: number;
  mediation: number;
  service: number;
}
export interface DVLine { label: string; value: number; official: boolean }
export interface DVResult { total: number; official: number; lines: DVLine[] }
export function divorceCost(d: DVState, inp: Partial<DVInput>): DVResult {
  const i: DVInput = { contested: false, response: false, rate: 0, hours: 0, mediation: 0, service: 0, ...inp };
  const lines: DVLine[] = [];
  if (d.filingFee != null) lines.push({ label: 'Court filing fee (petition)', value: d.filingFee, official: true });
  if (i.response && d.responseFee != null && d.responseFee > 0) lines.push({ label: 'Response or answer fee', value: d.responseFee, official: true });
  if (i.service > 0) lines.push({ label: 'Service of the papers', value: i.service, official: false });
  if (i.mediation > 0) lines.push({ label: 'Mediation', value: i.mediation, official: false });
  if (i.rate > 0 && i.hours > 0) lines.push({ label: `Attorney time, ${i.hours} h at your rate`, value: i.rate * i.hours, official: false });
  const official = lines.filter((l) => l.official).reduce((a, l) => a + l.value, 0);
  return { total: lines.reduce((a, l) => a + l.value, 0), official, lines };
}
