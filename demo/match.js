import { ENGINE_VERSION, GENERATOR_VERSION, MODEL, INITIAL_INPUTS, GRID_SIZE,
  makeObjective, evaluateObjective, selectNext } from './engine.js';

export const STORAGE_KEY = 'you-vs-bo-match-v1';
export const bestValue = points => Math.max(...points.map(point => point.y));
export const isComplete = match => match.history.length === match.turns;

export function createMatch({ mode = 'presentation', seed = 'classroom-1', turns = 5 } = {}) {
  if (!Number.isInteger(turns) || turns < 3 || turns > 10) throw new Error('Choose 3–10 guesses per player.');
  if (typeof seed !== 'string' || seed.length > 120) throw new Error('Seeds must contain at most 120 characters.');
  const objective = makeObjective(mode, seed);
  const initial = INITIAL_INPUTS.map(x => ({ x, y: evaluateObjective(objective, x) }));
  return {
    version: ENGINE_VERSION, generatorVersion: GENERATOR_VERSION, mode,
    seed: mode === 'presentation' ? 'presentation-v1' : seed,
    turns, model: { ...MODEL }, gridSize: GRID_SIZE, objective,
    initial, human: initial.map(point => ({ ...point })), bo: initial.map(point => ({ ...point })), history: [],
  };
}

export function validateGuess(match, x) {
  if (isComplete(match)) throw new Error('This match has finished. Start a new game to play again.');
  if (!Number.isFinite(x) || x < 0 || x > 1) throw new Error('Choose an input between 0 and 1.');
  if (match.human.some(point => Math.abs(point.x - x) <= 1e-12)) {
    throw new Error('You have already sampled that input. Choose a different one; no guess was used.');
  }
}

export function takeTurn(match, x, selector = selectNext) {
  validateGuess(match, x);
  // Atomic: compute everything before returning a replacement state. A failure spends no guesses.
  const before = match.bo.map(point => ({ ...point }));
  const proposal = selector(before, match.model);
  if (![proposal.x, proposal.mean, proposal.sd, proposal.ei].every(Number.isFinite) ||
      proposal.x < 0 || proposal.x > 1 || proposal.sd < 0 || proposal.ei < 0 ||
      before.some(point => Math.abs(point.x - proposal.x) <= 1e-12)) {
    throw new Error('BO produced an invalid suggestion. Your match has been preserved.');
  }
  const humanResult = { x, y: evaluateObjective(match.objective, x) };
  const boResult = { x: proposal.x, y: evaluateObjective(match.objective, proposal.x) };
  return {
    ...match, human: [...match.human, humanResult], bo: [...match.bo, boResult],
    history: [...match.history, { before, proposal, humanResult, boResult }],
  };
}

export function scores(match) {
  const human = bestValue(match.human);
  const bo = bestValue(match.bo);
  return { human, bo, winner: Math.abs(human - bo) <= 1e-9 ? 'draw' : human > bo ? 'human' : 'bo' };
}

export function exportMatch(match) {
  if (!isComplete(match)) throw new Error('Finish the match before exporting its hidden data.');
  return { ...match, scores: scores(match), evaluationsPerPlayer: match.initial.length + match.turns };
}

export function restoreMatch(serialised) {
  const saved = JSON.parse(serialised);
  if (!saved || saved.version !== ENGINE_VERSION || saved.generatorVersion !== GENERATOR_VERSION ||
      !Array.isArray(saved.history) || saved.history.length > 10) throw new Error('Unsupported saved match.');
  let reconstructed = createMatch(saved);
  if (JSON.stringify(saved.model) !== JSON.stringify(reconstructed.model) || saved.gridSize !== GRID_SIZE ||
      JSON.stringify(saved.objective) !== JSON.stringify(reconstructed.objective)) throw new Error('Saved settings have changed.');
  // Revalidate the short history instead of trusting persisted hidden state or scores.
  for (const turn of saved.history) reconstructed = takeTurn(reconstructed, turn.humanResult.x);
  if (JSON.stringify(reconstructed) !== JSON.stringify(saved)) throw new Error('The saved match is inconsistent.');
  return reconstructed;
}
