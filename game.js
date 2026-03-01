const MODES = [
  { id: "ocean", title: "🌊 Into the Deep", summary: "Dive race with hazards, pearls, and dash timing." },
  { id: "emotion", title: "😃 Emotion Mask", summary: "Balance visible calm against hidden pressure." },
  { id: "dig", title: "⛏️ Beneath the Dirt", summary: "Dig layers, collect relics, and surface truths." },
  { id: "mirror", title: "🪞 Mirror World", summary: "Move in dual worlds and avoid hidden traps." },
  { id: "trident", title: "🔱 Trident Duel", summary: "Turn-based physics throws with wind, blood splashes, and death animations." },
  { id: "text", title: "💬 Read Between the Lines", summary: "Text-only chat where your replies decide if your friend opens up." },
  { id: "up", title: "🪜 Ocean Only Up", summary: "Vertical ocean platform climb with jumps, boosts, and pearl combos." },
];

const el = {
  cards: document.getElementById("cards"),
  menu: document.getElementById("menu"),
  gameView: document.getElementById("gameView"),
  backBtn: document.getElementById("backBtn"),
  musicBtn: document.getElementById("musicBtn"),
  fullBtn: document.getElementById("fullBtn"),
  modeTitle: document.getElementById("modeTitle"),
  summary: document.getElementById("summary"),
  stats: document.getElementById("stats"),
  controls: document.getElementById("controls"),
  status: document.getElementById("status"),
  canvas: document.getElementById("gameCanvas"),
  chat: document.getElementById("chat"),
  composer: document.getElementById("composer"),
  msgInput: document.getElementById("msgInput"),
  botFace: document.getElementById("botFace"),
  botMood: document.getElementById("botMood"),
};

const ctx = el.canvas.getContext("2d");
const faceCtx = el.botFace.getContext("2d");
const keys = new Set();

let audioCtx = null;
let musicOn = false;
let memeSequencerTimer = null;
let memeLoopIndex = 0;
let currentTrack = null;
let currentStep = 0;
let nextStepTime = 0;
let musicMasterGain = null;
let transitionTimer = null;

const MEME_TRIGGERS = [
  { key: "jet 2 holiday", label: "Jet 2 Holiday", tones: [523.25, 659.25, 783.99] },
  { key: "wait wait wait", label: "Wait Wait Wait", tones: [349.23, 349.23, 293.66, 261.63] },
  { key: "wide putin", label: "Wide Putin", tones: [246.94, 293.66, 369.99] },
  { key: "pongbib fail", label: "Pongbib Fail", tones: [392, 329.63, 261.63] },
  { key: "ponqbib fail", label: "Pongbib Fail", tones: [392, 329.63, 261.63] },
  { key: "plh", label: "PLH", tones: [440, 554.37, 440, 659.25] },
  { key: "1,000,000,000 iq", label: "1,000,000,000 IQ", tones: [261.63, 329.63, 392, 523.25, 783.99] },
  { key: "1000000000 iq", label: "1,000,000,000 IQ", tones: [261.63, 329.63, 392, 523.25, 783.99] },
];

const SEA_MUSIC_PLAYLIST = [
  { label: "Coral Drift", tones: [261.63, 293.66, 349.23, 392.0, 440.0] },
  { label: "Moon Tide", tones: [220.0, 246.94, 293.66, 329.63, 392.0] },
  { label: "Reef Glow", tones: [196.0, 246.94, 311.13, 392.0, 493.88] },
  { label: "Bubble Rush", tones: [293.66, 349.23, 392.0, 440.0, 523.25] },
  { label: "Deep Current", tones: [174.61, 220.0, 261.63, 329.63, 392.0] },
];

const FUNNY_NUMBERS = {
  67: "six seven",
  69: "nice",
  420: "blaze",
  666: "chaos",
  777: "lucky",
  1337: "leet",
  1000000000: "1,000,000,000 IQ",
};
const seenFunnyNumbers = new Set();
const AUDIO_ASSETS = {
  victory: ["./assets/nothing-beats-a-jet2-holiday.mp3", "./assets/victory-theme.mp3"],
  chaos: ["./assets/wait-wait-what-the-hell.mp3", "./assets/chaos-sfx.mp3"],
  fail: ["./assets/spongebob-fail.mp3", "./assets/fail-sfx.mp3"],
};
const sfxCache = {};
let sfxEnabled = true;

function createSfx(candidates = []) {
  for (const src of candidates) {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = 0.7;
    audio.addEventListener("error", () => {}, { once: true });
    if (typeof audio.load === "function") audio.load();
    return audio;
  }
  return null;
}

function playSfx(name) {
  if (!sfxEnabled) return;
  if (!sfxCache[name]) sfxCache[name] = createSfx(AUDIO_ASSETS[name] || []);
  const sound = sfxCache[name];
  if (!sound) return;
  try {
    sound.currentTime = 0;
    const p = sound.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch (_err) {
    // ignore browser autoplay / decode errors
  }
}

function markEventOnce(key, soundName) {
  if (state.firedEvents.has(key)) return false;
  state.firedEvents.add(key);
  playSfx(soundName);
  return true;
}

function ensureAudioCtx() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
    musicMasterGain = audioCtx.createGain();
    musicMasterGain.gain.value = 0.22;
    musicMasterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

function playToneAt(freq, startAt, duration = 0.18, type = "triangle", volume = 0.03) {
  if (!freq || freq <= 0) return;
  const ctxA = ensureAudioCtx();
  if (!ctxA) return;
  const osc = ctxA.createOscillator();
  const gain = ctxA.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain);
  gain.connect(musicMasterGain || ctxA.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

function playTone(freq, duration = 0.18, type = "triangle", volume = 0.03) {
  const ctxA = ensureAudioCtx();
  if (!ctxA) return;
  playToneAt(freq, ctxA.currentTime, duration, type, volume);
}

function buildTrack(tones) {
  const safeTones = tones.length ? tones : [261.63, 329.63, 392];
  const lead = [];
  const bass = [];
  const pad = [];
  const pulse = [];
  for (let step = 0; step < 64; step++) {
    lead.push(step % 2 === 0 ? safeTones[(step / 2) % safeTones.length] : 0);
    bass.push(step % 4 === 0 ? safeTones[(Math.floor(step / 4)) % safeTones.length] / 2 : 0);
    pad.push(step % 8 === 0 ? safeTones[(Math.floor(step / 8)) % safeTones.length] : 0);
    pulse.push(step % 2 === 1 ? safeTones[(Math.floor(step / 2)) % safeTones.length] * 0.5 : 0);
  }
  return {
    baseStepDuration: 0.28,
    minStepDuration: 0.12,
    steps: 64,
    lead,
    bass,
    pad,
    pulse,
  };
}

function getMusicEnergy() {
  if (!state || !state.mode) return 0;
  if (state.mode === "ocean") return Math.min(1, Math.max(state.ocean.depth, state.ocean.botDepth) / 500);
  if (state.mode === "emotion") return Math.min(1, Math.max(state.emotion.hidden, state.emotion.botHidden) / 100);
  if (state.mode === "dig") return Math.min(1, Math.max(state.dig.layer, state.dig.botLayer) / (state.dig.finds.length - 1));
  if (state.mode === "mirror") return Math.min(1, Math.max(state.mirror.x, state.mirror.botX) / state.mirror.goal);
  if (state.mode === "trident") return Math.min(1, (6 - (state.trident.youHP + state.trident.botHP)) / 6);
  if (state.mode === "text") return Math.min(1, state.text.round / 5);
  if (state.mode === "up") return Math.min(1, state.up.bestHeight / 1800);
  return 0;
}

function getAdaptiveStepDuration() {
  const energy = getMusicEnergy();
  const span = currentTrack.baseStepDuration - currentTrack.minStepDuration;
  return Math.max(currentTrack.minStepDuration, currentTrack.baseStepDuration - span * energy);
}

function setCurrentTrack(index) {
  const track = SEA_MUSIC_PLAYLIST[index % SEA_MUSIC_PLAYLIST.length];
  currentTrack = buildTrack(track.tones);
  currentStep = 0;
  nextStepTime = ensureAudioCtx().currentTime + 0.05;
  el.botMood.textContent = `Now playing: ${track.label} | tempo ${Math.round((1 - getAdaptiveStepDuration() / currentTrack.baseStepDuration) * 100)}%`;
}

function scheduleStep() {
  if (!currentTrack) return;
  const step = currentStep % currentTrack.steps;
  const t = nextStepTime;
  const stepDuration = getAdaptiveStepDuration();
  const leadNote = currentTrack.lead[step];
  const bassNote = currentTrack.bass[step];
  const padNote = currentTrack.pad[step];
  const pulseNote = currentTrack.pulse[step];

  if (leadNote) playToneAt(leadNote, t, stepDuration * 0.9, "triangle", 0.03);
  if (bassNote) playToneAt(bassNote, t, stepDuration * 0.86, "sine", 0.05);
  if (padNote) {
    playToneAt(padNote, t, stepDuration * 2.6, "sine", 0.015);
    playToneAt(padNote * 1.5, t, stepDuration * 2.2, "sine", 0.01);
  }
  if (pulseNote && getMusicEnergy() > 0.35) playToneAt(pulseNote, t, stepDuration * 0.38, "square", 0.014);

  currentStep += 1;
  nextStepTime += stepDuration;

  if (currentStep >= currentTrack.steps) {
    memeLoopIndex = (memeLoopIndex + 1) % SEA_MUSIC_PLAYLIST.length;
    setCurrentTrack(memeLoopIndex);
  }
}

function runSequencer() {
  const ctxA = ensureAudioCtx();
  if (!ctxA || !musicOn || !currentTrack) return;
  while (nextStepTime < ctxA.currentTime + 0.22) scheduleStep();
}

function startMusic() {
  if (musicOn) return;
  const ctxA = ensureAudioCtx();
  if (!ctxA) return;
  if (ctxA.state === "suspended") ctxA.resume();

  musicOn = true;
  el.musicBtn.textContent = "🎵 Sea Music: On";

  setCurrentTrack(memeLoopIndex);
  memeSequencerTimer = setInterval(runSequencer, 50);
}

function stopMusic() {
  musicOn = false;
  el.musicBtn.textContent = "🎵 Sea Music: Off";
  if (memeSequencerTimer) clearInterval(memeSequencerTimer);
  memeSequencerTimer = null;
}

function toggleMusic() {
  if (musicOn) stopMusic();
  else startMusic();
}

function unlockAudioAndMaybeStart() {
  const ctxA = ensureAudioCtx();
  if (!ctxA) return;
  if (ctxA.state === "suspended") ctxA.resume();
  if (state.running && !musicOn) startMusic();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function playMemeJingle(tones) {
  const ctxA = ensureAudioCtx();
  if (!ctxA) return;
  tones.forEach((tone, i) => {
    playToneAt(tone, ctxA.currentTime + i * 0.11, 0.14, "square", 0.026);
  });
}

function checkMemeMessage(msg) {
  const lower = msg.toLowerCase();
  const trigger = MEME_TRIGGERS.find((m) => lower.includes(m.key));
  if (!trigger) return false;
  playMemeJingle(trigger.tones);
  playSfx("chaos");
  setTimeout(() => addBubble(`Meme unlocked: ${trigger.label} 😂`), 80);
  return true;
}

function checkFunnyNumbers(values = []) {
  values.forEach((value) => {
    const rounded = Math.floor(value);
    if (!FUNNY_NUMBERS[rounded] || seenFunnyNumbers.has(rounded)) return;
    seenFunnyNumbers.add(rounded);
    playMemeJingle([493.88, 659.25, 783.99, 659.25]);
    playSfx("chaos");
    addBubble(`Funny number ${rounded} hit: ${FUNNY_NUMBERS[rounded]} 😎`);
  });
}


const state = {
  mode: null,
  running: false,
  trust: 0,
  firedEvents: new Set(),
  ocean: { x: 370, y: 160, depth: 0, botDepth: 0, hp: 4, pearls: 0, dash: 0, hitCooldown: 0, enemies: [], pearlsMap: [] },
  emotion: { mask: 50, hidden: 20, botMask: 52, botHidden: 18, calm: 3, journal: 2 },
  dig: { layer: 0, botLayer: 0, truths: 0, boost: 0, finds: ["soil", "coins", "bones", "locket", "letter", "fear", "truth"], relics: 0 },
  mirror: { x: 70, mirrorX: 70, botX: 75, goal: 700, phase: 2, phaseTimer: 0, traps: [220, 340, 510], mirrorNoise: 0 },
  trident: {
    youHP: 3,
    botHP: 3,
    turn: "you",
    dragging: false,
    dragX: 95,
    dragY: 240,
    projectile: null,
    wind: 0,
    cooldown: 0,
    blood: [],
    deathAnim: null,
  },
  text: {
    round: 0,
    openness: 0,
    over: false,
    lastHint: "",
  },
  up: {
    x: 380,
    y: 260,
    vx: 0,
    vy: 0,
    cameraY: 0,
    bestHeight: 0,
    pearls: 0,
    combo: 0,
    maxCombo: 0,
    boosts: 2,
    over: false,
    platforms: [],
    pearlsMap: [],
  },
  transition: {
    active: false,
    modeId: null,
    startedAt: 0,
  },
};

let mouthOpen = false;
function drawFace() {
  faceCtx.clearRect(0, 0, 32, 32);
  for (let y = 2; y < 30; y++) for (let x = 2; x < 30; x++) { faceCtx.fillStyle = "#2b2241"; faceCtx.fillRect(x, y, 1, 1); }
  for (let y = 7; y < 26; y++) for (let x = 7; x < 26; x++) { faceCtx.fillStyle = "#f4d4be"; faceCtx.fillRect(x, y, 1, 1); }
  faceCtx.fillStyle = "#181421"; faceCtx.fillRect(11, 14, 2, 2); faceCtx.fillRect(19, 14, 2, 2);
  faceCtx.fillStyle = "#7a3042"; if (mouthOpen) faceCtx.fillRect(13, 22, 6, 2); else faceCtx.fillRect(13, 22, 6, 1);
  faceCtx.fillStyle = "#a286d1";
  for (let i = 0; i < 32; i++) { faceCtx.fillRect(i, 0, 1, 1); faceCtx.fillRect(i, 31, 1, 1); faceCtx.fillRect(0, i, 1, 1); faceCtx.fillRect(31, i, 1, 1); }
}
function animateFace(text) {
  el.botMood.textContent = `Bot: ${text}`;
  let n = 0;
  const timer = setInterval(() => {
    mouthOpen = !mouthOpen;
    drawFace();
    n += 1;
    if (n > Math.max(7, Math.floor(text.length / 3))) {
      clearInterval(timer);
      mouthOpen = false;
      drawFace();
    }
  }, 85);
}
function addBubble(text, who = "bot") {
  const b = document.createElement("article");
  b.className = `bubble ${who}`;
  b.textContent = text;
  el.chat.appendChild(b);
  el.chat.scrollTop = el.chat.scrollHeight;
  if (who === "bot") animateFace(text);
}

function classifyMessage(msg) {
  const t = msg.toLowerCase();
  const good = ["you okay", "i'm here", "talk", "listen", "care", "support", "how are", "got you", "we can do this"];
  const bad = ["whatever", "dramatic", "stop", "don't care", "overreact", "shut up"];
  let s = 0;
  good.forEach((w) => { if (t.includes(w)) s += 2; });
  bad.forEach((w) => { if (t.includes(w)) s -= 2; });
  if (t.includes("?")) s += 1;
  if (s >= 2) return "supportive";
  if (s <= -1) return "harsh";
  return "neutral";
}
function botReply(msg) {
  const tone = classifyMessage(msg);
  if (tone === "supportive") { state.trust += 1; return "Nice read. Team trust up."; }
  if (tone === "harsh") { state.trust -= 1; return "Ouch. Hidden mood got worse."; }
  return "Steady message. Safe but not deep.";
}

function stat(label, value) {
  const d = document.createElement("div");
  d.className = "stat";
  d.textContent = `${label}: ${value}`;
  return d;
}

function drawThumb(canvas, seed) {
  const c = canvas.getContext("2d");
  const bg = ["#1aa8d8", "#1888c9", "#2568b5", "#3b63cf", "#2b93bf"][seed % 5];
  c.fillStyle = bg;
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = "rgba(255,255,255,0.18)";
  for (let y = 8; y < 52; y += 12) c.fillRect(0, y + Math.sin(y + seed) * 2, canvas.width, 2);
  for (let i = 0; i < 70; i++) {
    c.fillStyle = i % 2 ? "rgba(255,170,210,0.45)" : "rgba(112,255,240,0.45)";
    c.fillRect((i * 19) % canvas.width, 56 + (i % 15), 5, 3);
  }
  c.fillStyle = "#ffe17d";
  c.beginPath();
  c.ellipse(22, 28, 11, 7, 0, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.moveTo(11, 28);
  c.lineTo(3, 23);
  c.lineTo(3, 33);
  c.closePath();
  c.fill();
  c.fillStyle = "#133049";
  c.fillRect(26, 26, 2, 2);
  c.fillStyle = "#88f1ff";
  c.fillRect(130, 16, 32, 32);
  c.fillStyle = "#f0ff9c";
  c.fillRect(140, 26, 4, 4);
}

function makeCards() {
  el.cards.innerHTML = "";
  MODES.forEach((m, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<canvas class="thumb" width="180" height="90"></canvas><span class="badge">Top Pick ${i + 1}</span><h3>${m.title}</h3><p>${m.summary}</p><button>Play</button>`;
    drawThumb(card.querySelector("canvas"), i);
    card.querySelector("button").addEventListener("click", () => startMode(m.id));
    el.cards.appendChild(card);
  });
}

function clearGameUI() {
  el.stats.innerHTML = "";
  el.controls.innerHTML = "";
  el.status.innerHTML = "";
  el.chat.innerHTML = "";
}

function spawnOceanEntities() {
  state.ocean.enemies = [];
  state.ocean.pearlsMap = [];
  for (let i = 0; i < 8; i++) state.ocean.enemies.push({ x: Math.random() * 730 + 10, y: Math.random() * 320 + 8, vx: (Math.random() - 0.5) * 2.4 });
  for (let i = 0; i < 8; i++) state.ocean.pearlsMap.push({ x: Math.random() * 720 + 20, y: Math.random() * 300 + 20, taken: false });
}


function createOnlyUpPlatforms() {
  const platforms = [];
  let y = 300;
  for (let i = 0; i < 70; i++) {
    const width = 70 + Math.random() * 90;
    const x = 20 + Math.random() * (740 - width);
    platforms.push({ x, y, w: width, h: 12, bob: Math.random() * Math.PI * 2, moving: i % 5 === 0, vx: (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.6) });
    y -= 42 + Math.random() * 28;
  }
  return platforms;
}

function createOnlyUpPearls(platforms) {
  return platforms.filter((_, i) => i % 3 === 1).map((p, i) => ({ x: p.x + p.w * 0.5, y: p.y - 14, r: 5 + (i % 2), taken: false }));
}

function setupMode(id) {
  clearGameUI();
  state.mode = id;
  state.running = true;
  seenFunnyNumbers.clear();
  state.firedEvents.clear();
  const m = MODES.find((x) => x.id === id);
  el.modeTitle.textContent = m.title;
  el.summary.textContent = m.summary;

  if (id === "ocean") {
    state.ocean = { x: 370, y: 160, depth: 0, botDepth: 0, hp: 4, pearls: 0, dash: 0, hitCooldown: 0, enemies: [], pearlsMap: [] };
    spawnOceanEntities();
    el.controls.innerHTML = '<button id="dashBtn">Dash Burst</button><span class="stat">Move: arrows / WASD</span>';
    document.getElementById("dashBtn").onclick = () => { if (state.ocean.dash <= 0) state.ocean.dash = 80; };
    addBubble("Race me to depth 500, collect pearls, and dodge shadow fish.");
  }
  if (id === "emotion") {
    state.emotion = { mask: 50, hidden: 20, botMask: 52, botHidden: 18, calm: 3, journal: 2 };
    el.controls.innerHTML = '<button id="maskBtn">Mask +</button><button id="breatheBtn">Breathe</button><button id="journalBtn">Journal</button>';
    document.getElementById("maskBtn").onclick = () => { state.emotion.mask = Math.min(100, state.emotion.mask + 8); state.emotion.hidden = Math.min(100, state.emotion.hidden + 6); };
    document.getElementById("breatheBtn").onclick = () => { if (state.emotion.calm > 0) { state.emotion.calm -= 1; state.emotion.hidden = Math.max(0, state.emotion.hidden - 12); } };
    document.getElementById("journalBtn").onclick = () => { if (state.emotion.journal > 0) { state.emotion.journal -= 1; state.emotion.hidden = Math.max(0, state.emotion.hidden - 18); state.trust += 1; } };
    addBubble("Keep the mask stable, but don't ignore hidden pressure.");
  }
  if (id === "dig") {
    state.dig = { layer: 0, botLayer: 0, truths: 0, boost: 0, finds: ["soil", "coins", "bones", "locket", "letter", "fear", "truth"], relics: 0 };
    el.controls.innerHTML = '<button id="digBtn">Dig</button><button id="truthBtn">Truth</button><button id="boostBtn">Drill Boost</button>';
    document.getElementById("digBtn").onclick = () => {
      const step = state.dig.boost > 0 ? 2 : 1;
      state.dig.layer = Math.min(state.dig.finds.length - 1, state.dig.layer + step);
      state.dig.relics += step;
      addBubble(`Found: ${state.dig.finds[state.dig.layer]}`, "you");
    };
    document.getElementById("truthBtn").onclick = () => { state.dig.truths = Math.min(4, state.dig.truths + 1); state.trust += 1; };
    document.getElementById("boostBtn").onclick = () => { state.dig.boost = 220; };
    addBubble("Dig race started. Chain relic finds before the bot does.");
  }
  if (id === "mirror") {
    state.mirror = { x: 70, mirrorX: 70, botX: 75, goal: 700, phase: 2, phaseTimer: 0, traps: [220, 340, 510], mirrorNoise: 0 };
    el.controls.innerHTML = '<button id="phaseBtn">Phase Shift</button><span class="stat">Move: arrows / WASD</span>';
    document.getElementById("phaseBtn").onclick = () => { if (state.mirror.phase > 0) { state.mirror.phase -= 1; state.mirror.phaseTimer = 140; } };
    addBubble("Watch both worlds. Phase Shift lets you ghost through traps briefly.");
  }
  if (id === "trident") {
    state.trident = { youHP: 3, botHP: 3, turn: "you", dragging: false, dragX: 95, dragY: 240, projectile: null, wind: (Math.random() - 0.5) * 0.12, cooldown: 0, blood: [], deathAnim: null };
    el.controls.innerHTML = '<span class="stat">Your turn: click near your diver, pull back, release to throw.</span>';
    addBubble("Turn duel started. Drag with your mouse to aim and set power.");
  }
  if (id === "text") {
    state.text = { round: 0, openness: 0, over: false, lastHint: "Small pauses can mean a lot." };
    el.controls.innerHTML = '<button id="gentleBtn">Gentle check-in</button><button id="lightBtn">Light joke</button><button id="directBtn">Be direct</button>';
    document.getElementById("gentleBtn").onclick = () => { el.msgInput.value = "Hey, I am here if you want to talk."; el.msgInput.focus(); };
    document.getElementById("lightBtn").onclick = () => { el.msgInput.value = "We can chill and talk if you want."; el.msgInput.focus(); };
    document.getElementById("directBtn").onclick = () => { el.msgInput.value = "You said you're fine but it sounds heavy. Want to share?"; el.msgInput.focus(); };
    addBubble("Text game back online. Type anything and read between the lines.");
    addBubble("Friend: i'm fine, just tired i guess");
  }
  if (id === "up") {
    const platforms = createOnlyUpPlatforms();
    state.up = {
      x: 380,
      y: 260,
      vx: 0,
      vy: 0,
      cameraY: 0,
      bestHeight: 0,
      pearls: 0,
      combo: 0,
      maxCombo: 0,
      boosts: 2,
      over: false,
      platforms,
      pearlsMap: createOnlyUpPearls(platforms),
    };
    el.controls.innerHTML = '<button id="upBoostBtn">Bubble Boost</button><span class="stat">Move: A/D or ←/→, Jump: W/↑/Space</span>';
    document.getElementById("upBoostBtn").onclick = () => {
      if (state.up.boosts > 0 && !state.up.over) {
        state.up.boosts -= 1;
        state.up.vy = -11.8;
        state.up.combo += 1;
        state.up.maxCombo = Math.max(state.up.maxCombo, state.up.combo);
      }
    };
    addBubble("Only Up starts now — climb the reef towers and chain pearl combos!");
  }
}


function drawModeTransition() {
  const tr = state.transition;
  if (!tr.active) return;
  const elapsed = Date.now() - tr.startedAt;
  const pulse = 1 + Math.sin(elapsed * 0.008) * 0.04;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 760, 340);

  // face circle
  ctx.save();
  ctx.translate(380, 170);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = "#ffe066";
  ctx.strokeStyle = "#1f2d3d";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 118, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // left eye chessboard
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      ctx.fillStyle = (i + j) % 2 === 0 ? "#111" : "#fff";
      ctx.fillRect(-62 + j * 10, -40 + i * 10, 10, 10);
      ctx.strokeStyle = "#222";
      ctx.strokeRect(-62 + j * 10, -40 + i * 10, 10, 10);
    }
  }

  // right eye nested squares
  const eyeColors = ["#ff4d4d", "#44c060", "#ffdf4d", "#8b5a2b", "#111"];
  const eyeSizes = [34, 26, 18, 12, 6];
  eyeSizes.forEach((sz, idx) => {
    ctx.fillStyle = eyeColors[idx];
    ctx.fillRect(34 - sz / 2, -34 - sz / 2, sz, sz);
  });

  // nose star
  ctx.fillStyle = "#2389ff";
  ctx.strokeStyle = "#ff2a2a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a1 = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const a2 = a1 + Math.PI / 5;
    const r1 = 23;
    const r2 = 10;
    const x1 = Math.cos(a1) * r1;
    const y1 = Math.sin(a1) * r1 + 5;
    const x2 = Math.cos(a2) * r2;
    const y2 = Math.sin(a2) * r2 + 5;
    if (i === 0) ctx.moveTo(x1, y1);
    else ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // mouth rainbow arc + cheeks
  const mouthColors = ["#ffd93d", "#ff4d6d", "#a56bff", "#3fa9ff"];
  mouthColors.forEach((c, i) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 20, 42 + i * 2, 0.2, Math.PI - 0.2);
    ctx.stroke();
  });
  ctx.fillStyle = "#ff4b5c";
  ctx.beginPath(); ctx.arc(-65, 20, 10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(65, 20, 10, 0, Math.PI * 2); ctx.fill();

  // hair shapes
  ctx.strokeStyle = "#2a8f2a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-42, -108); ctx.lineTo(-70, -138); ctx.lineTo(-14, -138); ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6;
    const x = 44 + Math.cos(a) * 20;
    const y = -128 + Math.sin(a) * 20;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.restore();

  const mode = MODES.find((m) => m.id === tr.modeId);
  ctx.fillStyle = "#123d73";
  ctx.font = "bold 28px Inter, system-ui";
  ctx.fillText("Diving into next game...", 220, 300);
  ctx.font = "18px Inter, system-ui";
  ctx.fillText(mode ? mode.title : "Next mode", 305, 326);
}

function beginModeTransition(id) {
  state.transition.active = true;
  state.transition.modeId = id;
  state.transition.startedAt = Date.now();
  state.running = false;
  if (transitionTimer) clearTimeout(transitionTimer);
  transitionTimer = setTimeout(() => {
    state.transition.active = false;
    setupMode(id);
    state.running = true;
    startMusic();
  }, 1600);
}

function startMode(id) {
  el.menu.classList.add("hidden");
  el.gameView.classList.remove("hidden");
  beginModeTransition(id);
}
function showMenu() {
  state.running = false;
  state.mode = null;
  state.transition.active = false;
  if (transitionTimer) clearTimeout(transitionTimer);
  transitionTimer = null;
  stopMusic();
  el.menu.classList.remove("hidden");
  el.gameView.classList.add("hidden");
}

function tryThrowTrident(releaseX, releaseY) {
  const t = state.trident;
  if (state.mode !== "trident" || t.projectile || t.turn !== "you" || t.youHP <= 0 || t.botHP <= 0) return;

  const anchorX = 95;
  const anchorY = 240;
  const pullX = anchorX - releaseX;
  const pullY = anchorY - releaseY;
  const power = Math.min(30, Math.hypot(pullX, pullY) * 0.22);
  if (power < 2.5) return;

  t.projectile = {
    x: anchorX,
    y: anchorY,
    vx: pullX * 0.08,
    vy: pullY * 0.08,
    owner: "you",
    trail: [],
  };
  t.turn = "bot";
  t.dragging = false;
  addBubble(`You throw with power ${power.toFixed(1)}.`, "you");
}

function botThrow() {
  const t = state.trident;
  if (t.projectile || t.turn !== "bot" || t.youHP <= 0 || t.botHP <= 0 || t.cooldown > 0) return;
  const baseAngle = 180 - (34 + Math.random() * 20);
  const rad = (baseAngle * Math.PI) / 180;
  const power = 12 + Math.random() * 10;
  t.projectile = { x: 665, y: 240, vx: Math.cos(rad) * power * 0.55, vy: -Math.sin(rad) * power * 0.55, owner: "bot", trail: [] };
  t.turn = "you";
  t.cooldown = 55;
  addBubble("Bot throws a trident.");
}

function spawnBlood(x, y, amount = 18) {
  const arr = state.trident.blood;
  for (let i = 0; i < amount; i++) {
    arr.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3 - 0.4, life: 45 + Math.random() * 40, r: 1 + Math.random() * 2.5 });
  }
}

el.backBtn.addEventListener("click", showMenu);
el.musicBtn.addEventListener("click", toggleMusic);
el.fullBtn?.addEventListener("click", toggleFullscreen);
window.addEventListener("pointerdown", unlockAudioAndMaybeStart, { passive: true });
window.addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

el.canvas.addEventListener("mousedown", (e) => {
  if (state.mode !== "trident") return;
  const t = state.trident;
  if (t.turn !== "you" || t.projectile || t.youHP <= 0 || t.botHP <= 0) return;
  const rect = el.canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * el.canvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * el.canvas.height;
  if (Math.hypot(x - 95, y - 240) < 90) {
    t.dragging = true;
    t.dragX = x;
    t.dragY = y;
  }
});

el.canvas.addEventListener("mousemove", (e) => {
  if (state.mode !== "trident") return;
  const t = state.trident;
  if (!t.dragging) return;
  const rect = el.canvas.getBoundingClientRect();
  t.dragX = ((e.clientX - rect.left) / rect.width) * el.canvas.width;
  t.dragY = ((e.clientY - rect.top) / rect.height) * el.canvas.height;
});

window.addEventListener("mouseup", (e) => {
  if (state.mode !== "trident") return;
  const t = state.trident;
  if (!t.dragging) return;
  const rect = el.canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * el.canvas.width;
  const y = ((e.clientY - rect.top) / rect.height) * el.canvas.height;
  tryThrowTrident(x, y);
});
el.composer.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!state.running) return;
  const msg = el.msgInput.value.trim();
  if (!msg) return;
  el.msgInput.value = "";
  addBubble(msg, "you");
  checkMemeMessage(msg);
  if (state.mode === "text") {
    handleTextModeMessage(msg);
    return;
  }
  setTimeout(() => addBubble(botReply(msg)), 120);
});



function handleTextModeMessage(msg) {
  const t = state.text;
  if (t.over) {
    addBubble("Friend: wanna run another round? i think i needed this.");
    return;
  }

  const tone = classifyMessage(msg);
  const neutralReplies = [
    "Friend: yeah maybe... hard to explain rn",
    "Friend: idk, my brain's kinda loud tonight",
    "Friend: i'm trying to act normal but it's weird",
  ];
  const supportiveReplies = [
    "Friend: thanks... i've been low-key stressed for weeks",
    "Friend: honestly, i haven't been sleeping much",
    "Friend: i keep saying 'fine' so people stop asking",
  ];
  const harshReplies = [
    "Friend: nvm then, forget i said anything",
    "Friend: yeah, that's why i don't talk about it",
    "Friend: it's cool, i'll deal with it myself",
  ];

  if (tone === "supportive") {
    t.openness += 2;
    state.trust += 1;
    addBubble(supportiveReplies[t.round % supportiveReplies.length]);
  } else if (tone === "harsh") {
    t.openness -= 2;
    state.trust -= 1;
    addBubble(harshReplies[t.round % harshReplies.length]);
  } else {
    t.openness += 0;
    addBubble(neutralReplies[t.round % neutralReplies.length]);
  }

  t.round += 1;
  const subtleHints = [
    "Hint: short replies + long pauses",
    "Hint: avoids details about their day",
    "Hint: jokes but changes subject quickly",
    "Hint: says 'fine' again after heavy line",
    "Hint: asks if you're still there",
  ];
  t.lastHint = subtleHints[Math.min(t.round, subtleHints.length - 1)];

  if (t.round >= 5) {
    t.over = true;
    if (t.openness >= 4) {
      markEventOnce("text-win", "victory");
      addBubble("Ending: You noticed the signals. Friend opens up and says thanks for staying.");
    } else if (t.openness <= -2) {
      markEventOnce("text-fail", "fail");
      addBubble("Ending: You missed the signs. Friend shuts down for now.");
    } else {
      addBubble("Ending: Mixed. You caught some signs, missed others.");
    }
  }
}

function renderTextMode() {
  const t = state.text;
  drawSeaBackdrop(t.round * 180 + t.openness * 22 + 90, ["#5ce0ff", "#3d83d0", "#2d2550"]);
  drawSeaLifeDecor(t.round * 85 + 40);

  ctx.fillStyle = "rgba(8, 22, 50, 0.62)";
  ctx.fillRect(70, 48, 620, 244);
  ctx.strokeStyle = "rgba(170, 245, 255, 0.65)";
  ctx.strokeRect(70, 48, 620, 244);

  ctx.fillStyle = "#dbf8ff";
  ctx.font = "20px Inter, system-ui";
  ctx.fillText("Read Between the Lines", 96, 84);
  ctx.font = "15px Inter, system-ui";
  ctx.fillStyle = "#b7d8ff";
  ctx.fillText("Type anything in chat. Supportive replies increase openness.", 96, 112);
  ctx.fillText(`Signal: ${t.lastHint || "Listen for what is not being said."}`, 96, 144);
  ctx.fillText(`Round: ${t.round}/5`, 96, 176);
  ctx.fillText(`Openness: ${t.openness}`, 96, 206);
  ctx.fillText(t.over ? "Status: ended (type to keep chatting or switch modes)" : "Status: active conversation", 96, 236);

  el.stats.innerHTML = "";
  el.stats.append(stat("Round", `${t.round}/5`));
  el.stats.append(stat("Openness", t.openness));
  el.stats.append(stat("Trust", state.trust));
  el.stats.append(stat("Status", t.over ? "ended" : "live"));
  el.stats.append(stat("Theme", "feelings below words"));

  el.status.textContent = t.over
    ? (t.openness >= 4 ? "Great ending: your friend felt safe opening up." : t.openness <= -2 ? "Bad ending: your friend shut down." : "Mixed ending: you were partly supportive.")
    : "Use chat to respond naturally and read hidden signals.";
}

function drawSeaBackdrop(seed = 0, palette = ["#49d2ff", "#1278bc", "#063a6f"]) {
  const wave = seed * 0.01;
  const grad = ctx.createLinearGradient(0, 0, 0, 340);
  grad.addColorStop(0, palette[0]);
  grad.addColorStop(0.58, palette[1]);
  grad.addColorStop(1, palette[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 760, 340);

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  for (let i = 0; i < 6; i++) {
    const y = 40 + i * 24 + Math.sin(wave + i) * 4;
    ctx.fillRect(0, y, 760, 2);
  }

  ctx.fillStyle = "rgba(190, 245, 255, 0.35)";
  for (let i = 0; i < 32; i++) {
    const x = ((seed * (0.42 + i * 0.008)) + i * 29) % 800 - 20;
    const y = 326 - ((seed * (0.25 + (i % 5) * 0.06) + i * 18) % 310);
    const r = 1 + (i % 3);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(18, 66, 84, 0.52)";
  ctx.fillRect(0, 280, 760, 60);
  for (let i = 0; i < 12; i++) {
    const bx = 24 + i * 64;
    const bh = 10 + (i % 4) * 8;
    ctx.fillStyle = i % 2 ? "rgba(255, 130, 170, 0.24)" : "rgba(105, 245, 232, 0.24)";
    ctx.fillRect(bx, 280 - bh, 22, bh + 60);
  }
}

function drawSeaLifeDecor(timeSeed = 0) {
  for (let i = 0; i < 9; i++) {
    const x = (timeSeed * (0.52 + i * 0.06) + i * 96) % 860 - 48;
    const y = 66 + (i % 6) * 40 + Math.sin(timeSeed * 0.008 + i) * 10;
    ctx.fillStyle = i % 3 === 0 ? "rgba(255, 214, 118, 0.55)" : i % 2 ? "rgba(126, 232, 255, 0.42)" : "rgba(255, 151, 194, 0.42)";
    ctx.beginPath();
    ctx.ellipse(x, y, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 14, y);
    ctx.lineTo(x - 24, y - 6);
    ctx.lineTo(x - 24, y + 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(11, 37, 60, 0.45)";
    ctx.fillRect(x + 6, y - 2, 2, 2);
  }

  for (let i = 0; i < 6; i++) {
    const sx = 60 + i * 130 + Math.sin(timeSeed * 0.006 + i) * 9;
    const sy = 302 + Math.cos(timeSeed * 0.005 + i) * 5;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(timeSeed * 0.0009 + i);
    ctx.fillStyle = "rgba(255, 173, 116, 0.44)";
    for (let a = 0; a < 5; a++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -12);
      ctx.lineTo(4, -4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255, 245, 230, 0.6)";
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}


function renderOnlyUp() {
  const u = state.up;
  drawSeaBackdrop(u.bestHeight * 0.6 + u.pearls * 25, ["#6be8ff", "#3389d2", "#203a7a"]);
  drawSeaLifeDecor(u.bestHeight * 0.35 + 30);

  const left = keys.has("arrowleft") || keys.has("a");
  const right = keys.has("arrowright") || keys.has("d");
  const jump = keys.has("arrowup") || keys.has("w") || keys.has(" ");

  if (!u.over) {
    if (left) u.vx -= 0.35;
    if (right) u.vx += 0.35;
    u.vx *= 0.9;
    u.vx = Math.max(-4.4, Math.min(4.4, u.vx));
    if (jump && u.vy > -0.7 && u.vy < 0.9) u.vy = -8.9;

    u.vy += 0.35;
    const prevY = u.y;
    u.x += u.vx;
    u.y += u.vy;

    if (u.x < 10) { u.x = 10; u.vx = 0; }
    if (u.x > 750) { u.x = 750; u.vx = 0; }

    u.platforms.forEach((p) => {
      if (p.moving) {
        p.x += p.vx;
        if (p.x < 0 || p.x + p.w > 760) p.vx *= -1;
      }
      const py = p.y + Math.sin(Date.now() * 0.002 + p.bob) * 2;
      const landed = prevY + 12 <= py && u.y + 12 >= py && u.x > p.x - 8 && u.x < p.x + p.w + 8 && u.vy >= 0;
      if (landed) {
        u.y = py - 12;
        u.vy = -8.4;
        u.combo += 1;
        u.maxCombo = Math.max(u.maxCombo, u.combo);
      }
    });

    u.pearlsMap.forEach((pearl) => {
      if (!pearl.taken && Math.hypot(pearl.x - u.x, pearl.y - u.y) < 13) {
        pearl.taken = true;
        u.pearls += 1;
        u.combo += 1;
        u.maxCombo = Math.max(u.maxCombo, u.combo);
      }
    });

    const heightNow = Math.max(0, 300 - u.y);
    u.bestHeight = Math.max(u.bestHeight, heightNow);
    if (u.bestHeight > 0) u.cameraY = Math.max(u.cameraY, u.bestHeight - 120);

    if (u.y - u.cameraY > 390) {
      u.over = true;
      markEventOnce("up-fail", "fail");
    }

    if (u.bestHeight >= 1700) {
      u.over = true;
      markEventOnce("up-win", "victory");
    }
  }

  ctx.save();
  ctx.translate(0, u.cameraY);

  u.platforms.forEach((p, idx) => {
    const py = p.y + Math.sin(Date.now() * 0.002 + p.bob) * 2;
    ctx.fillStyle = idx % 2 ? "#77ffd2" : "#ffc8e9";
    ctx.fillRect(p.x, py, p.w, p.h);
    ctx.fillStyle = "rgba(10, 54, 79, 0.5)";
    ctx.fillRect(p.x, py + p.h - 3, p.w, 3);
  });

  u.pearlsMap.forEach((pearl) => {
    if (pearl.taken) return;
    ctx.fillStyle = "#7de8ff";
    ctx.beginPath();
    ctx.arc(pearl.x, pearl.y, pearl.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = u.over ? "#ff9abf" : "#ffe987";
  ctx.beginPath();
  ctx.ellipse(u.x, u.y, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(u.x - 9, u.y);
  ctx.lineTo(u.x - 16, u.y - 5);
  ctx.lineTo(u.x - 16, u.y + 5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  checkFunnyNumbers([u.bestHeight, u.pearls, u.maxCombo]);

  el.stats.innerHTML = "";
  el.stats.append(stat("Height", Math.floor(u.bestHeight)));
  el.stats.append(stat("Pearls", u.pearls));
  el.stats.append(stat("Combo", u.combo));
  el.stats.append(stat("Best Combo", u.maxCombo));
  el.stats.append(stat("Bubble Boost", u.boosts));
  el.stats.append(stat("Trust", state.trust));

  if (!u.over) el.status.textContent = "Climb up! Chain landings + pearls for huge combos.";
  else if (u.bestHeight >= 1700) el.status.textContent = "You reached the sky reef! Massive win.";
  else el.status.textContent = "Splash down! Try a cleaner climb and use boosts wisely.";
}

function renderOcean() {
  const o = state.ocean;
  let speed = 3;
  if (o.dash > 0) { speed = 6; o.dash -= 1; }
  if (keys.has("arrowleft") || keys.has("a")) o.x -= speed;
  if (keys.has("arrowright") || keys.has("d")) o.x += speed;
  if (keys.has("arrowup") || keys.has("w")) o.y -= speed;
  if (keys.has("arrowdown") || keys.has("s")) { o.y += speed * 0.65; o.depth += 1; }
  o.x = Math.max(8, Math.min(740, o.x));
  o.y = Math.max(8, Math.min(320, o.y));
  o.botDepth += 0.7 + Math.random() * 1.15;

  const dark = Math.min(220, o.depth * 0.5);
  const g = Math.max(8, 85 - dark * 0.25);
  const b = Math.max(20, 145 - dark * 0.45);
  drawSeaBackdrop(o.depth + o.botDepth, [`rgb(40,${g + 80},${b + 90})`, `rgb(15,${g + 25},${b + 25})`, `rgb(4,${g - 2},${b - 22})`]);
  drawSeaLifeDecor(o.depth + o.botDepth);

  if (o.hitCooldown > 0) o.hitCooldown -= 1;

  o.enemies.forEach((en) => {
    en.x += en.vx;
    if (en.x < 0 || en.x > 760) en.vx *= -1;
    ctx.fillStyle = "#ff5e8a";
    ctx.beginPath();
    ctx.ellipse(en.x, en.y, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(en.x - 8, en.y);
    ctx.lineTo(en.x - 14, en.y - 4);
    ctx.lineTo(en.x - 14, en.y + 4);
    ctx.closePath();
    ctx.fill();
    if (Math.hypot(en.x - o.x, en.y - o.y) < 14 && o.hitCooldown <= 0) {
      o.hp = Math.max(0, o.hp - 1);
      o.hitCooldown = 28;
    }
  });
  o.pearlsMap.forEach((p) => {
    if (!p.taken) {
      ctx.fillStyle = "#7de8ff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.fillRect(p.x + 1, p.y - 2, 2, 2);
      if (Math.hypot(p.x - o.x, p.y - o.y) < 12) { p.taken = true; o.pearls += 1; }
    }
  });
  if (o.pearlsMap.every((p) => p.taken)) spawnOceanEntities();

  ctx.fillStyle = o.hitCooldown > 0 ? "#ff9f9f" : "#f6d86c";
  ctx.beginPath();
  ctx.ellipse(o.x, o.y, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(o.x - 9, o.y);
  ctx.lineTo(o.x - 16, o.y - 5);
  ctx.lineTo(o.x - 16, o.y + 5);
  ctx.closePath();
  ctx.fill();

  el.stats.innerHTML = "";
  el.stats.append(stat("Your depth", Math.floor(o.depth)));
  el.stats.append(stat("Bot depth", Math.floor(o.botDepth)));
  el.stats.append(stat("HP", o.hp));
  el.stats.append(stat("Pearls", o.pearls));
  el.stats.append(stat("Trust", state.trust));
  checkFunnyNumbers([o.depth, o.botDepth]);
  el.status.textContent = o.hp <= 0 ? "You got caught by shadow fish." : o.depth >= 500 || o.botDepth >= 500 ? (o.depth >= o.botDepth ? "You win the depth race." : "Bot wins this dive.") : "Collect pearls and time dash bursts.";

  if (o.hp <= 0) markEventOnce("ocean-fail", "fail");
  else if (o.depth >= 500 || o.botDepth >= 500) {
    if (o.depth >= o.botDepth) markEventOnce("ocean-win", "victory");
    else markEventOnce("ocean-lose", "fail");
  }
}

function renderEmotion() {
  const e = state.emotion;
  e.hidden = Math.min(100, e.hidden + 0.19);
  e.botHidden = Math.min(100, e.botHidden + 0.15);
  e.botMask = Math.max(10, Math.min(100, e.botMask + (Math.random() < 0.5 ? -1 : 1)));
  if (Math.random() < 0.02) e.botHidden = Math.max(0, e.botHidden - 6);
  if (Math.random() < 0.01 && e.calm < 3) e.calm += 1;

  drawSeaBackdrop(e.hidden * 4 + e.botHidden * 3, ["#4dc9ff", "#2a73cf", "#352b5f"]);
  drawSeaLifeDecor(e.hidden * 3 + e.botHidden * 2);
  ctx.fillStyle = "#f4d4be";
  ctx.fillRect(170, 90, 120, 120);
  ctx.fillRect(470, 90, 120, 120);
  ctx.fillStyle = "#7e3042";
  ctx.fillRect(205, 170, 50, Math.max(4, e.mask * 0.4));
  ctx.fillRect(505, 170, 50, Math.max(4, e.botMask * 0.4));

  el.stats.innerHTML = "";
  el.stats.append(stat("Your mask", Math.floor(e.mask)));
  el.stats.append(stat("Your hidden stress", Math.floor(e.hidden)));
  el.stats.append(stat("Bot hidden stress", Math.floor(e.botHidden)));
  el.stats.append(stat("Calm charges", e.calm));
  el.stats.append(stat("Journal uses", e.journal));
  el.stats.append(stat("Trust", state.trust));
  checkFunnyNumbers([e.mask, e.hidden, e.botHidden]);
  el.status.textContent = e.hidden >= 95 ? "Your hidden stress broke through." : e.botHidden >= 95 ? "Bot cracked first—you stabilized better." : "Use Breathe/Journal strategically.";

  if (e.hidden >= 95) markEventOnce("emotion-fail", "fail");
  else if (e.botHidden >= 95) markEventOnce("emotion-win", "victory");
}

function renderDig() {
  const d = state.dig;
  if (Math.random() < 0.025) d.botLayer = Math.min(d.finds.length - 1, d.botLayer + 1);
  if (d.boost > 0) d.boost -= 1;

  drawSeaBackdrop(d.layer * 140 + d.relics * 24, ["#3fb6d6", "#1f5f9d", "#3d2a4a"]);
  drawSeaLifeDecor(d.layer * 120 + d.relics * 20);

  for (let i = 0; i < d.finds.length; i++) {
    ctx.fillStyle = i <= d.layer ? "#8b643e" : "#543b27";
    ctx.fillRect(40 + i * 98, 78, 76, 190);
  }

  const truths = ["They called me brave.", "I was terrified.", "I hid it every day.", "Beneath the surface: fear."];
  el.stats.innerHTML = "";
  el.stats.append(stat("Your layer", d.layer));
  el.stats.append(stat("Bot layer", d.botLayer));
  el.stats.append(stat("Truths", d.truths));
  el.stats.append(stat("Relics", d.relics));
  el.stats.append(stat("Boost active", d.boost > 0 ? "yes" : "no"));
  el.stats.append(stat("Trust", state.trust));
  checkFunnyNumbers([d.layer, d.botLayer, d.relics]);
  el.status.textContent = `Find: ${d.finds[d.layer]} | Truth: ${truths.slice(0, d.truths).join(" / ") || "none"}`;

  if (d.layer >= d.finds.length - 1) {
    if (d.layer >= d.botLayer) markEventOnce("dig-win", "victory");
    else markEventOnce("dig-lose", "fail");
  } else if (d.botLayer >= d.finds.length - 1) {
    markEventOnce("dig-lose", "fail");
  }
}

function renderMirror() {
  const m = state.mirror;
  const speed = m.phaseTimer > 0 ? 4.6 : 3;
  if (keys.has("arrowright") || keys.has("d")) { m.x += speed; m.mirrorX += speed * 0.85; }
  if (keys.has("arrowleft") || keys.has("a")) { m.x -= speed; m.mirrorX -= speed * 0.85; }
  m.botX += Math.random() < 0.55 ? 1.8 : 0.7;
  m.mirrorNoise += 0.08;
  if (m.phaseTimer > 0) m.phaseTimer -= 1;

  m.x = Math.max(10, Math.min(730, m.x));
  m.mirrorX = Math.max(10, Math.min(730, m.mirrorX));

  drawSeaBackdrop(m.mirrorNoise * 115, ["#54d9ff", "#277ad0", "#2f2555"]);
  ctx.fillStyle = "rgba(31, 38, 64, 0.72)";
  ctx.fillRect(0, 0, 760, 170);
  ctx.fillStyle = "rgba(47, 31, 52, 0.72)";
  ctx.fillRect(0, 170, 760, 170);
  drawSeaLifeDecor(m.mirrorNoise * 100);

  ctx.fillStyle = "#8ae6ff";
  ctx.fillRect(m.x, 90, 12, 12);
  ctx.fillStyle = m.phaseTimer > 0 ? "#ffd670" : "#ff7b9f";
  ctx.fillRect(m.mirrorX, 250, 12, 12);

  ctx.fillStyle = "#ce4f65";
  m.traps.forEach((t, i) => ctx.fillRect(t + Math.sin(m.mirrorNoise + i) * 4, 246, 18, 18));

  const hitTrap = m.phaseTimer <= 0 && m.traps.some((t) => Math.abs(t - m.mirrorX) < 12);

  el.stats.innerHTML = "";
  el.stats.append(stat("Top x", Math.floor(m.x)));
  el.stats.append(stat("Mirror x", Math.floor(m.mirrorX)));
  el.stats.append(stat("Bot x", Math.floor(m.botX)));
  el.stats.append(stat("Phase charges", m.phase));
  el.stats.append(stat("Trust", state.trust));
  checkFunnyNumbers([m.x, m.mirrorX, m.botX]);
  el.status.textContent = hitTrap ? "Mirror self hit a trap." : (m.x >= m.goal || m.botX >= m.goal) ? (m.x >= m.botX ? "You escaped both worlds." : "Bot escaped first.") : "Use Phase Shift to pass trap zones safely.";

  if (hitTrap) markEventOnce("mirror-fail", "fail");
  else if (m.x >= m.goal || m.botX >= m.goal) {
    if (m.x >= m.botX) markEventOnce("mirror-win", "victory");
    else markEventOnce("mirror-lose", "fail");
  }
}

function renderTrident() {
  const t = state.trident;

  // cinematic background
  drawSeaBackdrop((3 - t.youHP + 3 - t.botHP) * 180 + (t.cooldown || 0), ["#64dbff", "#356dc0", "#38234e"]);
  drawSeaLifeDecor((3 - t.youHP + 3 - t.botHP) * 180 + (t.cooldown || 0));

  ctx.fillStyle = "#4d2b2f";
  ctx.fillRect(0, 260, 760, 80);

  // arena fog
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.02 + (i % 5) * 0.005})`;
    ctx.fillRect((i * 37) % 760, 220 + (i % 7) * 9, 42, 4);
  }

  // players
  ctx.fillStyle = "#7de8ff";
  ctx.fillRect(70, 220, 26, 40);
  ctx.fillStyle = "#ffe27e";
  ctx.beginPath();
  ctx.arc(83, 215, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff9db5";
  ctx.fillRect(665, 220, 26, 40);
  ctx.fillStyle = "#9cf9a8";
  ctx.beginPath();
  ctx.arc(678, 215, 10, 0, Math.PI * 2);
  ctx.fill();

  // death animation overlays
  if (t.deathAnim) {
    t.deathAnim.timer -= 1;
    const alpha = Math.max(0, t.deathAnim.timer / 90);
    ctx.fillStyle = t.deathAnim.side === "bot" ? `rgba(255, 30, 60, ${0.35 * alpha})` : `rgba(120, 190, 255, ${0.35 * alpha})`;
    const x = t.deathAnim.side === "bot" ? 630 : 40;
    ctx.fillRect(x, 180, 90, 120);
    if (t.deathAnim.timer <= 0) t.deathAnim = null;
  }

  // mouse pull-back aim helper
  if (t.turn === "you" && !t.projectile && t.youHP > 0 && t.botHP > 0) {
    const anchorX = 95;
    const anchorY = 240;
    const tx = t.dragging ? t.dragX : anchorX - 32;
    const ty = t.dragging ? t.dragY : anchorY - 20;
    ctx.strokeStyle = "#ffd670";
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    ctx.lineTo(tx, ty);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,214,112,0.35)";
    ctx.beginPath();
    ctx.arc(tx, ty, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // blood particles
  t.blood.forEach((p) => {
    p.vy += 0.08;
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
    ctx.fillStyle = `rgba(180,20,35,${Math.max(0, p.life / 80)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  t.blood = t.blood.filter((p) => p.life > 0 && p.y < 340);

  // projectile physics + trail
  if (t.projectile) {
    t.projectile.vy += 0.22;
    t.projectile.vx += t.wind;
    t.projectile.x += t.projectile.vx;
    t.projectile.y += t.projectile.vy;
    t.projectile.trail.push({ x: t.projectile.x, y: t.projectile.y });
    if (t.projectile.trail.length > 18) t.projectile.trail.shift();

    ctx.strokeStyle = "rgba(255,220,180,0.45)";
    ctx.beginPath();
    t.projectile.trail.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    ctx.save();
    ctx.translate(t.projectile.x, t.projectile.y);
    ctx.rotate(Math.atan2(t.projectile.vy, t.projectile.vx));
    ctx.fillStyle = "#f7f0ff";
    ctx.fillRect(-10, -2, 20, 4);
    ctx.restore();

    const hitYou = Math.abs(t.projectile.x - 83) < 18 && Math.abs(t.projectile.y - 238) < 20;
    const hitBot = Math.abs(t.projectile.x - 678) < 18 && Math.abs(t.projectile.y - 238) < 20;

    if (hitYou && t.projectile.owner === "bot") {
      t.youHP = Math.max(0, t.youHP - 1);
      spawnBlood(83, 238, 22);
      if (t.youHP <= 0) {
        t.deathAnim = { side: "you", timer: 90 };
        addBubble("Fatal hit. You fall in the arena.");
      } else {
        addBubble("Bot hit you with a trident.");
      }
      t.projectile = null;
      t.wind = (Math.random() - 0.5) * 0.12;
    } else if (hitBot && t.projectile.owner === "you") {
      t.botHP = Math.max(0, t.botHP - 1);
      spawnBlood(678, 238, 22);
      if (t.botHP <= 0) {
        t.deathAnim = { side: "bot", timer: 90 };
        addBubble("Direct kill shot. Bot is down.", "you");
      } else {
        addBubble("Direct hit! You tagged the bot.", "you");
      }
      t.projectile = null;
      t.wind = (Math.random() - 0.5) * 0.12;
    } else if (t.projectile.y > 340 || t.projectile.x < -40 || t.projectile.x > 800) {
      t.projectile = null;
      t.wind = (Math.random() - 0.5) * 0.12;
    }
  }

  if (t.cooldown > 0) t.cooldown -= 1;
  if (!t.projectile && t.turn === "bot" && t.youHP > 0 && t.botHP > 0) botThrow();

  el.stats.innerHTML = "";
  el.stats.append(stat("Your HP", t.youHP));
  el.stats.append(stat("Bot HP", t.botHP));
  el.stats.append(stat("Turn", t.turn));
  const previewPower = Math.min(30, Math.hypot(95 - t.dragX, 240 - t.dragY) * 0.22);
  el.stats.append(stat("Aim power", t.dragging ? previewPower.toFixed(1) : "ready"));
  el.stats.append(stat("Wind", t.wind.toFixed(2)));
  el.stats.append(stat("Trust", state.trust));
  checkFunnyNumbers([t.youHP, t.botHP, previewPower]);

  if (t.youHP <= 0) el.status.textContent = "Bot wins the duel.";
  else if (t.botHP <= 0) el.status.textContent = "You win the trident duel!";
  else el.status.textContent = "Take turns throwing. Account for gravity + wind.";

  if (t.youHP <= 0) markEventOnce("trident-fail", "fail");
  else if (t.botHP <= 0) markEventOnce("trident-win", "victory");
}

function frame() {
  if (state.transition.active) {
    drawModeTransition();
  } else if (state.running) {
    if (state.mode === "ocean") renderOcean();
    if (state.mode === "emotion") renderEmotion();
    if (state.mode === "dig") renderDig();
    if (state.mode === "mirror") renderMirror();
    if (state.mode === "trident") renderTrident();
    if (state.mode === "text") renderTextMode();
    if (state.mode === "up") renderOnlyUp();
  }
  requestAnimationFrame(frame);
}

makeCards();
drawFace();
showMenu();
requestAnimationFrame(frame);
