# Validation record

## GitHub Pages address · 7 November 2026

- Primary sharing URL: <https://owenmarschner.github.io/you-vs-bo/>. GitHub Pages publishes the dedicated public repository <https://github.com/owenmarschner/you-vs-bo> from its `main` branch, using HTTPS.
- All six deployed game files returned HTTP 200 without cookies or credentials and matched local source byte for byte. The repository contains only those files, `.nojekyll` and a short public README.
- Browser verification on the new URL: setup loaded with the bullet-point instructions; a human guess at x = 0.25 advanced both players one turn, displayed the human result and kept BO's result hidden.
- No game-engine changes were needed for migration. The existing numerical/state checks remain applicable. Progress saved under the previous host is not transferred between origins.

## Public hosting update · 7 November 2026

- Converted the highlighted introductory paragraph into four semantic list items; verified the bullet markers in both the local and published browser views.
- Published Site version 1 at <https://you-vs-bo-group-14.sincerewoodpecker.chatgpt.site>, with access set to public (anyone with the link).
- The root HTML and all five CSS/JavaScript assets returned HTTP 200 without cookies or credentials. CSS/JavaScript matched local source byte for byte; HTML retained the original content with a hosting-platform security script appended. `/index.html` redirects to the canonical `/` URL. Only the six game assets and hosting manifest are in the deployment archive.
- Started a match on the production site and evaluated x = 0.25. Both players advanced one turn, the human result appeared and BO's result stayed hidden. The deployed site does not depend on the local development server.
- All 17 numerical and state tests still pass. Existing local-only validation notes below refer to the initial implementation.

Verified with Node **v24.13.1** and npm **11.8.0** on the user's Mac. No Python was used, and no packages were installed.

## Automated checks

`npm test`: **17 tests pass**. Coverage includes independently calculated scalar and two-observation GP conditioning; EI versus numerical Simpson integration; zero uncertainty; monotonicity; full-grid acquisition maximisation and exact ties; equal budgets at 3, 5 and 10 turns; duplicate/invalid/boundary inputs; BO independence from human choices; atomic failure; score and draw rules; seed reproducibility; saved-state reconstruction; immutable replay; and absence of hidden values or scale information in the live plot.

`node --check` passed for the app, plots and server. `xmllint --noout` passed for all 17 generated fallback SVGs and downloaded reveal/replay SVGs. HTTP HEAD on the local app returned 200. Browser error logs were empty during the presentation-match/replay review.

## Browser review

Reviewed the local app in the Codex in-app browser:

- At a **DOM-verified 1280 × 720** viewport, live play fits with scores, plot and input controls visible. The compact replay shows the posterior, EI and evaluation control together. Screenshots are in `screenshots/`.
- At a **DOM-verified 390-pixel-wide** viewport, setup, live play, winner/draw reveal and controls remain usable. Large plots scroll horizontally inside their own panels; page-wide horizontal overflow was not observed. Small-screen plots deliberately preserve readable labels rather than shrinking the entire graph.
- Clicking the plot selected an input without spending a turn. A separate evaluation was required.
- An initial-observation duplicate was rejected without consuming a guess. Boundary inputs 0 and 1 were accepted.
- A double-click on Evaluate consumed exactly one turn. Keyboard Enter completed subsequent turns.
- Cancelling the unfinished-match reset dialog preserved progress. Reload offered Resume and restored both visible observations and hidden BO progress.
- A five-turn Presentation match used human guesses 0.25, 0.6, 0.72, 0.82, 0.96. The result matched the static fallback: human best **0.969281392107**, BO best **0.888404999997**, eight evaluations each. BO inputs were **0.652, 0.3505, 1, 0, 0.4595**. This is an illustrative model-dependent outcome, not evidence of general superiority for either player.
- A three-turn Random match with seed `mobile-check`, human inputs 0, 1 and 0.4, produced a correctly displayed draw at **0.592609239312**, six evaluations each.
- Replay started with the true-function overlay off. Reveal updated the posterior and displayed the evaluated value; Next reset to the next pre-decision state. Previous returned to the prior state. The reference overlay toggled independently. JSON, reveal SVG and replay SVG downloaded successfully.
- After loading the app, the local server was stopped. The remaining four Presentation turns, final reveal, JSON and reveal SVG downloads still worked. This checks that those operations need no server requests after initial loading; it is not a claim that the Mac's physical network was disconnected.

## Remaining manual checks

- The browser automation policy allows only HTTP/HTTPS and rejected direct `file://` navigation. The fallback HTML and all its referenced SVG files exist, contain no scripts or external assets, and the SVGs pass XML validation. **Opening `fallback/index.html` directly by double-click was not browser-verified.**
- Rehearse the five-minute interaction with the group and actual projector. Software review is not audience feedback and does not establish learning benefits.
- Storage-denied behaviour is implemented with a warning and continued in-tab play, but was not forced in the browser. Numerical failure is tested at the pure state-transition layer; it was not induced through developer tools in the live UI.
- Browser review covered the in-app browser, not a cross-browser compatibility matrix. Test in the browser intended for presentation before the assessment.

The development/test server is stopped after verification. Run `npm start` to open or reload the demo locally; a browser tab that already loaded the app can continue playing without the server.
