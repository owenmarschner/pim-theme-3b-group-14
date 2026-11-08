import { mkdir, writeFile } from 'node:fs/promises';
import { createMatch, takeTurn, exportMatch, scores } from '../match.js';
import { gameSVG, replayExportSVG, escapeXML } from '../plots.js';

const directory = new URL('../fallback/', import.meta.url);
await mkdir(directory, { recursive: true });
let match = createMatch();
const slides = [{ file: '01-start.svg', title: 'Three observations. Where would you look next?', note: 'Both players start here. The human sees only these values; BO has the same data.' }];
await writeFile(new URL(slides[0].file, directory), gameSVG(match));
const guesses = [0.25, 0.6, 0.72, 0.82, 0.96];
for (let i = 0; i < guesses.length; i++) {
  match = takeTurn(match, guesses[i]);
  const file = `02-human-turn-${i + 1}.svg`;
  await writeFile(new URL(file, directory), gameSVG(match));
  slides.push({ file, title: `Human guess ${i + 1}: x = ${guesses[i]}`, note: 'One evaluation each. BO’s location and result remain hidden.' });
}
await writeFile(new URL('03-reveal.svg', directory), gameSVG(match, { reveal: true }));
const score = scores(match);
slides.push({ file: '03-reveal.svg', title: 'The reveal', note: `Human best: ${score.human.toFixed(12)}. BO best: ${score.bo.toFixed(12)}. Winner: ${score.winner}. Eight evaluations each.` });
for (let i = 0; i < match.history.length; i++) {
  for (const after of [false, true]) {
    const file = `04-bo-turn-${i + 1}-${after ? 'after' : 'before'}.svg`;
    await writeFile(new URL(file, directory), replayExportSVG(match, i, { after }));
    const turn = match.history[i];
    slides.push({ file, title: `BO turn ${i + 1}: ${after ? 'the observation' : 'the decision'}`,
      note: after ? `Observed f(${turn.boResult.x}) = ${turn.boResult.y.toFixed(6)}. The posterior updates; the EI curve records the original decision.`
        : `EI proposes x = ${turn.proposal.x}. Ask what BO knows before revealing the value.` });
  }
}
await writeFile(new URL('example-match.json', directory), JSON.stringify(exportMatch(match), null, 2) + '\n');
await writeFile(new URL('index.html', directory), `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>You vs BO · Static presentation fallback</title>
<style>body{font:18px/1.5 system-ui,sans-serif;color:#192d43;background:#f5f7fa;margin:0}header,section{max-width:1100px;margin:auto;padding:28px}section{break-before:page;margin-bottom:30px;background:white;border:1px solid #dce3eb;border-radius:14px}img{width:100%;display:block}p{color:#52677a}a{color:#2163c7}@media print{header{display:none}section{border:0;margin:0;padding:0;break-inside:avoid}img{max-height:80vh}}</style>
<header><h1>You vs Bayesian Optimisation</h1><p>Static fallback · presentation-v1 · five guesses each</p><p>Human inputs: ${guesses.join(', ')}. This is one illustrative match, not a performance benchmark.</p><a href="example-match.json">Full example match record</a></header>
${slides.map((slide, i) => `<section><h2>${i + 1}. ${escapeXML(slide.title)}</h2><p>${escapeXML(slide.note)}</p><img src="${slide.file}" alt="${escapeXML(slide.title)}"></section>`).join('\n')}
</html>\n`);
console.log(`Generated ${slides.length} static figures, a match record and fallback/index.html.`);
console.log(`Presentation example: human ${score.human.toFixed(9)}; BO ${score.bo.toFixed(9)}; ${score.winner}.`);
console.log('BO inputs: ' + match.history.map(t => t.proposal.x).join(', '));
