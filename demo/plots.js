import { acquisitionGrid, evaluateObjective } from './engine.js';
import { bestValue } from './match.js';

const BLUE = '#2163c7';
const PURPLE = '#7046a3';
const ORANGE = '#b84912';
const INK = '#192d43';
export const escapeXML = value => String(value).replace(/[<>&"']/g, char => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
})[char]);
export const number = value => Number(value).toLocaleString('en-GB', { maximumFractionDigits: 2 });

function frame({ title, subtitle = '', legend = [], ymin = 0, ymax = 1.8, height = 440, label = 'Function value f(x)', compact = false }) {
  const clip = 'clip-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const w = 960, left = 82, right = 32, top = compact ? 60 : 76, bottom = compact ? 40 : 62;
  const pw = w - left - right, ph = height - top - bottom;
  const targetTicks = compact && ph < 80 ? 2 : 4;
  const roughStep = Math.max(1, (ymax - ymin) / targetTicks);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const tickStep = [1, 2, 5, 10].map(factor => factor * magnitude).find(step => step >= roughStep);
  ymin = Math.floor(ymin / tickStep) * tickStep;
  ymax = Math.ceil(ymax / tickStep) * tickStep;
  const X = x => left + x * pw;
  const Y = y => top + (ymax - y) / (ymax - ymin) * ph;
  let markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${height}" role="img" aria-label="${escapeXML([title, subtitle, ...legend.map(item => item.label)].filter(Boolean).join('. '))}" style="font-family:system-ui,sans-serif;background:#fff;color:${INK}">
    <rect width="${w}" height="${height}" fill="white"/>
    <text x="${left}" y="29" font-size="20" font-weight="650" fill="${INK}">${escapeXML(title)}</text>
    ${legend.length ? plotLegend(legend, left) : `<text x="${left}" y="52" font-size="13" fill="#52677a">${escapeXML(subtitle)}</text>`}
    <defs><clipPath id="${clip}"><rect x="${left - 9}" y="${top - 9}" width="${pw + 18}" height="${ph + 18}"/></clipPath></defs>`;
  for (let value = ymin; value <= ymax; value += tickStep) {
    markup += `<path d="M${left},${Y(value)}H${w - right}" stroke="#e9edf2"/>
      <text x="${left - 14}" y="${Y(value) + 5}" text-anchor="end" font-size="14" fill="#52677a">${number(value)}</text>`;
  }
  for (let i = 0; i <= 10; i++) {
    markup += `<text x="${X(i / 10)}" y="${height - bottom + (compact ? 18 : 26)}" text-anchor="middle" font-size="14" fill="#52677a">${i / 10}</text>`;
  }
  markup += `<path d="M${left},${top}V${height - bottom}H${w - right}" fill="none" stroke="#a6b2bd"/>
    <text x="${left + pw / 2}" y="${height - 9}" text-anchor="middle" font-size="15" fill="${INK}">Input x</text>
    <text transform="translate(20,${top + ph / 2}) rotate(-90)" text-anchor="middle" font-size="14" fill="${INK}">${escapeXML(label)}</text>`;
  return { markup, X, Y, top, end: height - bottom, clip };
}

const path = (points, X, Y, key = 'y') => points.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(3)},${Y(p[key]).toFixed(3)}`).join('');
function marker(point, X, Y, colour, shape = 'circle', size = 5) {
  const x = X(point.x), y = Y(point.y);
  if (shape === 'square') {
    return `<rect x="${x - size}" y="${y - size}" width="${size * 2}" height="${size * 2}" fill="${colour}" stroke="white" stroke-width="1.5"/>`;
  }
  return shape === 'diamond'
    ? `<path d="M${x},${y - size - 1}l${size + 1},${size + 1}l-${size + 1},${size + 1}l-${size + 1},-${size + 1}Z" fill="${colour}" stroke="white" stroke-width="1.4"/>`
    : `<circle cx="${x}" cy="${y}" r="${size}" fill="${colour}" stroke="white" stroke-width="1.5"/>`;
}
function plotLegend(items, left) {
  let x = left;
  return items.map(({ label, colour, shape, dashed, width }) => {
    let sample;
    if (shape === 'line') {
      sample = `<path d="M${x},47h18" fill="none" stroke="${colour}" stroke-width="2.5"${dashed ? ' stroke-dasharray="5 4"' : ''}/>`;
    } else if (shape === 'band') {
      sample = `<rect x="${x}" y="41" width="18" height="12" fill="${colour}"/>`;
    } else {
      sample = marker({ x: x + 9, y: 47 }, value => value, value => value, colour, shape);
    }
    const text = `<text x="${x + 25}" y="52" font-size="13" fill="${INK}">${escapeXML(label)}</text>`;
    x += width;
    return sample + text;
  }).join('');
}

const SHARED = { label: 'Shared starting observations', colour: PURPLE, shape: 'square', width: 220 };
const BO = { label: 'BO evaluations', colour: ORANGE, shape: 'diamond', width: 135 };
const FUNCTION = { label: 'True function', colour: INK, shape: 'line', width: 125 };

const truth = objective => Array.from({ length: 501 }, (_, i) => ({ x: i / 500, y: evaluateObjective(objective, i / 500) }));

export function gameSVG(match, { selected = null, reveal = false } = {}) {
  // Live scales depend only on human observations, never on hidden BO results or the function.
  const known = reveal ? [...match.human, ...match.bo, ...truth(match.objective)] : match.human;
  const ymax = Math.max(1.8 * Math.sqrt(match.model.signalVariance), ...known.map(p => p.y * 1.16));
  const f = frame({ title: reveal ? 'Function and evaluated points' : 'Observed function values',
    legend: [SHARED, { label: 'Your evaluations', colour: BLUE, shape: 'circle', width: 140 },
      ...(reveal ? [BO, FUNCTION] : [])], ymax });
  let s = f.markup + `<g clip-path="url(#${f.clip})">`;
  if (reveal) s += `<path d="${path(truth(match.objective), f.X, f.Y)}" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
  if (!reveal) {
    s += `<line data-hover-guide y1="${f.top}" y2="${f.end}" stroke="${BLUE}" stroke-dasharray="2 4" stroke-width="1.5" opacity="0" pointer-events="none"/>`;
  }
  if (!reveal && selected !== null) {
    s += `<path d="M${f.X(selected)},${f.top}V${f.end}" stroke="${BLUE}" stroke-dasharray="5 5" stroke-width="2.5"/>
      <text x="${Math.min(790, Math.max(90, f.X(selected) + 10))}" y="${f.top + 18}" fill="${BLUE}" font-size="14">Selected x = ${number(selected)}</text>`;
  }
  if (reveal) for (const point of match.bo.slice(match.initial.length)) s += marker(point, f.X, f.Y, ORANGE, 'diamond', 7);
  for (const point of match.initial) s += marker(point, f.X, f.Y, PURPLE, 'square', 7);
  for (const point of match.human.slice(match.initial.length)) s += marker(point, f.X, f.Y, BLUE);
  for (const point of match.human.filter(p => Math.abs(p.y - bestValue(match.human)) < 1e-12)) {
    s += `<circle cx="${f.X(point.x)}" cy="${f.Y(point.y)}" r="11" fill="none" stroke="${BLUE}" stroke-width="2"/>`;
  }
  return s + '</g></svg>';
}

const replayPlots = new WeakMap();

function replayPlotData(match) {
  const cached = replayPlots.get(match);
  if (cached) return cached;

  // Each pre-decision grid also gives the previous turn's updated posterior.
  const last = match.history.at(-1);
  const beforeGrids = match.history.map(step => acquisitionGrid(step.before, match.model));
  const finalGrid = acquisitionGrid([...last.before, last.boResult], match.model);
  const truePoints = truth(match.objective);
  let ymin = 0;
  let ymax = Math.max(1.8 * Math.sqrt(match.model.signalVariance), ...truePoints.map(p => p.y * 1.1));
  let eiMax = 0.001;
  for (const grid of [...beforeGrids, finalGrid]) {
    for (const point of grid) {
      ymin = Math.min(ymin, point.mean - 1.96 * point.sd);
      ymax = Math.max(ymax, point.mean + 1.96 * point.sd);
      if (grid !== finalGrid) eiMax = Math.max(eiMax, point.ei * 1.15);
    }
  }
  const data = { beforeGrids, finalGrid, truePoints, ymin, ymax, eiMax };
  replayPlots.set(match, data);
  return data;
}

export function replaySVG(match, index, { after = false, overlay = false, compact = false } = {}) {
  const step = match.history[index];
  if (!step) throw new Error('This replay step does not exist.');
  const observations = after ? [...step.before, step.boResult] : step.before;
  const { beforeGrids, finalGrid, truePoints, ymin, ymax, eiMax } = replayPlotData(match);
  const beforeGrid = beforeGrids[index];
  const afterGrid = beforeGrids[index + 1] ?? finalGrid;
  // Thin only for plotting; acquisition selection uses the full grid.
  const points = (after ? afterGrid : beforeGrid).filter((_, i) => i % 4 === 0);
  const f = frame({ title: `BO turn ${index + 1} · ${after ? 'After evaluation' : 'Before evaluation'}`,
    legend: [SHARED, BO,
      { label: 'GP posterior mean', colour: ORANGE, shape: 'line', width: 155 },
      { label: 'Pointwise 95% interval', colour: '#fce8d9', shape: 'band', width: 170 },
      ...(overlay ? [{ ...FUNCTION, dashed: true }] : [])],
    ymin, ymax, height: compact ? 220 : 390, compact });
  const upper = points.map(p => ({ x: p.x, y: p.mean + 1.96 * p.sd }));
  const lower = [...points].reverse().map(p => ({ x: p.x, y: p.mean - 1.96 * p.sd }));
  let posterior = f.markup + `<g clip-path="url(#${f.clip})">`;
  posterior += `<path d="${path(upper, f.X, f.Y)}${path(lower, f.X, f.Y).replace(/^M/, 'L')}Z" fill="#fce8d9"/>`;
  if (overlay) posterior += `<path d="${path(truePoints, f.X, f.Y)}" stroke="${INK}" stroke-width="1.8" stroke-dasharray="5 4" fill="none"/>`;
  posterior += `<path d="${path(points, f.X, f.Y, 'mean')}" stroke="${ORANGE}" stroke-width="2.5" fill="none"/>
    <path d="M${f.X(step.proposal.x)},${f.top}V${f.end}" stroke="${ORANGE}" stroke-dasharray="4 4"/>`;
  for (const point of match.initial) posterior += marker(point, f.X, f.Y, PURPLE, 'square', 6);
  for (const point of observations.slice(match.initial.length)) posterior += marker(point, f.X, f.Y, ORANGE, 'diamond');
  posterior += '</g></svg>';
  // Always preserve the actual pre-decision EI, even when showing the updated posterior.
  const a = frame({ title: 'Expected improvement',
    subtitle: after ? 'Original EI before evaluation. The posterior above includes the new observation.' : 'EI before evaluation. The marker shows the highest value on the candidate grid.',
    ymax: eiMax, height: compact ? 150 : 250, label: 'Expected improvement', compact });
  const curve = beforeGrid.filter((_, i) => i % 4 === 0);
  const acquisition = a.markup + `<g clip-path="url(#${a.clip})"><path d="${path(curve, a.X, a.Y, 'ei')}" fill="none" stroke="${ORANGE}" stroke-width="2.5"/>
    <path d="M${a.X(step.proposal.x)},${a.top}V${a.end}" stroke="${ORANGE}" stroke-dasharray="4 4"/>
    ${marker({ x: step.proposal.x, y: step.proposal.ei }, a.X, a.Y, ORANGE, 'diamond', 7)}</g></svg>`;
  return { posterior, acquisition };
}

export function replayExportSVG(match, index, options = {}) {
  const { posterior, acquisition } = replaySVG(match, index, options);
  const inner = svg => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  // Plot IDs are derived from distinct titles, avoiding collisions across panels.
  const step = match.history[index];
  const summary = `Proposed x = ${number(step.proposal.x)} · mean = ${number(step.proposal.mean)} · sd = ${number(step.proposal.sd)} · EI = ${number(step.proposal.ei)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 690" style="font-family:system-ui,sans-serif;background:white">
    <rect width="960" height="690" fill="white"/>
    <svg width="960" height="390" viewBox="0 0 960 390">${inner(posterior).replaceAll('plot-clip', 'posterior-clip')}</svg>
    <svg y="390" width="960" height="250" viewBox="0 0 960 250">${inner(acquisition).replaceAll('plot-clip', 'acquisition-clip')}</svg>
    <text x="82" y="668" font-size="14" fill="${INK}">${escapeXML(summary)}</text></svg>`;
}
