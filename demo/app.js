import { createMatch, takeTurn, validateGuess, bestValue, isComplete, scores, restoreMatch, STORAGE_KEY, GAME_VALUE_SCALE } from './match.js';
import { gameSVG, replaySVG, number } from './plots.js?v=replay-controls';

const $ = id => document.getElementById(id);
let match = null;
let savedMatch = null;
let selected = null;
let busy = false;
let replayIndex = 0;
let replayAfter = false;
let pendingReset = null;
let storageWarning = '';

for (const button of document.querySelectorAll('[data-dialog]')) {
  button.addEventListener('click', () => {
    $('prior-sd').textContent = number(Math.sqrt(match?.model.signalVariance ?? GAME_VALUE_SCALE ** 2));
    $(button.dataset.dialog).showModal();
  });
}

function status(message, error = false) {
  $('status').textContent = message + (storageWarning ? ` ${storageWarning}` : '');
  $('status').classList.toggle('error', error);
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
    storageWarning = '';
  } catch {
    storageWarning = 'Browser storage is unavailable; keep this tab open to retain your match.';
  }
}

function clearSaved() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* The game still works without storage. */ }
  savedMatch = null;
}

function lockControls(locked) {
  busy = locked;
  if (locked) $('game-plot').querySelector('[data-hover-guide]')?.setAttribute('opacity', '0');
  $('new-game').disabled = locked;
  $('evaluate').disabled = locked || selected === null;
  $('guess-form').setAttribute('aria-busy', String(locked));
}

function paintMatch() {
  const complete = isComplete(match);
  const played = match.history.length;
  $('setup').hidden = true;
  $('resume').hidden = true;
  $('arena').hidden = false;
  $('replay').hidden = true;
  document.body.classList.remove('replay-mode');
  $('new-game').hidden = false;
  $('human-score').textContent = bestValue(match.human).toFixed(2);
  $('bo-score').textContent = complete ? bestValue(match.bo).toFixed(2) : 'Hidden';
  const remaining = match.turns - played;
  $('human-count').textContent = `${match.human.length} evaluations · ${remaining} ${remaining === 1 ? 'guess' : 'guesses'} left`;
  $('bo-count').textContent = complete ? `${match.bo.length} evaluations · search complete` : `${played} of ${match.turns} turns completed · 3 starting observations`;
  $('round-label').textContent = complete ? 'Match complete' : `Your turn ${played + 1} of ${match.turns}`;
  $('challenge-label').textContent = `Seed: ${match.seed}`;
  $('budget-label').textContent = `${match.turns + 3} evaluations each, including 3 shared observations`;
  $('game-plot').innerHTML = gameSVG(match, { selected, reveal: complete });
  $('game-plot').classList.toggle('playing', !complete);
  $('game-plot').tabIndex = complete ? -1 : 0;
  $('game-plot').setAttribute('aria-label', complete ? 'Final function and observations' : 'Function observations. Use arrow keys to select an input.');
  $('evaluate').disabled = busy || selected === null;
  $('guess-form').hidden = complete;
  $('match-actions').hidden = !complete;
  $('result').hidden = !complete;
  if (complete) {
    const score = scores(match);
    $('result-title').textContent = score.winner === 'draw' ? 'Draw' : score.winner === 'human' ? 'You win' : 'BO wins';
    const roundedTie = score.winner !== 'draw' && score.human.toFixed(2) === score.bo.toFixed(2);
    $('result-detail').textContent = roundedTie ? 'The displayed scores round to the same value. The result uses full precision.' : '';
    status('The graph shows the function and the points evaluated by both players.');
  }
}

function start(config) {
  match = createMatch(config);
  selected = null;
  persist();
  paintMatch();
  status('');
  $('game-plot').focus({ preventScroll: true });
}

function showSetup() {
  clearSaved();
  match = null;
  selected = null;
  $('setup').hidden = false;
  $('resume').hidden = true;
  $('arena').hidden = true;
  $('replay').hidden = true;
  $('new-game').hidden = true;
  document.body.classList.remove('replay-mode');
  $('setup-error').textContent = '';
  $('seed').focus({ preventScroll: true });
}

function requestReset(callback) {
  if (busy) return;
  const current = match || savedMatch;
  if (current && !isComplete(current)) {
    pendingReset = callback;
    $('reset-dialog').showModal();
  } else callback();
}

$('confirm-reset').addEventListener('click', () => {
  $('reset-dialog').close();
  const callback = pendingReset;
  pendingReset = null;
  callback?.();
});
$('cancel-reset').addEventListener('click', () => { pendingReset = null; $('reset-dialog').close(); });
$('reset-dialog').addEventListener('cancel', () => { pendingReset = null; });
$('new-game').addEventListener('click', () => requestReset(showSetup));
$('discard-game').addEventListener('click', () => requestReset(showSetup));
$('same-game').addEventListener('click', () => start({ mode: match.mode, seed: match.seed, turns: match.turns, valueScale: match.valueScale }));
$('resume-game').addEventListener('click', () => {
  match = savedMatch;
  selected = null;
  paintMatch();
  if (!isComplete(match)) status('Match resumed.');
});

$('shuffle-seed').addEventListener('click', () => {
  $('seed').value = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
});
$('turns').addEventListener('input', () => {
  const turns = Number($('turns').value);
  $('turns-label').value = String(turns);
  $('budget-note').textContent = `3 starting observations + ${turns} guesses = ${turns + 3} evaluations each.`;
});
$('setup-form').addEventListener('submit', event => {
  event.preventDefault();
  try { start({ mode: 'random', seed: $('seed').value, turns: Number($('turns').value), valueScale: GAME_VALUE_SCALE }); }
  catch (error) { $('setup-error').textContent = error.message; }
});

function selectInput(x) {
  selected = x;
  $('game-plot').innerHTML = gameSVG(match, { selected });
  $('evaluate').disabled = false;
  status(`Selected input: ${x.toFixed(2)}.`);
}

$('game-plot').addEventListener('keydown', event => {
  if (!match || busy || isComplete(match) || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  const direction = event.key === 'ArrowLeft' ? -1 : 1;
  const step = Math.round((selected ?? 0.5) * 100) + direction;
  selectInput(Math.max(0, Math.min(100, step)) / 100);
});

function plotInput(event) {
  if (!match || busy || isComplete(match)) return null;
  const svg = event.currentTarget.querySelector('svg');
  const box = svg.getBoundingClientRect();
  // Account for SVG letterboxing on short presentation screens.
  const scale = Math.min(box.width / 960, box.height / 440);
  const offsetX = (box.width - 960 * scale) / 2;
  const offsetY = (box.height - 440 * scale) / 2;
  const sx = (event.clientX - box.left - offsetX) / scale;
  const sy = (event.clientY - box.top - offsetY) / scale;
  if (sx < 82 || sx > 928 || sy < 76 || sy > 378) return null;
  return Math.round((sx - 82) / 846 * 100) / 100;
}

$('game-plot').addEventListener('pointermove', event => {
  const guide = event.currentTarget.querySelector('[data-hover-guide]');
  if (!guide) return;
  const x = plotInput(event);
  if (x === null || x === selected || event.pointerType === 'touch') {
    guide.setAttribute('opacity', '0');
    return;
  }
  const position = 82 + 846 * x;
  guide.setAttribute('x1', position);
  guide.setAttribute('x2', position);
  guide.setAttribute('opacity', '0.4');
});

$('game-plot').addEventListener('pointerleave', event => {
  event.currentTarget.querySelector('[data-hover-guide]')?.setAttribute('opacity', '0');
});

$('game-plot').addEventListener('click', event => {
  const x = plotInput(event);
  if (x === null) return;
  selectInput(x);
  $('evaluate').focus({ preventScroll: true });
});

$('guess-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (busy || !match || isComplete(match) || selected === null) return;
  const x = selected;
  try { validateGuess(match, x); }
  catch (error) { status(error.message, true); return; }
  lockControls(true);
  status('Evaluating both guesses…');
  // Yield for controls and the live status to paint before numerical work.
  await new Promise(resolve => setTimeout(resolve, 60));
  try {
    try {
      match = takeTurn(match, x);
    } catch (error) {
      status(`Search paused: ${error.message} No guesses were used. You can retry or start a new game.`, true);
      return;
    }
    selected = null;
    persist();
    paintMatch();
    if (!isComplete(match)) {
      status(`Your guess: f(${number(x)}) = ${number(match.human.at(-1).y)}. BO has completed its evaluation.`);
    }
  } catch (error) {
    const recovery = storageWarning ? 'Keep this tab open.' : 'Reload and reopen your saved match.';
    status(`Both evaluations finished, but the match screen could not update. ${recovery}`, true);
    console.error(error);
  } finally {
    lockControls(false);
    if (match && !isComplete(match)) $('game-plot').focus({ preventScroll: true });
  }
});

function paintReplay() {
  $('replay-error').hidden = true;
  try {
    const turn = match.history[replayIndex];
    const compact = window.matchMedia('(min-width: 900px) and (max-height: 800px)').matches;
    const pictures = replaySVG(match, replayIndex, { after: replayAfter, overlay: $('overlay').checked, compact });
    $('posterior-plot').innerHTML = pictures.posterior;
    $('acquisition-plot').innerHTML = pictures.acquisition;
    $('previous').disabled = replayIndex === 0;
    $('next').disabled = replayIndex === match.history.length - 1;
    $('replay-step').textContent = `BO turn ${replayIndex + 1} of ${match.history.length}`;
    $('replay-stats').replaceChildren(...[
      ['Selected input x', turn.proposal.x], ['Mean before evaluation μ', turn.proposal.mean],
      ['SD before evaluation σ', turn.proposal.sd], ['Expected improvement', turn.proposal.ei],
    ].map(([label, value]) => {
      const div = document.createElement('div');
      const caption = document.createElement('span'); caption.textContent = label;
      const strong = document.createElement('strong'); strong.textContent = number(value);
      div.append(caption, strong); return div;
    }));
    $('reveal-step').textContent = replayAfter ? 'Show before evaluation' : 'Reveal this evaluation';
  } catch (error) {
    $('replay-error').textContent = error.message;
    $('replay-error').hidden = false;
  }
}

$('open-replay').addEventListener('click', () => {
  if (!match || !isComplete(match)) return;
  replayIndex = 0; replayAfter = false; $('overlay').checked = false;
  $('arena').hidden = true;
  $('replay').hidden = false;
  document.body.classList.add('replay-mode');
  paintReplay();
  $('replay').scrollIntoView({ block: 'start' });
});
$('close-replay').addEventListener('click', () => { paintMatch(); $('result').scrollIntoView({ block: 'start' }); });
$('previous').addEventListener('click', () => { replayIndex--; replayAfter = false; paintReplay(); });
$('next').addEventListener('click', () => { replayIndex++; replayAfter = false; paintReplay(); });
$('overlay').addEventListener('change', paintReplay);
$('reveal-step').addEventListener('click', () => { replayAfter = !replayAfter; paintReplay(); });
window.addEventListener('resize', () => { if (!$('replay').hidden) paintReplay(); });

try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    savedMatch = restoreMatch(stored);
    $('setup').hidden = true;
    $('resume').hidden = false;
    $('resume-description').textContent = `Seed: ${savedMatch.seed} · ${savedMatch.history.length} of ${savedMatch.turns} turns completed.`;
    $('resume-game').textContent = isComplete(savedMatch) ? 'View completed match' : 'Resume match';
  }
} catch {
  $('setup-error').textContent = 'A saved match could not be restored. You can start a new match.';
}
