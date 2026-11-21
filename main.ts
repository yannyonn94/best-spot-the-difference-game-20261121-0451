// Twin Tales — hand-in program (Node 22, standard library only).
// It stages this repository's game/ and screenshots/ into the output
// directory and writes the dossier the judge reads, using the vendored
// make.fun library. Outside the grader, MAKEFUN_OUTPUT_DIR stands in
// for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function stageFolder(name) {
  const source = join(repoRoot, name);
  const target = join(outputDir, name);
  if (!existsSync(source)) return;
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
stageFolder('game');
stageFolder('screenshots');

// Pre-flight: refuse to write a dossier for a game that is not there, so a
// typo in the repo layout fails loudly here instead of at the gate.
const stagedGame = join(outputDir, 'game', 'index.html');
if (!existsSync(stagedGame)) {
  throw new Error(`game/index.html missing after staging (looked in ${stagedGame})`);
}
const shotDir = join(outputDir, 'screenshots');
if (!existsSync(shotDir)) mkdirSync(shotDir, { recursive: true });

// The scorer's own caps, as the kit's gate states them: at most 4
// screenshots of 256 KiB, at most 993 game files totalling 48 MiB, and
// no game path longer than 1000 bytes. The dossier text is capped at
// 160 KiB so the judge's view stays inside its token budget.
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierText);

// A short human-readable summary so a run's output says what it handed in.
const shotCount = existsSync(shotDir)
  ? readdirSync(shotDir).filter((f) => !f.startsWith('.')).length
  : 0;
console.log(`Twin Tales staged: game/ + ${shotCount} screenshot(s) + dossier.json (${dossierText.length} bytes)`);
