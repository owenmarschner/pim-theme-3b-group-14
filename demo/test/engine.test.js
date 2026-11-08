import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL, GRID_SIZE, makeObjective, seededRandom, evaluateObjective, kernel, fitGP,
  expectedImprovement, normalCDF, normalPDF, acquisitionGrid, selectNext } from '../engine.js';

const close = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);

test('seeded generator has a stable version-1 sequence', () => {
  const a = seededRandom('classroom-1'), b = seededRandom('classroom-1');
  const values = Array.from({ length: 100 }, () => a());
  assert.deepEqual(values, Array.from({ length: 100 }, () => b()));
  assert.ok(values.every(x => x >= 0 && x < 1));
  assert.notEqual(values[0], seededRandom('classroom-2')());
  // FNV/Mulberry32 output locked independently of function sampling order.
  assert.equal(seededRandom('')(), 0.6112444521859288);
});

test('prepared function uses the specified peaks; random peaks obey all bounds', () => {
  assert.deepEqual(makeObjective('presentation').peaks.map(p => p.centre), [0.25, 0.55, 0.8]);
  for (let seed = 0; seed < 100; seed++) {
    const objective = makeObjective('random', String(seed));
    const bounds = [[0.1, 0.3], [0.4, 0.6], [0.7, 0.9]];
    objective.peaks.forEach((p, i) => {
      assert.ok(p.centre >= bounds[i][0] && p.centre <= bounds[i][1]);
      assert.ok(p.amplitude >= 0.5 && p.amplitude <= 1.5);
      assert.ok(p.width >= 0.04 && p.width <= 0.12);
    });
  }
  const single = { peaks: [{ centre: 0.5, amplitude: 2, width: 0.1 }] };
  close(evaluateObjective(single, 0.5), 2);
  close(evaluateObjective(single, 0.6), 2 * Math.exp(-0.5));
  assert.throws(() => evaluateObjective(single, -0.01));
});

test('one-observation GP matches independent scalar conditioning', () => {
  const model = { ...MODEL, jitter: 0 };
  const predict = fitGP([{ x: 0.2, y: 1.7 }], model);
  for (const x of [0, 0.2, 0.37, 1]) {
    const c = Math.exp(-0.5 * ((x - 0.2) / 0.15) ** 2);
    const p = predict(x);
    close(p.mean, c * 1.7);
    close(p.sd ** 2, 1 - c * c);
  }
});

test('two-observation GP matches explicit 2x2 inverse, not a second Cholesky implementation', () => {
  const observations = [{ x: 0.1, y: 0.7 }, { x: 0.4, y: -0.2 }];
  const predict = fitGP(observations);
  const d = 1 + MODEL.jitter;
  const c = kernel(0.1, 0.4);
  const determinant = d * d - c * c;
  for (const x of [0, 0.15, 0.5, 0.9]) {
    const k1 = kernel(x, 0.1), k2 = kernel(x, 0.4);
    const mean = (k1 * (d * 0.7 + c * 0.2) + k2 * (-c * 0.7 - d * 0.2)) / determinant;
    const variance = 1 - (d * k1 * k1 - 2 * c * k1 * k2 + d * k2 * k2) / determinant;
    close(predict(x).mean, mean);
    close(predict(x).sd ** 2, variance);
  }
});

test('GP interpolates observations within jitter tolerance and rejects numerical failures', () => {
  const obs = [{ x: 0.1, y: 0.3 }, { x: 0.5, y: 1.2 }, { x: 0.9, y: 0.6 }];
  const predict = fitGP(obs);
  for (const point of obs) {
    close(predict(point.x).mean, point.y);
    assert.ok(predict(point.x).sd < 2e-5);
  }
  assert.throws(() => fitGP(obs, { ...MODEL, lengthScale: 0 }), /settings/);
  assert.throws(() => fitGP([{ x: 0, y: NaN }]), /observation/);
  assert.throws(() => fitGP([{ x: 0, y: 1 }, { x: 0, y: 1 }], { ...MODEL, jitter: 0 }), /factorised/);
});

// Independent composite Simpson integration over the standard-normal variable.
function integratedEI(mean, sd, best) {
  const start = Math.max(-12, (best - mean) / sd), end = 12, n = 40000;
  if (start >= end) return 0;
  const h = (end - start) / n;
  const integrand = z => Math.max(mean + sd * z - best, 0) * Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  let sum = integrand(start) + integrand(end);
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * integrand(start + i * h);
  return sum * h / 3;
}

test('EI agrees with numerical integration over promising, uncertain and unlikely points', () => {
  for (const [mean, sd, best] of [[1, 0.4, 0.8], [-0.5, 1.1, 0.7], [0, 1, 0], [1.5, 0.1, 0.8], [-2, 0.2, 0]]) {
    close(expectedImprovement(mean, sd, best), integratedEI(mean, sd, best), 2e-7);
  }
  close(normalCDF(0), 0.5);
  close(normalCDF(1.96), 0.97500210485, 1e-7);
  close(expectedImprovement(0, 1, 0), normalPDF(0));
});

test('EI handles zero uncertainty, stays nonnegative, and increases with mean or sd', () => {
  close(expectedImprovement(2, 0, 1), 1);
  close(expectedImprovement(0, 0, 1), 0);
  close(expectedImprovement(1, 0, 1), 0);
  assert.ok(expectedImprovement(0.8, 0.3, 1) < expectedImprovement(0.9, 0.3, 1));
  assert.ok(expectedImprovement(0.8, 0.3, 1) < expectedImprovement(0.8, 0.5, 1));
  assert.equal(expectedImprovement(-100, 0.001, 1), 0);
  assert.throws(() => expectedImprovement(1, -1, 0));
});

test('acquisition selection is the maximum of all 2,001 candidates and excludes observations', () => {
  const obs = [0.1, 0.5, 0.9].map(x => ({ x, y: evaluateObjective(makeObjective('presentation'), x) }));
  const grid = acquisitionGrid(obs);
  assert.equal(grid.length, GRID_SIZE);
  assert.equal(grid[0].x, 0); assert.equal(grid.at(-1).x, 1);
  const proposal = selectNext(obs);
  const maximum = Math.max(...grid.filter(p => !p.sampled).map(p => p.ei));
  close(proposal.ei, maximum);
  assert.equal(proposal.x, grid.find(p => !p.sampled && p.ei === maximum).x);
  assert.ok(!obs.some(p => p.x === proposal.x));
});

test('exact acquisition ties choose the lowest unobserved input', () => {
  const obs = [{ x: 0.5, y: 1e6 }]; // EI underflows to exactly zero everywhere.
  assert.equal(selectNext(obs).x, 0);
});
