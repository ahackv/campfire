# Audio asset pack

Place files in these folders:

- `assets/music/`
  - `mii-channel-music.mp3` — background music track.
  - `the-entertainer-fuk.mp3` — background music track.
- `assets/sfx/`
  - `nothing-beats-a-jet2-holiday.mp3` — victory / theme trigger.
  - `wait-wait-wait-what-the-hell.mp3` — chaos / surprise trigger.
  - `spongebob-fail.mp3` — fail / game-over trigger.

Legacy fallback names are still supported in code for compatibility:

- `assets/wait-wait-what-the-hell.mp3`
- `assets/wait-wait-wait-what-the-hell.mp3`
- `assets/nothing-beats-a-jet2-holiday.mp3`
- `assets/spongebob-fail.mp3`

## Trigger mapping in game

- Victory moments (winning races/duels) play the victory sound.
- Chaos moments (meme phrase + funny numbers) play chaos sound.
- Fail moments (HP zero / losing conditions) play fail sound.
- Sea Music uses tracks from `assets/music/` and falls back to synth sequencing if file playback is unavailable.
