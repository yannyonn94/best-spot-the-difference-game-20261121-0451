// Twin Tales — synthesized sound effects (WebAudio, no audio files).
// Every sound is a few oscillators shaped in code, so the game stays
// fully offline and needs no media assets at all.
let audioCtx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function ensureCtx() {
  if (audioCtx) return audioCtx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  } catch {
    audioCtx = null;
  }
  return audioCtx;
}

export function unlockAudio() {
  const ctx = ensureCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}

function tone(freq, startAt, duration, type = 'sine', volume = 0.16) {
  const ctx = ensureCtx();
  if (!ctx || muted) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startAt);
    osc.stop(ctx.currentTime + startAt + duration + 0.05);
  } catch {
    // Sound is garnish: never let it break the game.
  }
}

export function playClick() {
  tone(660, 0, 0.07, 'triangle', 0.08);
}

export function playFound() {
  // A bright two-note "ding" that rewards every find.
  tone(880, 0, 0.16, 'sine', 0.18);
  tone(1318, 0.09, 0.24, 'sine', 0.16);
}

export function playWrong() {
  // A low, soft buzz for a miss — noticeable, never harsh.
  tone(160, 0, 0.22, 'sawtooth', 0.07);
  tone(110, 0.05, 0.22, 'sawtooth', 0.06);
}

export function playHint() {
  tone(1046, 0, 0.12, 'sine', 0.14);
  tone(1568, 0.1, 0.18, 'sine', 0.12);
}

export function playLevelComplete() {
  const notes = [523, 659, 784, 1046];
  notes.forEach((n, i) => tone(n, i * 0.11, 0.22, 'triangle', 0.16));
}

export function playWin() {
  const notes = [523, 659, 784, 1046, 784, 1046, 1318];
  notes.forEach((n, i) => tone(n, i * 0.13, 0.26, 'triangle', 0.16));
}

export function playGameOver() {
  const notes = [392, 330, 262, 196];
  notes.forEach((n, i) => tone(n, i * 0.16, 0.28, 'triangle', 0.12));
}
