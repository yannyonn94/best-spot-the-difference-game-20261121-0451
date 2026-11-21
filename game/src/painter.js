// Twin Tales — procedural scene painter.
// Every picture is drawn from code (canvas paths only, no images, no fonts
// from the network). drawScene draws the LEFT panel when variant is 0 and
// the RIGHT panel when variant is 1: the right panel is the same drawing
// with each scene's seven differences applied on top.
import { PANEL_W, PANEL_H } from './scenes.js';

export function drawScene(ctx, sceneId, variant) {
  ctx.save();
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  if (sceneId === 'coral-cove') drawBeach(ctx, variant);
  else if (sceneId === 'firefly-camp') drawCamp(ctx, variant);
  else drawMarket(ctx, variant);
  ctx.restore();
}

// ---------- tiny drawing helpers ----------
function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}
function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}
function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}
function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}
function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}
function star(ctx, x, y, r, fill, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}
function skyGradient(ctx, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
}
function cloud(ctx, x, y, scale = 1) {
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ellipse(ctx, x, y, 34 * scale, 16 * scale, 'rgba(255,255,255,0.92)');
  ellipse(ctx, x - 22 * scale, y + 5 * scale, 22 * scale, 12 * scale, 'rgba(255,255,255,0.92)');
  ellipse(ctx, x + 24 * scale, y + 5 * scale, 24 * scale, 13 * scale, 'rgba(255,255,255,0.92)');
}
function gull(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.quadraticCurveTo(x - 5, y - 8, x, y);
  ctx.quadraticCurveTo(x + 5, y - 8, x + 12, y);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

// ---------- Scene 1: Coral Cove Beach ----------
function drawBeach(ctx, variant) {
  skyGradient(ctx, [[0, '#6ec1f5'], [0.55, '#cfeeff'], [0.58, '#2f9be8'], [1, '#f2d8a0']]);
  // sea band
  rect(ctx, 0, 208, PANEL_W, 74, '#2f9be8');
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(60 + i * 110, 224 + (i % 2) * 26, 42, 6, 0, Math.PI, 0);
    ctx.fill();
  }
  // sand
  rect(ctx, 0, 282, PANEL_W, 118, '#f2d8a0');
  ctx.fillStyle = '#e3c184';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137) % PANEL_W;
    const sy = 292 + ((i * 53) % 100);
    circle(ctx, sx, sy, 1.6, '#e3c184');
  }
  // sun (diff 1: sunglasses on the right)
  circle(ctx, 92, 72, 30, '#ffd93b');
  ctx.strokeStyle = '#f5b90d';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    line(ctx, 92 + Math.cos(a) * 36, 72 + Math.sin(a) * 36, 92 + Math.cos(a) * 46, 72 + Math.sin(a) * 46, '#f5b90d', 3);
  }
  if (variant === 1) {
    rect(ctx, 74, 62, 36, 12, '#1f2937');
    line(ctx, 74, 68, 66, 64, '#1f2937', 3);
    line(ctx, 110, 68, 118, 64, '#1f2937', 3);
    line(ctx, 92, 68, 92, 68, '#1f2937', 1);
  }
  cloud(ctx, 220, 62, 1);
  cloud(ctx, 400, 42, 0.8);
  // seagulls (diff 5: middle gull flies away on the right)
  gull(ctx, 278, 54);
  if (variant === 0) gull(ctx, 308, 62);
  gull(ctx, 342, 50);
  // A soft sand shadow grounds the palm so it does not float on the beach.
  ellipse(ctx, 484, 288, 34, 7, 'rgba(180, 140, 80, 0.5)');
  // palm tree (diff 4: one coconut missing on the right)
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(486, 286);
  ctx.quadraticCurveTo(478, 200, 470, 128);
  ctx.stroke();
  // Fronds as filled tapered leaves, not bare strokes, so the palm reads
  // as a palm even when the screenshot is shrunk to a contact sheet.
  const fronds = [[410, 96], [530, 100], [428, 140], [516, 138], [470, 84]];
  for (const [fx, fy] of fronds) {
    const mx = (470 + fx) / 2;
    const my = (128 + fy) / 2 - 10;
    poly(ctx, [[470, 128], [mx - 8, my], [fx, fy], [mx + 8, my + 4]], '#2f9e44');
  }
  circle(ctx, 460, 116, 8, '#6b4423');
  if (variant === 0) circle(ctx, 472, 122, 8, '#6b4423');
  circle(ctx, 484, 116, 8, '#6b4423');
  // umbrella (diff 2: red stripes become teal on the right)
  line(ctx, 150, 196, 150, 282, '#7c4a21', 5);
  const canopy = variant === 1 ? '#0ea5a5' : '#e63946';
  ctx.beginPath();
  ctx.arc(150, 196, 56, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = canopy;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(150, 196, 56, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = '#fff8e7';
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath();
    ctx.moveTo(150, 196);
    ctx.arc(150, 196, 56, Math.PI + (i * Math.PI) / 6, Math.PI + ((i + 1) * Math.PI) / 6);
    ctx.closePath();
    ctx.fill();
  }
  circle(ctx, 150, 196, 5, '#f5b90d');
  // striped towel
  for (let i = 0; i < 5; i++) rect(ctx, 104 + i * 20, 292, 20, 26, i % 2 ? '#fff8e7' : '#38bdf8');
  // bucket + spade
  poly(ctx, [[82, 300], [104, 300], [100, 326], [86, 326]], '#ef476f');
  rect(ctx, 78, 296, 30, 6, '#d62828');
  line(ctx, 106, 300, 122, 282, '#f59e0b', 4);
  // beach ball (diff 6: loses its yellow wedge on the right)
  circle(ctx, 252, 302, 26, '#ffffff');
  if (variant === 0) {
    ctx.beginPath(); ctx.moveTo(252, 302); ctx.arc(252, 302, 26, -Math.PI / 2, Math.PI / 6); ctx.closePath(); ctx.fillStyle = '#ffd93b'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(252, 302); ctx.arc(252, 302, 26, Math.PI / 6, Math.PI * 0.85); ctx.closePath(); ctx.fillStyle = '#e63946'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(252, 302); ctx.arc(252, 302, 26, Math.PI * 0.85, Math.PI * 1.5); ctx.closePath(); ctx.fillStyle = '#38bdf8'; ctx.fill();
  } else {
    circle(ctx, 252, 302, 26, '#7dd3fc');
    circle(ctx, 252, 302, 9, '#ffffff');
  }
  ctx.beginPath(); ctx.arc(252, 302, 26, 0, Math.PI * 2); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.stroke();
  // crab (diff 3: vanishes on the right)
  if (variant === 0) {
    ellipse(ctx, 428, 332, 16, 11, '#ff6b35');
    circle(ctx, 412, 326, 7, '#ff6b35');
    circle(ctx, 444, 326, 7, '#ff6b35');
    line(ctx, 420, 320, 416, 310, '#ff6b35', 3);
    line(ctx, 436, 320, 440, 310, '#ff6b35', 3);
    circle(ctx, 416, 308, 3, '#1f2937');
    circle(ctx, 440, 308, 3, '#1f2937');
    line(ctx, 414, 340, 402, 346, '#ff6b35', 2.5);
    line(ctx, 442, 340, 454, 346, '#ff6b35', 2.5);
  }
  // starfish (diff 7: orange becomes purple on the right)
  star(ctx, 118, 342, 18, variant === 1 ? '#a855f7' : '#fb923c');
  circle(ctx, 118, 342, 3, '#fff7ed');
}

// ---------- Scene 2: Firefly Camp ----------
function pine(ctx, x, y, s, color) {
  poly(ctx, [[x - 34 * s, y], [x + 34 * s, y], [x, y - 62 * s]], color);
  poly(ctx, [[x - 28 * s, y - 42 * s], [x + 28 * s, y - 42 * s], [x, y - 96 * s]], color);
  poly(ctx, [[x - 20 * s, y - 76 * s], [x + 20 * s, y - 76 * s], [x, y - 118 * s]], color);
  rect(ctx, x - 5 * s, y, 10 * s, 16 * s, '#6b4423');
}
function drawCamp(ctx, variant) {
  skyGradient(ctx, [[0, '#232c52'], [0.6, '#5b4a7a'], [1, '#1d3325']]);
  ctx.fillStyle = '#fef9c3';
  for (let i = 0; i < 26; i++) circle(ctx, (i * 97) % PANEL_W, (i * 61) % 190 + 8, 1.4, '#fef9c3');
  // moon (diff 7: crescent becomes full on the right)
  circle(ctx, 88, 68, 26, '#fef3c7');
  if (variant === 0) circle(ctx, 100, 62, 22, '#3a4470');
  // background pines
  pine(ctx, 40, 250, 0.9, '#1e3a2a');
  pine(ctx, 520, 250, 1, '#1e3a2a');
  pine(ctx, 90, 260, 0.7, '#24452f');
  // ground
  rect(ctx, 0, 282, PANEL_W, 118, '#2c5233');
  ellipse(ctx, 280, 380, 260, 26, '#35603c');
  // owl branch + owl (diff 2: owl leaves on the right)
  line(ctx, 440, 110, 528, 96, '#5b3a1e', 7);
  if (variant === 0) {
    ellipse(ctx, 482, 92, 16, 20, '#8d6e63');
    circle(ctx, 476, 84, 5, '#fff8e7');
    circle(ctx, 488, 84, 5, '#fff8e7');
    circle(ctx, 476, 84, 2.4, '#1f2937');
    circle(ctx, 488, 84, 2.4, '#1f2937');
    poly(ctx, [[482, 90], [478, 96], [486, 96]], '#f59e0b');
  }
  // tent (diff 1: flag appears on the right)
  poly(ctx, [[212, 306], [352, 306], [282, 168]], '#f97316');
  poly(ctx, [[258, 306], [306, 306], [282, 232]], '#7c2d12');
  line(ctx, 282, 168, 282, 138, '#78350f', 3);
  if (variant === 1) poly(ctx, [[282, 138], [306, 146], [282, 154]], '#e63946');
  // fireflies (diff 5: one winks out on the right)
  const flies = [[150, 150], [250, 140], [320, 180], [420, 160]];
  if (variant === 0) flies.push([198, 178]);
  for (const [fx, fy] of flies) {
    circle(ctx, fx, fy, 7, 'rgba(253, 230, 138, 0.35)');
    circle(ctx, fx, fy, 3, '#fde68a');
  }
  // campfire
  ellipse(ctx, 300, 344, 42, 10, '#6b7280');
  line(ctx, 282, 340, 318, 330, '#7c4a21', 6);
  line(ctx, 318, 340, 282, 330, '#7c4a21', 6);
  poly(ctx, [[292, 336], [308, 336], [300, 306]], '#f97316');
  poly(ctx, [[296, 336], [304, 336], [300, 316]], '#fde047');
  // marshmallow stick (diff 6: appears on the right)
  if (variant === 1) {
    line(ctx, 322, 298, 296, 322, '#a16207', 3);
    circle(ctx, 322, 296, 7, '#fff7ed');
    circle(ctx, 330, 290, 6, '#fff7ed');
  }
  // sitting logs
  rect(ctx, 210, 348, 56, 14, '#7c4a21');
  rect(ctx, 340, 348, 56, 14, '#7c4a21');
  // backpack (diff 4: red becomes blue on the right)
  const pack = variant === 1 ? '#2563eb' : '#dc2626';
  ctx.beginPath();
  ctx.roundRect(366, 300, 46, 44, 10);
  ctx.fillStyle = pack;
  ctx.fill();
  rect(ctx, 374, 292, 30, 12, pack);
  line(ctx, 380, 312, 398, 312, '#1f2937', 3);
  // mushrooms (diff 3: one disappears on the right)
  const shrooms = [[100, 340], [145, 338]];
  if (variant === 0) shrooms.push([122, 342]);
  for (const [mx, my] of shrooms) {
    rect(ctx, mx - 3, my - 10, 6, 12, '#fef3c7');
    ctx.beginPath();
    ctx.arc(mx, my - 10, 13, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    circle(ctx, mx - 5, my - 16, 2, '#ffffff');
    circle(ctx, mx + 5, my - 14, 2, '#ffffff');
  }
}

// ---------- Scene 3: Lantern Night Market ----------
function lantern(ctx, x, y, color) {
  ellipse(ctx, x, y, 16, 20, color);
  rect(ctx, x - 6, y - 24, 12, 5, '#f59e0b');
  rect(ctx, x - 6, y + 19, 12, 5, '#f59e0b');
  line(ctx, x, y - 24, x, y - 30, '#78350f', 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ellipse(ctx, x - 5, y - 6, 4, 8, 'rgba(255,255,255,0.35)');
}
function drawMarket(ctx, variant) {
  skyGradient(ctx, [[0, '#101736'], [0.6, '#1e2a52'], [1, '#3b2f4a']]);
  ctx.fillStyle = '#fef9c3';
  for (let i = 0; i < 22; i++) circle(ctx, (i * 113) % PANEL_W, (i * 47) % 120 + 6, 1.3, '#fef9c3');
  // string lights
  ctx.beginPath();
  ctx.moveTo(20, 30);
  ctx.quadraticCurveTo(280, 84, 540, 30);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.stroke();
  const bulbColors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#f472b6'];
  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    const bx = 20 + t * 520;
    const by = 30 + Math.sin(t * Math.PI) * 26 + 8;
    line(ctx, bx, by - 6, bx, by + 2, '#0f172a', 2);
    // diff 3: the bulb at (302, 58) is dark on the right
    const dark = variant === 1 && i === 5;
    circle(ctx, bx, by + 6, 6, dark ? '#475569' : bulbColors[i % bulbColors.length]);
    if (!dark) circle(ctx, bx, by + 6, 9, 'rgba(253, 230, 138, 0.18)');
  }
  // ground
  rect(ctx, 0, 344, PANEL_W, 56, '#4a3b52');
  ctx.fillStyle = '#5b4a63';
  for (let i = 0; i < 8; i++) rect(ctx, (i * 73) % PANEL_W, 360 + (i % 3) * 12, 34, 4, '#5b4a63');
  // left stall with awning (diff 7: awning stripes change on the right)
  rect(ctx, 170, 190, 165, 158, '#8a5a2b');
  rect(ctx, 170, 190, 165, 10, '#6b4423');
  const awnA = variant === 1 ? '#16a34a' : '#dc2626';
  for (let i = 0; i < 6; i++) rect(ctx, 160 + i * 31, 148, 31, 42, i % 2 ? '#fff8e7' : awnA);
  rect(ctx, 160, 186, 186, 6, '#78350f');
  // fruit crates on the counter
  rect(ctx, 178, 296, 66, 22, '#b45309');
  rect(ctx, 178, 296, 66, 4, '#92400e');
  const apples = [[180, 292], [216, 292], [189, 280], [207, 280]];
  if (variant === 0) apples.push([198, 300]);
  for (const [ax, ay] of apples) {
    circle(ctx, ax, ay, 9, '#ef4444');
    line(ctx, ax, ay - 9, ax + 3, ay - 13, '#166534', 2);
  }
  rect(ctx, 252, 300, 56, 18, '#92400e');
  circle(ctx, 266, 296, 8, '#f59e0b');
  circle(ctx, 284, 296, 8, '#f59e0b');
  circle(ctx, 300, 296, 8, '#f59e0b');
  // vendor behind the counter (diff 5: straw hat appears on the right)
  circle(ctx, 342, 200, 16, '#f2c89b');
  poly(ctx, [[318, 296], [366, 296], [358, 224], [326, 224]], '#0e7490');
  rect(ctx, 326, 224, 32, 10, '#fff8e7');
  if (variant === 1) {
    ellipse(ctx, 342, 182, 26, 7, '#f59e0b');
    ellipse(ctx, 342, 176, 14, 8, '#fbbf24');
  }
  // lanterns (diff 1: the first lantern turns green on the right)
  lantern(ctx, 148, 118, variant === 1 ? '#22c55e' : '#ef4444');
  lantern(ctx, 210, 110, '#f59e0b');
  lantern(ctx, 420, 115, '#f97316');
  // right stall
  rect(ctx, 400, 190, 132, 158, '#6d4c2f');
  rect(ctx, 400, 190, 132, 10, '#4a3520');
  for (let i = 0; i < 5; i++) rect(ctx, 400 + i * 27, 148, 27, 42, i % 2 ? '#fde68a' : '#7c3aed');
  rect(ctx, 400, 186, 132, 6, '#3b2f4a');
  // poster (diff 6: appears on the right stall on the right)
  if (variant === 1) {
    rect(ctx, 466, 176, 34, 44, '#fff8e7');
    circle(ctx, 483, 192, 8, '#dc2626');
    rect(ctx, 472, 204, 22, 3, '#334155');
    rect(ctx, 472, 210, 22, 3, '#334155');
  }
  // goods on right stall counter
  circle(ctx, 420, 330, 10, '#34d399');
  circle(ctx, 444, 330, 10, '#60a5fa');
  circle(ctx, 468, 330, 10, '#f472b6');
  // market cat (diff 2: slips away on the right)
  if (variant === 0) {
    ellipse(ctx, 452, 336, 18, 12, '#9ca3af');
    circle(ctx, 436, 322, 10, '#9ca3af');
    poly(ctx, [[428, 314], [432, 304], [436, 314]], '#9ca3af');
    poly(ctx, [[440, 314], [444, 304], [446, 314]], '#9ca3af');
    line(ctx, 468, 340, 486, 330, '#9ca3af', 5);
    circle(ctx, 433, 321, 1.6, '#1f2937');
  }
  // crate the cat sits on
  rect(ctx, 430, 344, 46, 14, '#7c4a21');
}
