// Twin Tales — entry point. Sizes the two panel canvases to the scene's
// panel resolution, then hands control to the game state machine.
import { PANEL_W, PANEL_H } from './scenes.js';
import { initGame } from './game.js';

const left = document.getElementById('panel-left');
const right = document.getElementById('panel-right');
for (const canvas of [left, right]) {
  canvas.width = PANEL_W;
  canvas.height = PANEL_H;
}

initGame();
