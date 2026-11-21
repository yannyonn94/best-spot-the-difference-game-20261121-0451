# Twin Tales — Spot the Difference

A complete, original spot-the-difference game that plays offline in a
desktop browser from static files. Two near-identical pictures side by
side, seven differences per scene, three hand-drawn scenes that get
harder as you go.

## Scenes

1. **Coral Cove Beach** (180 s) — sun, surf, one suspicious crab.
2. **Firefly Camp** (150 s) — dusk in the pines, a crackling fire, an owl.
3. **Lantern Night Market** (120 s) — lanterns, fruit stalls, a busy cat.

## How to play

- Click a difference on either picture to circle it in green (+100 pts).
- Wrong clicks cost a heart and 25 points; 5 hearts per level.
- `H` for a hint (−50 pts, 3 per level), `M` to mute, `R` to restart,
  `Enter` to start / continue. Finish a level before the timer runs out
  for a time bonus; clear all three scenes to win.
- All art is drawn procedurally in code and all sounds are synthesized
  with WebAudio — no images, audio files, fonts or network requests.

## Play locally

```sh
node serve.ts
# open http://localhost:8080
```

Screenshot states (deterministic): `?shot=start`, `?shot=play`
(3 differences found, 4 still hidden), `?shot=end` (level complete),
plus `&level=2` / `&level=3` to pick the scene. `&seed=1` is accepted
and ignored — the shots are fixed by design.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
