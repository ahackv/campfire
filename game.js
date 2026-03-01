const MODES = {
  ocean: {
    title: "🌊 Game 3 — Into the Deep",
    summary:
      "Swim deeper while racing a bot diver. Light fades, enemies drift, and the danger beneath the surface grows.",
  },
  dig: {
    title: "⛏️ Game 5 — Beneath the Dirt",
    summary:
      "Dig through layered finds while a bot excavator races you. Buried text reveals emotional truth beneath the surface.",
  },
  chat: {
    title: "💬 Game 7 — Read Between the Lines",
    summary:
      "A branching chat duel: you and a bot respond to someone saying 'I'm fine'. Your empathy score decides the ending.",
  },
};

const el = {
  menu: document.getElementById("menu"),
  gameView: document.getElementById("gameView"),
  playBtns: document.querySelectorAll(".playBtn"),
  backBtn: document.getElementById("backBtn"),
  modeTitle: document.getElementById("modeTitle"),
  summary: document.getElementById("summary"),
  stats: document.getElementById("stats"),
  controls: document.getElementById("controls"),
  status: document.getElementById("status"),
  oceanCanvas: document.getElementById("oceanCanvas"),
  chat: document.getElementById("chat"),
  composer: document.getElementById("composer"),
  msgInput: document.getElementById("msgInput"),
  botFace: document.getElementById("botFace"),
  botMood: document.getElementById("botMood"),
  thumbOcean: document.getElementById("thumbOcean"),
  thumbDig: document.getElementById("thumbDig"),
  thumbChat: document.getElementById("thumbChat"),
};

const state = {
  mode: null,
  running: false,
  chatTrust: 0,
  playerMessages: 0,
  ocean: {
    depth: 0,
    botDepth: 0,
    hp: 3,
    x: 380,
    y: 160,
    enemies: [],
  },
  dig: {
    layer: 0,
    botLayer: 0,
    truths: 0,
    maxLayer: 9,
    finds: [
      "Loose soil",
      "Coins",
      "Broken helmet",
      "Locked box",
      "Cracked locket",
      "Diary page",
      "Family photo",
      "Apology note",
      "Final letter",
      "Buried fear",
    ],
  },
  chatGame: {
    turn: 0,
    maxTurns: 6,
    npcLines: [
      "NPC: I'm fine lol.",
      "NPC: it's just school stuff.",
      "NPC: don't make it a big deal.",
      "NPC: anyway... how was your day?",
      "NPC: i'm not upset. promise.",
      "NPC: maybe we can talk later.",
    ],
    botScore: 0,
    yourScore: 0,
  },
};

const keys = new Set();
const oceanCtx = el.oceanCanvas.getContext("2d");
const faceCtx = el.botFace.getContext("2d");
let mouthOpen = false;

function drawPixelThumb(canvas, kind) {
  const c = canvas.getContext("2d");
  c.clearRect(0, 0, 180, 90);
  c.fillStyle = kind === "ocean" ? "#10243d" : kind === "dig" ? "#3a2a18" : "#231c35";
  c.fillRect(0, 0, 180, 90);
  for (let i = 0; i < 80; i++) {
    c.fillStyle = i % 2 ? "#5d4a83" : "#3a2a57";
    c.fillRect((i * 23) % 180, 66 + (i % 8), 4, 2);
  }
  c.fillStyle = "#f6d6bf";
  c.fillRect(18, 24, 20, 18);
  c.fillStyle = "#101018";
  c.fillRect(22, 30, 3, 3);
  c.fillRect(30, 30, 3, 3);
  c.fillStyle = "#ece0ff";
  c.fillRect(62, 22, 92, 7);
  c.fillRect(62, 34, 68, 6);
  c.fillRect(62, 45, 82, 6);
}

function drawFace() {
  faceCtx.clearRect(0, 0, 32, 32);
  for (let y = 2; y < 30; y++) {
    for (let x = 2; x < 30; x++) {
      faceCtx.fillStyle = "#2a2241";
      faceCtx.fillRect(x, y, 1, 1);
    }
  }
  for (let y = 7; y < 26; y++) {
    for (let x = 7; x < 26; x++) {
      faceCtx.fillStyle = "#f4d4be";
      faceCtx.fillRect(x, y, 1, 1);
    }
  }
  faceCtx.fillStyle = "#1a1526";
  faceCtx.fillRect(11, 14, 2, 2);
  faceCtx.fillRect(19, 14, 2, 2);
  faceCtx.fillStyle = "#7d3042";
  if (mouthOpen) {
    faceCtx.fillRect(13, 22, 6, 2);
    faceCtx.fillRect(14, 23, 4, 1);
  } else {
    faceCtx.fillRect(13, 22, 6, 1);
  }
  faceCtx.fillStyle = "#9e80cd";
  for (let i = 0; i < 32; i++) {
    faceCtx.fillRect(i, 0, 1, 1);
    faceCtx.fillRect(i, 31, 1, 1);
    faceCtx.fillRect(0, i, 1, 1);
    faceCtx.fillRect(31, i, 1, 1);
  }
}

function animateFace(text) {
  el.botMood.textContent = `Bot: ${text}`;
  let t = 0;
  const timer = setInterval(() => {
    mouthOpen = !mouthOpen;
    drawFace();
    t += 1;
    if (t > Math.max(6, Math.floor(text.length / 3))) {
      clearInterval(timer);
      mouthOpen = false;
      drawFace();
    }
  }, 90);
}

function addBubble(text, who = "bot") {
  const b = document.createElement("article");
  b.className = `bubble ${who}`;
  b.innerHTML = text;
  el.chat.appendChild(b);
  el.chat.scrollTop = el.chat.scrollHeight;
  if (who === "bot") animateFace(text.replace(/<[^>]+>/g, ""));
}

function clearUI() {
  el.stats.innerHTML = "";
  el.controls.innerHTML = "";
  el.status.innerHTML = "";
  el.chat.innerHTML = "";
}

function showMenu() {
  state.running = false;
  state.mode = null;
  el.menu.classList.remove("hidden");
  el.gameView.classList.add("hidden");
}

function statLine(label, value) {
  const d = document.createElement("div");
  d.className = "stat";
  d.textContent = `${label}: ${value}`;
  return d;
}

function setupOcean() {
  state.ocean = { depth: 0, botDepth: 0, hp: 3, x: 380, y: 160, enemies: [] };
  for (let i = 0; i < 8; i++) {
    state.ocean.enemies.push({ x: Math.random() * 740 + 10, y: Math.random() * 320 + 5, vx: (Math.random() - 0.5) * 2.3 });
  }
  el.controls.innerHTML = '<button id="resetOcean">Restart Dive</button><span class="stat">Controls: Arrow keys / WASD</span>';
  document.getElementById("resetOcean").addEventListener("click", setupOcean);
  addBubble("Bot diver online. I'll race you to depth 500. Don't get clipped by shadows.");
}

function setupDig() {
  state.dig.layer = 0;
  state.dig.botLayer = 0;
  state.dig.truths = 0;
  el.controls.innerHTML = '<button id="digBtn">Dig Layer</button><button id="truthBtn">Read Truth</button>';
  document.getElementById("digBtn").addEventListener("click", () => {
    state.dig.layer = Math.min(state.dig.maxLayer, state.dig.layer + 1);
    addBubble(`I found: ${state.dig.finds[state.dig.layer]}.`, "you");
  });
  document.getElementById("truthBtn").addEventListener("click", () => {
    state.dig.truths = Math.min(4, state.dig.truths + 1);
    addBubble("Truth noted. You're digging emotions too, not just dirt.");
  });
  addBubble("Bot excavator here. I'll dig too—let's see who reaches the final letter first.");
}

function setupChatGame() {
  state.chatGame.turn = 0;
  state.chatGame.botScore = 0;
  state.chatGame.yourScore = 0;
  state.chatTrust = 0;
  el.controls.innerHTML = '<span class="stat">Tip: Ask caring questions to gain trust.</span>';
  addBubble("I'm your bot teammate. Let's both reply to the NPC and see who reads beneath the surface better.");
  addBubble(state.chatGame.npcLines[0]);
}

function startMode(mode) {
  state.mode = mode;
  state.running = true;
  state.playerMessages = 0;
  el.menu.classList.add("hidden");
  el.gameView.classList.remove("hidden");
  clearUI();
  el.modeTitle.textContent = MODES[mode].title;
  el.summary.textContent = MODES[mode].summary;
  el.oceanCanvas.classList.toggle("hidden", mode !== "ocean");

  if (mode === "ocean") setupOcean();
  if (mode === "dig") setupDig();
  if (mode === "chat") setupChatGame();
}

function classifyMessage(msg) {
  const t = msg.toLowerCase();
  const good = ["you okay", "you ok", "i'm here", "talk", "listen", "care", "support", "want to vent", "how are you"];
  const bad = ["whatever", "overreact", "deal with it", "don't care", "stop", "dramatic"];
  let s = 0;
  good.forEach((w) => { if (t.includes(w)) s += 2; });
  bad.forEach((w) => { if (t.includes(w)) s -= 2; });
  if (t.includes("?")) s += 1;
  if (s >= 2) return "supportive";
  if (s <= -1) return "harsh";
  return "neutral";
}

function botReply(input) {
  const mood = classifyMessage(input);
  if (state.mode === "chat") {
    if (mood === "supportive") {
      state.chatGame.yourScore += 2;
      state.chatTrust += 2;
      return "Good read. That felt kind and specific.";
    }
    if (mood === "harsh") {
      state.chatGame.botScore += 2;
      state.chatTrust -= 2;
      return "That was cold. NPC shut down a little.";
    }
    state.chatGame.botScore += 1;
    return "Neutral response. Safe, but not deep.";
  }

  if (mood === "supportive") {
    state.chatTrust += 1;
    return "Got it. That's a supportive message—team trust up.";
  }
  if (mood === "harsh") {
    state.chatTrust -= 1;
    return "Oof. Bot teammate notes low empathy signal.";
  }
  return "Message received. Keeping it steady.";
}

el.composer.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!state.running) return;
  const msg = el.msgInput.value.trim();
  if (!msg) return;
  el.msgInput.value = "";
  state.playerMessages += 1;
  addBubble(msg, "you");

  const reply = botReply(msg);
  setTimeout(() => addBubble(reply), 140);

  if (state.mode === "chat") {
    state.chatGame.turn += 1;
    if (state.chatGame.turn < state.chatGame.maxTurns) {
      setTimeout(() => addBubble(state.chatGame.npcLines[state.chatGame.turn]), 260);
    }
  }
});

window.addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

function renderOcean() {
  const o = state.ocean;
  if (keys.has("arrowleft") || keys.has("a")) o.x -= 3.2;
  if (keys.has("arrowright") || keys.has("d")) o.x += 3.2;
  if (keys.has("arrowup") || keys.has("w")) o.y -= 3.2;
  if (keys.has("arrowdown") || keys.has("s")) {
    o.y += 2.2;
    o.depth += 1;
  }
  o.x = Math.max(10, Math.min(740, o.x));
  o.y = Math.max(6, Math.min(310, o.y));

  o.botDepth += 0.7 + Math.random() * 1.1;
  if (Math.random() < 0.03) o.depth += 1;

  const dark = Math.min(220, o.depth * 0.5);
  oceanCtx.fillStyle = `rgb(10, ${80 - dark * 0.25}, ${140 - dark * 0.45})`;
  oceanCtx.fillRect(0, 0, 760, 330);

  o.enemies.forEach((en) => {
    en.x += en.vx;
    if (en.x < 0 || en.x > 760) en.vx *= -1;
    oceanCtx.fillStyle = "#b32042";
    oceanCtx.fillRect(en.x, en.y, 16, 8);
    const dx = en.x - o.x;
    const dy = en.y - o.y;
    if (Math.hypot(dx, dy) < 14 && Math.random() < 0.02) o.hp = Math.max(0, o.hp - 1);
  });

  oceanCtx.fillStyle = "#f8d86f";
  oceanCtx.fillRect(o.x, o.y, 12, 12);
  oceanCtx.fillStyle = "#7fe6ff";
  oceanCtx.fillRect(20, 15, Math.min(720, o.botDepth), 4);

  el.stats.innerHTML = "";
  el.stats.append(statLine("Your depth", Math.floor(o.depth)));
  el.stats.append(statLine("Bot depth", Math.floor(o.botDepth)));
  el.stats.append(statLine("HP", o.hp));
  el.stats.append(statLine("Trust", state.chatTrust));

  if (o.hp <= 0) {
    el.status.textContent = "You were clipped by shadows. Restart dive to try again.";
  } else if (o.depth >= 500 || o.botDepth >= 500) {
    el.status.textContent = o.depth >= o.botDepth ? "You reached the truth below first." : "Bot diver won this run. You can still rematch.";
  } else {
    el.status.textContent = "Swim down, dodge shadows, and keep chatting with your bot teammate.";
  }
}

function renderDig() {
  if (Math.random() < 0.02) state.dig.botLayer = Math.min(state.dig.maxLayer, state.dig.botLayer + 1);

  el.stats.innerHTML = "";
  el.stats.append(statLine("Your layer", state.dig.layer));
  el.stats.append(statLine("Bot layer", state.dig.botLayer));
  el.stats.append(statLine("Truths revealed", state.dig.truths));
  el.stats.append(statLine("Trust", state.chatTrust));

  const currentFind = state.dig.finds[state.dig.layer];
  const truths = [
    "They called me brave.",
    "I was scared each day.",
    "I buried this so no one knew.",
    "Beneath the surface: fear.",
  ];

  el.status.innerHTML = `<strong>Current layer:</strong> ${currentFind}<br/><strong>Revealed truths:</strong> ${truths.slice(0, state.dig.truths).join(" • ") || "none yet"}`;

  if (state.dig.layer >= state.dig.maxLayer || state.dig.botLayer >= state.dig.maxLayer) {
    el.status.innerHTML += `<br/><strong>${state.dig.layer >= state.dig.botLayer ? "You" : "Bot"} reached the deepest layer first.</strong>`;
  }
}

function renderChatGame() {
  const g = state.chatGame;
  if (Math.random() < 0.015 && g.turn < g.maxTurns) {
    g.botScore += 1;
  }

  el.stats.innerHTML = "";
  el.stats.append(statLine("Turn", `${Math.min(g.turn, g.maxTurns)} / ${g.maxTurns}`));
  el.stats.append(statLine("Your empathy", g.yourScore));
  el.stats.append(statLine("Bot empathy", g.botScore));
  el.stats.append(statLine("Trust", state.chatTrust));

  if (g.turn >= g.maxTurns) {
    if (g.yourScore > g.botScore && state.chatTrust > 0) {
      el.status.textContent = "Ending: You noticed the hidden mood best. NPC opens up.";
    } else if (g.yourScore === g.botScore) {
      el.status.textContent = "Ending: Mixed read. Some support landed, some didn't.";
    } else {
      el.status.textContent = "Ending: Bot outread you this run. NPC stays guarded.";
    }
  } else {
    el.status.textContent = "Reply in chat to score empathy points before the conversation closes.";
  }
}

function loop() {
  if (state.running) {
    if (state.mode === "ocean") renderOcean();
    if (state.mode === "dig") renderDig();
    if (state.mode === "chat") renderChatGame();
  }
  requestAnimationFrame(loop);
}

el.playBtns.forEach((btn) => {
  btn.addEventListener("click", () => startMode(btn.dataset.mode));
});
el.backBtn.addEventListener("click", showMenu);

drawPixelThumb(el.thumbOcean, "ocean");
drawPixelThumb(el.thumbDig, "dig");
drawPixelThumb(el.thumbChat, "chat");
drawFace();
showMenu();
loop();
