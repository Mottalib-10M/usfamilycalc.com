/**
 * Engines against the reference cases recorded with the data (research/<topic>/<slug>.json → testCases):
 * official worked examples when the state publishes one, otherwise hand computations from the statute,
 * each with its source. RECETTE §4: a case off by more than 1 % blocks the build.
 */
import { describe, it, expect } from 'vitest';
import { csAll, wcAll, alAll, pbAll, pbFeesOf, cs } from '../src/lib/kit';
import { childSupport, toMonthly, toPeriod, scheduleLookup } from '../src/lib/engine/child-support';
import { weeklyBenefit } from '../src/lib/engine/workers-comp';
import { alimony } from '../src/lib/engine/alimony';
import { scheduleFee } from '../src/lib/engine/probate';
import { customModel } from '../src/lib/engine/cs-custom';

const close = (got: number, want: number, what: string) => {
  const tol = Math.max(1, Math.abs(want) * 0.01);
  expect(Math.abs(got - want), `${what}: got ${got.toFixed(2)}, want ${want}`).toBeLessThanOrEqual(tol);
};
type CSCase = { inputs: Record<string, number | string>; expected: number; what: string; source: string; skipEngine?: boolean };

describe('child support: reference cases', () => {
  for (const d of csAll()) {
    const cases = ((d as unknown as { testCases?: CSCase[] }).testCases ?? []).filter((c) => typeof c.expected === 'number' && !c.skipEngine);
    for (const [i, c] of cases.entries()) {
      const I = c.inputs;
      if (I.tn != null) continue; // a K-factor check, done below for California
      it(`${d.slug} #${i + 1}: ${c.what}`, () => {
        const p = d.period;
        const payer = toMonthly(Number(I.incomeA ?? 0), p), other = toMonthly(Number(I.incomeB ?? 0), p);
        let nights = Number(I.overnightsA ?? I.overnightsPayer ?? 0);
        if (I.hPercent != null) nights = Math.round(Number(I.hPercent) * 365); // California: A is the high earner
        const r = childSupport(d, { payer, other, children: Number(I.children ?? 1), payerOvernights: nights, childcare: toMonthly(Number(I.childcare ?? 0), p), health: toMonthly(Number(I.health ?? 0), p), healthBy: 'other' });
        const basicOnly = /basic|schedule|table/i.test(c.what) && !/share|payer|obligor|owes|pays|noncustodial|support paid/i.test(c.what);
        const got = basicOnly ? toPeriod(r.basicMonthly, p) : toPeriod(r.monthly || r.reverse, p);
        close(got, c.expected, `${c.what} (${c.source.slice(0, 80)})`);
      });
    }
  }
  it('California K factor, Fam. Code § 4055(b)(3) example: H% 20%, TN $1,000 → 0.21', () => {
    const F = cs('california').formula as { kTable: Array<{ tnMax: number | null; constant: number; divisor: number | null }> };
    const row = F.kTable.find((r) => 1000 <= (r.tnMax ?? Infinity))!;
    expect(Math.round((1 + 0.2) * (row.constant + 1000 / (row.divisor ?? Infinity)) * 100) / 100).toBe(0.21);
  });
  it('every schedule is increasing in income and in number of children', () => {
    for (const d of csAll()) {
      const s = d.schedule; if (!s || customModel(d.slug)) continue;
      for (let i = 1; i < s.rows.length; i++) expect(s.rows[i][0], `${d.slug} row ${i}`).toBeGreaterThan(s.rows[i - 1][0]);
      const mid = s.rows[Math.floor(s.rows.length / 2)];
      expect(scheduleLookup(s, mid[0], 2), `${d.slug} 2 > 1 child`).toBeGreaterThanOrEqual(scheduleLookup(s, mid[0], 1));
    }
  });
  it('no state returns NaN on a range of incomes', () => {
    for (const d of csAll()) for (const inc of [0, 800, 2500, 6000, 15000, 60000]) for (const n of [1, 2, 3]) {
      const r = childSupport(d, { payer: inc, other: inc / 2, children: n, payerOvernights: 100, childcare: 300, health: 200, healthBy: 'payer' });
      expect(Number.isFinite(r.monthly) && Number.isFinite(r.reverse), `${d.slug} ${inc} ${n}`).toBe(true);
    }
  });
});

describe('workers comp: bounds', () => {
  for (const d of wcAll()) {
    it(`${d.slug}: maximum and minimum applied`, () => {
      if (d.ttd.max != null) expect(weeklyBenefit(d, 1e6).weekly).toBeCloseTo(d.ttd.max, 2);
      const w = 1000; const r = weeklyBenefit(d, w);
      expect(r.weekly).toBeGreaterThan(0);
      if (d.ttd.min != null && d.ttd.minRule === 'fixed') expect(weeklyBenefit(d, 1).weekly).toBeCloseTo(d.ttd.min, 2);
    });
  }
});

describe.runIf(alAll().length > 0)('alimony: reference cases', () => {
  for (const d of alAll()) {
    const cases = ((d as unknown as { testCases?: Array<{ inputs: Record<string, number | boolean>; expected: number | { monthly?: number; low?: number; high?: number }; what: string; source: string }> }).testCases ?? []);
    for (const [i, c] of cases.entries()) {
      it(`${d.slug} #${i + 1}: ${c.what}`, () => {
        const I = c.inputs;
        const r = alimony(d, { payer: Number(I.payer), payee: Number(I.payee), years: Number(I.years ?? 10), children: !!I.children, childSupport: Number(I.childSupport ?? 0) });
        const e = c.expected;
        if (typeof e === 'number') close(r.monthly, e, c.what);
        else { if (e.monthly != null) close(r.monthly, e.monthly, c.what); if (e.low != null) close(r.low ?? NaN, e.low, `${c.what} low`); if (e.high != null) close(r.high ?? NaN, e.high, `${c.what} high`); }
      });
    }
  }
});

describe.runIf(pbAll().some((p) => pbFeesOf(p.slug)))('probate: statutory schedules', () => {
  for (const p of pbAll()) {
    const f = pbFeesOf(p.slug); if (!f) continue;
    const cases = (f.testCases ?? []) as Array<{ estate: number; expected: Record<string, number>; source: string }>;
    for (const [i, c] of cases.entries()) {
      it(`${p.slug} #${i + 1} (${c.source.slice(0, 60)})`, () => {
        for (const [who, want] of Object.entries(c.expected)) {
          const s = f.schedules.find((x) => x.who === who);
          expect(s, who).toBeTruthy();
          close(scheduleFee(c.estate, s!), want, who);
        }
      });
    }
  }
});
