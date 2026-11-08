import { mkdir, copyFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const checkout = new URL('.github-pages-source/', root);
await mkdir(checkout, { recursive: true });
// Only the already-public game assets are copied, never coursework or browser saves.
for (const asset of ['index.html', 'style.css', 'app.js', 'engine.js', 'match.js', 'plots.js']) {
  await copyFile(new URL(asset, root), new URL(asset, checkout));
}
await writeFile(new URL('.nojekyll', checkout), '');
await writeFile(new URL('README.md', checkout), '# You vs Bayesian Optimisation\n\nAn educational game about finding high function values using a limited number of evaluations. Play against expected-improvement Bayesian optimisation, then replay its decisions.\n\nThis repository contains the static website assets. GitHub Pages publishes the main branch. No build step or dependencies are required.\n');
console.log('Prepared the GitHub Pages checkout in demo/.github-pages-source.');
