const MODES = [
  { id: "ocean", title: "🌊 Into the Deep", summary: "Dive race with hazards, pearls, and dash timing." },
  { id: "emotion", title: "😃 Emotion Mask", summary: "Balance visible calm against hidden pressure." },
  { id: "dig", title: "⛏️ Beneath the Dirt", summary: "Dig layers, collect relics, and surface truths." },
  { id: "mirror", title: "🪞 Mirror World", summary: "Move in dual worlds and avoid hidden traps." },
  { id: "trident", title: "🔱 Trident Duel", summary: "Turn-based physics throws. Arc your shot to hit the bot." },
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
  ocean: { x: 370, y: 160, depth: 0, botDepth: 0, hp: 4, pearls: 0, dash: 0, enemies: [], pearlsMap: [] },
  emotion: { mask: 50, hidden: 20, botMask: 52, botHidden: 18, calm: 3, journal: 2 },
  dig: { layer: 0, botLayer: 0, truths: 0, boost: 0, finds: ["soil", "coins", "bones", "locket", "letter", "fear", "truth"], relics: 0 },
  mirror: { x: 70, mirrorX: 70, botX: 75, goal: 700, phase: 2, phaseTimer: 0, traps: [220, 340, 510], mirrorNoise: 0 },
  trident: {
    youHP: 3,
    botHP: 3,
    turn: "you",
    aimAngle: 42,
    aimPower: 15,
    projectile: null,
    wind: 0,
    cooldown: 0,
  },
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
  c.fillStyle = ["#10283d", "#2d2347", "#3a2816", "#202b3d", "#2e1b29"][seed % 5];
  c.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 70; i++) {
    c.fillStyle = i % 2 ? "#6f57a0" : "#3b2a59";
    c.fillRect((i * 17) % canvas.width, 55 + (i % 12), 4, 2);
  }
  c.fillStyle = "#f4d4be";
  c.fillRect(14, 20, 18, 16);
  c.fillStyle = "#191522";
  c.fillRect(18, 25, 2, 2);
  c.fillRect(25, 25, 2, 2);
  c.fillStyle = "#86eaff";
  c.fillRect(130, 20, 30, 30);
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
  for (let i = 0; i < 7; i++) state.ocean.pearlsMap.push({ x: Math.random() * 720 + 20, y: Math.random() * 300 + 20, taken: false });
}

function setupMode(id) {
  clearGameUI();
  state.mode = id;
  state.running = true;
  const m = MODES.find((x) => x.id === id);
  el.modeTitle.textContent = m.title;
  el.summary.textContent = m.summary;
  el.canvas.classList.remove("hidden");

  if (id === "ocean") {
    state.ocean = { x: 370, y: 160, depth: 0, botDepth: 0, hp: 4, pearls: 0, dash: 0, enemies: [], pearlsMap: [] };
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
    state.trident = { youHP: 3, botHP: 3, turn: "you", aimAngle: 42, aimPower: 15, projectile: null, wind: (Math.random() - 0.5) * 0.12, cooldown: 0 };
    el.controls.innerHTML = '<button id="angleUp">Angle +</button><button id="angleDown">Angle -</button><button id="powerUp">Power +</button><button id="powerDown">Power -</button><button id="throwBtn">Throw Trident</button>';
    document.getElementById("angleUp").onclick = () => state.trident.aimAngle = Math.min(80, state.trident.aimAngle + 2);
    document.getElementById("angleDown").onclick = () => state.trident.aimAngle = Math.max(8, state.trident.aimAngle - 2);
    document.getElementById("powerUp").onclick = () => state.trident.aimPower = Math.min(28, state.trident.aimPower + 1);
    document.getElementById("powerDown").onclick = () => state.trident.aimPower = Math.max(8, state.trident.aimPower - 1);
    document.getElementById("throwBtn").onclick = () => tryThrowTrident();
    addBubble("Turn duel started. Set angle + power, then throw.");
  }
}

function tryThrowTrident() {
  const t = state.trident;
  if (state.mode !== "trident" || t.projectile || t.turn !== "you" || t.youHP <= 0 || t.botHP <= 0) return;
  const rad = (t.aimAngle * Math.PI) / 180;
  t.projectile = {
    x: 95,
    y: 240,
    vx: Math.cos(rad) * t.aimPower * 0.55,
    vy: -Math.sin(rad) * t.aimPower * 0.55,
    owner: "you",
  };
  t.turn = "bot";
  addBubble(`You throw at ${t.aimAngle}° / power ${t.aimPower}.`, "you");
}

function botThrow() {
  const t = state.trident;
  if (t.projectile || t.turn !== "bot" || t.youHP <= 0 || t.botHP <= 0 || t.cooldown > 0) return;
  const baseAngle = 180 - (34 + Math.random() * 20);
  const rad = (baseAngle * Math.PI) / 180;
  const power = 12 + Math.random() * 10;
  t.projectile = {
    x: 665,
    y: 240,
    vx: Math.cos(rad) * power * 0.55,
    vy: -Math.sin(rad) * power * 0.55,
    owner: "bot",
  };
  t.turn = "you";
  t.cooldown = 55;
  addBubble("Bot throws a trident.");
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
  ctx.fillStyle = `rgb(10, ${g}, ${b})`;
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
  else el.status.textContent = "Collect pearls for score and use Dash Burst to dodge.";
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
  el.stats.append(stat("Relics", d.relics));
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
  else el.status.textContent = "Use Phase Shift to pass trap zones safely.";
}

function renderTrident() {
  const t = state.trident;
  ctx.fillStyle = "#2d1b2a";
  ctx.fillRect(0, 0, 760, 340);

  ctx.fillStyle = "#3c6a91";
  ctx.fillRect(0, 260, 760, 80);

  // players
  ctx.fillStyle = "#7de8ff";
  ctx.fillRect(70, 220, 26, 40);
  ctx.fillStyle = "#ff9db5";
  ctx.fillRect(665, 220, 26, 40);

  // aim helper on your turn
  if (t.turn === "you" && !t.projectile && t.youHP > 0 && t.botHP > 0) {
    const rad = (t.aimAngle * Math.PI) / 180;
    const tx = 95 + Math.cos(rad) * (t.aimPower * 3.2);
    const ty = 240 - Math.sin(rad) * (t.aimPower * 3.2);
    ctx.strokeStyle = "#ffd670";
    ctx.beginPath();
    ctx.moveTo(95, 240);
    ctx.lineTo(tx, ty);
    ctx.stroke();
  }

  // projectile physics
  if (t.projectile) {
    t.projectile.vy += 0.22; // gravity
    t.projectile.vx += t.wind; // wind
    t.projectile.x += t.projectile.vx;
    t.projectile.y += t.projectile.vy;

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
      addBubble("Bot hit you with a trident.");
      t.projectile = null;
      t.wind = (Math.random() - 0.5) * 0.12;
    } else if (hitBot && t.projectile.owner === "you") {
      t.botHP = Math.max(0, t.botHP - 1);
      addBubble("Direct hit! You tagged the bot.", "you");
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
  el.stats.append(stat("Angle", `${t.aimAngle}°`));
  el.stats.append(stat("Power", t.aimPower));
  el.stats.append(stat("Wind", t.wind.toFixed(2)));
  el.stats.append(stat("Trust", state.trust));

  if (t.youHP <= 0) el.status.textContent = "Bot wins the duel.";
  else if (t.botHP <= 0) el.status.textContent = "You win the trident duel!";
  else el.status.textContent = "Take turns throwing. Adjust angle/power for arc + wind.";
}

function frame() {
  if (state.running) {
    if (state.mode === "ocean") renderOcean();
    if (state.mode === "emotion") renderEmotion();
    if (state.mode === "dig") renderDig();
    if (state.mode === "mirror") renderMirror();
    if (state.mode === "trident") renderTrident();
  }
  requestAnimationFrame(frame);
}

makeCards();
drawFace();
showMenu();
requestAnimationFrame(frame);
