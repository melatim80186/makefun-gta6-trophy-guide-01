// Leonida Legends — GTA VI Trophy Guide & Tracker
// make.fun entrypoint for contest gta6-trophy-guide-01 (Node 22, stdlib only).
//
// What this program does, in three moves:
//   1. Stages the guide itself: copies app/ (the static tracker — index.html,
//      style.css, app.js, data/trophies.json) and screenshots/ (the four judged
//      renders) from beside this file into the output directory.
//   2. Asks the vendored make.fun library (vendor/makefun-frontend.ts, copied
//      from the kit unchanged) to describe that staged output as a dossier:
//      which files the first load touches, how big they are, and the entry's
//      own source — the summary the judge reads.
//   3. Writes that dossier to <output>/dossier.json.
//
// The output directory is MAKEFUN_OUTPUT_DIR when set (the grader's harness
// sets it); locally it defaults to /output. Run it from the repo root with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// and serve the guide for a look with `node serve.ts` (http://localhost:8080).

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The folder this file lives in — app/ and screenshots/ sit beside it.
const here = fileURLToPath(new URL('.', import.meta.url));

// Where the finished entry goes. The grader supplies this; /output is the
// fallback so a bare `node main.ts` still lands somewhere sensible.
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Stage the guide. app/ is required — fail loudly if it is absent rather
// than letting cpSync throw a bare ENOENT with no context.
const appDir = join(here, 'app');
if (!existsSync(appDir)) {
  throw new Error(`Leonida Legends: app/ not found beside main.ts (${appDir})`);
}
mkdirSync(out, { recursive: true });
cpSync(appDir, join(out, 'app'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps, from the kit's reference/gate.json. text_max_bytes shapes
// how much of the entry's text the judge is shown; the other three are the
// scorer's own refusal lines — more than 4 screenshots, any one over 256 KiB,
// more than 993 files/directories inside app/, or app/ over 48 MiB — and the
// dossier refuses an entry that would cross them, exactly as the scorer would.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`Leonida Legends staged in ${out} — dossier.json written.`);
