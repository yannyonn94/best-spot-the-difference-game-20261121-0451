// Twin Tales — scene catalogue.
// Every scene is an original hand-drawn idea with exactly seven differences.
// A difference is a spot in panel coordinates (560 x 400) with a hit radius;
// the painter draws the change at the same spot, so a click there is always fair.
export const PANEL_W = 560;
export const PANEL_H = 400;
export const DIFFS_PER_SCENE = 7;

export const SCENES = [
  {
    id: 'coral-cove',
    name: 'Coral Cove Beach',
    subtitle: 'Level 1 · Sunny · 180 seconds',
    timeLimit: 180,
    blurb: 'A lazy afternoon on Coral Cove: sun, surf, one suspicious crab.',
    diffs: [
      { id: 'sun-shades', label: 'The sun wears sunglasses', x: 92, y: 72, r: 34 },
      { id: 'umbrella-colour', label: 'The beach umbrella changes colour', x: 150, y: 148, r: 46 },
      { id: 'crab-vanishes', label: 'The little crab disappears', x: 428, y: 332, r: 26 },
      { id: 'coconut-count', label: 'One coconut goes missing', x: 472, y: 122, r: 22 },
      { id: 'gull-count', label: 'One seagull flies away', x: 308, y: 62, r: 22 },
      { id: 'ball-stripe', label: 'The beach ball loses a stripe', x: 252, y: 302, r: 30 },
      { id: 'starfish-colour', label: 'The starfish changes colour', x: 118, y: 342, r: 24 },
    ],
  },
  {
    id: 'firefly-camp',
    name: 'Firefly Camp',
    subtitle: 'Level 2 · Forest dusk · 150 seconds',
    timeLimit: 150,
    blurb: 'Dusk in the pines: a crackling fire, a tent, and something in the trees.',
    diffs: [
      { id: 'tent-flag', label: 'A flag appears on the tent', x: 282, y: 108, r: 24 },
      { id: 'owl-vanishes', label: 'The owl leaves its branch', x: 482, y: 92, r: 26 },
      { id: 'mushroom-count', label: 'One mushroom disappears', x: 122, y: 342, r: 22 },
      { id: 'pack-colour', label: 'The backpack changes colour', x: 388, y: 322, r: 30 },
      { id: 'firefly-count', label: 'One firefly winks out', x: 198, y: 178, r: 20 },
      { id: 'marshmallow', label: 'A marshmallow stick appears', x: 322, y: 298, r: 28 },
      { id: 'moon-phase', label: 'The moon changes phase', x: 88, y: 68, r: 30 },
    ],
  },
  {
    id: 'lantern-market',
    name: 'Lantern Night Market',
    subtitle: 'Level 3 · Night market · 120 seconds',
    timeLimit: 120,
    blurb: 'Lanterns, fruit stalls and one very busy cat at the night market.',
    diffs: [
      { id: 'lantern-colour', label: 'A paper lantern changes colour', x: 148, y: 118, r: 26 },
      { id: 'cat-vanishes', label: 'The market cat slips away', x: 452, y: 332, r: 26 },
      { id: 'bulb-out', label: 'A string-light bulb goes dark', x: 302, y: 58, r: 18 },
      { id: 'apple-count', label: 'One apple goes missing', x: 198, y: 302, r: 22 },
      { id: 'vendor-hat', label: 'The vendor puts on a hat', x: 342, y: 172, r: 26 },
      { id: 'stall-poster', label: 'A poster appears on the stall', x: 482, y: 198, r: 24 },
      { id: 'awning-stripe', label: 'The awning stripes change colour', x: 252, y: 148, r: 40 },
    ],
  },
];

export function sceneById(id) {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}

export function levelName(index) {
  return SCENES[index] ? SCENES[index].name : 'Unknown';
}
