import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';

// Publish an explicit allowlist: no coursework, saved games, screenshots or personal paths.
const root = new URL('../', import.meta.url);
const checkout = new URL('.sites-source/', root);
const assets = ['index.html', 'style.css', 'app.js', 'engine.js', 'match.js', 'plots.js'];
const manifest = JSON.parse(await readFile(new URL('.openai/hosting.json', root), 'utf8'));
if (!manifest.project_id || manifest.static?.directory !== 'dist') throw new Error('Configure the Site before preparing publication.');
await mkdir(new URL('.openai/', checkout), { recursive: true });
await mkdir(new URL('dist/', checkout), { recursive: true });
await writeFile(new URL('.openai/hosting.json', checkout), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(new URL('.gitignore', checkout), 'dist/\n');
for (const asset of assets) {
  await copyFile(new URL(asset, root), new URL(asset, checkout));
  await copyFile(new URL(asset, root), new URL(`dist/${asset}`, checkout));
}
console.log('Prepared six public game assets in demo/.sites-source and its dist directory.');
