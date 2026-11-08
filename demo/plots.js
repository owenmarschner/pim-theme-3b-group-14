import { acquisitionGrid, evaluateObjective } from './engine.js';
import { bestValue } from './match.js';

const BLUE = '#2163c7';
const ORANGE = '#b84912';
const INK = '#192d43';
export const escapeXML = value => String(value).replace(/[<>&"']/g, char => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
})[char]);
export const number = value => Number(value).toLocaleString('en-GB', { maximumFractionDigits: 6 });

function frame({ title, subtitle = '', ymin = 0, ymax = 1.8, height = 440, label = 'Function value f(x)', compact = false }) {
  const clip = 'clip-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const w = 960, left = 82, right = 32, top = compact ? 60 : 76, bottom = compact ? 40 : 62;
  const pw = w - left - right, ph = height - top - bottom;
  const X = x => left + x * pw;
  const Y = y => top + (ymax - y) / (ymax - ymin) * ph;
  let markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${height}" role="img" aria-label="${escapeXML(title + '. ' + subtitle)}" style="font-family:system-ui,sans-serif;background:#fff;color:${INK}">
    <rect width="${w}" height="${height}" fill="white"/>
    <text x="${left}" y="29" font-size="20" font-weight="650" fill="${INK}">${escapeXML(title)}</text>
    <text x="${left}" y="52" font-size="13" fill="#52677a">${escapeXML(subtitle)}</text>
    <defs><clipPath id="${clip}"><rect x="${left - 9}" y="${top - 9}" width="${pw + 18}" height="${ph + 18}"/></clipPath></defs>`;
  const ticks = compact && ph < 80 ? 2 : 4;
  for (let i = 0; i <= ticks; i++) {
    const value = ymin + (ymax - ymin) * i / ticks;
    markup += `<path d="M${left},${Y(value)}H${w - right}" stroke="#e9edf2"/>
      <text x="${left - 14}" y="${Y(value) + 5}" text-anchor="end" font-size="14" fill="#52677a">${Number(value.toFixed(3))}</text>`;
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
function marker(point, X, Y, colour, diamond = false, size = 5) {
  const x = X(point.x), y = Y(point.y);
  return diamond
    ? `<path d="M${x},${y - size - 1}l${size + 1},${size + 1}l-${size + 1},${size + 1}l-${size + 1},-${size + 1}Z" fill="${colour}" stroke="white" stroke-width="1.4"/>`
    : `<circle cx="${x}" cy="${y}" r="${size}" fill="${colour}" stroke="white" stroke-width="1.5"/>`;
}
const truth = objective => Array.from({ length: 501 }, (_, i) => ({ x: i / 500, y: evaluateObjective(objective, i / 500) }));

export function gameSVG(match, { selected = null, reveal = false } = {}) {
  // Live scales depend only on human observations, never on hidden BO results or the function.
  const known = reveal ? [...match.human, ...match.bo, ...truth(match.objective)] : match.human;
  const ymax = Math.max(1.8, ...known.map(p => p.y * 1.16));
  const f = frame({ title: reveal ? 'The hidden function, revealed' : 'Your observations',
    subtitle: reveal ? 'Blue circles: you · Orange diamonds: BO · Dark curve: hidden function' : 'Only sampled values are known. Where will you look next?', ymax });
  let s = f.markup + `<g clip-path="url(#${f.clip})">`;
  if (reveal) s += `<path d="${path(truth(match.objective), f.X, f.Y)}" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
  if (!reveal && selected !== null) {
    s += `<path d="M${f.X(selected)},${f.top}V${f.end}" stroke="${BLUE}" stroke-dasharray="5 5" stroke-width="1.8"/>
      <text x="${Math.min(790, Math.max(90, f.X(selected) + 10))}" y="${f.top + 18}" fill="${BLUE}" font-size="14">Selected x = ${number(selected)}</text>`;
  }
  if (reveal) for (const point of match.bo) s += marker(point, f.X, f.Y, ORANGE, true, 7);
  for (const point of match.human) s += marker(point, f.X, f.Y, BLUE);
  for (const point of match.human.filter(p => Math.abs(p.y - bestValue(match.human)) < 1e-12)) {
    s += `<circle cx="${f.X(point.x)}" cy="${f.Y(point.y)}" r="11" fill="none" stroke="${BLUE}" stroke-width="2"/>`;
  }
  return s + '</g></svg>';
}

export function replaySVG(match, index, { after = false, overlay = false, compact = false } = {}) {
  const step = match.history[index];
  if (!step) throw new Error('This replay step does not exist.');
  const observations = after ? [...step.before, step.boResult] : step.before;
  const grid = acquisitionGrid(observations, match.model);
  // Thin only for plotting; acquisition selection always uses the full 2,001 points.
  const points = grid.filter((_, i) => i % 4 === 0);
  const truePoints = overlay ? truth(match.objective) : [];
  const ymin = Math.min(0, ...points.map(p => p.mean - 1.96 * p.sd));
  const ymax = Math.max(1.8, ...points.map(p => p.mean + 1.96 * p.sd), ...truePoints.map(p => p.y * 1.1));
  const f = frame({ title: `BO turn ${index + 1} · ${after ? 'After evaluation' : 'Before evaluation'}`,
    subtitle: 'GP mean and pointwise 95% posterior band · Model-dependent uncertainty', ymin, ymax, height: compact ? 220 : 390, compact });
  const upper = points.map(p => ({ x: p.x, y: p.mean + 1.96 * p.sd }));
  const lower = [...points].reverse().map(p => ({ x: p.x, y: p.mean - 1.96 * p.sd }));
  let posterior = f.markup + `<g clip-path="url(#${f.clip})">`;
  posterior += `<path d="${path(upper, f.X, f.Y)}${path(lower, f.X, f.Y).replace(/^M/, 'L')}Z" fill="#fce8d9"/>`;
  if (overlay) posterior += `<path d="${path(truePoints, f.X, f.Y)}" stroke="${INK}" stroke-width="1.8" stroke-dasharray="5 4" fill="none"/>`;
  posterior += `<path d="${path(points, f.X, f.Y, 'mean')}" stroke="${ORANGE}" stroke-width="2.5" fill="none"/>
    <path d="M${f.X(step.proposal.x)},${f.top}V${f.end}" stroke="${ORANGE}" stroke-dasharray="4 4"/>`;
  for (const point of observations) posterior += marker(point, f.X, f.Y, ORANGE, true);
  posterior += '</g></svg>';
  // Always preserve the actual pre-decision EI, even when showing the updated posterior.
  const beforeGrid = after ? acquisitionGrid(step.before, match.model) : grid;
  const a = frame({ title: 'Expected improvement · the decision curve',
    subtitle: after ? 'Original EI before this guess · The posterior above has now updated' : 'Highest EI on the candidate grid selects the next input',
    ymax: Math.max(0.001, ...beforeGrid.map(p => p.ei * 1.15)), height: compact ? 150 : 250, label: 'Expected improvement', compact });
  const curve = beforeGrid.filter((_, i) => i % 4 === 0);
  const acquisition = a.markup + `<g clip-path="url(#${a.clip})"><path d="${path(curve, a.X, a.Y, 'ei')}" fill="none" stroke="${ORANGE}" stroke-width="2.5"/>
    <path d="M${a.X(step.proposal.x)},${a.top}V${a.end}" stroke="${ORANGE}" stroke-dasharray="4 4"/>
    ${marker({ x: step.proposal.x, y: step.proposal.ei }, a.X, a.Y, ORANGE, true, 7)}</g></svg>`;
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
