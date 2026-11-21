// Twin Tales — game state, input, HUD, timer, hints and screenshot states.
// One canvas per panel; both panels are drawn by painter.js from the same
// scene, the right one with the differences applied. A click is mapped back
// into panel coordinates and tested against the scene's difference spots.
import { SCENES, DIFFS_PER_SCENE, PANEL_W, PANEL_H } from './scenes.js';
import { drawScene } from './painter.js';
import {
  unlockAudio, playClick, playFound, playWrong, playHint,
  playLevelComplete, playWin, playGameOver, toggleMute, isMuted,
} from './audio.js';

const MAX_MISTAKES = 5;
const HINTS_PER_LEVEL = 3;
const HINT_COST = 50;
const FIND_POINTS = 100;
const WRONG_COST = 25;

export const gameState = {
  screen: 'title', // title | playing | levelComplete | gameOver | win
  level: 0,
  found: new Set(),
  mistakes: 0,
  hintsLeft: HINTS_PER_LEVEL,
  score: 0,
  timeLeft: 0,
  hintPulse: null, // { index, until }
  wrongFlash: null, // { x, y, panel, until }
  timerId: null,
  shot: null,
};

const $ = (id) => document.getElementById(id);

function scene() {
  return SCENES[gameState.level];
}

function remainingCount() {
  return DIFFS_PER_SCENE - gameState.found.size;
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function renderPanels() {
  const left = $('panel-left');
  const right = $('panel-right');
  if (!left || !right) return;
  const current = scene();
  drawScene(left.getContext('2d'), current.id, 0);
  drawScene(right.getContext('2d'), current.id, 1);
  drawMarkers(left.getContext('2d'));
  drawMarkers(right.getContext('2d'));
  drawHintPulse(left.getContext('2d'));
  drawHintPulse(right.getContext('2d'));
  drawWrongFlash(left.getContext('2d'), 'left');
  drawWrongFlash(right.getContext('2d'), 'right');
}

function drawMarkers(ctx) {
  const now = Date.now();
  for (const index of gameState.found) {
    const d = scene().diffs[index];
    const pulse = 1 + 0.08 * Math.sin(now / 240);
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * pulse + 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // check mark
    ctx.beginPath();
    ctx.moveTo(d.x - 8, d.y);
    ctx.lineTo(d.x - 2, d.y + 7);
    ctx.lineTo(d.x + 10, d.y - 7);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

function drawHintPulse(ctx) {
  const hint = gameState.hintPulse;
  if (!hint || Date.now() > hint.until) return;
  const d = scene().diffs[hint.index];
  const pulse = 1 + 0.25 * Math.sin(Date.now() / 120);
  ctx.beginPath();
  ctx.arc(d.x, d.y, (d.r + 10) * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawWrongFlash(ctx, panel) {
  const flash = gameState.wrongFlash;
  if (!flash || flash.panel !== panel || Date.now() > flash.until) return;
  const s = 14;
  ctx.beginPath();
  ctx.moveTo(flash.x - s, flash.y - s);
  ctx.lineTo(flash.x + s, flash.y + s);
  ctx.moveTo(flash.x + s, flash.y - s);
  ctx.lineTo(flash.x - s, flash.y + s);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();
}

export function updateHud() {
  const current = scene();
  $('level-name').textContent = `Level ${gameState.level + 1} · ${current.name}`;
  $('level-sub').textContent = current.subtitle;
  $('timer').textContent = formatTime(gameState.timeLeft);
  $('timer').classList.toggle('urgent', gameState.timeLeft <= 30 && gameState.screen === 'playing');
  $('score').textContent = String(gameState.score);
  $('found-count').textContent = `FOUND ${gameState.found.size} / ${DIFFS_PER_SCENE}`;
  $('remain-count').textContent = `${remainingCount()} LEFT TO FIND`;
  $('hearts').textContent = '♥'.repeat(MAX_MISTAKES - gameState.mistakes) + '♡'.repeat(gameState.mistakes);
  $('hint-btn').textContent = `💡 Hint (${gameState.hintsLeft} left · −${HINT_COST} pts)`;
  $('hint-btn').disabled = gameState.hintsLeft <= 0 || gameState.screen !== 'playing';
  $('mute-btn').textContent = isMuted() ? '🔇 Sound off' : '🔊 Sound on';
  const dots = $('dots');
  dots.innerHTML = '';
  for (let i = 0; i < DIFFS_PER_SCENE; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (gameState.found.has(i) ? ' found' : '');
    dot.textContent = gameState.found.has(i) ? '✓' : '•';
    dots.appendChild(dot);
  }
  $('status-line').textContent =
    gameState.screen === 'playing'
      ? `${remainingCount()} difference${remainingCount() === 1 ? '' : 's'} still hiding in ${current.name}.`
      : '';
}

function showOverlay(html) {
  const overlay = $('overlay');
  overlay.innerHTML = html;
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  $('overlay').classList.add('hidden');
  $('overlay').innerHTML = '';
}

function startTimer() {
  stopTimer();
  gameState.timerId = window.setInterval(() => {
    if (gameState.screen !== 'playing') return;
    gameState.timeLeft -= 1;
    if (gameState.timeLeft <= 0) {
      gameState.timeLeft = 0;
      updateHud();
      endGame(false, 'Time ran out!');
      return;
    }
    updateHud();
    renderPanels();
  }, 1000);
}

function stopTimer() {
  if (gameState.timerId !== null) {
    window.clearInterval(gameState.timerId);
    gameState.timerId = null;
  }
}

export function startLevel(level, keepScore = false) {
  gameState.level = level;
  gameState.found = new Set();
  gameState.mistakes = 0;
  gameState.hintsLeft = HINTS_PER_LEVEL;
  gameState.hintPulse = null;
  gameState.wrongFlash = null;
  gameState.timeLeft = scene().timeLimit;
  if (!keepScore) gameState.score = 0;
  gameState.screen = 'playing';
  hideOverlay();
  renderPanels();
  updateHud();
  startTimer();
}

export function startGame() {
  unlockAudio();
  playClick();
  gameState.score = 0;
  startLevel(0);
}

function endGame(won, reason) {
  stopTimer();
  if (won) {
    gameState.screen = 'win';
    playWin();
    showOverlay(`
      <div class="card">
        <h1>🏆 You found them all!</h1>
        <p class="big">All 3 scenes cleared — every last difference spotted.</p>
        <p>Final score: <strong>${gameState.score}</strong></p>
        <p class="hint-line">Twin Tales thanks you for playing. Can you beat your score?</p>
        <button id="again-btn" class="primary">Play again</button>
      </div>`);
  } else {
    gameState.screen = 'gameOver';
    playGameOver();
    showOverlay(`
      <div class="card">
        <h1>⏰ ${reason}</h1>
        <p class="big">You found ${gameState.found.size} of ${DIFFS_PER_SCENE} differences in ${scene().name}.</p>
        <p>Score: <strong>${gameState.score}</strong> · Level ${gameState.level + 1} of ${SCENES.length}</p>
        <button id="again-btn" class="primary">Try this level again</button>
        <button id="menu-btn" class="ghost">Back to title</button>
      </div>`);
  }
  $('again-btn').addEventListener('click', () => {
    if (won) startGame();
    else startLevel(gameState.level, true);
  });
  const menuBtn = $('menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', showTitle);
  updateHud();
  renderPanels();
}

function levelComplete() {
  stopTimer();
  gameState.screen = 'levelComplete';
  const bonus = gameState.timeLeft * 5;
  gameState.score += bonus;
  playLevelComplete();
  const last = gameState.level === SCENES.length - 1;
  showOverlay(`
    <div class="card">
      <h1>🎉 Level complete!</h1>
      <p class="big">All ${DIFFS_PER_SCENE} differences found in ${scene().name}.</p>
      <p>Time bonus +${bonus} · Score: <strong>${gameState.score}</strong></p>
      <p class="found-list">${scene().diffs.map((d) => `✓ ${d.label}`).join('<br>')}</p>
      <button id="next-btn" class="primary">${last ? 'See your victory' : 'Next level →'}</button>
    </div>`);
  $('next-btn').addEventListener('click', () => {
    if (last) endGame(true, '');
    else startLevel(gameState.level + 1, true);
  });
  updateHud();
  renderPanels();
}

export function showTitle() {
  stopTimer();
  gameState.screen = 'title';
  gameState.level = 0;
  gameState.found = new Set();
  gameState.mistakes = 0;
  gameState.hintsLeft = HINTS_PER_LEVEL;
  gameState.score = 0;
  gameState.timeLeft = scene().timeLimit;
  gameState.hintPulse = null;
  gameState.wrongFlash = null;
  showOverlay(`
    <div class="card title-card">
      <h1>🔍 TWIN TALES</h1>
      <p class="tagline">Spot the Difference</p>
      <p class="big">Two pictures. Seven differences. One sharp pair of eyes.</p>
      <p>Three hand-drawn scenes — a sunny beach, a firefly camp, a lantern
      night market. Click a difference on either picture to circle it.
      Wrong clicks cost a heart and 25 points. Stuck? A hint costs 50.</p>
      <p class="keys">Mouse: click a difference &nbsp;·&nbsp; H: hint &nbsp;·&nbsp; M: sound &nbsp;·&nbsp; R: restart</p>
      <button id="start-btn" class="primary big-btn">▶ Start playing</button>
    </div>`);
  $('start-btn').addEventListener('click', startGame);
  renderPanels();
  updateHud();
}

function panelCoords(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * PANEL_W;
  const y = ((event.clientY - rect.top) / rect.height) * PANEL_H;
  return { x, y };
}

function handlePanelClick(event, panel) {
  if (gameState.screen !== 'playing') return;
  unlockAudio();
  const canvas = event.currentTarget;
  const { x, y } = panelCoords(event, canvas);
  const current = scene();
  let hit = -1;
  for (let i = 0; i < current.diffs.length; i++) {
    if (gameState.found.has(i)) continue;
    const d = current.diffs[i];
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      hit = i;
      break;
    }
  }
  if (hit >= 0) {
    gameState.found.add(hit);
    gameState.score += FIND_POINTS;
    playFound();
    $('found-toast').textContent = `✓ Found: ${current.diffs[hit].label}! +${FIND_POINTS}`;
    renderPanels();
    updateHud();
    // A find also clears any lingering hint pulse on that spot.
  gameState.hintPulse = null;
  if (gameState.found.size === DIFFS_PER_SCENE) levelComplete();
  } else {
    gameState.mistakes += 1;
    gameState.score = Math.max(0, gameState.score - WRONG_COST);
    gameState.wrongFlash = { x, y, panel, until: Date.now() + 700 };
    canvas.classList.remove('shake');
    // Restart the shake animation so every miss visibly jolts the panel.
    void canvas.offsetWidth;
    canvas.classList.add('shake');
    window.setTimeout(() => canvas.classList.remove('shake'), 350);
    playWrong();
    $('found-toast').textContent = `✗ Nothing there — a heart lost (−${WRONG_COST} pts). ${MAX_MISTAKES - gameState.mistakes} hearts left.`;
    renderPanels();
    updateHud();
    if (gameState.mistakes >= MAX_MISTAKES) endGame(false, 'Out of hearts!');
  }
}

function useHint() {
  if (gameState.screen !== 'playing' || gameState.hintsLeft <= 0) return;
  const remaining = scene().diffs.map((d, i) => i).filter((i) => !gameState.found.has(i));
  if (remaining.length === 0) return;
  unlockAudio();
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  gameState.hintsLeft -= 1;
  gameState.score = Math.max(0, gameState.score - HINT_COST);
  gameState.hintPulse = { index: pick, until: Date.now() + 3000 };
  playHint();
  const hintLabel = scene().diffs[pick].label.toLowerCase().replace(/^the /, '');
  $('found-toast').textContent = `💡 Hint: look near the ${hintLabel}… (−${HINT_COST} pts)`;
  renderPanels();
  updateHud();
  window.setTimeout(() => renderPanels(), 3100);
}

function bindInput() {
  for (const panel of ['left', 'right']) {
    $(`panel-${panel}`).addEventListener('click', (event) => handlePanelClick(event, panel));
  }
  $('hint-btn').addEventListener('click', useHint);
  $('mute-btn').addEventListener('click', () => {
    unlockAudio();
    toggleMute();
    updateHud();
  });
  $('restart-btn').addEventListener('click', () => {
    if (gameState.screen === 'playing' || gameState.screen === 'gameOver') {
      startLevel(gameState.level, gameState.screen === 'gameOver');
    } else {
      showTitle();
    }
  });
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'h') useHint();
    else if (key === 'm') {
      toggleMute();
      updateHud();
    } else if (key === 'r') {
      if (gameState.screen === 'playing') startLevel(gameState.level, true);
    } else if (key === 'enter') {
      if (gameState.screen === 'title') startGame();
      else if (gameState.screen === 'levelComplete') {
        const next = $('next-btn');
        if (next) next.click();
      } else if (gameState.screen === 'gameOver' || gameState.screen === 'win') {
        const again = $('again-btn');
        if (again) again.click();
      }
    }
  });
}

// ---------- deterministic screenshot states ----------
// ?shot=start → title screen · ?shot=play → mid-play with 3 found, 4 still
// hidden · ?shot=end → level-complete screen with all 7 found.
// ?level=2 / 3 picks the scene for the play shot. Everything is fixed so
// the screenshots are reproducible.
export function applyShotParams() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const level = Math.min(SCENES.length - 1, Math.max(0, (Number(params.get('level')) || 1) - 1));
  gameState.shot = shot;
  if (shot === 'play') {
    gameState.level = level;
    gameState.screen = 'playing';
    gameState.found = new Set([0, 1, 2]);
    gameState.mistakes = 1;
    gameState.hintsLeft = 2;
    gameState.score = 300;
    gameState.timeLeft = scene().timeLimit - 42;
    hideOverlay();
    renderPanels();
    updateHud();
    $('found-toast').textContent = `✓ Found: ${scene().diffs[2].label}! +100`;
  } else if (shot === 'end') {
    gameState.level = 0;
    gameState.screen = 'levelComplete';
    gameState.found = new Set([0, 1, 2, 3, 4, 5, 6]);
    gameState.mistakes = 1;
    gameState.hintsLeft = 2;
    gameState.score = 815;
    gameState.timeLeft = 96;
    renderPanels();
    updateHud();
    levelCompleteShot();
  } else {
    showTitle();
  }
}

function levelCompleteShot() {
  stopTimer();
  gameState.screen = 'levelComplete';
  showOverlay(`
    <div class="card">
      <h1>🎉 Level complete!</h1>
      <p class="big">All ${DIFFS_PER_SCENE} differences found in ${scene().name}.</p>
      <p>Time bonus +480 · Score: <strong>815</strong></p>
      <p class="found-list">${scene().diffs.map((d) => `✓ ${d.label}`).join('<br>')}</p>
      <button class="primary">Next level →</button>
    </div>`);
  updateHud();
  renderPanels();
}

export function initGame() {
  bindInput();
  applyShotParams();
}
