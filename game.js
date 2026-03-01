const MODES = [
  { id: "normal", title: "🎭 Normal Life", summary: "Do chores, trigger mini-events, and keep your hidden stress from breaking through.", controls: "Work / Rest / Help Friend" },
  { id: "iceberg", title: "🧠 Iceberg Clicker", summary: "Reveal layers, buy scans, and race a bot to the deepest truth.", controls: "Reveal / Sonar / Speed Dig" },
  { id: "ocean", title: "🌊 Into the Deep", summary: "Swim through hazards, collect pearls, and beat the bot depth score.", controls: "Arrows/WASD + Dash" },
  { id: "emotion", title: "😃 Emotion Mask", summary: "Balance the public mask and private pressure with active cooldown skills.", controls: "Mask / Breathe / Journal" },
  { id: "dig", title: "⛏️ Beneath the Dirt", summary: "Dig relic chains, uncover truths, and use boosts before the bot finishes.", controls: "Dig / Truth / Drill Boost" },
  { id: "mirror", title: "🪞 Mirror World", summary: "Survive dual-world movement, dodge mirror traps, and reach the exit first.", controls: "Arrows/WASD + Phase Shift" },
  { id: "external", title: "🔗 Campfire External", summary: "Open the linked Vercel project directly in a new tab.", controls: "Open Link" },
];

const el = {
  cards: document.getElementById("cards"),
  menu: document.getElementById("menu"),
  gameView: document.getElementById("gameView"),
  backBtn: document.getElementById("backBtn"),
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

const state = {
  mode: null,
  running: false,
  trust: 0,
  normal: { progress: 0, bot: 0, glitch: 0, streak: 0 },
  iceberg: { depth: 0, bot: 0, coins: 0, revealPower: 1, layers: ["memes", "rumors", "drama", "secrets", "fear", "truth"] },
  ocean: { x: 370, y: 160, depth: 0, botDepth: 0, hp: 4, pearls: 0, dash: 0, enemies: [], pearlsMap: [] },
  emotion: { mask: 50, hidden: 20, botMask: 52, botHidden: 18, calm: 3, journal: 2 },
  dig: { layer: 0, botLayer: 0, truths: 0, boost: 0, finds: ["soil", "coins", "bones", "locket", "letter", "fear", "truth"] },
  mirror: { x: 70, mirrorX: 70, botX: 75, goal: 700, phase: 2, phaseTimer: 0, traps: [220, 340, 510], mirrorNoise: 0 },
};

let mouthOpen = false;
function drawFace() {
  faceCtx.clearRect(0, 0, 32, 32);
  for (let y = 2; y < 30; y++) for (let x = 2; x < 30; x++) { faceCtx.fillStyle = "#2b2241"; faceCtx.fillRect(x, y, 1, 1); }
  for (let y = 7; y < 26; y++) for (let x = 7; x < 26; x++) { faceCtx.fillStyle = "#f4d4be"; faceCtx.fillRect(x, y, 1, 1); }
  faceCtx.fillStyle = "#181421"; faceCtx.fillRect(11, 14, 2, 2); faceCtx.fillRect(19, 14, 2, 2);
  faceCtx.fillStyle = "#7a3042"; if (mouthOpen) faceCtx.fillRect(13, 22, 6, 2); else faceCtx.fillRect(13, 22, 6, 1);
  faceCtx.fillStyle = "#a286d1"; for (let i = 0; i < 32; i++) { faceCtx.fillRect(i, 0, 1, 1); faceCtx.fillRect(i, 31, 1, 1); faceCtx.fillRect(0, i, 1, 1); faceCtx.fillRect(31, i, 1, 1); }
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
  c.fillStyle = ["#1d1533", "#12283e", "#3a2816"][seed % 3];
  c.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 55; i++) {
    c.fillStyle = i % 2 ? "#6f57a0" : "#3b2a59";
    c.fillRect((i * 17) % canvas.width, 62 + (i % 8), 4, 2);
  }
  c.fillStyle = "#f4d4be";
  c.fillRect(14, 20, 18, 16);
  c.fillStyle = "#191522";
  c.fillRect(18, 25, 2, 2);
  c.fillRect(25, 25, 2, 2);
}

function makeCards() {
  el.cards.innerHTML = "";
  MODES.forEach((m, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<canvas class="thumb" width="180" height="90"></canvas><span class="badge">Option ${i + 1}</span><h3>${m.title}</h3><p>${m.summary}</p><button>Play</button>`;
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
  for (let i = 0; i < 7; i++) {
    state.ocean.enemies.push({ x: Math.random() * 730 + 10, y: Math.random() * 320 + 8, vx: (Math.random() - 0.5) * 2.4 });
  }
  for (let i = 0; i < 6; i++) {
    state.ocean.pearlsMap.push({ x: Math.random() * 720 + 20, y: Math.random() * 300 + 20, taken: false });
  }
}

function setupMode(id) {
  clearGameUI();
  state.mode = id;
  state.running = true;
  const m = MODES.find((x) => x.id === id);
  el.modeTitle.textContent = m.title;
  el.summary.textContent = m.summary;

  if (id === "external") {
    el.canvas.classList.add("hidden");
    el.controls.innerHTML = `<a class="linkBtn" href="https://campfire-7ioxgkuxz-ahackvs-projects.vercel.app/" target="_blank" rel="noopener noreferrer">Open Campfire Vercel Project ↗</a>`;
    el.status.textContent = "External mode opens in a new tab because embedding is blocked by that site.";
    addBubble("I can’t run that one inside the frame, but this link opens it directly.");
    return;
  }

  el.canvas.classList.remove("hidden");

  if (id === "normal") {
    state.normal = { progress: 0, bot: 0, glitch: 0, streak: 0 };
    el.controls.innerHTML = '<button id="workBtn">Work</button><button id="restBtn">Rest</button><button id="helpBtn">Help Friend</button>';
    document.getElementById("workBtn").onclick = () => { state.normal.progress += 8 + state.normal.streak; state.normal.glitch += 3; state.normal.streak = Math.min(12, state.normal.streak + 1); };
    document.getElementById("restBtn").onclick = () => { state.normal.glitch = Math.max(0, state.normal.glitch - 8); state.normal.streak = Math.max(0, state.normal.streak - 2); };
    document.getElementById("helpBtn").onclick = () => { state.trust += 1; state.normal.glitch = Math.max(0, state.normal.glitch - 5); addBubble("Good call. Helping others lowers hidden pressure."); };
    addBubble("Let's keep normal life stable while glitches try to break through.");
  }

  if (id === "iceberg") {
    state.iceberg = { depth: 0, bot: 0, coins: 0, revealPower: 1, layers: ["memes", "rumors", "drama", "secrets", "fear", "truth"] };
    el.controls.innerHTML = '<button id="revealBtn">Reveal</button><button id="sonarBtn">Buy Sonar (3)</button><button id="speedBtn">Buy Speed Dig (5)</button>';
    document.getElementById("revealBtn").onclick = () => {
      state.iceberg.depth = Math.min(state.iceberg.layers.length - 1, state.iceberg.depth + state.iceberg.revealPower);
      state.iceberg.coins += 1;
    };
    document.getElementById("sonarBtn").onclick = () => {
      if (state.iceberg.coins >= 3) { state.iceberg.coins -= 3; state.iceberg.depth = Math.min(state.iceberg.layers.length - 1, state.iceberg.depth + 2); }
    };
    document.getElementById("speedBtn").onclick = () => {
      if (state.iceberg.coins >= 5) { state.iceberg.coins -= 5; state.iceberg.revealPower = Math.min(3, state.iceberg.revealPower + 1); }
    };
    addBubble("We'll race to the bottom. Upgrade your reveal tools.");
  }

  if (id === "ocean") {
    state.ocean = { x: 370, y: 160, depth: 0, botDepth: 0, hp: 4, pearls: 0, dash: 0, enemies: [], pearlsMap: [] };
    spawnOceanEntities();
    el.controls.innerHTML = '<button id="dashBtn">Dash Burst</button><span class="stat">Move: arrows / WASD</span>';
    document.getElementById("dashBtn").onclick = () => {
      if (state.ocean.dash <= 0) state.ocean.dash = 80;
    };
    addBubble("Race me to depth 500, collect pearls, and avoid shadow fish.");
  }

  if (id === "emotion") {
    state.emotion = { mask: 50, hidden: 20, botMask: 52, botHidden: 18, calm: 3, journal: 2 };
    el.controls.innerHTML = '<button id="maskBtn">Mask +</button><button id="breatheBtn">Breathe</button><button id="journalBtn">Journal</button>';
    document.getElementById("maskBtn").onclick = () => { state.emotion.mask = Math.min(100, state.emotion.mask + 8); state.emotion.hidden = Math.min(100, state.emotion.hidden + 6); };
    document.getElementById("breatheBtn").onclick = () => { if (state.emotion.calm > 0) { state.emotion.calm -= 1; state.emotion.hidden = Math.max(0, state.emotion.hidden - 12); } };
    document.getElementById("journalBtn").onclick = () => { if (state.emotion.journal > 0) { state.emotion.journal -= 1; state.emotion.hidden = Math.max(0, state.emotion.hidden - 18); state.trust += 1; } };
    addBubble("Keep the visible mask stable, but don't ignore hidden pressure.");
  }

  if (id === "dig") {
    state.dig = { layer: 0, botLayer: 0, truths: 0, boost: 0, finds: ["soil", "coins", "bones", "locket", "letter", "fear", "truth"] };
    el.controls.innerHTML = '<button id="digBtn">Dig</button><button id="truthBtn">Truth</button><button id="boostBtn">Drill Boost</button>';
    document.getElementById("digBtn").onclick = () => {
      const step = state.dig.boost > 0 ? 2 : 1;
      state.dig.layer = Math.min(state.dig.finds.length - 1, state.dig.layer + step);
      addBubble(`Found: ${state.dig.finds[state.dig.layer]}`, "you");
    };
    document.getElementById("truthBtn").onclick = () => { state.dig.truths = Math.min(4, state.dig.truths + 1); state.trust += 1; };
    document.getElementById("boostBtn").onclick = () => { state.dig.boost = 220; };
    addBubble("Dig race started. Use boost windows to surge ahead.");
  }

  if (id === "mirror") {
    state.mirror = { x: 70, mirrorX: 70, botX: 75, goal: 700, phase: 2, phaseTimer: 0, traps: [220, 340, 510], mirrorNoise: 0 };
    el.controls.innerHTML = '<button id="phaseBtn">Phase Shift</button><span class="stat">Move: arrows / WASD</span>';
    document.getElementById("phaseBtn").onclick = () => { if (state.mirror.phase > 0) { state.mirror.phase -= 1; state.mirror.phaseTimer = 140; } };
    addBubble("Watch both worlds. Phase Shift lets you ghost through traps briefly.");
  }
}

function startMode(id) {
  el.menu.classList.add("hidden");
  el.gameView.classList.remove("hidden");
  setupMode(id);
}

function showMenu() {
  state.running = false;
  state.mode = null;
  el.menu.classList.remove("hidden");
  el.gameView.classList.add("hidden");
}

el.backBtn.addEventListener("click", showMenu);
window.addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
el.composer.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!state.running) return;
  const msg = el.msgInput.value.trim();
  if (!msg) return;
  el.msgInput.value = "";
  addBubble(msg, "you");
  setTimeout(() => addBubble(botReply(msg)), 120);
});

function renderNormal() {
  const g = state.normal;
  g.bot += 0.45 + Math.random() * 0.55;
  g.glitch = Math.min(100, g.glitch + 0.14);

  const tint = Math.min(180, g.glitch * 1.3);
  ctx.fillStyle = `rgb(${35 + tint}, ${35 + tint * 0.2}, ${60 + tint * 0.1})`;
  ctx.fillRect(0, 0, 760, 340);
  ctx.fillStyle = "#8de6ff";
  ctx.fillRect(90, 90, 160, 120);
  if (g.glitch > 25) {
    ctx.fillStyle = "#ff5f8b";
    for (let i = 0; i < 9; i++) ctx.fillRect(65 + i * 78, 60 + (i % 3) * 62, 26, 7);
  }

  el.stats.innerHTML = "";
  el.stats.append(stat("Your progress", Math.floor(g.progress)));
  el.stats.append(stat("Bot progress", Math.floor(g.bot)));
  el.stats.append(stat("Glitch", Math.floor(g.glitch)));
  el.stats.append(stat("Task streak", g.streak));
  el.stats.append(stat("Trust", state.trust));

  if (g.glitch >= 95) el.status.textContent = "Surface cracked. Hidden stress took over this round.";
  else if (g.progress >= 280 || g.bot >= 280) el.status.textContent = g.progress >= g.bot ? "You completed the day first." : "Bot finished the day first.";
  else el.status.textContent = "Work builds progress, but too much pressure increases glitches.";
}

function renderIceberg() {
  const i = state.iceberg;
  if (Math.random() < 0.03) i.bot = Math.min(i.layers.length - 1, i.bot + 1);

  ctx.fillStyle = "#10324e";
  ctx.fillRect(0, 0, 760, 340);
  ctx.fillStyle = "#d8edff";
  ctx.beginPath();
  ctx.moveTo(300, 70); ctx.lineTo(430, 70); ctx.lineTo(505, 150); ctx.lineTo(225, 150); ctx.fill();
  ctx.fillStyle = "#8db8e6";
  ctx.fillRect(180, 150, 370, 135);

  ctx.fillStyle = "#f6fbff";
  ctx.fillText(`You: ${i.layers[i.depth]}`, 20, 28);
  ctx.fillText(`Bot: ${i.layers[i.bot]}`, 20, 50);

  el.stats.innerHTML = "";
  el.stats.append(stat("Your layer", i.depth));
  el.stats.append(stat("Bot layer", i.bot));
  el.stats.append(stat("Coins", i.coins));
  el.stats.append(stat("Reveal power", i.revealPower));
  el.stats.append(stat("Trust", state.trust));

  if (i.depth >= i.layers.length - 1 || i.bot >= i.layers.length - 1) {
    el.status.textContent = i.depth >= i.bot ? "You reached the hidden bottom first." : "Bot reached the truth first.";
  } else {
    el.status.textContent = "Reveal, buy sonar, and upgrade speed to beat the bot.";
  }
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
  ctx.fillStyle = `rgb(10, ${85 - dark * 0.25}, ${145 - dark * 0.45})`;
  ctx.fillRect(0, 0, 760, 340);

  o.enemies.forEach((en) => {
    en.x += en.vx;
    if (en.x < 0 || en.x > 760) en.vx *= -1;
    ctx.fillStyle = "#b32145";
    ctx.fillRect(en.x, en.y, 16, 8);
    if (Math.hypot(en.x - o.x, en.y - o.y) < 14 && Math.random() < 0.02) o.hp = Math.max(0, o.hp - 1);
  });

  o.pearlsMap.forEach((p) => {
    if (!p.taken) {
      ctx.fillStyle = "#7de8ff";
      ctx.fillRect(p.x, p.y, 6, 6);
      if (Math.hypot(p.x - o.x, p.y - o.y) < 12) { p.taken = true; o.pearls += 1; }
    }
  });
  if (o.pearlsMap.every((p) => p.taken)) spawnOceanEntities();

  ctx.fillStyle = "#f6d86c";
  ctx.fillRect(o.x, o.y, 12, 12);

  el.stats.innerHTML = "";
  el.stats.append(stat("Your depth", Math.floor(o.depth)));
  el.stats.append(stat("Bot depth", Math.floor(o.botDepth)));
  el.stats.append(stat("HP", o.hp));
  el.stats.append(stat("Pearls", o.pearls));
  el.stats.append(stat("Trust", state.trust));

  if (o.hp <= 0) el.status.textContent = "You got caught by shadow fish.";
  else if (o.depth >= 500 || o.botDepth >= 500) el.status.textContent = o.depth >= o.botDepth ? "You win the depth race." : "Bot wins this dive.";
  else el.status.textContent = "Collect pearls for bonus fun and use Dash Burst to dodge.";
}

function renderEmotion() {
  const e = state.emotion;
  e.hidden = Math.min(100, e.hidden + 0.19);
  e.botHidden = Math.min(100, e.botHidden + 0.15);
  e.botMask = Math.max(10, Math.min(100, e.botMask + (Math.random() < 0.5 ? -1 : 1)));
  if (Math.random() < 0.02) e.botHidden = Math.max(0, e.botHidden - 6);
  if (Math.random() < 0.01 && e.calm < 3) e.calm += 1;

  ctx.fillStyle = "#1c1830";
  ctx.fillRect(0, 0, 760, 340);
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

  if (e.hidden >= 95) el.status.textContent = "Your hidden stress broke through.";
  else if (e.botHidden >= 95) el.status.textContent = "Bot cracked first—you stabilized better.";
  else el.status.textContent = "Use Breathe/Journal strategically before stress spikes.";
}

function renderDig() {
  const d = state.dig;
  if (Math.random() < 0.025) d.botLayer = Math.min(d.finds.length - 1, d.botLayer + 1);
  if (d.boost > 0) d.boost -= 1;

  ctx.fillStyle = "#3a2818";
  ctx.fillRect(0, 0, 760, 340);
  for (let i = 0; i < d.finds.length; i++) {
    ctx.fillStyle = i <= d.layer ? "#7a5632" : "#4a3421";
    ctx.fillRect(40 + i * 98, 78, 76, 190);
  }

  const truths = ["They called me brave.", "I was terrified.", "I hid it every day.", "Beneath the surface: fear."];
  el.stats.innerHTML = "";
  el.stats.append(stat("Your layer", d.layer));
  el.stats.append(stat("Bot layer", d.botLayer));
  el.stats.append(stat("Truths", d.truths));
  el.stats.append(stat("Boost active", d.boost > 0 ? "yes" : "no"));
  el.stats.append(stat("Trust", state.trust));
  el.status.textContent = `Find: ${d.finds[d.layer]} | Truth: ${truths.slice(0, d.truths).join(" / ") || "none"}`;
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

  ctx.fillStyle = "#1f2640";
  ctx.fillRect(0, 0, 760, 170);
  ctx.fillStyle = "#2f1f34";
  ctx.fillRect(0, 170, 760, 170);

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

  if (hitTrap) el.status.textContent = "Mirror self hit a trap.";
  else if (m.x >= m.goal || m.botX >= m.goal) el.status.textContent = m.x >= m.botX ? "You escaped both worlds." : "Bot escaped first.";
  else el.status.textContent = "Use Phase Shift to pass through trap zones safely.";
}

function frame() {
  if (state.running) {
    if (state.mode === "normal") renderNormal();
    if (state.mode === "iceberg") renderIceberg();
    if (state.mode === "ocean") renderOcean();
    if (state.mode === "emotion") renderEmotion();
    if (state.mode === "dig") renderDig();
    if (state.mode === "mirror") renderMirror();
  }
  requestAnimationFrame(frame);
}

makeCards();
drawFace();
showMenu();
requestAnimationFrame(frame);
