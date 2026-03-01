const MODES = [
  { id: "normal", title: "🎭 Normal Life", summary: "Do chores while glitches reveal what’s beneath the surface.", controls: "Press Work" },
  { id: "iceberg", title: "🧠 Iceberg Clicker", summary: "Click downward through meme layers and hidden truths.", controls: "Press Reveal" },
  { id: "ocean", title: "🌊 Into the Deep", summary: "Swim down as danger and darkness increase.", controls: "Arrow keys / WASD" },
  { id: "emotion", title: "😃 Emotion Mask", summary: "Keep the visible mask stable while hidden stress rises.", controls: "Mask+/Breathe" },
  { id: "dig", title: "⛏️ Beneath the Dirt", summary: "Dig layers and reveal buried emotional text.", controls: "Dig / Truth" },
  { id: "mirror", title: "🪞 Mirror World", summary: "Move in two worlds; avoid hidden-side hazards.", controls: "Arrow keys / WASD" },
  { id: "external", title: "🔗 Campfire External", summary: "Open the linked Vercel project directly.", controls: "Open Link" },
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
  normal: { progress: 0, glitch: 0, bot: 0 },
  iceberg: { depth: 0, bot: 0, layers: ["memes", "rumors", "drama", "secrets", "fear", "truth"] },
  ocean: { x: 370, y: 160, depth: 0, botDepth: 0, hp: 3, enemies: [] },
  emotion: { mask: 50, hidden: 20, botMask: 52, botHidden: 18 },
  dig: { layer: 0, botLayer: 0, truths: 0, finds: ["soil", "coins", "bones", "note", "fear", "truth"] },
  mirror: { x: 70, y: 160, mirrorX: 70, traps: [220, 340, 510], goal: 700, botX: 75 },
};

let mouthOpen = false;
function drawFace() {
  faceCtx.clearRect(0, 0, 32, 32);
  for (let y = 2; y < 30; y++) for (let x = 2; x < 30; x++) { faceCtx.fillStyle = "#2b2241"; faceCtx.fillRect(x, y, 1, 1); }
  for (let y = 7; y < 26; y++) for (let x = 7; x < 26; x++) { faceCtx.fillStyle = "#f4d4be"; faceCtx.fillRect(x, y, 1, 1); }
  faceCtx.fillStyle = "#181421"; faceCtx.fillRect(11, 14, 2, 2); faceCtx.fillRect(19, 14, 2, 2);
  faceCtx.fillStyle = "#7a3042"; if (mouthOpen) { faceCtx.fillRect(13, 22, 6, 2); } else { faceCtx.fillRect(13, 22, 6, 1); }
  faceCtx.fillStyle = "#a286d1"; for (let i = 0; i < 32; i++) { faceCtx.fillRect(i, 0, 1, 1); faceCtx.fillRect(i, 31, 1, 1); faceCtx.fillRect(0, i, 1, 1); faceCtx.fillRect(31, i, 1, 1); }
}
function animateFace(text) {
  el.botMood.textContent = `Bot: ${text}`;
  let n = 0;
  const t = setInterval(() => {
    mouthOpen = !mouthOpen; drawFace(); n += 1;
    if (n > Math.max(7, Math.floor(text.length / 3))) { clearInterval(t); mouthOpen = false; drawFace(); }
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
  const good = ["you okay", "i'm here", "talk", "listen", "care", "support", "how are"];
  const bad = ["whatever", "dramatic", "stop", "don't care", "overreact"];
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
  if (tone === "supportive") { state.trust += 1; return "Nice read. That's supportive."; }
  if (tone === "harsh") { state.trust -= 1; return "That was rough. Hidden mood got worse."; }
  return "Steady message. Safe but not deep.";
}

function stat(label, value) {
  const d = document.createElement("div"); d.className = "stat"; d.textContent = `${label}: ${value}`; return d;
}

function drawThumb(canvas, seed) {
  const c = canvas.getContext("2d");
  c.fillStyle = ["#1d1533", "#12283e", "#3a2816"][seed % 3]; c.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 50; i++) {
    c.fillStyle = i % 2 ? "#6f57a0" : "#3b2a59";
    c.fillRect((i * 17) % canvas.width, 62 + (i % 8), 4, 2);
  }
  c.fillStyle = "#f4d4be"; c.fillRect(14, 20, 18, 16);
  c.fillStyle = "#191522"; c.fillRect(18, 25, 2, 2); c.fillRect(25, 25, 2, 2);
}

function makeCards() {
  el.cards.innerHTML = "";
  MODES.forEach((m, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<canvas class="thumb" width="180" height="90"></canvas><span class="badge">Option ${i + 1}</span><h3>${m.title}</h3><p>${m.summary}</p><button>Play</button>`;
    const btn = card.querySelector("button");
    btn.addEventListener("click", () => startMode(m.id));
    drawThumb(card.querySelector("canvas"), i);
    el.cards.appendChild(card);
  });
}

function clearGameUI() {
  el.stats.innerHTML = "";
  el.controls.innerHTML = "";
  el.status.innerHTML = "";
  el.chat.innerHTML = "";
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
    el.status.textContent = "External mode opens in a new tab because Vercel blocks iframe embedding.";
    addBubble("I can’t embed that site here, but this button opens it directly.");
    return;
  }

  el.canvas.classList.remove("hidden");
  if (id === "normal") {
    el.controls.innerHTML = '<button id="workBtn">Do Task</button><button id="restBtn">Pause</button>';
    document.getElementById("workBtn").onclick = () => { state.normal.progress += 8; state.normal.glitch += 3; };
    document.getElementById("restBtn").onclick = () => { state.normal.glitch = Math.max(0, state.normal.glitch - 6); };
    addBubble("Let's keep life normal on top... and watch what glitches underneath.");
  }
  if (id === "iceberg") {
    el.controls.innerHTML = '<button id="revealBtn">Reveal Deeper Layer</button>';
    document.getElementById("revealBtn").onclick = () => { state.iceberg.depth = Math.min(state.iceberg.layers.length - 1, state.iceberg.depth + 1); };
    addBubble("Click down the iceberg while I race you to the deepest layer.");
  }
  if (id === "ocean") {
    state.ocean = { x: 370, y: 160, depth: 0, botDepth: 0, hp: 3, enemies: [] };
    for (let i = 0; i < 7; i++) state.ocean.enemies.push({ x: Math.random() * 730 + 10, y: Math.random() * 320 + 8, vx: (Math.random() - .5) * 2.4 });
    el.controls.innerHTML = '<span class="stat">Move: arrows / WASD</span>';
    addBubble("Race me to depth 500 and dodge shadow fish.");
  }
  if (id === "emotion") {
    state.emotion = { mask: 50, hidden: 20, botMask: 52, botHidden: 18 };
    el.controls.innerHTML = '<button id="maskBtn">Mask +</button><button id="breatheBtn">Breathe</button>';
    document.getElementById("maskBtn").onclick = () => { state.emotion.mask = Math.min(100, state.emotion.mask + 8); state.emotion.hidden += 5; };
    document.getElementById("breatheBtn").onclick = () => { state.emotion.hidden = Math.max(0, state.emotion.hidden - 7); };
    addBubble("Keep the visible mask stable without letting hidden stress explode.");
  }
  if (id === "dig") {
    state.dig = { layer: 0, botLayer: 0, truths: 0, finds: ["soil", "coins", "bones", "note", "fear", "truth"] };
    el.controls.innerHTML = '<button id="digBtn">Dig</button><button id="truthBtn">Read Truth</button>';
    document.getElementById("digBtn").onclick = () => { state.dig.layer = Math.min(5, state.dig.layer + 1); addBubble(`Found: ${state.dig.finds[state.dig.layer]}`, "you"); };
    document.getElementById("truthBtn").onclick = () => { state.dig.truths = Math.min(4, state.dig.truths + 1); };
    addBubble("Dig race started. Under the surface, stories get heavier.");
  }
  if (id === "mirror") {
    state.mirror = { x: 70, y: 160, mirrorX: 70, traps: [220, 340, 510], goal: 700, botX: 75 };
    el.controls.innerHTML = '<span class="stat">Move: arrows / WASD</span>';
    addBubble("Top world looks safe. Mirror world has traps—watch both.");
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
el.composer.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!state.running) return;
  const msg = el.msgInput.value.trim();
  if (!msg) return;
  el.msgInput.value = "";
  addBubble(msg, "you");
  setTimeout(() => addBubble(botReply(msg)), 120);
});
window.addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

function renderNormal() {
  state.normal.bot += 0.35 + Math.random() * 0.4;
  state.normal.glitch = Math.min(100, state.normal.glitch + 0.12);
  const g = state.normal.glitch;
  ctx.fillStyle = `rgb(${35 + g}, ${35 + g * 0.2}, ${60 + g * 0.1})`;
  ctx.fillRect(0, 0, 760, 340);
  ctx.fillStyle = "#89e0ff";
  ctx.fillRect(90, 80, 160, 120);
  if (g > 35) { ctx.fillStyle = "#ff5f8b"; for (let i = 0; i < 8; i++) ctx.fillRect(80 + i * 80, 60 + (i % 3) * 50, 22, 6); }
  el.stats.innerHTML = "";
  el.stats.append(stat("Your tasks", Math.floor(state.normal.progress)));
  el.stats.append(stat("Bot tasks", Math.floor(state.normal.bot)));
  el.stats.append(stat("Glitch", Math.floor(g)));
  el.stats.append(stat("Trust", state.trust));
  el.status.textContent = g > 80 ? "Surface is cracking. Hidden stress is visible now." : "Keep routine stable before glitches overtake the screen.";
}

function renderIceberg() {
  state.iceberg.bot += Math.random() < 0.02 ? 1 : 0;
  state.iceberg.bot = Math.min(state.iceberg.layers.length - 1, state.iceberg.bot);
  ctx.fillStyle = "#10324e"; ctx.fillRect(0,0,760,340);
  ctx.fillStyle = "#cfe7ff"; ctx.beginPath(); ctx.moveTo(300,70); ctx.lineTo(430,70); ctx.lineTo(500,150); ctx.lineTo(230,150); ctx.fill();
  ctx.fillStyle = "#8db8e6"; ctx.fillRect(180,150,370,130);
  ctx.fillStyle = "#f8fbff"; ctx.fillText(`You: ${state.iceberg.layers[state.iceberg.depth]}`, 24, 30);
  ctx.fillText(`Bot: ${state.iceberg.layers[state.iceberg.bot]}`, 24, 52);
  el.stats.innerHTML = "";
  el.stats.append(stat("Your layer", state.iceberg.depth));
  el.stats.append(stat("Bot layer", state.iceberg.bot));
  el.stats.append(stat("Depth total", state.iceberg.layers.length - 1));
  el.stats.append(stat("Trust", state.trust));
  el.status.textContent = state.iceberg.depth === state.iceberg.layers.length - 1 ? "You reached the hidden bottom first." : "Reveal deeper layers to expose what's beneath.";
}

function renderOcean() {
  const o = state.ocean;
  if (keys.has("arrowleft") || keys.has("a")) o.x -= 3;
  if (keys.has("arrowright") || keys.has("d")) o.x += 3;
  if (keys.has("arrowup") || keys.has("w")) o.y -= 3;
  if (keys.has("arrowdown") || keys.has("s")) { o.y += 2; o.depth += 1; }
  o.x = Math.max(8, Math.min(740, o.x)); o.y = Math.max(8, Math.min(320, o.y));
  o.botDepth += 0.7 + Math.random();
  const dark = Math.min(220, o.depth * 0.5);
  ctx.fillStyle = `rgb(10, ${85 - dark * 0.25}, ${145 - dark * 0.45})`; ctx.fillRect(0,0,760,340);
  o.enemies.forEach((en)=>{ en.x += en.vx; if (en.x < 0 || en.x > 760) en.vx *= -1; ctx.fillStyle="#b32145"; ctx.fillRect(en.x,en.y,16,8); if (Math.hypot(en.x-o.x,en.y-o.y)<14 && Math.random()<0.02) o.hp=Math.max(0,o.hp-1); });
  ctx.fillStyle="#f6d86c"; ctx.fillRect(o.x,o.y,12,12);
  el.stats.innerHTML=""; el.stats.append(stat("Your depth",Math.floor(o.depth))); el.stats.append(stat("Bot depth",Math.floor(o.botDepth))); el.stats.append(stat("HP",o.hp)); el.stats.append(stat("Trust",state.trust));
  el.status.textContent = o.hp <= 0 ? "You got caught by shadows." : o.depth >= 500 || o.botDepth >= 500 ? (o.depth >= o.botDepth ? "You win the depth race." : "Bot wins this dive.") : "Dive deeper and avoid enemies.";
}

function renderEmotion() {
  const e = state.emotion;
  e.hidden = Math.min(100, e.hidden + 0.18);
  e.botHidden = Math.min(100, e.botHidden + 0.14);
  e.botMask = Math.max(10, Math.min(100, e.botMask + (Math.random() < .5 ? -1 : 1)));
  if (Math.random() < 0.02) e.botHidden = Math.max(0, e.botHidden - 6);
  ctx.fillStyle = "#1c1830"; ctx.fillRect(0,0,760,340);
  ctx.fillStyle = "#f4d4be"; ctx.fillRect(170,90,120,120); ctx.fillRect(470,90,120,120);
  ctx.fillStyle = "#7e3042"; ctx.fillRect(205,170,50,Math.max(4, e.mask * 0.4)); ctx.fillRect(505,170,50,Math.max(4, e.botMask * 0.4));
  el.stats.innerHTML=""; el.stats.append(stat("Your mask",Math.floor(e.mask))); el.stats.append(stat("Your hidden stress",Math.floor(e.hidden))); el.stats.append(stat("Bot hidden stress",Math.floor(e.botHidden))); el.stats.append(stat("Trust",state.trust));
  el.status.textContent = e.hidden >= 95 ? "Your hidden stress broke through the mask." : "Balance visible calm and hidden pressure.";
}

function renderDig() {
  if (Math.random() < 0.02) state.dig.botLayer = Math.min(5, state.dig.botLayer + 1);
  ctx.fillStyle="#3a2818"; ctx.fillRect(0,0,760,340);
  for (let i=0;i<6;i++){ ctx.fillStyle = i<=state.dig.layer?"#7a5632":"#4a3421"; ctx.fillRect(80+i*100, 80, 76, 190); }
  el.stats.innerHTML=""; el.stats.append(stat("Your layer",state.dig.layer)); el.stats.append(stat("Bot layer",state.dig.botLayer)); el.stats.append(stat("Truths",state.dig.truths)); el.stats.append(stat("Trust",state.trust));
  const truths = ["They called me brave.","I was terrified.","I hid it every day.","Beneath the surface: fear."];
  el.status.textContent = `Find: ${state.dig.finds[state.dig.layer]} | Truth: ${truths.slice(0,state.dig.truths).join(" / ") || "none"}`;
}

function renderMirror() {
  const m = state.mirror;
  if (keys.has("arrowright") || keys.has("d")) { m.x += 3; m.mirrorX += 2.4; }
  if (keys.has("arrowleft") || keys.has("a")) { m.x -= 3; m.mirrorX -= 2.4; }
  m.botX += Math.random() < 0.55 ? 1.7 : 0.7;
  m.x = Math.max(10, Math.min(730, m.x)); m.mirrorX = Math.max(10, Math.min(730, m.mirrorX));
  ctx.fillStyle="#1f2640"; ctx.fillRect(0,0,760,170); ctx.fillStyle="#2f1f34"; ctx.fillRect(0,170,760,170);
  ctx.fillStyle="#8ae6ff"; ctx.fillRect(m.x,90,12,12); ctx.fillStyle="#ff7b9f"; ctx.fillRect(m.mirrorX,250,12,12);
  ctx.fillStyle="#ce4f65"; m.traps.forEach((t)=>ctx.fillRect(t,246,18,18));
  const hitTrap = m.traps.some((t)=>Math.abs(t-m.mirrorX)<12);
  el.stats.innerHTML=""; el.stats.append(stat("Top world x",Math.floor(m.x))); el.stats.append(stat("Mirror x",Math.floor(m.mirrorX))); el.stats.append(stat("Bot x",Math.floor(m.botX))); el.stats.append(stat("Trust",state.trust));
  if (hitTrap) el.status.textContent = "Mirror self hit a hidden trap.";
  else if (m.x >= m.goal || m.botX >= m.goal) el.status.textContent = m.x >= m.botX ? "You escaped both worlds." : "Bot escaped first.";
  else el.status.textContent = "Move while watching the hidden mirror side.";
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
