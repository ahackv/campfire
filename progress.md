Original prompt: please integrate sounds from assets/ dir

- Inspected current audio wiring in game.js and assets inventory.
- Updated AUDIO_ASSETS to use exact files from assets/ as primary sources.
- Fixed chaos sound filename to match actual file: wait-wait-wait-what-the-hell.mp3.
- Kept compatibility alias wait-wait-what-the-hell.mp3 as fallback.
- Updated assets/README.md to reflect the real chaos filename.

TODOs / next suggestions:
- Run browser smoke test and trigger victory/chaos/fail events to verify playback in each mode.
- Decide whether to keep fallback alias support or enforce only exact filenames.

Validation:
- Ran local HTTP server and Playwright client smoke run:
  - URL: http://127.0.0.1:4173/index.html
  - Output screenshots: output/web-game/shot-0.png, output/web-game/shot-1.png
- Visually checked screenshots: app renders gameplay canvas after mode click.
- No Playwright-captured console/page errors were emitted in output/web-game.
- Syntax check: `node --check game.js` passed.

Follow-up prompt: I've moved the assets around into music/ (bg music) and sfx/ (sound effects), integrate the new paths
- Updated SFX paths to `assets/sfx/*` with legacy fallbacks.
- Added file-based background music playlist from `assets/music/*`.
- `startMusic` now prefers file tracks and falls back to synth sequencer if playback is unavailable.
- Updated assets/README.md to document the new folder structure.
