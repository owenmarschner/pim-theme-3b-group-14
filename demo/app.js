import { createMatch, takeTurn, validateGuess, bestValue, isComplete, scores, exportMatch, restoreMatch, STORAGE_KEY } from './match.js';
import { gameSVG, replaySVG, replayExportSVG, number } from './plots.js';

const $ = id => document.getElementById(id);
let match = null;
let savedMatch = null;
let selected = null;
let busy = false;
let replayIndex = 0;
let replayAfter = false;
let pendingReset = null;
let storageWarning = '';

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
  for (const id of ['guess', 'evaluate', 'new-game']) $(id).disabled = locked;
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
  $('human-score').textContent = bestValue(match.human).toFixed(9);
  $('bo-score').textContent = complete ? bestValue(match.bo).toFixed(9) : 'Hidden';
  const remaining = match.turns - played;
  $('human-count').textContent = `${match.human.length} evaluations · ${remaining} ${remaining === 1 ? 'guess' : 'guesses'} left`;
  $('bo-count').textContent = complete ? `${match.bo.length} evaluations · search complete` : `${played} of ${match.turns} turns completed · 3 starting observations`;
  $('round-label').textContent = complete ? 'Match complete' : `Your turn ${played + 1} of ${match.turns}`;
  $('challenge-label').textContent = match.mode === 'presentation' ? 'Presentation challenge' : `Random · seed: ${match.seed}`;
  $('budget-label').textContent = `${match.turns + 3} evaluations each, including 3 shared observations`;
  $('game-plot').innerHTML = gameSVG(match, { selected, reveal: complete });
  $('game-plot').classList.toggle('playing', !complete);
  $('guess-form').hidden = complete;
  $('exports').hidden = !complete;
  $('result').hidden = !complete;
  if (complete) {
    const score = scores(match);
    $('result-title').textContent = score.winner === 'draw' ? 'A shared victory. It’s a draw.' : score.winner === 'human' ? 'You found the higher value.' : 'BO found the higher value.';
    $('result-detail').textContent = `Your best: ${score.human.toFixed(12)} · BO’s best: ${score.bo.toFixed(12)}. Both used ${match.turns + 3} evaluations. ${score.winner === 'draw' ? 'Scores within 0.000000001 count as a draw.' : 'The highest observed value wins.'}`;
    status('The dark curve is now visible. Replay BO’s decisions to see what it knew before each guess.');
  }
}

function start(config) {
  match = createMatch(config);
  selected = null;
  $('guess').value = '';
  persist();
  paintMatch();
  status('Choose your first input. BO has the same three starting observations.');
  $('guess').focus({ preventScroll: true });
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
  $('mode').focus({ preventScroll: true });
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
$('same-game').addEventListener('click', () => start({ mode: match.mode, seed: match.seed, turns: match.turns }));
$('resume-game').addEventListener('click', () => {
  match = savedMatch;
  selected = null;
  $('guess').value = '';
  paintMatch();
  if (!isComplete(match)) status('Match resumed. Your previous observations and BO’s hidden progress are preserved.');
});

$('mode').addEventListener('change', () => { $('seed-row').hidden = $('mode').value !== 'random'; });
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
  try { start({ mode: $('mode').value, seed: $('seed').value, turns: Number($('turns').value) }); }
  catch (error) { $('setup-error').textContent = error.message; }
});

$('guess').addEventListener('input', () => {
  if (!match || busy || isComplete(match)) return;
  const x = $('guess').valueAsNumber;
  selected = Number.isFinite(x) && x >= 0 && x <= 1 ? x : null;
  $('game-plot').innerHTML = gameSVG(match, { selected });
});
$('game-plot').addEventListener('click', event => {
  if (!match || busy || isComplete(match)) return;
  const svg = $('game-plot').querySelector('svg');
  const box = svg.getBoundingClientRect();
  // Account for SVG letterboxing on short presentation screens.
  const scale = Math.min(box.width / 960, box.height / 440);
  const offsetX = (box.width - 960 * scale) / 2;
  const offsetY = (box.height - 440 * scale) / 2;
  const sx = (event.clientX - box.left - offsetX) / scale;
  const sy = (event.clientY - box.top - offsetY) / scale;
  if (sx < 82 || sx > 928 || sy < 76 || sy > 378) return;
  selected = Number(((sx - 82) / 846).toFixed(6));
  $('guess').value = String(selected);
  $('game-plot').innerHTML = gameSVG(match, { selected });
  $('evaluate').focus({ preventScroll: true });
});

$('guess-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (busy || !match || isComplete(match)) return;
  const x = $('guess').valueAsNumber;
  try { validateGuess(match, x); }
  catch (error) { status(error.message, true); return; }
  lockControls(true);
  status('Evaluating your guess. BO is making its own hidden guess…');
  // Yield for controls and the live status to paint before numerical work.
  await new Promise(resolve => setTimeout(resolve, 60));
  try {
    match = takeTurn(match, x);
    selected = null;
    $('guess').value = '';
    persist();
    paintMatch();
    if (!isComplete(match)) {
      status(`Your guess: f(${number(x)}) = ${number(match.human.at(-1).y)}. BO completed turn ${match.history.length}; its result stays hidden.`);
    }
  } catch (error) {
    status(`Search paused: ${error.message} No guesses were used. You can retry or start a new game.`, true);
  } finally {
    lockControls(false);
    if (match && !isComplete(match)) $('guess').focus({ preventScroll: true });
  }
});

function paintReplay() {
  try {
    const turn = match.history[replayIndex];
    const compact = window.matchMedia('(min-width: 900px) and (max-height: 800px)').matches;
    const pictures = replaySVG(match, replayIndex, { after: replayAfter, overlay: $('overlay').checked, compact });
    $('posterior-plot').innerHTML = pictures.posterior;
    $('acquisition-plot').innerHTML = pictures.acquisition;
    $('previous').disabled = replayIndex === 0;
    $('next').disabled = replayIndex === match.history.length - 1;
    $('replay-step').value = String(replayIndex);
    $('replay-stats').replaceChildren(...[
      ['Selected input x', turn.proposal.x], ['Predicted mean μ', turn.proposal.mean],
      ['Uncertainty σ', turn.proposal.sd], ['Expected improvement', turn.proposal.ei],
    ].map(([label, value]) => {
      const div = document.createElement('div');
      const caption = document.createElement('span'); caption.textContent = label;
      const strong = document.createElement('strong'); strong.textContent = number(value);
      div.append(caption, strong); return div;
    }));
    $('reveal-step').textContent = replayAfter ? 'Show before evaluation' : 'Reveal this evaluation';
    $('replay-explanation').textContent = replayAfter
      ? `Observed f(${number(turn.boResult.x)}) = ${number(turn.boResult.y)}. The posterior above now includes this observation; EI below preserves the original decision.`
      : `With ${turn.before.length} observations, BO chose the input with the highest expected positive gain over its best observed value, ${number(bestValue(turn.before))}. The outcome is not yet shown.`;
  } catch (error) {
    $('replay-explanation').textContent = `Replay paused: ${error.message} The completed match is unchanged.`;
  }
}

$('open-replay').addEventListener('click', () => {
  if (!match || !isComplete(match)) return;
  replayIndex = 0; replayAfter = false; $('overlay').checked = false;
  $('replay-step').replaceChildren(...match.history.map((_, i) => new Option(String(i + 1), String(i))));
  $('arena').hidden = true;
  $('replay').hidden = false;
  document.body.classList.add('replay-mode');
  paintReplay();
  $('replay').scrollIntoView({ block: 'start' });
});
$('close-replay').addEventListener('click', () => { paintMatch(); $('result').scrollIntoView({ block: 'start' }); });
$('previous').addEventListener('click', () => { replayIndex--; replayAfter = false; paintReplay(); });
$('next').addEventListener('click', () => { replayIndex++; replayAfter = false; paintReplay(); });
$('replay-step').addEventListener('change', () => { replayIndex = Number($('replay-step').value); replayAfter = false; paintReplay(); });
$('overlay').addEventListener('change', paintReplay);
$('reveal-step').addEventListener('click', () => { replayAfter = !replayAfter; paintReplay(); });
window.addEventListener('resize', () => { if (!$('replay').hidden) paintReplay(); });

function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$('export-json').addEventListener('click', () => download(JSON.stringify(exportMatch(match), null, 2), 'you-vs-bo-match.json', 'application/json'));
$('export-reveal').addEventListener('click', () => download(gameSVG(match, { reveal: true }), 'you-vs-bo-reveal.svg', 'image/svg+xml'));
$('export-replay').addEventListener('click', () => download(replayExportSVG(match, replayIndex, { after: replayAfter, overlay: $('overlay').checked }), `you-vs-bo-turn-${replayIndex + 1}-${replayAfter ? 'after' : 'before'}.svg`, 'image/svg+xml'));

try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    savedMatch = restoreMatch(stored);
    $('setup').hidden = true;
    $('resume').hidden = false;
    $('resume-description').textContent = `${savedMatch.mode === 'presentation' ? 'Presentation' : 'Random'} challenge · ${savedMatch.history.length} of ${savedMatch.turns} turns completed.`;
    $('resume-game').textContent = isComplete(savedMatch) ? 'View completed match' : 'Resume match';
  }
} catch {
  $('setup-error').textContent = 'A saved match could not be restored. You can start a fresh challenge.';
}
