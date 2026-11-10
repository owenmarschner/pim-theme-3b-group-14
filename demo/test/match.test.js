import test from 'node:test';
import assert from 'node:assert/strict';
import { createMatch, takeTurn, isComplete, scores, bestValue, exportMatch, restoreMatch } from '../match.js';
import { gameSVG, replaySVG, replayExportSVG } from '../plots.js';

const finish = (config, guesses) => guesses.reduce((match, x) => takeTurn(match, x), createMatch(config));

test('minimum, default, and maximum budgets give equal evaluation counts and stop at the limit', () => {
  for (const turns of [3, 5, 10]) {
    let match = createMatch({ turns });
    assert.equal(match.human.length, 3);
    assert.deepEqual(match.human, match.bo);
    assert.notEqual(match.human, match.bo);
    for (let i = 0; i < turns; i++) match = takeTurn(match, (i + 1) / 23);
    assert.ok(isComplete(match));
    assert.equal(match.human.length, 3 + turns);
    assert.equal(match.bo.length, 3 + turns);
    assert.throws(() => takeTurn(match, 0.7), /finished/);
    assert.equal(exportMatch(match).evaluationsPerPlayer, 3 + turns);
  }
});

test('invalid/duplicate inputs do not mutate a match; boundaries are valid', () => {
  const match = createMatch();
  const original = JSON.stringify(match);
  for (const x of [NaN, Infinity, -0.1, 1.01, 0.1, 0.5, 0.9]) assert.throws(() => takeTurn(match, x));
  assert.equal(JSON.stringify(match), original);
  let next = takeTurn(match, 0);
  next = takeTurn(next, 1);
  assert.equal(next.history.length, 2);
  assert.throws(() => takeTurn(next, 0), /already/);
  assert.throws(() => exportMatch(match), /Finish/);
});

test('BO only receives its own observations/settings and is independent of human choices', () => {
  const a = finish({ turns: 3 }, [0.2, 0.3, 0.4]);
  const b = finish({ turns: 3 }, [0.6, 0.7, 0.8]);
  assert.deepEqual(a.bo, b.bo);
  assert.deepEqual(a.history.map(t => t.proposal), b.history.map(t => t.proposal));
  assert.notDeepEqual(a.human, b.human);
  takeTurn(createMatch(), 0.2, (...args) => {
    assert.equal(args.length, 2);
    assert.deepEqual(Object.keys(args[0][0]), ['x', 'y']);
    return { x: 0.7, mean: 0, sd: 1, ei: 1 };
  });
});

test('numerical failure preserves the match; no random-search substitution', () => {
  const match = createMatch();
  const original = JSON.stringify(match);
  assert.throws(() => takeTurn(match, 0.2, () => { throw new Error('Factorisation failed'); }), /Factorisation/);
  assert.throws(() => takeTurn(match, 0.2, () => ({ x: NaN })), /invalid/);
  assert.equal(JSON.stringify(match), original);
});

test('scores include initial observations, use best ever rather than last, and apply tie tolerance', () => {
  const match = createMatch();
  assert.equal(scores(match).winner, 'draw');
  assert.equal(scores(match).human, Math.max(...match.initial.map(p => p.y)));
  const changed = { ...match, human: [{ x: 0, y: 2 }, { x: 1, y: 0 }], bo: [{ x: 0, y: 1.5 }] };
  assert.equal(scores(changed).winner, 'human');
  assert.equal(bestValue(changed.human), 2);
  changed.bo[0].y = 2 + 5e-10;
  assert.equal(scores(changed).winner, 'draw');
  changed.bo[0].y = 2 + 2e-9;
  assert.equal(scores(changed).winner, 'bo');
});

test('random seed, completed turns, and persisted matches reproduce exactly', () => {
  const config = { mode: 'random', seed: 'group-14', turns: 3 };
  const a = finish(config, [0.25, 0.6, 0.8]);
  assert.deepEqual(a, finish(config, [0.25, 0.6, 0.8]));
  assert.deepEqual(restoreMatch(JSON.stringify(a)), a);
  const partial = takeTurn(createMatch(config), 0.22);
  assert.deepEqual(restoreMatch(JSON.stringify(partial)), partial);
  assert.throws(() => restoreMatch('bad JSON'));
  assert.throws(() => restoreMatch(JSON.stringify({ ...a, version: '0.0.0' })));
  assert.throws(() => restoreMatch(JSON.stringify({ ...a, human: [] })), /inconsistent/);
});

test('replay uses the original before/after histories without changing scores or observations', () => {
  const match = finish({ turns: 3 }, [0.25, 0.6, 0.8]);
  const original = JSON.stringify(match);
  match.history.forEach((turn, i) => {
    assert.deepEqual(turn.before, match.bo.slice(0, 3 + i));
    assert.deepEqual(turn.boResult, match.bo[3 + i]);
    const before = replaySVG(match, i);
    const after = replaySVG(match, i, { after: true });
    assert.notEqual(before.posterior, after.posterior);
    assert.match(after.acquisition, /Original EI/);
    assert.match(replayExportSVG(match, i), /^<svg/);
  });
  assert.equal(JSON.stringify(match), original);
});

test('replay uses the same y axes across turns, reveals and reference overlays', () => {
  const match = finish({ turns: 3 }, [0.25, 0.6, 0.8]);
  const yAxis = svg => svg.match(/<text x="68"[^>]*>[^<]*<\/text>/g);
  for (const compact of [false, true]) {
    const first = replaySVG(match, 0, { compact });
    const posteriorAxis = yAxis(first.posterior);
    const acquisitionAxis = yAxis(first.acquisition);
    assert.ok(posteriorAxis?.length >= 2);
    assert.ok(acquisitionAxis?.length >= 2);
    for (let i = 0; i < match.history.length; i++) {
      for (const revealed of [false, true]) {
        const plots = replaySVG(match, i, { compact, after: revealed, overlay: revealed });
        assert.deepEqual(yAxis(plots.posterior), posteriorAxis);
        assert.deepEqual(yAxis(plots.acquisition), acquisitionAxis);
      }
    }
  }
});

test('live SVG reveals no hidden BO values, curve, or scale information', () => {
  const match = takeTurn(createMatch(), 0.25);
  const live = gameSVG(match);
  const changedHidden = { ...match, bo: [{ x: 0.33, y: 1000 }], objective: { peaks: [{ centre: 0.7, width: 1, amplitude: 2000 }] } };
  assert.equal(gameSVG(changedHidden), live);
  assert.doesNotMatch(live, /hidden function, revealed/);
  assert.notEqual(gameSVG(match, { reveal: true }), live);
});
