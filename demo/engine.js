// Pure numerical code. No DOM, storage, or access to a match's hidden objective.
export const ENGINE_VERSION = '1.0.0';
export const GENERATOR_VERSION = 'fnv1a-mulberry32-peaks-v1';
export const MODEL = Object.freeze({ lengthScale: 0.15, signalVariance: 1, jitter: 1e-10 });
export const INITIAL_INPUTS = Object.freeze([0.1, 0.5, 0.9]);
export const GRID_SIZE = 2001;

export function seededRandom(seed) {
  // FNV-1a hashes UTF-16 code units; Mulberry32 generates [0, 1) doubles.
  let state = 2166136261;
  for (const char of String(seed).split('')) {
    state = Math.imul(state ^ char.charCodeAt(0), 16777619) >>> 0;
  }
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeObjective(mode, seed = '') {
  if (mode === 'presentation') {
    return { peaks: [
      { centre: 0.25, amplitude: 0.9, width: 0.1 },
      { centre: 0.55, amplitude: 1.2, width: 0.06 },
      { centre: 0.8, amplitude: 1, width: 0.08 },
    ] };
  }
  if (mode !== 'random') throw new Error('Unknown game mode.');
  const random = seededRandom(seed);
  const between = (a, b) => a + (b - a) * random();
  return { peaks: [[0.1, 0.3], [0.4, 0.6], [0.7, 0.9]].map(([a, b]) => ({
    centre: between(a, b), amplitude: between(0.5, 1.5), width: between(0.04, 0.12),
  })) };
}

export function evaluateObjective(objective, x) {
  if (!Number.isFinite(x) || x < 0 || x > 1) throw new Error('Choose an input between 0 and 1.');
  return objective.peaks.reduce((sum, peak) => sum + peak.amplitude *
    Math.exp(-0.5 * ((x - peak.centre) / peak.width) ** 2), 0);
}

export function kernel(a, b, model = MODEL) {
  return model.signalVariance * Math.exp(-0.5 * ((a - b) / model.lengthScale) ** 2);
}

function solveLower(lower, vector) {
  const result = [];
  for (let i = 0; i < vector.length; i++) {
    let value = vector[i];
    for (let j = 0; j < i; j++) value -= lower[i][j] * result[j];
    result[i] = value / lower[i][i];
  }
  return result;
}

export function fitGP(observations, model = MODEL) {
  if (!(model.lengthScale > 0) || !(model.signalVariance > 0) || !(model.jitter >= 0) ||
      !Object.values(model).every(Number.isFinite)) throw new Error('Invalid GP settings.');
  if (!observations.every(({ x, y }) => Number.isFinite(x) && x >= 0 && x <= 1 && Number.isFinite(y))) {
    throw new Error('The GP received an invalid observation.');
  }
  const n = observations.length;
  const lower = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let value = kernel(observations[i].x, observations[j].x, model) + (i === j ? model.jitter : 0);
      for (let k = 0; k < j; k++) value -= lower[i][k] * lower[j][k];
      if (i === j && (!(value > 0) || !Number.isFinite(value))) {
        throw new Error('The GP covariance could not be factorised. Your match has been preserved.');
      }
      lower[i][j] = i === j ? Math.sqrt(value) : value / lower[j][j];
    }
  }
  const solved = solveLower(lower, observations.map(point => point.y));
  const alpha = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let value = solved[i];
    for (let j = i + 1; j < n; j++) value -= lower[j][i] * alpha[j];
    alpha[i] = value / lower[i][i];
  }
  return x => {
    if (!Number.isFinite(x) || x < 0 || x > 1) throw new Error('Invalid prediction input.');
    const cov = observations.map(point => kernel(x, point.x, model));
    const v = solveLower(lower, cov);
    const mean = cov.reduce((sum, value, i) => sum + value * alpha[i], 0);
    const variance = model.signalVariance - v.reduce((sum, value) => sum + value * value, 0);
    if (!Number.isFinite(mean) || !Number.isFinite(variance) || variance < -1e-7 * model.signalVariance) {
      throw new Error('The GP produced an invalid prediction. Your match has been preserved.');
    }
    return { mean, sd: Math.sqrt(Math.max(0, variance)) };
  };
}

export const normalPDF = z => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
export function normalCDF(z) {
  // Abramowitz & Stegun 26.2.17: absolute CDF error < 7.5e-8.
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const tail = normalPDF(z) * t * (0.319381530 + t * (-0.356563782 +
    t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - tail : tail;
}

export function expectedImprovement(mean, sd, best) {
  if (![mean, sd, best].every(Number.isFinite) || sd < 0) throw new Error('Invalid EI arguments.');
  if (sd <= 1e-12) return Math.max(mean - best, 0);
  const difference = mean - best;
  const z = difference / sd;
  return Math.max(0, difference * normalCDF(z) + sd * normalPDF(z));
}

export function acquisitionGrid(observations, model = MODEL) {
  if (!observations.length) throw new Error('EI needs at least one observation.');
  const predict = fitGP(observations, model);
  const best = Math.max(...observations.map(point => point.y));
  return Array.from({ length: GRID_SIZE }, (_, i) => {
    const x = i / (GRID_SIZE - 1);
    const { mean, sd } = predict(x);
    const sampled = observations.some(point => Math.abs(point.x - x) <= 1e-12);
    return { x, mean, sd, ei: sampled ? 0 : expectedImprovement(mean, sd, best), sampled };
  });
}

export function selectNext(observations, model = MODEL) {
  let best;
  for (const candidate of acquisitionGrid(observations, model)) {
    if (!candidate.sampled && (!best || candidate.ei > best.ei)) best = candidate;
  }
  if (!best) throw new Error('No unobserved acquisition-grid inputs remain.');
  const { x, mean, sd, ei } = best;
  return { x, mean, sd, ei };
}
