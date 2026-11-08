# You vs Bayesian Optimisation

A local educational game for Group 14's mathematical exploration project. Find a higher function value than noise-free expected-improvement BO using the same number of evaluations.

## Share and play online

Public game: <https://owenmarschner.github.io/you-vs-bo/>

Anyone with the link can play in their browser without installing anything or signing in. Hosting is independent of the presenter's laptop. Each browser keeps its own match locally; the link does not share observations, scores or saved progress between players.

GitHub Pages publishes the `main` branch of <https://github.com/owenmarschner/you-vs-bo>. `npm run prepare:pages` copies only the six game assets, a short README and `.nojekyll` into the ignored `.github-pages-source/` checkout. Commit and push changes from that checkout to update the shared game. Coursework, local saves and personal documentation stay out of the published repository.

The previous Sites deployment remains available as a separate copy. Its identity is saved in `.openai/hosting.json`; `npm run prepare:site` prepares that older host. The GitHub Pages link above is now the primary sharing link.

## Run

Use Node.js 24 or later. No package installation, Python environment, build step, account or internet connection is required.

```bash
cd "/Users/Owen/Desktop/Education/2026/Perspectives in Math/pim-theme-3b-group-14/demo"
npm start
```

Open <http://127.0.0.1:4173>. Keep the terminal running; press Ctrl+C to stop it. To use another port: `PORT=4174 npm start`. The server binds only to your laptop's loopback interface. Opening `index.html` directly is unsupported because browsers restrict local JavaScript modules.

```bash
npm test       # Numerical, fairness, reproducibility and state tests
npm run fallback  # Regenerate the documented static example and SVG figures
```

## Play

1. Choose the prepared Presentation example or a seeded Random challenge. Seeds are exact, case-sensitive strings (including any spaces). Select 3–10 additional guesses each; default five.
2. Both players get observations at x = 0.1, 0.5 and 0.9. These count towards both budgets: the default is eight evaluations per player.
3. Click the plot or type an input between 0 and 1, then press **Evaluate guess** (or Enter in the input). Clicking alone spends no guess. Repeated inputs are rejected within 1e-12.
4. Your value appears; BO also evaluates one input privately. Its locations, values and score stay hidden until both finish. Only your observations determine the live chart scale.
5. Highest observed value wins, including starting observations. Scores use full precision; differences of at most 1e-9 count as a draw. The final result displays 12 decimal places to explain close scores.
6. Open the replay to inspect BO's GP and EI **before** each decision. **Reveal this evaluation** updates the posterior; the lower EI curve continues to show the original decision. The optional true-function overlay is initially off.

The match is saved after setup and each completed turn. Refresh offers Resume or New Game. Leaving an unfinished match requires confirmation. If storage is unavailable, a warning appears and play still works in the current tab. A numerical failure commits neither player's turn and preserves the previous match; it never substitutes another search strategy.

## Maths and numerical choices

- Domain [0, 1]. The objective is the sum, over three peaks, of `amplitude * exp(-0.5 * ((x - centre) / width)^2)`. These are cheap synthetic evaluations standing in for costly experiments.
- Presentation peaks `(centre, amplitude, width)`: `(0.25, 0.9, 0.1)`, `(0.55, 1.2, 0.06)`, `(0.8, 1.0, 0.08)`. Presentation seed label: `presentation-v1`.
- Random generation version: `fnv1a-mulberry32-peaks-v1`. Hash the seed's UTF-16 code units using FNV-1a, then use Mulberry32. Draw centre, amplitude, width for each peak in left-to-right order. Centre intervals: [0.1, 0.3), [0.4, 0.6), [0.7, 0.9); amplitude [0.5, 1.5); width [0.04, 0.12). Some sums can have fewer distinct maxima because peaks overlap.
- GP prior: zero mean; squared-exponential kernel `exp(-0.5 * ((x-x')/0.15)^2)`. Signal variance 1, fixed length scale 0.15; no hyperparameter fitting or observation noise.
- Cholesky conditioning uses diagonal jitter 1e-10 for numerical stability, not a claim of measurement noise. Posterior uncertainty at observations is therefore tiny rather than exactly zero. Variances between -1e-7 and zero are clamped; larger negative or nonfinite values stop the calculation.
- Noise-free EI: improvement relative to BO's best observed value. Use the Gaussian closed form and its deterministic limit for standard deviation at most 1e-12. The normal CDF uses Abramowitz–Stegun 26.2.17 (absolute CDF error below 7.5e-8); EI is clamped nonnegative against rounding.
- Maximise EI on all 2,001 grid inputs `i/2000`, including boundaries. Exclude previously sampled BO inputs within 1e-12; exact computed ties use the lowest input. This approximates continuous acquisition optimisation. The graph thins curves for display only.
- Shaded replay bands are `mean ± 1.96 * sd`: **pointwise, model-dependent** 95% posterior bands, not simultaneous bands or guaranteed error bounds.

The selector accepts only BO's observations and model settings. The objective evaluator is called after selection; human observations never enter BO's model. The live game is an illustration of human intuition versus GP-based EI, not an isolated comparison of acquisition policies or a human-performance study. The game does not need or compute the true maximum to decide a winner.

Source to read and verify: Peter I. Frazier (2018), *A Tutorial on Bayesian Optimization*, §§3 and 4.1, <https://arxiv.org/abs/1807.02811>. The source describes the GP and EI mathematics; function design, budgets and UI are project choices. Check compatibility with the group's notation and read scholarly sources directly before writing the assessed report.

## Code and exports

- `engine.js`: objective generation/evaluation, GP, EI and candidate selection.
- `match.js`: immutable match transitions, scores, validated resume and export.
- `plots.js`: pure, self-contained SVG generation; used by the interface and fallback.
- `app.js`: UI state, browser storage, replay navigation and downloads.

No server-side game state or external services are used. This is a classroom game, not a secure competition: hidden data exists in the browser's JavaScript state and local storage and could be inspected with developer tools. Normal UI and exports do not expose it before completion.

After a match, export its JSON (parameters, seed, model, budgets, observations, original proposals, per-turn histories and scores). Export the reveal or current replay as SVG for report figures. Downloads use browser-native save behaviour. The SVGs contain their own styles and no external assets.

## Five-minute presentation runbook

| Time | Action and teaching prompt |
| --- | --- |
| 0:00–0:30 | Start Presentation mode, five guesses each. Explain equal budgets, shared observations and highest-observed-value scoring. |
| 0:30–2:00 | Ask the audience for five inputs; the presenter clicks/types and confirms. Ask for a mixture of promising and unexplored locations. Keep BO's results hidden. |
| 2:00–2:40 | Reveal scores and function. Identify a discovered peak and any region neither player sampled well. Winning this match does not establish general superiority. |
| 2:40–4:30 | Replay two contrasting BO decisions (suggested turns 1 and 2). Before revealing each outcome, connect the mean and uncertainty to the EI maximum. Reveal and show the posterior update. |
| 4:30–5:00 | Summarise the role of the model and limited budget. Hand over to the repeated experimental comparisons. UCB is covered elsewhere; it is not part of this game. |

Before presenting, use the actual projector, check label readability and rehearse the audience interaction. A silent audience can nominate an interval and let the presenter select a value. Use a short prepared human sequence if necessary, clearly identified as prepared.

## Static fallback

Open `fallback/index.html` directly in a browser, even without the local server or JavaScript. It contains initial observations, each human turn, the final reveal and before/after BO replay figures. For the five-minute slot, use the start, reveal, and first two replay turns; the remaining figures are available for questions.

The included example uses human inputs **0.25, 0.6, 0.72, 0.82, 0.96**, in order, against the Presentation function. `fallback/example-match.json` records the full result. Each SVG can be used independently in slides. Do not present the prepared match as collected audience feedback.

## Verification boundaries

Automated tests independently check scalar and 2x2 GP conditioning, EI via numerical integration, acquisition maximisation, budget rules, ties, independence from human guesses, persistence consistency and replay integrity. Browser interaction and layout review are recorded in `VALIDATION.md`. Rehearsing with the actual audience/projector remains a group task; no educational benefit or audience feedback is claimed from software tests.
